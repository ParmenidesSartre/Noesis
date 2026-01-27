import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ParentsService } from './parents.service';
import { CreateLinkRequestDto } from './dto/create-link-request.dto';
import { RejectLinkRequestDto } from './dto/reject-link-request.dto';
import { UnlinkStudentDto } from './dto/unlink-student.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserData } from '../auth/decorators/current-user.decorator';
import { Role, ParentLinkRequestStatus } from '@prisma/client';

@ApiTags('Parents')
@ApiBearerAuth()
@Controller('parents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ParentsController {
  constructor(private readonly parentsService: ParentsService) {}

  @Post('link-requests')
  @Roles(Role.PARENT)
  @ApiOperation({
    summary: 'Request to link to a student',
    description:
      'Parent requests to link their account to a student by providing student code, name, and DOB for verification',
  })
  async createLinkRequest(@CurrentUser() user: CurrentUserData, @Body() dto: CreateLinkRequestDto) {
    // Get parent ID from user
    const parent = await this.parentsService['prisma'].parent.findFirst({
      where: { userId: user.userId },
    });

    if (!parent) {
      throw new ForbiddenException('Parent profile not found');
    }

    return this.parentsService.createLinkRequest(parent.id, user.organizationId, dto);
  }

  @Get('link-requests')
  @Roles(Role.PARENT, Role.BRANCH_ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Get link requests',
    description: 'Parents can view their own requests. Admins can view requests in their scope.',
  })
  @ApiQuery({ name: 'status', enum: ParentLinkRequestStatus, required: false })
  async getLinkRequests(
    @CurrentUser() user: CurrentUserData,
    @Query('status') status?: ParentLinkRequestStatus,
  ) {
    return this.parentsService.findAllLinkRequests(
      user.userId,
      user.organizationId,
      user.role as Role,
      user.branchId ?? undefined,
      status,
    );
  }

  @Post('link-requests/:id/approve')
  @Roles(Role.BRANCH_ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Approve link request',
    description: 'Admin approves a parent-student link request and creates the relationship',
  })
  async approveLinkRequest(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.parentsService.approveLinkRequest(
      id,
      user.userId,
      user.role as Role,
      user.organizationId,
      user.branchId ?? undefined,
    );
  }

  @Post('link-requests/:id/reject')
  @Roles(Role.BRANCH_ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Reject link request',
    description: 'Admin rejects a parent-student link request with a reason',
  })
  async rejectLinkRequest(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserData,
    @Body() dto: RejectLinkRequestDto,
  ) {
    return this.parentsService.rejectLinkRequest(
      id,
      user.role as Role,
      user.organizationId,
      user.branchId ?? undefined,
      dto,
    );
  }

  @Get('students')
  @Roles(Role.PARENT)
  @ApiOperation({
    summary: 'Get linked students',
    description: 'Parent views all students linked to their account',
  })
  async getLinkedStudents(@CurrentUser() user: CurrentUserData) {
    // Get parent ID from user
    const parent = await this.parentsService['prisma'].parent.findFirst({
      where: { userId: user.userId },
    });

    if (!parent) {
      throw new ForbiddenException('Parent profile not found');
    }

    return this.parentsService.getLinkedStudents(parent.id);
  }

  @Delete(':parentId/students/:studentId')
  @Roles(Role.BRANCH_ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Unlink parent-student relationship',
    description: 'Admin removes the link between a parent and student with a reason',
  })
  async unlinkStudent(
    @Param('parentId', ParseIntPipe) parentId: number,
    @Param('studentId', ParseIntPipe) studentId: number,
    @CurrentUser() user: CurrentUserData,
    @Body() dto: UnlinkStudentDto,
  ) {
    return this.parentsService.unlinkStudent(
      parentId,
      studentId,
      user.role as Role,
      user.organizationId,
      user.branchId ?? undefined,
      dto,
    );
  }
}
