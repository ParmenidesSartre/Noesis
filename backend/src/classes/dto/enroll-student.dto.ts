import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, IsNumber, Min } from 'class-validator';

export class EnrollStudentDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  studentId: number;

  @ApiPropertyOptional({ example: 200.0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  agreedFeePerMonth?: number;

  @ApiPropertyOptional({ example: 20.0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  discountApplied?: number;

  @ApiPropertyOptional({ example: 'Early bird discount applied' })
  @IsString()
  @IsOptional()
  enrollmentNotes?: string;
}
