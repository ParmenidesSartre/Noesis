import { IsString, IsNotEmpty, IsOptional, IsEmail, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBranchDto {
  @ApiProperty({ example: 'Main Campus' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'MC001' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({ example: '123 Main Street, City, Country' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'branch@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 1, description: 'Auto-injected from authenticated user' })
  @IsOptional()
  @IsInt()
  organizationId?: number;
}
