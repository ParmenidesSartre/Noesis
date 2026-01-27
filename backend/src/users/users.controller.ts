import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserData } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Create a new user (Admin only)' })
  create(@Body() createUserDto: CreateUserDto, @CurrentUser() user: CurrentUserData) {
    return this.usersService.create(createUserDto, user.organizationId, user.role as Role);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Get all users' })
  @ApiQuery({ name: 'role', enum: Role, required: false })
  @ApiQuery({ name: 'branchId', type: Number, required: false })
  @ApiQuery({ name: 'isActive', type: Boolean, required: false })
  findAll(
    @CurrentUser() user: CurrentUserData,
    @Query('role') role?: Role,
    @Query('branchId', new ParseIntPipe({ optional: true })) branchId?: number,
    @Query('isActive') isActive?: string,
  ) {
    const filters: Record<string, boolean | Role | number | undefined> = {};
    if (role) filters.role = role;
    if (branchId) filters.branchId = branchId;
    if (isActive !== undefined) filters.isActive = isActive === 'true';

    return this.usersService.findAll(
      user.organizationId,
      user.role as Role,
      user.branchId ?? undefined,
      filters,
    );
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Get user by ID' })
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: CurrentUserData) {
    return this.usersService.findOne(
      id,
      user.organizationId,
      user.role as Role,
      user.branchId ?? undefined,
    );
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Update user' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.usersService.update(
      id,
      updateUserDto,
      user.organizationId,
      user.role as Role,
      user.branchId ?? undefined,
    );
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Deactivate user' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: CurrentUserData) {
    return this.usersService.remove(
      id,
      user.organizationId,
      user.role as Role,
      user.branchId ?? undefined,
    );
  }

  @Post(':id/reactivate')
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Reactivate a deactivated user' })
  reactivate(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: CurrentUserData) {
    return this.usersService.reactivate(
      id,
      user.organizationId,
      user.role as Role,
      user.branchId ?? undefined,
    );
  }

  @Post('teachers')
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN)
  @ApiOperation({
    summary: 'Create a new teacher',
    description: 'Creates a teacher with auto-generated credentials. Returns temporary password.',
  })
  createTeacher(@Body() createTeacherDto: CreateTeacherDto, @CurrentUser() user: CurrentUserData) {
    return this.usersService.createTeacher(
      createTeacherDto,
      user.organizationId,
      user.role as Role,
    );
  }

  @Post('students')
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN)
  @ApiOperation({
    summary: 'Create a new student',
    description:
      'Creates a student and links to parent. Creates parent if does not exist. Returns temporary passwords.',
  })
  createStudent(@Body() createStudentDto: CreateStudentDto, @CurrentUser() user: CurrentUserData) {
    return this.usersService.createStudent(
      createStudentDto,
      user.organizationId,
      user.role as Role,
    );
  }

  @Post('change-password')
  @ApiOperation({ summary: 'Change password for current user' })
  changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.usersService.changePassword(
      user.userId,
      changePasswordDto.oldPassword,
      changePasswordDto.newPassword,
    );
  }

  @Post(':id/reset-password')
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN)
  @ApiOperation({
    summary: 'Reset password for a user (Admin only)',
    description: 'Generates a new temporary password for the user',
  })
  resetPassword(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: CurrentUserData) {
    return this.usersService.resetPassword(
      id,
      user.organizationId,
      user.role as Role,
      user.branchId ?? undefined,
    );
  }

  @Post('set-password')
  @ApiOperation({
    summary: 'Set new password',
    description: 'For first-time login or after password reset',
  })
  setPassword(@Body() resetPasswordDto: ResetPasswordDto, @CurrentUser() user: CurrentUserData) {
    return this.usersService.setPassword(user.userId, resetPasswordDto.newPassword);
  }
}
