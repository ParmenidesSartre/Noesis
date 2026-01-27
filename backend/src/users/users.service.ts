import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Role, Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new user
   * Validates organization, branch, and role requirements
   */
  async create(createUserDto: CreateUserDto, organizationId: number, _currentUserRole: Role) {
    // Hash the password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Check if user already exists in this organization
    const existingUser = await this.prisma.user.findFirst({
      where: {
        email: createUserDto.email,
        organizationId,
      },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists in this organization');
    }

    // Validate branchId if role requires it
    const rolesRequiringBranch: Role[] = [Role.BRANCH_ADMIN, Role.TEACHER, Role.STUDENT];
    if (rolesRequiringBranch.includes(createUserDto.role) && !createUserDto.branchId) {
      throw new BadRequestException(`Branch is required for ${createUserDto.role} role`);
    }

    // Verify branch exists and belongs to organization if branchId is provided
    if (createUserDto.branchId) {
      const branch = await this.prisma.branch.findFirst({
        where: {
          id: createUserDto.branchId,
          organizationId,
        },
      });

      if (!branch) {
        throw new NotFoundException('Branch not found in this organization');
      }
    }

    // Create the user
    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: hashedPassword,
        name: createUserDto.name,
        role: createUserDto.role,
        organizationId,
        branchId: createUserDto.branchId || null,
        phone: createUserDto.phone,
        address: createUserDto.address,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        organizationId: true,
        branchId: true,
        phone: true,
        address: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Find all users with filtering based on role
   * SUPER_ADMIN: Can see all users in organization
   * BRANCH_ADMIN: Can see users in their branch(es)
   */
  async findAll(
    organizationId: number,
    currentUserRole: Role,
    currentUserBranchId?: number,
    filters?: { role?: Role; branchId?: number; isActive?: boolean },
  ) {
    const where: Prisma.UserWhereInput = {
      organizationId,
    };

    // Apply role-based filtering
    if (currentUserRole === Role.BRANCH_ADMIN && currentUserBranchId) {
      where.branchId = currentUserBranchId;
    }

    // Apply additional filters
    if (filters?.role) {
      where.role = filters.role;
    }
    if (filters?.branchId !== undefined) {
      where.branchId = filters.branchId;
    }
    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    const users = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        organizationId: true,
        branchId: true,
        phone: true,
        address: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return users;
  }

  /**
   * Find one user by ID
   * Enforces organization and branch-level access control
   */
  async findOne(
    id: number,
    organizationId: number,
    currentUserRole: Role,
    currentUserBranchId?: number,
  ) {
    const where: Prisma.UserWhereInput = {
      id,
      organizationId,
    };

    // Branch admins can only see users in their branch
    if (currentUserRole === Role.BRANCH_ADMIN && currentUserBranchId) {
      where.branchId = currentUserBranchId;
    }

    const user = await this.prisma.user.findFirst({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        organizationId: true,
        branchId: true,
        phone: true,
        address: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Find user by email within organization
   */
  async findByEmail(email: string, organizationId: number) {
    return this.prisma.user.findFirst({
      where: {
        email,
        organizationId,
      },
    });
  }

  /**
   * Update user
   * Validates permissions and updates allowed fields
   */
  async update(
    id: number,
    updateUserDto: UpdateUserDto,
    organizationId: number,
    currentUserRole: Role,
    currentUserBranchId?: number,
  ) {
    // Find the user to update
    const user = await this.findOne(id, organizationId, currentUserRole, currentUserBranchId);

    // Prevent updating SUPER_ADMIN if current user is not SUPER_ADMIN
    if (user.role === Role.SUPER_ADMIN && currentUserRole !== Role.SUPER_ADMIN) {
      throw new ForbiddenException('Cannot update Super Admin users');
    }

    // If changing email, check for conflicts
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.findByEmail(updateUserDto.email, organizationId);
      if (existingUser) {
        throw new ConflictException('Email already exists in this organization');
      }
    }

    // If changing branch, verify it exists and belongs to organization
    if (updateUserDto.branchId) {
      const branch = await this.prisma.branch.findFirst({
        where: {
          id: updateUserDto.branchId,
          organizationId,
        },
      });

      if (!branch) {
        throw new NotFoundException('Branch not found in this organization');
      }
    }

    // Hash password if provided
    const dataToUpdate: Prisma.UserUpdateInput = { ...updateUserDto };
    if (updateUserDto.password) {
      dataToUpdate.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        organizationId: true,
        branchId: true,
        phone: true,
        address: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    return updatedUser;
  }

  /**
   * Soft delete user by setting isActive to false
   * SUPER_ADMIN users cannot be deleted
   */
  async remove(
    id: number,
    organizationId: number,
    currentUserRole: Role,
    currentUserBranchId?: number,
  ) {
    const user = await this.findOne(id, organizationId, currentUserRole, currentUserBranchId);

    // Prevent deleting SUPER_ADMIN
    if (user.role === Role.SUPER_ADMIN) {
      throw new ForbiddenException('Cannot delete Super Admin users');
    }

    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'User deactivated successfully' };
  }

  /**
   * Reactivate a deactivated user
   */
  async reactivate(
    id: number,
    organizationId: number,
    currentUserRole: Role,
    currentUserBranchId?: number,
  ) {
    // Verify user exists and check access permissions
    await this.findOne(id, organizationId, currentUserRole, currentUserBranchId);

    await this.prisma.user.update({
      where: { id },
      data: { isActive: true },
    });

    return { message: 'User reactivated successfully' };
  }

  /**
   * Generate a temporary password for new users
   */
  private generateTemporaryPassword(): string {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    password += 'A'; // Ensure at least one uppercase
    password += 'a'; // Ensure at least one lowercase
    password += '1'; // Ensure at least one number
    password += '!'; // Ensure at least one special character

    for (let i = password.length; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    // Shuffle the password
    return password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  }

  /**
   * Create a teacher with additional employee information
   */
  async createTeacher(dto: CreateTeacherDto, organizationId: number, _currentUserRole: Role) {
    // Verify branch exists and belongs to organization
    const branch = await this.prisma.branch.findFirst({
      where: {
        id: dto.branchId,
        organizationId,
      },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found in this organization');
    }

    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        email: dto.email,
        organizationId,
      },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists in this organization');
    }

    // Generate temporary password
    const temporaryPassword = this.generateTemporaryPassword();
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    // Generate teacher code
    const year = new Date().getFullYear();
    const teacherCount = await this.prisma.teacher.count({
      where: { organizationId },
    });
    const teacherCode = `TCH-${year}-${String(teacherCount + 1).padStart(4, '0')}`;

    // Create user and teacher in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          name: dto.name,
          role: Role.TEACHER,
          organizationId,
          branchId: dto.branchId,
          phone: dto.phone,
          address: dto.address,
          dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
          gender: dto.gender,
          employeeId: dto.employeeId,
          employmentStartDate: dto.employmentStartDate ? new Date(dto.employmentStartDate) : null,
          emergencyContactName: dto.emergencyContactName,
          emergencyContactPhone: dto.emergencyContactPhone,
          isActive: true,
        },
      });

      const teacher = await tx.teacher.create({
        data: {
          userId: user.id,
          organizationId,
          branchId: dto.branchId,
          teacherCode,
        },
      });

      return { user, teacher, temporaryPassword };
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = result.user;

    return {
      user: userWithoutPassword,
      teacher: result.teacher,
      temporaryPassword: result.temporaryPassword,
      message:
        'Teacher created successfully. Please send the temporary password to the teacher via email.',
    };
  }

  /**
   * Create a student with parent linking
   * Creates parent if doesn't exist, or links to existing parent
   */
  async createStudent(dto: CreateStudentDto, organizationId: number, _currentUserRole: Role) {
    // Verify branch exists and belongs to organization
    const branch = await this.prisma.branch.findFirst({
      where: {
        id: dto.branchId,
        organizationId,
      },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found in this organization');
    }

    // Check if student email already exists (if provided)
    if (dto.email) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          email: dto.email,
          organizationId,
        },
      });

      if (existingUser) {
        throw new ConflictException('Student with this email already exists in this organization');
      }
    }

    // Generate student code
    const year = new Date().getFullYear();
    const branchCode = branch.code;
    const studentCount = await this.prisma.student.count({
      where: { organizationId, branchId: dto.branchId },
    });
    const studentCode = `${year}-${branchCode}-${String(studentCount + 1).padStart(4, '0')}`;

    // Generate temporary passwords
    const studentTempPassword = this.generateTemporaryPassword();
    const parentTempPassword = this.generateTemporaryPassword();

    const studentHashedPassword = await bcrypt.hash(studentTempPassword, 10);
    const parentHashedPassword = await bcrypt.hash(parentTempPassword, 10);

    // Check if parent already exists
    const parentUser = await this.prisma.user.findFirst({
      where: {
        email: dto.parent.email,
        organizationId,
      },
      include: {
        parent: true,
      },
    });

    const isNewParent = !parentUser;

    const result = await this.prisma.$transaction(async (tx) => {
      let parentRecord;
      let createdParentUser;

      // Create parent if doesn't exist
      if (!parentUser) {
        createdParentUser = await tx.user.create({
          data: {
            email: dto.parent.email,
            password: parentHashedPassword,
            name: dto.parent.name,
            role: Role.PARENT,
            organizationId,
            phone: dto.parent.phone,
            address: dto.parent.address,
            isActive: true,
          },
        });

        parentRecord = await tx.parent.create({
          data: {
            userId: createdParentUser.id,
            occupation: dto.parent.occupation,
            officePhone: dto.parent.officePhone,
            preferredContactMethod: dto.parent.preferredContactMethod,
          },
        });

        finalParentUser = createdParentUser;
      } else {
        // Parent exists, use existing parent record
        parentRecord = parentUser.parent!;
        createdParentUser = parentUser;
      }

      // Create student user
      const studentUser = await tx.user.create({
        data: {
          email: dto.email || `${studentCode.toLowerCase()}@student.temp`,
          password: studentHashedPassword,
          name: dto.name,
          role: Role.STUDENT,
          organizationId,
          branchId: dto.branchId,
          phone: dto.phone,
          address: dto.address,
          dateOfBirth: new Date(dto.dateOfBirth),
          gender: dto.gender,
          isActive: true,
        },
      });

      // Create student record
      const student = await tx.student.create({
        data: {
          userId: studentUser.id,
          organizationId,
          branchId: dto.branchId,
          studentCode,
          dateOfBirth: new Date(dto.dateOfBirth),
          grade: dto.gradeLevel,
          schoolName: dto.schoolName,
          medicalInfo: dto.medicalInfo,
          specialNeeds: dto.specialNeeds,
          previousTuitionCenter: dto.previousTuitionCenter,
          referralSource: dto.referralSource,
        },
      });

      // Link parent to student
      await tx.parentStudent.create({
        data: {
          parentId: parentRecord.id,
          studentId: student.id,
          relationship: dto.parent.relationship,
          isPrimary: true,
        },
      });

      return { studentUser, student, parentUser: createdParentUser };
    });

    // Return users without passwords
    const { password: _studentPassword, ...studentWithoutPassword } = result.studentUser;
    const { password: _parentPassword, ...parentWithoutPassword } = result.parentUser as Record<
      string,
      unknown
    >;

    return {
      student: {
        user: studentWithoutPassword,
        details: result.student,
        temporaryPassword: studentTempPassword,
      },
      parent: {
        user: parentWithoutPassword,
        temporaryPassword: isNewParent ? parentTempPassword : undefined,
        isNewParent,
      },
      message:
        'Student and parent created successfully. Please send the login credentials via email to the parent.',
    };
  }

  /**
   * Change password for current user
   * Validates old password before updating
   */
  async changePassword(userId: number, oldPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify old password
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Check if new password is same as old password
    const isSameAsOld = await bcrypt.compare(newPassword, user.password);
    if (isSameAsOld) {
      throw new BadRequestException('New password cannot be the same as current password');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password changed successfully' };
  }

  /**
   * Reset password for a user (admin only)
   * Generates a new temporary password
   */
  async resetPassword(
    userId: number,
    organizationId: number,
    currentUserRole: Role,
    currentUserBranchId?: number,
  ) {
    // Find the user and validate access
    const user = await this.findOne(userId, organizationId, currentUserRole, currentUserBranchId);

    // Prevent resetting SUPER_ADMIN password unless current user is SUPER_ADMIN
    if (user.role === Role.SUPER_ADMIN && currentUserRole !== Role.SUPER_ADMIN) {
      throw new ForbiddenException('Cannot reset Super Admin password');
    }

    // Generate new temporary password
    const temporaryPassword = this.generateTemporaryPassword();
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return {
      message: 'Password reset successfully. Please send the temporary password to the user.',
      temporaryPassword,
    };
  }

  /**
   * Set new password (for first-time login or after password reset)
   */
  async setPassword(userId: number, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password set successfully' };
  }
}
