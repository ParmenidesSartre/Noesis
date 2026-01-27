import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RejectLinkRequestDto {
  @ApiProperty({
    example: 'Unable to verify relationship with student',
    description: 'Reason for rejecting the link request',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  reason: string;
}
