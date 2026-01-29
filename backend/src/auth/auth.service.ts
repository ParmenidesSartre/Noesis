import { ConflictException, Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { RegisterTenantDto } from './dto/register-tenant.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { Role, SubscriptionPlan, PlanStatus } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly auditService: AuditService,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  /**
   * Register a new organization with an admin user
   * Creates organization and SUPER_ADMIN user in a transaction
   * Sets up 14-day trial period
   */
  async register(dto: RegisterTenantDto) {
    const ipAddress =
      this.request.ip || (this.request.headers['x-forwarded-for'] as string) || 'unknown';

    try {
      // Generate slug if not provided
      const slug = dto.organizationSlug || this.generateSlug(dto.organizationName);

      // Check if organization already exists
      const existingOrg = await this.prisma.organization.findFirst({
        where: {
          OR: [{ email: dto.organizationEmail }, { slug }],
        },
      });

      if (existingOrg) {
        // Log failed registration
        await this.auditService.logRegistrationFailure(
          dto.adminEmail,
          'Organization already exists',
          ipAddress,
        );
        throw new ConflictException('Organization already exists with this email or slug');
      }

      // Hash admin password
      const hashedPassword = await bcrypt.hash(dto.adminPassword, 10);

      // Calculate trial end date (14 days from now)
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 14);

      // Create organization and admin user in transaction
      const result = await this.prisma.$transaction(async (tx) => {
        const organization = await tx.organization.create({
          data: {
            name: dto.organizationName,
            slug,
            email: dto.organizationEmail,
            phone: dto.organizationPhone,
            address: dto.organizationAddress,
            country: dto.organizationCountry,
            plan: dto.plan || SubscriptionPlan.FREE_TRIAL,
            planStatus: PlanStatus.TRIAL,
            trialEndsAt,
            isActive: true,
          },
        });

        const adminUser = await tx.user.create({
          data: {
            email: dto.adminEmail,
            password: hashedPassword,
            name: dto.adminName,
            role: Role.SUPER_ADMIN,
            organizationId: organization.id,
            isActive: true,
          },
        });

        return { organization, adminUser };
      });

      // Log successful registration
      await this.auditService.logRegistrationSuccess(
        result.organization.name,
        dto.adminEmail,
        result.organization.id,
        ipAddress,
      );

      // Return without password
      const { password: _, ...adminUserWithoutPassword } = result.adminUser;

      return {
        organization: result.organization,
        adminUser: adminUserWithoutPassword,
      };
    } catch (error) {
      // If not already logged, log generic registration failure
      if (!(error instanceof ConflictException)) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        await this.auditService.logRegistrationFailure(dto.adminEmail, errorMessage, ipAddress);
      }
      throw error;
    }
  }

  /**
   * Login with email, password, and optional organization slug
   * If slug not provided, auto-detects organization from email
   * Returns JWT token with user and organization context
   */
  async login(dto: LoginDto) {
    const ipAddress =
      this.request.ip || (this.request.headers['x-forwarded-for'] as string) || 'unknown';
    const userAgent = this.request.headers['user-agent'] || 'unknown';

    let organization;
    let user;

    try {
      if (dto.organizationSlug) {
        // Slug provided - use traditional login flow
        organization = await this.prisma.organization.findUnique({
          where: { slug: dto.organizationSlug },
        });

        if (!organization) {
          throw new UnauthorizedException('Invalid credentials');
        }

        user = await this.prisma.user.findFirst({
          where: {
            email: dto.email,
            organizationId: organization.id,
          },
        });

        if (!user) {
          throw new UnauthorizedException('Invalid credentials');
        }
      } else {
        // No slug - auto-detect from email
        const users = await this.prisma.user.findMany({
          where: { email: dto.email },
          include: { organization: true },
        });

        if (users.length === 0) {
          throw new UnauthorizedException('Invalid credentials');
        }

        if (users.length > 1) {
          // Multiple organizations - return list for user to choose
          const organizations = users.map((u) => ({
            slug: u.organization.slug,
            name: u.organization.name,
          }));
          throw new UnauthorizedException({
            message: 'Multiple organizations found. Please specify which one.',
            organizations,
          });
        }

        // Exactly one user found - proceed with login
        user = users[0];
        organization = user.organization;
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(dto.password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new UnauthorizedException('Account is inactive');
      }

      // Generate JWT token
      const payload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        organizationId: organization.id,
        organizationSlug: organization.slug,
      };

      const accessToken = this.jwtService.sign(payload);

      // Return user without password
      const { password: _, organization: _org, ...userWithoutPassword } = user;

      // Log successful login
      await this.auditService.logLoginSuccess(
        user.email,
        user.id,
        organization.id,
        ipAddress,
        userAgent,
      );

      return {
        access_token: accessToken,
        user: userWithoutPassword,
        organization: {
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
        },
      };
    } catch (error) {
      // Log failed login attempt
      const errorMessage = error instanceof Error ? error.message : 'Invalid credentials';
      await this.auditService.logLoginFailure(dto.email, errorMessage, ipAddress, userAgent);
      throw error;
    }
  }

  /**
   * Logout (stateless acknowledgement)
   * In future, can implement token blacklisting
   */
  logout() {
    return { message: 'Logged out' };
  }

  /**
   * Generate URL-friendly slug from organization name
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .trim()
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
  }
}
