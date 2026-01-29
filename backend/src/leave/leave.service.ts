import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LeaveType, LeaveStatus, Role } from '@prisma/client';

export interface CreateLeaveRequestDto {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  supportingDocuments?: string;
}

export interface UpdateLeaveRequestDto {
  startDate?: string;
  endDate?: string;
  reason?: string;
  supportingDocuments?: string;
}

export interface ReviewLeaveDto {
  comments?: string;
}

@Injectable()
export class LeaveService {
  constructor(private prisma: PrismaService) {}

  /**
   * Submit a leave request
   */
  async createLeaveRequest(
    teacherId: number,
    dto: CreateLeaveRequestDto,
    requestingUserId: number,
    requestingUserRole: Role,
  ) {
    // Validate dates
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (endDate < startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    if (startDate < today) {
      throw new BadRequestException('Cannot submit leave for past dates');
    }

    // Verify teacher exists
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
      include: { user: true },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    // Permission check: Teachers can only submit for themselves, admins can submit for anyone
    if (requestingUserRole === Role.TEACHER && teacher.userId !== requestingUserId) {
      throw new ForbiddenException('Teachers can only submit leave requests for themselves');
    }

    // Calculate total days (inclusive)
    const totalDays =
      Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Track who submitted (for admin submissions on behalf of teacher)
    const submittedBy = teacher.userId !== requestingUserId ? requestingUserId : null;

    // Create leave request
    const leaveRequest = await this.prisma.leaveRequest.create({
      data: {
        teacherId,
        leaveType: dto.leaveType,
        startDate,
        endDate,
        totalDays,
        reason: dto.reason,
        supportingDocuments: dto.supportingDocuments,
        submittedBy,
        status: LeaveStatus.PENDING,
      },
      include: {
        teacher: {
          include: {
            user: true,
          },
        },
        reviewedBy: true,
      },
    });

    return leaveRequest;
  }

  /**
   * Get all leave requests for a teacher
   */
  async getTeacherLeaveRequests(
    teacherId: number,
    requestingUserId: number,
    requestingUserRole: Role,
    filters?: {
      status?: LeaveStatus;
      leaveType?: LeaveType;
      year?: number;
    },
  ) {
    // Verify teacher exists
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
      include: { user: true },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    // Permission check: Teachers can only view their own, admins can view any
    if (requestingUserRole === Role.TEACHER && teacher.userId !== requestingUserId) {
      throw new ForbiddenException('Teachers can only view their own leave requests');
    }

    // Build where clause
    const where: {
      teacherId: number;
      status?: LeaveStatus;
      leaveType?: LeaveType;
      startDate?: {
        gte: Date;
        lte: Date;
      };
    } = { teacherId };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.leaveType) {
      where.leaveType = filters.leaveType;
    }

    if (filters?.year) {
      where.startDate = {
        gte: new Date(`${filters.year}-01-01`),
        lte: new Date(`${filters.year}-12-31`),
      };
    }

    const leaveRequests = await this.prisma.leaveRequest.findMany({
      where,
      include: {
        teacher: {
          include: {
            user: true,
          },
        },
        reviewedBy: true,
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    return leaveRequests;
  }

  /**
   * Get a single leave request by ID
   */
  async getLeaveRequest(
    teacherId: number,
    leaveRequestId: number,
    requestingUserId: number,
    requestingUserRole: Role,
  ) {
    const leaveRequest = await this.prisma.leaveRequest.findFirst({
      where: {
        id: leaveRequestId,
        teacherId,
      },
      include: {
        teacher: {
          include: {
            user: true,
          },
        },
        reviewedBy: true,
      },
    });

    if (!leaveRequest) {
      throw new NotFoundException('Leave request not found');
    }

    // Permission check
    if (requestingUserRole === Role.TEACHER && leaveRequest.teacher.userId !== requestingUserId) {
      throw new ForbiddenException('You do not have permission to view this leave request');
    }

    return leaveRequest;
  }

  /**
   * Update a pending leave request
   */
  async updateLeaveRequest(
    teacherId: number,
    leaveRequestId: number,
    dto: UpdateLeaveRequestDto,
    requestingUserId: number,
    requestingUserRole: Role,
  ) {
    const leaveRequest = await this.prisma.leaveRequest.findFirst({
      where: {
        id: leaveRequestId,
        teacherId,
      },
      include: {
        teacher: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!leaveRequest) {
      throw new NotFoundException('Leave request not found');
    }

    // Permission check
    if (requestingUserRole === Role.TEACHER && leaveRequest.teacher.userId !== requestingUserId) {
      throw new ForbiddenException('You do not have permission to update this leave request');
    }

    // Can only update pending requests
    if (leaveRequest.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('Can only update leave requests with PENDING status');
    }

    // Validate dates if provided
    let startDate = leaveRequest.startDate;
    let endDate = leaveRequest.endDate;
    let totalDays = leaveRequest.totalDays;

    if (dto.startDate) {
      startDate = new Date(dto.startDate);
    }

    if (dto.endDate) {
      endDate = new Date(dto.endDate);
    }

    if (endDate < startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    // Recalculate total days
    totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const updated = await this.prisma.leaveRequest.update({
      where: { id: leaveRequestId },
      data: {
        startDate,
        endDate,
        totalDays,
        reason: dto.reason ?? leaveRequest.reason,
        supportingDocuments: dto.supportingDocuments ?? leaveRequest.supportingDocuments,
      },
      include: {
        teacher: {
          include: {
            user: true,
          },
        },
        reviewedBy: true,
      },
    });

    return updated;
  }

  /**
   * Approve a leave request
   */
  async approveLeaveRequest(
    teacherId: number,
    leaveRequestId: number,
    dto: ReviewLeaveDto,
    adminUserId: number,
    adminRole: Role,
  ) {
    // Only admins can approve
    if (adminRole !== Role.SUPER_ADMIN && adminRole !== Role.BRANCH_ADMIN) {
      throw new ForbiddenException('Only admins can approve leave requests');
    }

    const leaveRequest = await this.prisma.leaveRequest.findFirst({
      where: {
        id: leaveRequestId,
        teacherId,
      },
      include: {
        teacher: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!leaveRequest) {
      throw new NotFoundException('Leave request not found');
    }

    // Can only approve pending requests
    if (leaveRequest.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('Can only approve leave requests with PENDING status');
    }

    // Approve the leave request
    const approved = await this.prisma.leaveRequest.update({
      where: { id: leaveRequestId },
      data: {
        status: LeaveStatus.APPROVED,
        adminComments: dto.comments,
        reviewedByUserId: adminUserId,
        reviewedAt: new Date(),
      },
      include: {
        teacher: {
          include: {
            user: true,
          },
        },
        reviewedBy: true,
      },
    });

    return approved;
  }

  /**
   * Reject a leave request
   */
  async rejectLeaveRequest(
    teacherId: number,
    leaveRequestId: number,
    dto: ReviewLeaveDto,
    adminUserId: number,
    adminRole: Role,
  ) {
    // Only admins can reject
    if (adminRole !== Role.SUPER_ADMIN && adminRole !== Role.BRANCH_ADMIN) {
      throw new ForbiddenException('Only admins can reject leave requests');
    }

    const leaveRequest = await this.prisma.leaveRequest.findFirst({
      where: {
        id: leaveRequestId,
        teacherId,
      },
      include: {
        teacher: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!leaveRequest) {
      throw new NotFoundException('Leave request not found');
    }

    // Can only reject pending requests
    if (leaveRequest.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('Can only reject leave requests with PENDING status');
    }

    // Rejection requires a comment
    if (!dto.comments || dto.comments.trim().length === 0) {
      throw new BadRequestException('Rejection reason is required');
    }

    // Reject the leave request
    const rejected = await this.prisma.leaveRequest.update({
      where: { id: leaveRequestId },
      data: {
        status: LeaveStatus.REJECTED,
        adminComments: dto.comments,
        reviewedByUserId: adminUserId,
        reviewedAt: new Date(),
      },
      include: {
        teacher: {
          include: {
            user: true,
          },
        },
        reviewedBy: true,
      },
    });

    return rejected;
  }

  /**
   * Cancel/delete a leave request
   */
  async cancelLeaveRequest(
    teacherId: number,
    leaveRequestId: number,
    requestingUserId: number,
    requestingUserRole: Role,
  ) {
    const leaveRequest = await this.prisma.leaveRequest.findFirst({
      where: {
        id: leaveRequestId,
        teacherId,
      },
      include: {
        teacher: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!leaveRequest) {
      throw new NotFoundException('Leave request not found');
    }

    // Teachers can only cancel their own pending requests
    // Admins can cancel any request
    if (requestingUserRole === Role.TEACHER) {
      if (leaveRequest.teacher.userId !== requestingUserId) {
        throw new ForbiddenException('You do not have permission to cancel this leave request');
      }

      // Teachers can't cancel approved leaves
      if (leaveRequest.status === LeaveStatus.APPROVED) {
        throw new ForbiddenException(
          'Cannot cancel approved leave. Please contact an administrator.',
        );
      }
    }

    // Delete the leave request
    await this.prisma.leaveRequest.delete({
      where: { id: leaveRequestId },
    });

    return { message: 'Leave request cancelled successfully' };
  }

  /**
   * Get leave balance for a teacher
   */
  async getLeaveBalance(
    teacherId: number,
    requestingUserId: number,
    requestingUserRole: Role,
    year?: number,
  ) {
    // Verify teacher exists
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
      include: { user: true },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    // Permission check
    if (requestingUserRole === Role.TEACHER && teacher.userId !== requestingUserId) {
      throw new ForbiddenException('Teachers can only view their own leave balance');
    }

    const targetYear = year || new Date().getFullYear();

    // Get all approved leave for the year
    const approvedLeaves = await this.prisma.leaveRequest.findMany({
      where: {
        teacherId,
        status: LeaveStatus.APPROVED,
        startDate: {
          gte: new Date(`${targetYear}-01-01`),
          lte: new Date(`${targetYear}-12-31`),
        },
      },
    });

    // Calculate leave balance by type
    const balances = {
      SICK: { total: 14, used: 0, remaining: 14 }, // 14 days per year
      ANNUAL: { total: 21, used: 0, remaining: 21 }, // 21 days per year
      EMERGENCY: { total: 7, used: 0, remaining: 7 }, // 7 days per year
      UNPAID: { total: null, used: 0, remaining: null }, // Unlimited
    };

    // Sum up used days by leave type
    for (const leave of approvedLeaves) {
      balances[leave.leaveType].used += leave.totalDays;
      const total = balances[leave.leaveType].total;
      if (total !== null) {
        balances[leave.leaveType].remaining = total - balances[leave.leaveType].used;
      }
    }

    return {
      teacherId,
      year: targetYear,
      balances,
    };
  }

  /**
   * Get all pending leave requests (admin only)
   */
  async getAllPendingLeaves(
    adminUserId: number,
    adminRole: Role,
    organizationId: number,
    branchId?: number,
  ) {
    // Only admins can view all pending requests
    if (adminRole !== Role.SUPER_ADMIN && adminRole !== Role.BRANCH_ADMIN) {
      throw new ForbiddenException('Only admins can view all pending leave requests');
    }

    // Build where clause
    const where: {
      status: LeaveStatus;
      teacher: {
        organizationId: number;
        branchId?: number;
      };
    } = {
      status: LeaveStatus.PENDING,
      teacher: {
        organizationId,
      },
    };

    // Branch admins can only see their branch
    if (adminRole === Role.BRANCH_ADMIN && branchId) {
      where.teacher.branchId = branchId;
    }

    const pendingLeaves = await this.prisma.leaveRequest.findMany({
      where,
      include: {
        teacher: {
          include: {
            user: true,
            branch: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return pendingLeaves;
  }
}
