import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateLinkRequestDto {
  @ApiProperty({
    example: '2024-TEST-0001',
    description: 'Student code to link to',
  })
  @IsString()
  @IsNotEmpty()
  studentCode: string;

  @ApiProperty({
    example: 'John Smith',
    description: 'Full name of the student for verification',
  })
  @IsString()
  @IsNotEmpty()
  studentName: string;

  @ApiProperty({
    example: '2010-05-15',
    description: 'Date of birth of the student for verification',
  })
  @IsDateString()
  @IsNotEmpty()
  studentDateOfBirth: string;

  @ApiProperty({
    example: 'Mother',
    description: 'Relationship to the student (Father/Mother/Guardian/Other)',
  })
  @IsString()
  @IsNotEmpty()
  relationship: string;
}
