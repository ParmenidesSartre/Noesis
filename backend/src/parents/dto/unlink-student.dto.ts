import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UnlinkStudentDto {
  @ApiProperty({
    example: 'Parent request to unlink due to custody change',
    description: 'Reason for unlinking the parent-student relationship',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  reason: string;
}
