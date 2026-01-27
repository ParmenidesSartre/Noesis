import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLinkRequestDto } from './dto/create-link-request.dto';
import { RejectLinkRequestDto } from './dto/reject-link-request.dto';
import { UnlinkStudentDto } from './dto/unlink-student.dto';
import { Role, ParentLinkRequestStatus, Prisma } from '@prisma/client';

@Injectable()
export class ParentsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Parent requests to link to a student
   * Validates student information before creating request
   */
  async createLinkRequest(parentId: number, organizationId: number, dto: CreateLinkRequestDto) {
    // Find student by code within organization
    const student = await this.prisma.student.findFirst({
      where: {
        studentCode: dto.studentCode,
        organizationId,
      },
      include: {
        user: true,
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Verify student name matches
    if (student.user.name.toLowerCase() !== dto.studentName.toLowerCase()) {
      throw new BadRequestException(
        'Student information does not match our records. Please verify the student name.',
      );
    }

    // Verify student date of birth matches
    const providedDOB = new Date(dto.studentDateOfBirth);
    const studentDOB = student.dateOfBirth ? new Date(student.dateOfBirth) : null;

    if (
      !studentDOB ||
      providedDOB.toISOString().split('T')[0] !== studentDOB.toISOString().split('T')[0]
    ) {
      throw new BadRequestException(
        'Student information does not match our records. Please verify the date of birth.',
      );
    }

    // Check if already linked
    const existingLink = await this.prisma.parentStudent.findFirst({
      where: {
        parentId,
        studentId: student.id,
      },
    });

    if (existingLink) {
      throw new ConflictException('You are already linked to this student');
    }

    // Check for existing pending request
    const existingRequest = await this.prisma.parentLinkRequest.findFirst({
      where: {
        parentId,
        studentId: student.id,
        status: ParentLinkRequestStatus.PENDING,
      },
    });

    if (existingRequest) {
      throw new ConflictException('You already have a pending link request for this student');
    }

    // Create link request
    const linkRequest = await this.prisma.parentLinkRequest.create({
      data: {
        parentId,
        studentId: student.id,
        studentCode: dto.studentCode,
        studentName: dto.studentName,
        studentDateOfBirth: new Date(dto.studentDateOfBirth),
        relationship: dto.relationship,
        status: ParentLinkRequestStatus.PENDING,
      },
      include: {
        parent: {
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
        student: {
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
      },
    });

    return linkRequest;
  }

  /**
   * Get link requests
   * - Parents can view their own requests
   * - Admins can view requests in their scope
   */
  async findAllLinkRequests(
    userId: number,
    organizationId: number,
    userRole: Role,
    branchId?: number,
    status?: ParentLinkRequestStatus,
  ) {
    // Build where clause
    const where: Prisma.ParentLinkRequestWhereInput = {};

    if (userRole === Role.PARENT) {
      // Parents can only see their own requests
      const parent = await this.prisma.parent.findFirst({
        where: { userId },
      });

      if (!parent) {
        throw new NotFoundException('Parent profile not found');
      }

      where.parentId = parent.id;
    } else if (userRole === Role.BRANCH_ADMIN && branchId) {
      // Branch admins can see requests for students in their branch
      where.student = {
        branchId,
      };
    } else if (userRole === Role.SUPER_ADMIN) {
      // Super admins can see all requests in organization
      where.student = {
        organizationId,
      };
    } else {
      throw new ForbiddenException('You do not have permission to view link requests');
    }

    // Add status filter if provided
    if (status) {
      where.status = status;
    }

    const linkRequests = await this.prisma.parentLinkRequest.findMany({
      where,
      include: {
        parent: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        student: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            branch: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
        approvedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return linkRequests;
  }

  /**
   * Admin approves a link request
   * Creates parent-student relationship
   */
  async approveLinkRequest(
    requestId: number,
    adminUserId: number,
    adminRole: Role,
    organizationId: number,
    branchId?: number,
  ) {
    const linkRequest = await this.prisma.parentLinkRequest.findUnique({
      where: { id: requestId },
      include: {
        student: true,
        parent: true,
      },
    });

    if (!linkRequest) {
      throw new NotFoundException('Link request not found');
    }

    // Verify admin has permission for this request's branch
    if (adminRole === Role.BRANCH_ADMIN && linkRequest.student.branchId !== branchId) {
      throw new ForbiddenException('You can only approve requests for your branch');
    }

    // Check if request is still pending
    if (linkRequest.status !== ParentLinkRequestStatus.PENDING) {
      throw new BadRequestException(
        `This request has already been ${linkRequest.status.toLowerCase()}`,
      );
    }

    // Check if already linked (race condition check)
    const existingLink = await this.prisma.parentStudent.findFirst({
      where: {
        parentId: linkRequest.parentId,
        studentId: linkRequest.studentId,
      },
    });

    if (existingLink) {
      throw new ConflictException('Parent is already linked to this student');
    }

    // Approve request and create parent-student link in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Update link request status
      const updatedRequest = await tx.parentLinkRequest.update({
        where: { id: requestId },
        data: {
          status: ParentLinkRequestStatus.APPROVED,
          approvedBy: adminUserId,
          approvedAt: new Date(),
        },
        include: {
          parent: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
          student: {
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
          approvedByUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Check if student already has a primary parent
      const existingPrimaryParent = await tx.parentStudent.findFirst({
        where: {
          studentId: linkRequest.studentId,
          isPrimary: true,
        },
      });

      // Create parent-student relationship
      await tx.parentStudent.create({
        data: {
          parentId: linkRequest.parentId,
          studentId: linkRequest.studentId,
          relationship: linkRequest.relationship,
          isPrimary: !existingPrimaryParent, // First parent is primary
        },
      });

      return updatedRequest;
    });

    return result;
  }

  /**
   * Admin rejects a link request
   */
  async rejectLinkRequest(
    requestId: number,
    adminRole: Role,
    organizationId: number,
    branchId: number | undefined,
    dto: RejectLinkRequestDto,
  ) {
    const linkRequest = await this.prisma.parentLinkRequest.findUnique({
      where: { id: requestId },
      include: {
        student: true,
      },
    });

    if (!linkRequest) {
      throw new NotFoundException('Link request not found');
    }

    // Verify admin has permission for this request's branch
    if (adminRole === Role.BRANCH_ADMIN && linkRequest.student.branchId !== branchId) {
      throw new ForbiddenException('You can only reject requests for your branch');
    }

    // Check if request is still pending
    if (linkRequest.status !== ParentLinkRequestStatus.PENDING) {
      throw new BadRequestException(
        `This request has already been ${linkRequest.status.toLowerCase()}`,
      );
    }

    // Update link request to rejected
    const updatedRequest = await this.prisma.parentLinkRequest.update({
      where: { id: requestId },
      data: {
        status: ParentLinkRequestStatus.REJECTED,
        rejectionReason: dto.reason,
        rejectedAt: new Date(),
      },
      include: {
        parent: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        student: {
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
      },
    });

    return updatedRequest;
  }

  /**
   * Get linked students for a parent
   */
  async getLinkedStudents(parentId: number) {
    const linkedStudents = await this.prisma.parentStudent.findMany({
      where: { parentId },
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
            branch: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return linkedStudents;
  }

  /**
   * Admin unlinks parent-student relationship
   */
  async unlinkStudent(
    parentId: number,
    studentId: number,
    adminRole: Role,
    organizationId: number,
    branchId: number | undefined,
    dto: UnlinkStudentDto,
  ) {
    // Verify the relationship exists
    const parentStudent = await this.prisma.parentStudent.findFirst({
      where: {
        parentId,
        studentId,
      },
      include: {
        student: true,
      },
    });

    if (!parentStudent) {
      throw new NotFoundException('Parent-student relationship not found');
    }

    // Verify admin has permission for this student's branch
    if (adminRole === Role.BRANCH_ADMIN && parentStudent.student.branchId !== branchId) {
      throw new ForbiddenException('You can only unlink relationships in your branch');
    }

    // Delete the relationship
    await this.prisma.parentStudent.delete({
      where: { id: parentStudent.id },
    });

    // TODO: Log the unlinking action with reason (when audit log is implemented)

    return {
      message: 'Parent-student relationship unlinked successfully',
      reason: dto.reason,
    };
  }
}
