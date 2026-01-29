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
import { UpdateTeacherProfileDto } from './dto/update-teacher-profile.dto';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import * as bcrypt from 'bcrypt';
import { Role, Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

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
  async createTeacher(
    dto: CreateTeacherDto,
    organizationId: number,
    _currentUserRole: Role,
    senderId?: number,
    senderEmail?: string,
    ipAddress?: string,
  ) {
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

    // Send credentials email if sender information is provided
    if (senderId && senderEmail) {
      try {
        await this.emailService.sendCredentialsEmail({
          recipientEmail: result.user.email,
          recipientName: result.user.name,
          role: 'Teacher',
          password: temporaryPassword,
          organizationId,
          senderId,
          senderEmail,
          ipAddress,
        });
      } catch (error) {
        // Log error but don't fail the user creation
        console.error('Failed to send credentials email:', error);
      }
    }

    return {
      user: userWithoutPassword,
      teacher: result.teacher,
      temporaryPassword: result.temporaryPassword,
      message: senderId
        ? 'Teacher created successfully. Credentials email sent to the teacher.'
        : 'Teacher created successfully. Please send the temporary password to the teacher via email.',
    };
  }

  /**
   * Create a student with parent linking
   * Creates parent if doesn't exist, or links to existing parent
   */
  async createStudent(
    dto: CreateStudentDto,
    organizationId: number,
    _currentUserRole: Role,
    senderId?: number,
    senderEmail?: string,
    ipAddress?: string,
  ) {
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

    // Send credentials email to parent if sender information is provided
    if (senderId && senderEmail) {
      try {
        // Send parent credentials if new parent
        if (isNewParent) {
          await this.emailService.sendCredentialsEmail({
            recipientEmail: result.parentUser.email,
            recipientName: result.parentUser.name,
            role: 'Parent',
            password: parentTempPassword,
            organizationId,
            senderId,
            senderEmail,
            ipAddress,
          });
        }

        // Send student credentials (parent will receive this)
        await this.emailService.sendCredentialsEmail({
          recipientEmail: dto.parent.email, // Send to parent's email
          recipientName: result.studentUser.name,
          role: 'Student',
          password: studentTempPassword,
          organizationId,
          senderId,
          senderEmail,
          ipAddress,
        });
      } catch (error) {
        // Log error but don't fail the user creation
        console.error('Failed to send credentials email:', error);
      }
    }

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
      message: senderId
        ? 'Student and parent created successfully. Credentials emails sent to the parent.'
        : 'Student and parent created successfully. Please send the login credentials via email to the parent.',
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

  /**
   * Get detailed teacher profile
   * Teachers can view their own profile
   * Admins can view any teacher profile in their scope
   */
  async getTeacherProfile(
    teacherId: number,
    organizationId: number,
    currentUserId: number,
    currentUserRole: Role,
    currentUserBranchId?: number,
  ) {
    // Build where clause based on role
    const where: Prisma.TeacherWhereInput = {
      id: teacherId,
      organizationId,
    };

    // Branch admins can only view teachers in their branch
    if (currentUserRole === Role.BRANCH_ADMIN && currentUserBranchId) {
      where.branchId = currentUserBranchId;
    }

    const teacher = await this.prisma.teacher.findFirst({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            address: true,
            dateOfBirth: true,
            gender: true,
            profilePhoto: true,
            employeeId: true,
            employmentStartDate: true,
            emergencyContactName: true,
            emergencyContactPhone: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
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
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    // Teachers can only view their own profile
    if (currentUserRole === Role.TEACHER && teacher.userId !== currentUserId) {
      throw new ForbiddenException('You can only view your own profile');
    }

    // Parse JSON fields
    const profile = {
      ...teacher,
      primarySubjects: teacher.primarySubjects ? JSON.parse(teacher.primarySubjects) : [],
      secondarySubjects: teacher.secondarySubjects ? JSON.parse(teacher.secondarySubjects) : [],
      gradeLevels: teacher.gradeLevels ? JSON.parse(teacher.gradeLevels) : [],
      languagesSpoken: teacher.languagesSpoken ? JSON.parse(teacher.languagesSpoken) : [],
      certifications: teacher.certifications ? JSON.parse(teacher.certifications) : [],
      workSchedule: teacher.workSchedule ? JSON.parse(teacher.workSchedule) : null,
      documentsMetadata: teacher.documentsMetadata ? JSON.parse(teacher.documentsMetadata) : null,
    };

    return profile;
  }

  /**
   * Update teacher professional profile
   * Teachers can update their own profile
   * Admins can update teacher profiles in their scope
   */
  async updateTeacherProfile(
    teacherId: number,
    dto: UpdateTeacherProfileDto,
    organizationId: number,
    currentUserId: number,
    currentUserRole: Role,
    currentUserBranchId?: number,
  ) {
    // Build where clause based on role
    const where: Prisma.TeacherWhereInput = {
      id: teacherId,
      organizationId,
    };

    // Branch admins can only update teachers in their branch
    if (currentUserRole === Role.BRANCH_ADMIN && currentUserBranchId) {
      where.branchId = currentUserBranchId;
    }

    const teacher = await this.prisma.teacher.findFirst({
      where,
      include: { user: true },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    // Teachers can only update their own profile
    if (currentUserRole === Role.TEACHER && teacher.userId !== currentUserId) {
      throw new ForbiddenException('You can only update your own profile');
    }

    // Prepare update data - stringify JSON fields
    const updateData: Prisma.TeacherUpdateInput = {};

    if (dto.primarySubjects !== undefined) {
      updateData.primarySubjects = JSON.stringify(dto.primarySubjects);
    }
    if (dto.secondarySubjects !== undefined) {
      updateData.secondarySubjects = JSON.stringify(dto.secondarySubjects);
    }
    if (dto.gradeLevels !== undefined) {
      updateData.gradeLevels = JSON.stringify(dto.gradeLevels);
    }
    if (dto.languagesSpoken !== undefined) {
      updateData.languagesSpoken = JSON.stringify(dto.languagesSpoken);
    }
    if (dto.certifications !== undefined) {
      updateData.certifications = JSON.stringify(dto.certifications);
    }
    if (dto.workSchedule !== undefined) {
      updateData.workSchedule = JSON.stringify(dto.workSchedule);
    }
    if (dto.highestQualification !== undefined) {
      updateData.highestQualification = dto.highestQualification;
    }
    if (dto.degreeName !== undefined) {
      updateData.degreeName = dto.degreeName;
    }
    if (dto.institution !== undefined) {
      updateData.institution = dto.institution;
    }
    if (dto.graduationYear !== undefined) {
      updateData.graduationYear = dto.graduationYear;
    }
    if (dto.employmentType !== undefined) {
      updateData.employmentType = dto.employmentType;
    }
    if (dto.contractStartDate !== undefined) {
      updateData.contractStartDate = new Date(dto.contractStartDate);
    }
    if (dto.contractEndDate !== undefined) {
      updateData.contractEndDate = new Date(dto.contractEndDate);
    }
    if (dto.hourlyRate !== undefined) {
      updateData.hourlyRate = dto.hourlyRate;
    }
    if (dto.monthlySalary !== undefined) {
      updateData.monthlySalary = dto.monthlySalary;
    }
    if (dto.bio !== undefined) {
      updateData.bio = dto.bio;
    }
    if (dto.teachingPhilosophy !== undefined) {
      updateData.teachingPhilosophy = dto.teachingPhilosophy;
    }
    if (dto.achievements !== undefined) {
      updateData.achievements = dto.achievements;
    }
    if (dto.experience !== undefined) {
      updateData.experience = dto.experience;
    }
    if (dto.resumeUrl !== undefined) {
      updateData.resumeUrl = dto.resumeUrl;
    }
    if (dto.certificatesUrl !== undefined) {
      updateData.certificatesUrl = dto.certificatesUrl;
    }

    // Update teacher profile
    const updatedTeacher = await this.prisma.teacher.update({
      where: { id: teacherId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            address: true,
            dateOfBirth: true,
            gender: true,
            profilePhoto: true,
            employeeId: true,
            employmentStartDate: true,
            emergencyContactName: true,
            emergencyContactPhone: true,
            isActive: true,
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
    });

    // Parse JSON fields for response
    const profile = {
      ...updatedTeacher,
      primarySubjects: updatedTeacher.primarySubjects
        ? JSON.parse(updatedTeacher.primarySubjects)
        : [],
      secondarySubjects: updatedTeacher.secondarySubjects
        ? JSON.parse(updatedTeacher.secondarySubjects)
        : [],
      gradeLevels: updatedTeacher.gradeLevels ? JSON.parse(updatedTeacher.gradeLevels) : [],
      languagesSpoken: updatedTeacher.languagesSpoken
        ? JSON.parse(updatedTeacher.languagesSpoken)
        : [],
      certifications: updatedTeacher.certifications
        ? JSON.parse(updatedTeacher.certifications)
        : [],
      workSchedule: updatedTeacher.workSchedule ? JSON.parse(updatedTeacher.workSchedule) : null,
      documentsMetadata: updatedTeacher.documentsMetadata
        ? JSON.parse(updatedTeacher.documentsMetadata)
        : null,
    };

    return {
      message: 'Teacher profile updated successfully',
      teacher: profile,
    };
  }
}
