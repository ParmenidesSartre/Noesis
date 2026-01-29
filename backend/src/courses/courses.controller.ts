import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { AssignCourseToBranchDto } from './dto/assign-course-to-branch.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserData } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Courses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Create a new course' })
  create(@Body() createCourseDto: CreateCourseDto, @CurrentUser() user: CurrentUserData) {
    return this.coursesService.create(createCourseDto, user.organizationId);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Get all courses' })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'isTemplate', required: false, type: Boolean })
  @ApiQuery({ name: 'branchId', required: false, type: Number })
  findAll(
    @CurrentUser() user: CurrentUserData,
    @Query('category') category?: string,
    @Query('isActive') isActive?: string,
    @Query('isTemplate') isTemplate?: string,
    @Query('branchId', new ParseIntPipe({ optional: true })) branchId?: number,
  ) {
    const filters: {
      category?: string;
      isActive?: boolean;
      isTemplate?: boolean;
      branchId?: number;
    } = {};

    if (category) filters.category = category;
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    if (isTemplate !== undefined) filters.isTemplate = isTemplate === 'true';
    if (branchId) filters.branchId = branchId;

    return this.coursesService.findAll(user.organizationId, filters);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Get a course by ID' })
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: CurrentUserData) {
    return this.coursesService.findOne(id, user.organizationId);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Update a course' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCourseDto: UpdateCourseDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.coursesService.update(id, updateCourseDto, user.organizationId);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete a course (soft delete)' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: CurrentUserData) {
    return this.coursesService.remove(id, user.organizationId);
  }

  @Delete(':id/hard')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Permanently delete a course' })
  hardDelete(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: CurrentUserData) {
    return this.coursesService.hardDelete(id, user.organizationId);
  }

  @Post(':id/branches')
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Assign course to a branch with optional customization' })
  assignToBranch(
    @Param('id', ParseIntPipe) id: number,
    @Body() assignDto: AssignCourseToBranchDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.coursesService.assignToBranch(id, assignDto, user.organizationId);
  }

  @Delete(':id/branches/:branchId')
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Remove course from a branch' })
  removeFromBranch(
    @Param('id', ParseIntPipe) id: number,
    @Param('branchId', ParseIntPipe) branchId: number,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.coursesService.removeFromBranch(id, branchId, user.organizationId);
  }

  @Get(':id/branches')
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Get all branches offering this course' })
  getCourseBranches(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: CurrentUserData) {
    return this.coursesService.getCourseBranches(id, user.organizationId);
  }
}
