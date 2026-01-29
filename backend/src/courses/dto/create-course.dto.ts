import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsInt,
  IsBoolean,
  IsArray,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum CourseCategory {
  UPSR = 'UPSR',
  PT3 = 'PT3',
  SPM = 'SPM',
  STPM = 'STPM',
  MATRICULATION = 'MATRICULATION',
  IGCSE = 'IGCSE',
  O_LEVEL = 'O_LEVEL',
  A_LEVEL = 'A_LEVEL',
  ACADEMIC = 'ACADEMIC',
  ENRICHMENT = 'ENRICHMENT',
  LANGUAGE = 'LANGUAGE',
  SPECIAL_PROGRAM = 'SPECIAL_PROGRAM',
}

export enum CourseLevel {
  STANDARD_1 = 'STANDARD_1',
  STANDARD_2 = 'STANDARD_2',
  STANDARD_3 = 'STANDARD_3',
  STANDARD_4 = 'STANDARD_4',
  STANDARD_5 = 'STANDARD_5',
  STANDARD_6 = 'STANDARD_6',
  FORM_1 = 'FORM_1',
  FORM_2 = 'FORM_2',
  FORM_3 = 'FORM_3',
  FORM_4 = 'FORM_4',
  FORM_5 = 'FORM_5',
  FORM_6_LOWER = 'FORM_6_LOWER',
  FORM_6_UPPER = 'FORM_6_UPPER',
  MIXED = 'MIXED',
}

export enum DifficultyLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  MIXED = 'MIXED',
}

export enum SessionDuration {
  THIRTY_MIN = 'THIRTY_MIN',
  FORTY_FIVE_MIN = 'FORTY_FIVE_MIN',
  SIXTY_MIN = 'SIXTY_MIN',
  NINETY_MIN = 'NINETY_MIN',
  ONE_TWENTY_MIN = 'ONE_TWENTY_MIN',
}

export class CreateCourseDto {
  @ApiProperty({ example: 'Matematik SPM' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'MATH-SPM' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({ example: 'Comprehensive mathematics course for SPM students' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Master SPM mathematics syllabus' })
  @IsOptional()
  @IsString()
  objectives?: string;

  @ApiProperty({ enum: CourseCategory, example: CourseCategory.SPM })
  @IsEnum(CourseCategory)
  @IsNotEmpty()
  category: CourseCategory;

  @ApiProperty({ enum: DifficultyLevel, example: DifficultyLevel.INTERMEDIATE })
  @IsEnum(DifficultyLevel)
  @IsNotEmpty()
  difficultyLevel: DifficultyLevel;

  @ApiProperty({
    type: [String],
    example: ['FORM_4', 'FORM_5'],
    description: 'Array of course levels',
  })
  @IsArray()
  @IsEnum(CourseLevel, { each: true })
  gradeLevels: CourseLevel[];

  @ApiPropertyOptional({ example: 14 })
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(25)
  minAge?: number;

  @ApiPropertyOptional({ example: 17 })
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(25)
  maxAge?: number;

  @ApiPropertyOptional({ example: 'Basic mathematics knowledge required' })
  @IsOptional()
  @IsString()
  prerequisites?: string;

  @ApiProperty({ enum: SessionDuration, example: SessionDuration.NINETY_MIN })
  @IsEnum(SessionDuration)
  @IsNotEmpty()
  sessionDuration: SessionDuration;

  @ApiPropertyOptional({ example: 40, description: 'Total weeks (null for ongoing courses)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  totalWeeks?: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  isOngoing: boolean;

  @ApiProperty({ example: 30 })
  @IsInt()
  @Min(1)
  @Max(100)
  maxClassSize: number;

  @ApiProperty({ example: 5 })
  @IsInt()
  @Min(1)
  @Max(50)
  minClassSize: number;

  // Pricing in RM
  @ApiPropertyOptional({ example: 50.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  baseFeePerSession?: number;

  @ApiPropertyOptional({ example: 200.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  baseFeePerMonth?: number;

  @ApiPropertyOptional({ example: 800.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  baseFeePerTerm?: number;

  @ApiPropertyOptional({ example: 50.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  materialFee?: number;

  @ApiPropertyOptional({ example: 100.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  registrationFee?: number;

  @ApiPropertyOptional({ example: 30.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  trialSessionFee?: number;

  @ApiPropertyOptional({
    example: [
      {
        title: 'SPM Mathematics Workbook',
        publisher: 'Oxford',
        isbn: '978-123456',
        required: true,
      },
    ],
  })
  @IsOptional()
  textbooks?: Record<string, unknown>[];

  @ApiPropertyOptional({ example: 'Calculator, ruler, protractor' })
  @IsOptional()
  @IsString()
  additionalMaterials?: string;

  @ApiPropertyOptional({ example: 'https://drive.google.com/...' })
  @IsOptional()
  @IsString()
  digitalResources?: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  enrollmentOpen: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  waitlistEnabled: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  publicVisibility: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  isTemplate: boolean;

  @ApiPropertyOptional({ example: 1, description: 'Auto-injected from authenticated user' })
  @IsOptional()
  @IsInt()
  organizationId?: number;
}
