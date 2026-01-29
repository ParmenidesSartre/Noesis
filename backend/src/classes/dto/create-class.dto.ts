import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsInt,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsArray,
  Min,
  IsNumber,
} from 'class-validator';

export enum ClassType {
  REGULAR_GROUP = 'REGULAR_GROUP',
  SMALL_GROUP = 'SMALL_GROUP',
  ONE_ON_ONE = 'ONE_ON_ONE',
  ONLINE = 'ONLINE',
  HYBRID = 'HYBRID',
  INTENSIVE = 'INTENSIVE',
  WORKSHOP = 'WORKSHOP',
}

export enum ClassStatus {
  DRAFT = 'DRAFT',
  OPEN_FOR_ENROLLMENT = 'OPEN_FOR_ENROLLMENT',
  FULL = 'FULL',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  ON_HOLD = 'ON_HOLD',
}

export interface ClassScheduleItem {
  day: string; // "MONDAY", "TUESDAY", etc.
  startTime: string; // "14:00"
  endTime: string; // "16:00"
}

export class CreateClassDto {
  @ApiProperty({ example: 'Mathematics - Primary 5 A' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'MATH-P5-A-2026' })
  @IsString()
  @IsOptional()
  classCode?: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  courseId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  teacherId: number;

  @ApiPropertyOptional({ example: 2 })
  @IsInt()
  @IsOptional()
  coTeacherId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsOptional()
  roomId?: number;

  @ApiProperty({ enum: ClassType, example: ClassType.REGULAR_GROUP })
  @IsEnum(ClassType)
  classType: ClassType;

  @ApiPropertyOptional({ example: 'Primary 5' })
  @IsString()
  @IsOptional()
  classLevel?: string;

  @ApiPropertyOptional({ example: 'Term 1 2026' })
  @IsString()
  @IsOptional()
  termName?: string;

  @ApiPropertyOptional({ example: 2026 })
  @IsInt()
  @IsOptional()
  academicYear?: number;

  @ApiProperty({ example: '2026-01-15T00:00:00Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-04-30T00:00:00Z' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ example: 12 })
  @IsInt()
  @IsOptional()
  @Min(1)
  totalWeeks?: number;

  @ApiPropertyOptional({
    example: [{ startDate: '2026-02-10', endDate: '2026-02-14', name: 'Mid-term break' }],
  })
  @IsArray()
  @IsOptional()
  holidayBreaks?: Array<{ startDate: string; endDate: string; name?: string }>;

  @ApiProperty({
    example: [
      { day: 'MONDAY', startTime: '14:00', endTime: '16:00' },
      { day: 'WEDNESDAY', startTime: '14:00', endTime: '16:00' },
    ],
  })
  @IsArray()
  @IsNotEmpty()
  schedule: ClassScheduleItem[];

  @ApiPropertyOptional({ example: 'No class on public holidays' })
  @IsString()
  @IsOptional()
  scheduleNotes?: string;

  @ApiProperty({ example: 30 })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  maxCapacity: number;

  @ApiProperty({ example: 5 })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  minCapacity: number;

  @ApiPropertyOptional({ example: 50.0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  feePerSession?: number;

  @ApiPropertyOptional({ example: 200.0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  feePerMonth?: number;

  @ApiPropertyOptional({ example: 600.0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  feePerTerm?: number;

  @ApiPropertyOptional({ example: 50.0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  materialFee?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  allowLateEnrollment?: boolean;

  @ApiPropertyOptional({ example: '2026-01-25T00:00:00Z' })
  @IsDateString()
  @IsOptional()
  lateEnrollmentCutoffDate?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  allowMidTermWithdrawal?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  waitlistEnabled?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  autoEnrollFromWaitlist?: boolean;

  @ApiPropertyOptional({ enum: ClassStatus, example: ClassStatus.DRAFT })
  @IsEnum(ClassStatus)
  @IsOptional()
  status?: ClassStatus;

  @ApiPropertyOptional({ example: 'Course syllabus details...' })
  @IsString()
  @IsOptional()
  syllabus?: string;

  @ApiPropertyOptional({
    example: [
      { name: 'Textbook A', required: true },
      { name: 'Workbook B', required: false },
    ],
  })
  @IsArray()
  @IsOptional()
  materials?: Array<{ name: string; required?: boolean }>;

  @ApiPropertyOptional({ example: 'https://classroom.google.com/abc' })
  @IsString()
  @IsOptional()
  digitalResources?: string;

  @ApiPropertyOptional({ example: 'Welcome to Mathematics class!' })
  @IsString()
  @IsOptional()
  classAnnouncements?: string;
}
