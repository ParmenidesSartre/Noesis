import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PlanStatus, Role, SubscriptionPlan } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { LoggerService } from '../common/logger/logger.service';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterTenantDto } from './dto/register-tenant.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly jwtService: JwtService,
  ) {
    this.logger.setContext(AuthService.name);
  }

  /**
   * Register a new tenant organization and initial SUPER_ADMIN user
   * @param dto - Registration payload
   */
  async register(dto: RegisterTenantDto) {
    const normalizedSlug = this.slugify(dto.organizationSlug || dto.organizationName);

    const existingOrg = await this.prisma.organization.findUnique({
      where: { email: dto.organizationEmail },
      select: { id: true, email: true },
    });

    if (existingOrg) {
      throw new ConflictException('Organization already exists with this email');
    }

    const slug = await this.resolveSlug(normalizedSlug, Boolean(dto.organizationSlug));

    const hashedPassword = await bcrypt.hash(dto.adminPassword, 10);
    const trialEndsAt = this.calculateTrialEndDate();

    const result = await this.prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: dto.organizationName,
          email: dto.organizationEmail,
          phone: dto.organizationPhone,
          address: dto.organizationAddress,
          country: dto.organizationCountry,
          slug,
          plan: dto.plan || SubscriptionPlan.FREE_TRIAL,
          planStatus: PlanStatus.TRIAL,
          trialEndsAt,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          country: true,
          slug: true,
          plan: true,
          planStatus: true,
          trialEndsAt: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      const adminUser = await tx.user.create({
        data: {
          email: dto.adminEmail,
          password: hashedPassword,
          name: dto.adminName,
          role: Role.SUPER_ADMIN,
          organizationId: organization.id,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          organizationId: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return { organization, adminUser };
    });

    this.logger.log(
      `New organization registered: ${result.organization.slug} (${result.organization.id})`,
    );

    return result;
  }

  /**
   * Normalize input to slug format (lowercase alphanumeric with hyphens)
   * @param value - Name or slug provided by user
   */
  private slugify(value: string): string {
    const normalized = value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-{2,}/g, '-');

    if (!normalized) {
      throw new BadRequestException('Invalid organization name or slug');
    }

    return normalized;
  }

  /**
   * Ensure slug uniqueness. If user provided slug, throw on conflict.
   * Otherwise, append a numeric suffix.
   * @param baseSlug - normalized slug
   * @param userProvided - whether slug came from request
   */
  private async resolveSlug(baseSlug: string, userProvided: boolean): Promise<string> {
    const existing = await this.prisma.organization.findUnique({
      where: { slug: baseSlug },
      select: { id: true },
    });

    if (!existing) {
      return baseSlug;
    }

    if (userProvided) {
      throw new ConflictException('Organization slug already in use');
    }

    let counter = 2;
    let candidate = `${baseSlug}-${counter}`;

    while (
      await this.prisma.organization.findUnique({
        where: { slug: candidate },
        select: { id: true },
      })
    ) {
      counter += 1;
      candidate = `${baseSlug}-${counter}`;
    }

    return candidate;
  }

  /**
   * Calculate the end date for a 14-day free trial
   */
  private calculateTrialEndDate(): Date {
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 14);
    return trialEnd;
  }

  /**
   * Authenticate user by organization slug, email, and password
   * @param dto - login payload
   */
  async login(dto: LoginDto) {
    const organization = await this.prisma.organization.findUnique({
      where: { slug: dto.organizationSlug },
      select: {
        id: true,
        slug: true,
        name: true,
        planStatus: true,
        isActive: true,
      },
    });

    if (!organization || !organization.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        email: dto.email,
        organizationId: organization.id,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
        isActive: true,
        organizationId: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      userId: user.id,
      email: user.email,
      organizationId: organization.id,
      organizationSlug: organization.slug,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    this.logger.log(
      `User ${user.email} logged in for organization ${organization.slug}`,
    );

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: user.organizationId,
        isActive: user.isActive,
      },
      organization,
    };
  }

  /**
   * Stateless logout acknowledgement
   */
  async logout() {
    return { message: 'Logged out' };
  }
}
