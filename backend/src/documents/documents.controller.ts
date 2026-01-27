import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  ForbiddenException,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiQuery } from '@nestjs/swagger';
import type { Response } from 'express';
import { DocumentsService } from './documents.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserData } from '../auth/decorators/current-user.decorator';
import { Role, DocumentType } from '@prisma/client';

@ApiTags('Documents')
@ApiBearerAuth()
@Controller('users/teachers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post(':teacherId/documents')
  @Roles(Role.TEACHER, Role.BRANCH_ADMIN, Role.SUPER_ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload a document for a teacher',
    description: 'Teachers can upload documents for themselves. Admins can upload for any teacher.',
  })
  async uploadDocument(
    @Param('teacherId', ParseIntPipe) teacherId: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadDocumentDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    // Check permission
    const canUpload = await this.documentsService.canUploadForTeacher(
      teacherId,
      user.userId,
      user.role as Role,
    );

    if (!canUpload) {
      throw new ForbiddenException('You can only upload documents for yourself');
    }

    return this.documentsService.uploadDocument(teacherId, file, dto, user.userId);
  }

  @Get(':teacherId/documents')
  @Roles(Role.TEACHER, Role.BRANCH_ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Get all documents for a teacher',
    description:
      'Teachers can view their own documents. Admins can view documents for any teacher.',
  })
  @ApiQuery({ name: 'type', enum: DocumentType, required: false })
  async getTeacherDocuments(
    @Param('teacherId', ParseIntPipe) teacherId: number,
    @Query('type') documentType: DocumentType,
    @CurrentUser() user: CurrentUserData,
  ) {
    // Check permission
    const canUpload = await this.documentsService.canUploadForTeacher(
      teacherId,
      user.userId,
      user.role as Role,
    );

    if (!canUpload) {
      throw new ForbiddenException('You can only view your own documents');
    }

    return this.documentsService.getTeacherDocuments(teacherId, documentType);
  }

  @Get(':teacherId/documents/:documentId')
  @Roles(Role.TEACHER, Role.BRANCH_ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Get a single document details',
    description:
      'Teachers can view their own document details. Admins can view any document details.',
  })
  async getDocument(
    @Param('teacherId', ParseIntPipe) teacherId: number,
    @Param('documentId', ParseIntPipe) documentId: number,
    @CurrentUser() user: CurrentUserData,
  ) {
    const document = await this.documentsService.getDocumentById(documentId);

    // Check permission
    const canAccess = this.documentsService.canAccessDocument(
      document,
      user.userId,
      user.role as Role,
    );

    if (!canAccess) {
      throw new ForbiddenException('You can only view your own documents');
    }

    return document;
  }

  @Get(':teacherId/documents/:documentId/download')
  @Roles(Role.TEACHER, Role.BRANCH_ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Download a document file',
    description: 'Teachers can download their own documents. Admins can download any document.',
  })
  async downloadDocument(
    @Param('teacherId', ParseIntPipe) teacherId: number,
    @Param('documentId', ParseIntPipe) documentId: number,
    @CurrentUser() user: CurrentUserData,
    @Res() res: Response,
  ) {
    const document = await this.documentsService.getDocumentById(documentId);

    // Check permission
    const canAccess = this.documentsService.canAccessDocument(
      document,
      user.userId,
      user.role as Role,
    );

    if (!canAccess) {
      throw new ForbiddenException('You can only download your own documents');
    }

    const { buffer, fileName, mimeType } = await this.documentsService.downloadDocument(documentId);

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(buffer);
  }

  @Patch(':teacherId/documents/:documentId')
  @Roles(Role.TEACHER, Role.BRANCH_ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Update document metadata',
    description:
      'Teachers can update their own document metadata. Admins can update any document metadata.',
  })
  async updateDocument(
    @Param('teacherId', ParseIntPipe) teacherId: number,
    @Param('documentId', ParseIntPipe) documentId: number,
    @Body() dto: UpdateDocumentDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    const document = await this.documentsService.getDocumentById(documentId);

    // Check permission
    const canAccess = this.documentsService.canAccessDocument(
      document,
      user.userId,
      user.role as Role,
    );

    if (!canAccess) {
      throw new ForbiddenException('You can only update your own documents');
    }

    return this.documentsService.updateDocument(documentId, dto);
  }

  @Delete(':teacherId/documents/:documentId')
  @Roles(Role.TEACHER, Role.BRANCH_ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Delete a document',
    description: 'Teachers can delete their own documents. Admins can delete any document.',
  })
  async deleteDocument(
    @Param('teacherId', ParseIntPipe) teacherId: number,
    @Param('documentId', ParseIntPipe) documentId: number,
    @CurrentUser() user: CurrentUserData,
  ) {
    const document = await this.documentsService.getDocumentById(documentId);

    // Check permission
    const canAccess = this.documentsService.canAccessDocument(
      document,
      user.userId,
      user.role as Role,
    );

    if (!canAccess) {
      throw new ForbiddenException('You can only delete your own documents');
    }

    return this.documentsService.deleteDocument(documentId);
  }

  @Get('documents/expiring')
  @Roles(Role.BRANCH_ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Get documents expiring soon',
    description: 'Admin only. Get documents expiring within specified days.',
  })
  @ApiQuery({ name: 'days', required: false, description: 'Days until expiry (default: 30)' })
  async getExpiringDocuments(@Query('days') days?: string) {
    const daysNumber = days ? parseInt(days, 10) : 30;
    return this.documentsService.getExpiringDocuments(daysNumber);
  }
}
