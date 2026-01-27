import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class ParentInfoDto {
  @ApiProperty({ example: 'parent@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Parent Name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '+1234567890' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    example: 'Father',
    enum: ['Father', 'Mother', 'Guardian', 'Other'],
    description: 'Relationship to student',
  })
  @IsString()
  @IsNotEmpty()
  relationship: string;

  @ApiPropertyOptional({ example: '123 Main St, City, Country' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'Engineer' })
  @IsOptional()
  @IsString()
  occupation?: string;

  @ApiPropertyOptional({ example: '+1234567891' })
  @IsOptional()
  @IsString()
  officePhone?: string;

  @ApiPropertyOptional({ example: 'Email', enum: ['Email', 'SMS', 'Phone', 'WhatsApp'] })
  @IsOptional()
  @IsString()
  preferredContactMethod?: string;
}

export class CreateStudentDto {
  @ApiProperty({ example: 'student@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'Student Name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 1, description: 'Branch ID where the student will enroll' })
  @IsInt()
  @IsNotEmpty()
  branchId: number;

  @ApiProperty({ example: '+1234567890' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: '2010-03-15' })
  @IsDateString()
  @IsNotEmpty()
  dateOfBirth: string;

  @ApiProperty({ example: 'Male', enum: ['Male', 'Female', 'Other'] })
  @IsString()
  @IsNotEmpty()
  gender: string;

  @ApiProperty({ example: 'Grade 10' })
  @IsString()
  @IsNotEmpty()
  gradeLevel: string;

  @ApiProperty({ example: 'ABC High School' })
  @IsString()
  @IsNotEmpty()
  schoolName: string;

  @ApiPropertyOptional({ example: '123 Main St, City, Country' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'None' })
  @IsOptional()
  @IsString()
  medicalInfo?: string;

  @ApiPropertyOptional({ example: 'None' })
  @IsOptional()
  @IsString()
  specialNeeds?: string;

  @ApiPropertyOptional({ example: 'XYZ Tuition' })
  @IsOptional()
  @IsString()
  previousTuitionCenter?: string;

  @ApiPropertyOptional({ example: 'Google Search' })
  @IsOptional()
  @IsString()
  referralSource?: string;

  @ApiProperty({
    description: 'Parent information (creates new parent if email does not exist)',
    type: ParentInfoDto,
  })
  @ValidateNested()
  @Type(() => ParentInfoDto)
  @IsNotEmpty()
  parent: ParentInfoDto;
}
