import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role, LeaveType, LeaveStatus } from '@prisma/client';
import {
  LeaveService,
  CreateLeaveRequestDto,
  UpdateLeaveRequestDto,
  ReviewLeaveDto,
} from './leave.service';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  /**
   * Submit a leave request
   * Teachers can submit for themselves, admins can submit for any teacher
   */
  @Post('teachers/:id/leave-requests')
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.TEACHER)
  async createLeaveRequest(
    @Param('id', ParseIntPipe) teacherId: number,
    @Body() dto: CreateLeaveRequestDto,
    @Request() req,
  ) {
    return this.leaveService.createLeaveRequest(
      teacherId,
      dto,
      req.user.userId,
      req.user.role,
    );
  }

  /**
   * Get all leave requests for a teacher
   */
  @Get('teachers/:id/leave-requests')
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.TEACHER)
  async getTeacherLeaveRequests(
    @Param('id', ParseIntPipe) teacherId: number,
    @Query('status') status?: LeaveStatus,
    @Query('leaveType') leaveType?: LeaveType,
    @Query('year') year?: string,
    @Request() req?,
  ) {
    const filters: any = {};
    if (status) filters.status = status;
    if (leaveType) filters.leaveType = leaveType;
    if (year) filters.year = parseInt(year);

    return this.leaveService.getTeacherLeaveRequests(
      teacherId,
      req.user.userId,
      req.user.role,
      filters,
    );
  }

  /**
   * Get a single leave request
   */
  @Get('teachers/:teacherId/leave-requests/:id')
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.TEACHER)
  async getLeaveRequest(
    @Param('teacherId', ParseIntPipe) teacherId: number,
    @Param('id', ParseIntPipe) leaveRequestId: number,
    @Request() req,
  ) {
    return this.leaveService.getLeaveRequest(
      teacherId,
      leaveRequestId,
      req.user.userId,
      req.user.role,
    );
  }

  /**
   * Update a pending leave request
   */
  @Patch('teachers/:teacherId/leave-requests/:id')
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.TEACHER)
  async updateLeaveRequest(
    @Param('teacherId', ParseIntPipe) teacherId: number,
    @Param('id', ParseIntPipe) leaveRequestId: number,
    @Body() dto: UpdateLeaveRequestDto,
    @Request() req,
  ) {
    return this.leaveService.updateLeaveRequest(
      teacherId,
      leaveRequestId,
      dto,
      req.user.userId,
      req.user.role,
    );
  }

  /**
   * Approve a leave request (admin only)
   */
  @Patch('teachers/:teacherId/leave-requests/:id/approve')
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN)
  async approveLeaveRequest(
    @Param('teacherId', ParseIntPipe) teacherId: number,
    @Param('id', ParseIntPipe) leaveRequestId: number,
    @Body() dto: ReviewLeaveDto,
    @Request() req,
  ) {
    return this.leaveService.approveLeaveRequest(
      teacherId,
      leaveRequestId,
      dto,
      req.user.userId,
      req.user.role,
    );
  }

  /**
   * Reject a leave request (admin only)
   */
  @Patch('teachers/:teacherId/leave-requests/:id/reject')
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN)
  async rejectLeaveRequest(
    @Param('teacherId', ParseIntPipe) teacherId: number,
    @Param('id', ParseIntPipe) leaveRequestId: number,
    @Body() dto: ReviewLeaveDto,
    @Request() req,
  ) {
    return this.leaveService.rejectLeaveRequest(
      teacherId,
      leaveRequestId,
      dto,
      req.user.userId,
      req.user.role,
    );
  }

  /**
   * Cancel/delete a leave request
   */
  @Delete('teachers/:teacherId/leave-requests/:id')
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.TEACHER)
  async cancelLeaveRequest(
    @Param('teacherId', ParseIntPipe) teacherId: number,
    @Param('id', ParseIntPipe) leaveRequestId: number,
    @Request() req,
  ) {
    return this.leaveService.cancelLeaveRequest(
      teacherId,
      leaveRequestId,
      req.user.userId,
      req.user.role,
    );
  }

  /**
   * Get leave balance for a teacher
   */
  @Get('teachers/:id/leave-balance')
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.TEACHER)
  async getLeaveBalance(
    @Param('id', ParseIntPipe) teacherId: number,
    @Query('year') year?: string,
    @Request() req?,
  ) {
    const targetYear = year ? parseInt(year) : undefined;
    return this.leaveService.getLeaveBalance(
      teacherId,
      req.user.userId,
      req.user.role,
      targetYear,
    );
  }

  /**
   * Get all pending leave requests (admin only)
   */
  @Get('leave-requests/pending')
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN)
  async getAllPendingLeaves(@Request() req) {
    return this.leaveService.getAllPendingLeaves(
      req.user.userId,
      req.user.role,
      req.user.organizationId,
      req.user.branchId,
    );
  }
}
