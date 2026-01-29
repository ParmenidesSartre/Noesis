import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from './storage.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { Role, DocumentType } from '@prisma/client';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  /**
   * Upload a document for a teacher
   */
  async uploadDocument(
    teacherId: number,
    file: Express.Multer.File,
    dto: UploadDocumentDto,
    uploadedByUserId: number,
  ) {
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      throw new BadRequestException('File size must not exceed 10MB');
    }

    // Validate file type (only PDF and images)
    const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only PDF and image files (JPEG, JPG, PNG) are allowed');
    }

    // Verify teacher exists
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    // Upload file to storage
    const { fileUrl, storedName } = await this.storageService.uploadFile(
      file,
      `documents/teacher-${teacherId}`,
    );

    // Create document record in database
    const document = await this.prisma.document.create({
      data: {
        teacherId,
        documentType: dto.documentType,
        description: dto.description,
        fileName: file.originalname,
        storedName,
        fileUrl,
        fileSize: file.size,
        mimeType: file.mimetype,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
        uploadedBy: uploadedByUserId,
      },
      include: {
        teacher: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        uploadedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return document;
  }

  /**
   * Get all documents for a teacher with optional filtering
   */
  async getTeacherDocuments(teacherId: number, documentType?: DocumentType) {
    const where: {
      teacherId: number;
      isActive: boolean;
      documentType?: DocumentType;
    } = {
      teacherId,
      isActive: true,
    };

    if (documentType) {
      where.documentType = documentType;
    }

    const documents = await this.prisma.document.findMany({
      where,
      include: {
        uploadedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        uploadedAt: 'desc',
      },
    });

    return documents;
  }

  /**
   * Get a single document by ID
   */
  async getDocumentById(documentId: number) {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
      include: {
        teacher: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        uploadedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!document || !document.isActive) {
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  /**
   * Download a document file
   */
  async downloadDocument(documentId: number) {
    const document = await this.getDocumentById(documentId);

    try {
      const fileBuffer = await this.storageService.getFile(document.storedName);
      return {
        buffer: fileBuffer,
        fileName: document.fileName,
        mimeType: document.mimeType,
      };
    } catch {
      throw new BadRequestException('Failed to download document');
    }
  }

  /**
   * Update document metadata
   */
  async updateDocument(documentId: number, dto: UpdateDocumentDto) {
    const document = await this.getDocumentById(documentId);

    const updatedDocument = await this.prisma.document.update({
      where: { id: documentId },
      data: {
        description: dto.description ?? document.description,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : document.expiryDate,
        expiryAlerted: dto.expiryDate ? false : document.expiryAlerted, // Reset alert if expiry date changes
      },
      include: {
        teacher: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        uploadedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return updatedDocument;
  }

  /**
   * Delete a document (soft delete)
   */
  async deleteDocument(documentId: number) {
    await this.getDocumentById(documentId);

    // Soft delete - mark as inactive
    await this.prisma.document.update({
      where: { id: documentId },
      data: {
        isActive: false,
      },
    });

    // Optionally delete the physical file (uncomment if needed)
    // await this.storageService.deleteFile(document.storedName);

    return {
      message: 'Document deleted successfully',
    };
  }

  /**
   * Get documents expiring within specified days
   * Admin only
   */
  async getExpiringDocuments(days: number = 30) {
    const expiryThreshold = new Date();
    expiryThreshold.setDate(expiryThreshold.getDate() + days);

    const documents = await this.prisma.document.findMany({
      where: {
        isActive: true,
        expiryDate: {
          lte: expiryThreshold,
          gte: new Date(), // Only future expiries, not expired ones
        },
      },
      include: {
        teacher: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        uploadedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        expiryDate: 'asc',
      },
    });

    return documents;
  }

  /**
   * Check if user can access a document
   * Teachers can only access their own documents
   * Admins can access all documents
   */
  canAccessDocument(
    document: { teacherId: number; teacher: { user: { id: number } } },
    userId: number,
    userRole: Role,
  ): boolean {
    if (userRole === Role.SUPER_ADMIN || userRole === Role.BRANCH_ADMIN) {
      return true;
    }

    if (userRole === Role.TEACHER) {
      return document.teacher.user.id === userId;
    }

    return false;
  }

  /**
   * Check if user can upload document for a teacher
   * Teachers can only upload for themselves
   * Admins can upload for any teacher
   */
  async canUploadForTeacher(teacherId: number, userId: number, userRole: Role): Promise<boolean> {
    if (userRole === Role.SUPER_ADMIN || userRole === Role.BRANCH_ADMIN) {
      return true;
    }

    if (userRole === Role.TEACHER) {
      const teacher = await this.prisma.teacher.findUnique({
        where: { id: teacherId },
        include: { user: true },
      });

      return teacher?.user.id === userId;
    }

    return false;
  }
}
