import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';

export class AddToWaitlistDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  studentId: number;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isPriority?: boolean;

  @ApiPropertyOptional({ example: 'Returning student from previous term' })
  @IsString()
  @IsOptional()
  priorityNotes?: string;

  @ApiPropertyOptional({ example: 'Student requested this specific class' })
  @IsString()
  @IsOptional()
  notes?: string;
}
