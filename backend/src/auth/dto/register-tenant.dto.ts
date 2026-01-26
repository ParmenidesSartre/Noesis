import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SubscriptionPlan } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class RegisterTenantDto {
  @ApiProperty({
    example: 'ABC Tuition Centre',
    description: 'Organization name displayed in the platform',
  })
  @IsString()
  @IsNotEmpty()
  organizationName: string;

  @ApiPropertyOptional({
    example: 'abc-tuition-centre',
    description: 'Optional slug/subdomain. If omitted, a slug is generated from the name.',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'organizationSlug must contain only lowercase letters, numbers, and hyphens',
  })
  organizationSlug?: string;

  @ApiProperty({
    example: 'hello@abctuition.com',
    description: 'Primary organization contact email',
  })
  @IsEmail()
  @IsNotEmpty()
  organizationEmail: string;

  @ApiPropertyOptional({
    example: '+65 1234 5678',
    description: 'Organization phone number',
  })
  @IsOptional()
  @IsString()
  organizationPhone?: string;

  @ApiPropertyOptional({
    example: '123 Main St, Singapore',
    description: 'Organization address (optional)',
  })
  @IsOptional()
  @IsString()
  organizationAddress?: string;

  @ApiPropertyOptional({
    example: 'Singapore',
    description: 'Organization country (optional)',
  })
  @IsOptional()
  @IsString()
  organizationCountry?: string;

  @ApiPropertyOptional({
    enum: SubscriptionPlan,
    description: 'Subscription plan. Defaults to FREE_TRIAL.',
  })
  @IsOptional()
  @IsEnum(SubscriptionPlan)
  plan?: SubscriptionPlan;

  @ApiProperty({
    example: 'Alice Admin',
    description: 'Name of the initial admin user',
  })
  @IsString()
  @IsNotEmpty()
  adminName: string;

  @ApiProperty({
    example: 'admin@abctuition.com',
    description: 'Email of the initial admin user',
  })
  @IsEmail()
  @IsNotEmpty()
  adminEmail: string;

  @ApiProperty({
    example: 'Str0ngP@ssword!',
    description:
      'Password for the initial admin user (min 8 chars, with upper, lower, number, symbol)',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/, {
    message:
      'adminPassword must include upper and lower case letters, numbers, and special characters',
  })
  adminPassword: string;
}
