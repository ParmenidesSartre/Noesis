import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterTenantDto } from './dto/register-tenant.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { Role, SubscriptionPlan, PlanStatus } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Register a new organization with an admin user
   * Creates organization and SUPER_ADMIN user in a transaction
   * Sets up 14-day trial period
   */
  async register(dto: RegisterTenantDto) {
    // Generate slug if not provided
    const slug = dto.organizationSlug || this.generateSlug(dto.organizationName);

    // Check if organization already exists
    const existingOrg = await this.prisma.organization.findFirst({
      where: {
        OR: [{ email: dto.organizationEmail }, { slug }],
      },
    });

    if (existingOrg) {
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

    // Return without password
    const { password: _, ...adminUserWithoutPassword } = result.adminUser;

    return {
      organization: result.organization,
      adminUser: adminUserWithoutPassword,
    };
  }

  /**
   * Login with email, password, and organization slug
   * Returns JWT token with user and organization context
   */
  async login(dto: LoginDto) {
    // Find organization by slug
    const organization = await this.prisma.organization.findUnique({
      where: { slug: dto.organizationSlug },
    });

    if (!organization) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Find user by email and organization
    const user = await this.prisma.user.findFirst({
      where: {
        email: dto.email,
        organizationId: organization.id,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
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
    const { password: _, ...userWithoutPassword } = user;

    return {
      accessToken,
      user: userWithoutPassword,
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
      },
    };
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
