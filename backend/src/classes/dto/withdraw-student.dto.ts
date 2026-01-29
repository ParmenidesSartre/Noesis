import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class WithdrawStudentDto {
  @ApiProperty({ example: 'Moving to another city' })
  @IsString()
  @IsNotEmpty()
  withdrawalReason: string;
}
