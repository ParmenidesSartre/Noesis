import { IsInt, IsOptional, IsBoolean, IsNumber, Min, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AssignCourseToBranchDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  branchId: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  isOffered: boolean;

  // Custom pricing for this branch
  @ApiPropertyOptional({ example: 55.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  customFeePerSession?: number;

  @ApiPropertyOptional({ example: 220.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  customFeePerMonth?: number;

  @ApiPropertyOptional({ example: 880.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  customFeePerTerm?: number;

  @ApiPropertyOptional({ example: 60.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  customMaterialFee?: number;

  @ApiPropertyOptional({ example: 120.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  customRegistrationFee?: number;

  // Custom capacity for this branch
  @ApiPropertyOptional({ example: 25 })
  @IsOptional()
  @IsInt()
  @Min(1)
  customMaxClassSize?: number;

  @ApiPropertyOptional({ example: 8 })
  @IsOptional()
  @IsInt()
  @Min(1)
  customMinClassSize?: number;

  @ApiPropertyOptional({ example: 'This branch offers evening classes only' })
  @IsOptional()
  @IsString()
  branchNotes?: string;
}
