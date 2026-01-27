import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import { DocumentType } from '@prisma/client';

export class UploadDocumentDto {
  @ApiProperty({
    enum: DocumentType,
    example: 'RESUME',
    description: 'Type of document being uploaded',
  })
  @IsEnum(DocumentType)
  documentType: DocumentType;

  @ApiProperty({
    example: 'Updated resume with latest experience',
    description: 'Description of the document',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: '2026-12-31',
    description: 'Expiry date of the document (if applicable)',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;
}
