import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { AssignCourseToBranchDto } from './dto/assign-course-to-branch.dto';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new course
   */
  async create(createCourseDto: CreateCourseDto, organizationId: number) {
    const { gradeLevels, textbooks, ...courseData } = createCourseDto;

    // Check if course code already exists for this organization
    const existingCourse = await this.prisma.course.findUnique({
      where: {
        organizationId_code: {
          organizationId,
          code: createCourseDto.code,
        },
      },
    });

    if (existingCourse) {
      throw new ConflictException(
        `Course with code '${createCourseDto.code}' already exists in this organization`,
      );
    }

    // Create the course
    return this.prisma.course.create({
      data: {
        ...courseData,
        organizationId,
        gradeLevels: gradeLevels as never, // Cast to avoid type issues with enum array
        textbooks: textbooks ? (textbooks as never) : Prisma.JsonNull,
      },
      include: {
        courseBranches: {
          include: {
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
    });
  }

  /**
   * Find all courses for an organization with optional filtering
   */
  async findAll(
    organizationId: number,
    filters?: {
      category?: string;
      isActive?: boolean;
      isTemplate?: boolean;
      branchId?: number;
    },
  ) {
    const where: {
      organizationId: number;
      category?: string;
      isActive?: boolean;
      isTemplate?: boolean;
      courseBranches?: {
        some: {
          branchId: number;
          isOffered: boolean;
        };
      };
    } = {
      organizationId,
    };

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.isTemplate !== undefined) {
      where.isTemplate = filters.isTemplate;
    }

    // If filtering by branch, only get courses assigned to that branch
    if (filters?.branchId) {
      where.courseBranches = {
        some: {
          branchId: filters.branchId,
          isOffered: true,
        },
      };
    }

    return this.prisma.course.findMany({
      where,
      include: {
        courseBranches: {
          include: {
            branch: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
        _count: {
          select: {
            classes: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Find one course by ID
   */
  async findOne(id: number, organizationId: number) {
    const course = await this.prisma.course.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        courseBranches: {
          include: {
            branch: {
              select: {
                id: true,
                name: true,
                code: true,
                isActive: true,
              },
            },
          },
        },
        _count: {
          select: {
            classes: true,
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  /**
   * Update a course
   */
  async update(id: number, updateCourseDto: UpdateCourseDto, organizationId: number) {
    // Check if course exists
    await this.findOne(id, organizationId);

    const { gradeLevels, textbooks, organizationId: _, ...courseData } = updateCourseDto;

    // If code is being changed, check for conflicts
    if (updateCourseDto.code) {
      const existingCourse = await this.prisma.course.findFirst({
        where: {
          organizationId,
          code: updateCourseDto.code,
          NOT: {
            id,
          },
        },
      });

      if (existingCourse) {
        throw new ConflictException(
          `Course with code '${updateCourseDto.code}' already exists in this organization`,
        );
      }
    }

    return this.prisma.course.update({
      where: { id },
      data: {
        ...courseData,
        ...(gradeLevels && { gradeLevels: gradeLevels as never }),
        ...(textbooks !== undefined && {
          textbooks: textbooks ? (textbooks as never) : Prisma.JsonNull,
        }),
      },
      include: {
        courseBranches: {
          include: {
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
    });
  }

  /**
   * Delete a course (soft delete by setting isActive to false)
   */
  async remove(id: number, organizationId: number) {
    // Check if course exists
    await this.findOne(id, organizationId);

    // Check if course has active classes
    const classCount = await this.prisma.class.count({
      where: {
        courseId: id,
        isActive: true,
      },
    });

    if (classCount > 0) {
      throw new ConflictException(
        `Cannot delete course with ${classCount} active classes. Please deactivate or delete the classes first.`,
      );
    }

    // Soft delete by setting isActive to false
    return this.prisma.course.update({
      where: { id },
      data: {
        isActive: false,
      },
    });
  }

  /**
   * Hard delete a course (permanent deletion)
   */
  async hardDelete(id: number, organizationId: number) {
    // Check if course exists
    await this.findOne(id, organizationId);

    return this.prisma.course.delete({
      where: { id },
    });
  }

  /**
   * Assign a course to a branch with optional customization
   */
  async assignToBranch(
    courseId: number,
    assignDto: AssignCourseToBranchDto,
    organizationId: number,
  ) {
    // Verify course exists and belongs to organization
    await this.findOne(courseId, organizationId);

    // Verify branch exists and belongs to organization
    const branch = await this.prisma.branch.findFirst({
      where: {
        id: assignDto.branchId,
        organizationId,
      },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found in this organization');
    }

    // Check if assignment already exists
    const existingAssignment = await this.prisma.courseBranch.findUnique({
      where: {
        courseId_branchId: {
          courseId,
          branchId: assignDto.branchId,
        },
      },
    });

    if (existingAssignment) {
      // Update existing assignment
      return this.prisma.courseBranch.update({
        where: {
          courseId_branchId: {
            courseId,
            branchId: assignDto.branchId,
          },
        },
        data: assignDto,
        include: {
          branch: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      });
    }

    // Create new assignment
    return this.prisma.courseBranch.create({
      data: {
        courseId,
        ...assignDto,
      },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });
  }

  /**
   * Remove course assignment from a branch
   */
  async removeFromBranch(courseId: number, branchId: number, organizationId: number) {
    // Verify course exists and belongs to organization
    await this.findOne(courseId, organizationId);

    // Verify branch exists and belongs to organization
    const branch = await this.prisma.branch.findFirst({
      where: {
        id: branchId,
        organizationId,
      },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found in this organization');
    }

    const assignment = await this.prisma.courseBranch.findUnique({
      where: {
        courseId_branchId: {
          courseId,
          branchId,
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Course is not assigned to this branch');
    }

    return this.prisma.courseBranch.delete({
      where: {
        courseId_branchId: {
          courseId,
          branchId,
        },
      },
    });
  }

  /**
   * Get all branches where a course is offered
   */
  async getCourseBranches(courseId: number, organizationId: number) {
    // Verify course exists
    await this.findOne(courseId, organizationId);

    return this.prisma.courseBranch.findMany({
      where: {
        courseId,
      },
      include: {
        branch: true,
      },
    });
  }
}
