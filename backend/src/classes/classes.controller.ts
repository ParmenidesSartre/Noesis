import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { EnrollStudentDto } from './dto/enroll-student.dto';
import { AddToWaitlistDto } from './dto/add-to-waitlist.dto';
import { WithdrawStudentDto } from './dto/withdraw-student.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { GetUser } from '../auth/decorators/get-user.decorator';

interface AuthenticatedUser {
  id: number;
  organizationId: number;
  branchId?: number;
  role: Role;
  teacher?: { id: number };
}

@ApiTags('classes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Create a new class' })
  @ApiResponse({ status: 201, description: 'Class created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Course, teacher, or room not found' })
  @ApiResponse({ status: 409, description: 'Class code already exists' })
  create(@Body() createClassDto: CreateClassDto, @GetUser() user: AuthenticatedUser) {
    return this.classesService.create(createClassDto, user.organizationId, user.branchId);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Get all classes with optional filters' })
  @ApiResponse({ status: 200, description: 'Classes retrieved successfully' })
  @ApiQuery({ name: 'branchId', required: false, type: Number })
  @ApiQuery({ name: 'courseId', required: false, type: Number })
  @ApiQuery({ name: 'teacherId', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'termName', required: false, type: String })
  @ApiQuery({ name: 'academicYear', required: false, type: Number })
  findAll(
    @GetUser() user: AuthenticatedUser,
    @Query('branchId') branchId?: string,
    @Query('courseId') courseId?: string,
    @Query('teacherId') teacherId?: string,
    @Query('status') status?: string,
    @Query('termName') termName?: string,
    @Query('academicYear') academicYear?: string,
  ) {
    const filters: {
      branchId?: number;
      courseId?: number;
      teacherId?: number;
      status?: string;
      termName?: string;
      academicYear?: number;
    } = {};

    // Branch admins can only see their branch's classes
    if (user.role === Role.BRANCH_ADMIN) {
      filters.branchId = user.branchId;
    } else if (branchId) {
      filters.branchId = parseInt(branchId);
    }

    // Teachers can see classes they teach
    if (user.role === Role.TEACHER && user.teacher) {
      filters.teacherId = user.teacher.id;
    } else if (teacherId) {
      filters.teacherId = parseInt(teacherId);
    }

    if (courseId) filters.courseId = parseInt(courseId);
    if (status) filters.status = status;
    if (termName) filters.termName = termName;
    if (academicYear) filters.academicYear = parseInt(academicYear);

    return this.classesService.findAll(user.organizationId, filters);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Get a class by ID with full details' })
  @ApiResponse({ status: 200, description: 'Class retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Class not found' })
  findOne(@Param('id', ParseIntPipe) id: number, @GetUser() user: AuthenticatedUser) {
    return this.classesService.findOne(id, user.organizationId);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Update a class' })
  @ApiResponse({ status: 200, description: 'Class updated successfully' })
  @ApiResponse({ status: 404, description: 'Class not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClassDto: UpdateClassDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.classesService.update(id, updateClassDto, user.organizationId);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Delete a class (soft delete)' })
  @ApiResponse({ status: 200, description: 'Class deleted successfully' })
  @ApiResponse({ status: 404, description: 'Class not found' })
  @ApiResponse({ status: 409, description: 'Cannot delete class with active enrollments' })
  remove(@Param('id', ParseIntPipe) id: number, @GetUser() user: AuthenticatedUser) {
    return this.classesService.remove(id, user.organizationId);
  }

  @Post(':id/enroll')
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Enroll a student in a class' })
  @ApiResponse({ status: 201, description: 'Student enrolled successfully' })
  @ApiResponse({ status: 404, description: 'Class or student not found' })
  @ApiResponse({ status: 409, description: 'Student already enrolled or class is full' })
  enrollStudent(
    @Param('id', ParseIntPipe) id: number,
    @Body() enrollDto: EnrollStudentDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.classesService.enrollStudent(id, enrollDto, user.organizationId);
  }

  @Post(':id/students/:studentId/withdraw')
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Withdraw a student from a class' })
  @ApiResponse({ status: 200, description: 'Student withdrawn successfully' })
  @ApiResponse({ status: 404, description: 'Class or enrollment not found' })
  @ApiResponse({ status: 400, description: 'Student is not actively enrolled' })
  withdrawStudent(
    @Param('id', ParseIntPipe) id: number,
    @Param('studentId', ParseIntPipe) studentId: number,
    @Body() withdrawDto: WithdrawStudentDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.classesService.withdrawStudent(id, studentId, withdrawDto, user.organizationId);
  }

  @Post(':id/waitlist')
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Add a student to class waitlist' })
  @ApiResponse({ status: 201, description: 'Student added to waitlist successfully' })
  @ApiResponse({ status: 404, description: 'Class or student not found' })
  @ApiResponse({ status: 400, description: 'Waitlist not enabled for this class' })
  @ApiResponse({ status: 409, description: 'Student already on waitlist or enrolled' })
  addToWaitlist(
    @Param('id', ParseIntPipe) id: number,
    @Body() waitlistDto: AddToWaitlistDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.classesService.addToWaitlist(id, waitlistDto, user.organizationId);
  }

  @Get(':id/roster')
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Get class roster (all enrolled students)' })
  @ApiResponse({ status: 200, description: 'Class roster retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Class not found' })
  getClassRoster(@Param('id', ParseIntPipe) id: number, @GetUser() user: AuthenticatedUser) {
    return this.classesService.getClassRoster(id, user.organizationId);
  }

  @Get(':id/waitlist')
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Get class waitlist' })
  @ApiResponse({ status: 200, description: 'Class waitlist retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Class not found' })
  getClassWaitlist(@Param('id', ParseIntPipe) id: number, @GetUser() user: AuthenticatedUser) {
    return this.classesService.getClassWaitlist(id, user.organizationId);
  }
}
