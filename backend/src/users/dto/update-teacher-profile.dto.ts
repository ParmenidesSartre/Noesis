import {
  IsOptional,
  IsString,
  IsInt,
  IsNumber,
  IsDateString,
  IsArray,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class CertificationDto {
  @ApiPropertyOptional({ example: 'MOE Teaching Certificate' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 2016 })
  @IsInt()
  year: number;

  @ApiPropertyOptional({ example: 'Ministry of Education Singapore' })
  @IsOptional()
  @IsString()
  issuingOrganization?: string;
}

enum EmploymentType {
  FULL_TIME = 'Full-time',
  PART_TIME = 'Part-time',
  CONTRACT = 'Contract',
  FREELANCE = 'Freelance',
}

enum QualificationLevel {
  DIPLOMA = 'Diploma',
  BACHELOR = "Bachelor's Degree",
  MASTER = "Master's Degree",
  PHD = 'PhD',
  OTHER = 'Other',
}

export class UpdateTeacherProfileDto {
  // Subject Specialization
  @ApiPropertyOptional({
    example: ['Mathematics', 'Physics'],
    description: 'Primary subjects the teacher specializes in',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  primarySubjects?: string[];

  @ApiPropertyOptional({
    example: ['Chemistry'],
    description: 'Secondary subjects the teacher can teach',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  secondarySubjects?: string[];

  @ApiPropertyOptional({
    example: ['Primary 5', 'Primary 6', 'Secondary 1'],
    description: 'Grade levels the teacher can teach',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  gradeLevels?: string[];

  @ApiPropertyOptional({
    example: ['English', 'Mandarin', 'Malay'],
    description: 'Languages the teacher can speak',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languagesSpoken?: string[];

  // Professional Qualifications
  @ApiPropertyOptional({
    example: "Bachelor's Degree",
    enum: QualificationLevel,
    description: 'Highest educational qualification',
  })
  @IsOptional()
  @IsEnum(QualificationLevel)
  highestQualification?: QualificationLevel;

  @ApiPropertyOptional({
    example: 'Bachelor of Science in Mathematics',
    description: 'Full degree name',
  })
  @IsOptional()
  @IsString()
  degreeName?: string;

  @ApiPropertyOptional({
    example: 'National University of Singapore',
    description: 'Institution where degree was obtained',
  })
  @IsOptional()
  @IsString()
  institution?: string;

  @ApiPropertyOptional({
    example: 2015,
    description: 'Year of graduation',
  })
  @IsOptional()
  @IsInt()
  graduationYear?: number;

  @ApiPropertyOptional({
    example: [
      { name: 'MOE Teaching Certificate', year: 2016, issuingOrganization: 'MOE Singapore' },
    ],
    description: 'Professional certifications',
    type: [CertificationDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CertificationDto)
  certifications?: CertificationDto[];

  // Employment Details
  @ApiPropertyOptional({
    example: 'Full-time',
    enum: EmploymentType,
    description: 'Type of employment',
  })
  @IsOptional()
  @IsEnum(EmploymentType)
  employmentType?: EmploymentType;

  @ApiPropertyOptional({
    example: '2024-01-15',
    description: 'Contract start date',
  })
  @IsOptional()
  @IsDateString()
  contractStartDate?: string;

  @ApiPropertyOptional({
    example: '2025-01-14',
    description: 'Contract end date (for contract employees)',
  })
  @IsOptional()
  @IsDateString()
  contractEndDate?: string;

  @ApiPropertyOptional({
    example: { monday: ['09:00-12:00', '14:00-17:00'], tuesday: ['09:00-12:00'] },
    description: 'Weekly work schedule',
  })
  @IsOptional()
  workSchedule?: Record<string, string[]>;

  @ApiPropertyOptional({
    example: 50.0,
    description: 'Hourly rate for part-time/freelance teachers',
  })
  @IsOptional()
  @IsNumber()
  hourlyRate?: number;

  @ApiPropertyOptional({
    example: 4500.0,
    description: 'Monthly salary for full-time teachers',
  })
  @IsOptional()
  @IsNumber()
  monthlySalary?: number;

  // Professional Profile
  @ApiPropertyOptional({
    example: 'Experienced mathematics teacher with a passion for helping students excel.',
    description: 'Brief biography',
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    example: 'I believe in making mathematics fun and relatable through real-world examples.',
    description: 'Teaching philosophy and approach',
  })
  @IsOptional()
  @IsString()
  teachingPhilosophy?: string;

  @ApiPropertyOptional({
    example: 'Top Teacher Award 2023, 95% student pass rate for O-Levels',
    description: 'Notable achievements',
  })
  @IsOptional()
  @IsString()
  achievements?: string;

  @ApiPropertyOptional({
    example: 8,
    description: 'Years of teaching experience',
  })
  @IsOptional()
  @IsInt()
  experience?: number;

  // Document References
  @ApiPropertyOptional({
    example: 'https://storage.example.com/resumes/teacher-123.pdf',
    description: 'URL to resume/CV document',
  })
  @IsOptional()
  @IsString()
  resumeUrl?: string;

  @ApiPropertyOptional({
    example: 'https://storage.example.com/certificates/teacher-123/',
    description: 'URL to certificates folder',
  })
  @IsOptional()
  @IsString()
  certificatesUrl?: string;
}
