import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString } from 'class-validator';

export class UpdateDocumentDto {
  @ApiProperty({
    example: 'Updated description',
    description: 'Updated description of the document',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: '2027-06-30',
    description: 'Updated expiry date',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;
}
