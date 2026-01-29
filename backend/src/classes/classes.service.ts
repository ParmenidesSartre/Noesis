import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClassDto, ClassStatus } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { EnrollStudentDto } from './dto/enroll-student.dto';
import { AddToWaitlistDto } from './dto/add-to-waitlist.dto';
import { WithdrawStudentDto } from './dto/withdraw-student.dto';

@Injectable()
export class ClassesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate a unique class code
   */
  private async generateClassCode(
    organizationId: number,
    courseCode: string,
    academicYear?: number,
  ): Promise<string> {
    const year = academicYear || new Date().getFullYear();
    const base = `${courseCode}-${year}`;

    // Find existing classes with similar codes
    const existingClasses = await this.prisma.class.count({
      where: {
        organizationId,
        classCode: {
          startsWith: base,
        },
      },
    });

    // Append sequence number
    const sequence = String.fromCharCode(65 + existingClasses); // A, B, C, ...
    return `${base}-${sequence}`;
  }

  /**
   * Create a new class
   */
  async create(createClassDto: CreateClassDto, organizationId: number, branchId?: number) {
    // Validate course exists
    const course = await this.prisma.course.findFirst({
      where: {
        id: createClassDto.courseId,
        organizationId,
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Validate teacher exists and belongs to organization
    const teacher = await this.prisma.teacher.findFirst({
      where: {
        id: createClassDto.teacherId,
        organizationId,
      },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    // Use teacher's branch if not specified
    const finalBranchId = branchId || teacher.branchId;

    // Validate co-teacher if provided
    if (createClassDto.coTeacherId) {
      const coTeacher = await this.prisma.teacher.findFirst({
        where: {
          id: createClassDto.coTeacherId,
          organizationId,
        },
      });

      if (!coTeacher) {
        throw new NotFoundException('Co-teacher not found');
      }
    }

    // Validate room if provided
    if (createClassDto.roomId) {
      const room = await this.prisma.room.findFirst({
        where: {
          id: createClassDto.roomId,
          branchId: finalBranchId,
          organizationId,
        },
      });

      if (!room) {
        throw new NotFoundException('Room not found in this branch');
      }

      // Check room capacity
      if (createClassDto.maxCapacity > room.capacity) {
        throw new BadRequestException(
          `Class capacity (${createClassDto.maxCapacity}) exceeds room capacity (${room.capacity})`,
        );
      }
    }

    // Validate capacity
    if (createClassDto.minCapacity > createClassDto.maxCapacity) {
      throw new BadRequestException('Minimum capacity cannot exceed maximum capacity');
    }

    // Generate class code if not provided
    let classCode = createClassDto.classCode;
    if (!classCode) {
      classCode = await this.generateClassCode(
        organizationId,
        course.code,
        createClassDto.academicYear,
      );
    }

    // Check if class code already exists
    const existingClass = await this.prisma.class.findUnique({
      where: {
        classCode_organizationId: {
          classCode,
          organizationId,
        },
      },
    });

    if (existingClass) {
      throw new ConflictException(`Class with code '${classCode}' already exists`);
    }

    // Create the class
    return this.prisma.class.create({
      data: {
        organizationId,
        branchId: finalBranchId,
        courseId: createClassDto.courseId,
        teacherId: createClassDto.teacherId,
        coTeacherId: createClassDto.coTeacherId,
        roomId: createClassDto.roomId,
        name: createClassDto.name,
        classCode,
        classType: createClassDto.classType as never,
        classLevel: createClassDto.classLevel,
        termName: createClassDto.termName,
        academicYear: createClassDto.academicYear,
        startDate: new Date(createClassDto.startDate),
        endDate: new Date(createClassDto.endDate),
        totalWeeks: createClassDto.totalWeeks,
        holidayBreaks: createClassDto.holidayBreaks || [],
        schedule: createClassDto.schedule as never,
        scheduleNotes: createClassDto.scheduleNotes,
        maxCapacity: createClassDto.maxCapacity,
        minCapacity: createClassDto.minCapacity,
        feePerSession: createClassDto.feePerSession,
        feePerMonth: createClassDto.feePerMonth,
        feePerTerm: createClassDto.feePerTerm,
        materialFee: createClassDto.materialFee,
        allowLateEnrollment: createClassDto.allowLateEnrollment ?? true,
        lateEnrollmentCutoffDate: createClassDto.lateEnrollmentCutoffDate
          ? new Date(createClassDto.lateEnrollmentCutoffDate)
          : null,
        allowMidTermWithdrawal: createClassDto.allowMidTermWithdrawal ?? true,
        waitlistEnabled: createClassDto.waitlistEnabled ?? true,
        autoEnrollFromWaitlist: createClassDto.autoEnrollFromWaitlist ?? false,
        status: (createClassDto.status || ClassStatus.DRAFT) as never,
        syllabus: createClassDto.syllabus,
        materials: createClassDto.materials || [],
        digitalResources: createClassDto.digitalResources,
        classAnnouncements: createClassDto.classAnnouncements,
      },
      include: {
        course: true,
        teacher: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        coTeacher: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        room: true,
        branch: true,
        _count: {
          select: {
            enrollments: true,
            waitlist: true,
          },
        },
      },
    });
  }

  /**
   * Find all classes with filtering
   */
  async findAll(
    organizationId: number,
    filters?: {
      branchId?: number;
      courseId?: number;
      teacherId?: number;
      status?: string;
      termName?: string;
      academicYear?: number;
    },
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      organizationId,
    };

    if (filters?.branchId) {
      where.branchId = filters.branchId;
    }

    if (filters?.courseId) {
      where.courseId = filters.courseId;
    }

    if (filters?.teacherId) {
      where.OR = [{ teacherId: filters.teacherId }, { coTeacherId: filters.teacherId }];
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.termName) {
      where.termName = filters.termName;
    }

    if (filters?.academicYear) {
      where.academicYear = filters.academicYear;
    }

    return this.prisma.class.findMany({
      where,
      include: {
        course: {
          select: {
            name: true,
            code: true,
            category: true,
          },
        },
        teacher: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        coTeacher: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        room: {
          select: {
            name: true,
            capacity: true,
          },
        },
        branch: {
          select: {
            name: true,
            code: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
            waitlist: true,
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    });
  }

  /**
   * Find one class by ID
   */
  async findOne(id: number, organizationId: number) {
    const classData = await this.prisma.class.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        course: true,
        teacher: {
          include: {
            user: true,
          },
        },
        coTeacher: {
          include: {
            user: true,
          },
        },
        room: true,
        branch: true,
        enrollments: {
          where: {
            status: 'ACTIVE',
          },
          include: {
            student: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
        waitlist: {
          where: {
            status: 'WAITING',
          },
          include: {
            student: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
          orderBy: {
            position: 'asc',
          },
        },
        _count: {
          select: {
            enrollments: true,
            waitlist: true,
          },
        },
      },
    });

    if (!classData) {
      throw new NotFoundException('Class not found');
    }

    return classData;
  }

  /**
   * Update a class
   */
  async update(id: number, updateClassDto: UpdateClassDto, organizationId: number) {
    // Check if class exists
    await this.findOne(id, organizationId);

    // Validate updates similar to create
    if (updateClassDto.courseId) {
      const course = await this.prisma.course.findFirst({
        where: {
          id: updateClassDto.courseId,
          organizationId,
        },
      });

      if (!course) {
        throw new NotFoundException('Course not found');
      }
    }

    if (updateClassDto.teacherId) {
      const teacher = await this.prisma.teacher.findFirst({
        where: {
          id: updateClassDto.teacherId,
          organizationId,
        },
      });

      if (!teacher) {
        throw new NotFoundException('Teacher not found');
      }
    }

    if (updateClassDto.minCapacity && updateClassDto.maxCapacity) {
      if (updateClassDto.minCapacity > updateClassDto.maxCapacity) {
        throw new BadRequestException('Minimum capacity cannot exceed maximum capacity');
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {};

    // Only update provided fields
    if (updateClassDto.name) data.name = updateClassDto.name;
    if (updateClassDto.courseId) data.courseId = updateClassDto.courseId;
    if (updateClassDto.teacherId) data.teacherId = updateClassDto.teacherId;
    if (updateClassDto.coTeacherId !== undefined) data.coTeacherId = updateClassDto.coTeacherId;
    if (updateClassDto.roomId !== undefined) data.roomId = updateClassDto.roomId;
    if (updateClassDto.classType) data.classType = updateClassDto.classType as never;
    if (updateClassDto.classLevel !== undefined) data.classLevel = updateClassDto.classLevel;
    if (updateClassDto.termName !== undefined) data.termName = updateClassDto.termName;
    if (updateClassDto.academicYear) data.academicYear = updateClassDto.academicYear;
    if (updateClassDto.startDate) data.startDate = new Date(updateClassDto.startDate);
    if (updateClassDto.endDate) data.endDate = new Date(updateClassDto.endDate);
    if (updateClassDto.totalWeeks) data.totalWeeks = updateClassDto.totalWeeks;
    if (updateClassDto.holidayBreaks) data.holidayBreaks = updateClassDto.holidayBreaks as never;
    if (updateClassDto.schedule) data.schedule = updateClassDto.schedule as never;
    if (updateClassDto.scheduleNotes !== undefined)
      data.scheduleNotes = updateClassDto.scheduleNotes;
    if (updateClassDto.maxCapacity) data.maxCapacity = updateClassDto.maxCapacity;
    if (updateClassDto.minCapacity) data.minCapacity = updateClassDto.minCapacity;
    if (updateClassDto.feePerSession !== undefined)
      data.feePerSession = updateClassDto.feePerSession;
    if (updateClassDto.feePerMonth !== undefined) data.feePerMonth = updateClassDto.feePerMonth;
    if (updateClassDto.feePerTerm !== undefined) data.feePerTerm = updateClassDto.feePerTerm;
    if (updateClassDto.materialFee !== undefined) data.materialFee = updateClassDto.materialFee;
    if (updateClassDto.allowLateEnrollment !== undefined)
      data.allowLateEnrollment = updateClassDto.allowLateEnrollment;
    if (updateClassDto.lateEnrollmentCutoffDate !== undefined)
      data.lateEnrollmentCutoffDate = updateClassDto.lateEnrollmentCutoffDate
        ? new Date(updateClassDto.lateEnrollmentCutoffDate)
        : null;
    if (updateClassDto.allowMidTermWithdrawal !== undefined)
      data.allowMidTermWithdrawal = updateClassDto.allowMidTermWithdrawal;
    if (updateClassDto.waitlistEnabled !== undefined)
      data.waitlistEnabled = updateClassDto.waitlistEnabled;
    if (updateClassDto.autoEnrollFromWaitlist !== undefined)
      data.autoEnrollFromWaitlist = updateClassDto.autoEnrollFromWaitlist;
    if (updateClassDto.status) data.status = updateClassDto.status as never;
    if (updateClassDto.syllabus !== undefined) data.syllabus = updateClassDto.syllabus;
    if (updateClassDto.materials) data.materials = updateClassDto.materials as never;
    if (updateClassDto.digitalResources !== undefined)
      data.digitalResources = updateClassDto.digitalResources;
    if (updateClassDto.classAnnouncements !== undefined)
      data.classAnnouncements = updateClassDto.classAnnouncements;

    return this.prisma.class.update({
      where: { id },
      data,
      include: {
        course: true,
        teacher: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        coTeacher: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        room: true,
        branch: true,
        _count: {
          select: {
            enrollments: true,
            waitlist: true,
          },
        },
      },
    });
  }

  /**
   * Delete a class (soft delete by setting isActive to false)
   */
  async remove(id: number, organizationId: number) {
    // Check if class exists
    await this.findOne(id, organizationId);

    // Check if class has active enrollments
    const activeEnrollments = await this.prisma.enrollment.count({
      where: {
        classId: id,
        status: 'ACTIVE',
      },
    });

    if (activeEnrollments > 0) {
      throw new ConflictException(
        `Cannot delete class with ${activeEnrollments} active enrollments`,
      );
    }

    // Soft delete
    return this.prisma.class.update({
      where: { id },
      data: {
        isActive: false,
        status: 'CANCELLED' as never,
      },
    });
  }

  /**
   * Enroll a student in a class
   */
  async enrollStudent(classId: number, enrollDto: EnrollStudentDto, organizationId: number) {
    // Get class details
    const classData = await this.findOne(classId, organizationId);

    // Check if student exists
    const student = await this.prisma.student.findFirst({
      where: {
        id: enrollDto.studentId,
        organizationId,
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Check if already enrolled
    const existingEnrollment = await this.prisma.enrollment.findUnique({
      where: {
        studentId_classId: {
          studentId: enrollDto.studentId,
          classId,
        },
      },
    });

    if (existingEnrollment && existingEnrollment.status === 'ACTIVE') {
      throw new ConflictException('Student is already enrolled in this class');
    }

    // Check if class is full
    if (classData.currentEnrollment >= classData.maxCapacity) {
      throw new ConflictException('Class is full');
    }

    // Check if enrollment is open
    if (classData.status === 'FULL' || classData.status === 'CANCELLED') {
      throw new BadRequestException('Class enrollment is not open');
    }

    // Create enrollment
    const enrollment = await this.prisma.enrollment.create({
      data: {
        studentId: enrollDto.studentId,
        classId,
        status: 'ACTIVE' as never,
        agreedFeePerMonth: enrollDto.agreedFeePerMonth,
        discountApplied: enrollDto.discountApplied,
        enrollmentNotes: enrollDto.enrollmentNotes,
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Update class enrollment count
    const newEnrollmentCount = classData.currentEnrollment + 1;
    const updateData: {
      currentEnrollment: number;
      status?: string;
    } = {
      currentEnrollment: newEnrollmentCount,
    };

    // Update status if class is now full
    if (newEnrollmentCount >= classData.maxCapacity) {
      updateData.status = 'FULL';
    }

    await this.prisma.class.update({
      where: { id: classId },
      data: updateData,
    });

    // Remove from waitlist if they were on it
    await this.prisma.waitlist.deleteMany({
      where: {
        studentId: enrollDto.studentId,
        classId,
      },
    });

    return enrollment;
  }

  /**
   * Withdraw a student from a class
   */
  async withdrawStudent(
    classId: number,
    studentId: number,
    withdrawDto: WithdrawStudentDto,
    organizationId: number,
  ) {
    // Check class exists
    await this.findOne(classId, organizationId);

    // Find enrollment
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        studentId_classId: {
          studentId,
          classId,
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    if (enrollment.status !== 'ACTIVE') {
      throw new BadRequestException('Student is not actively enrolled');
    }

    // Update enrollment status
    await this.prisma.enrollment.update({
      where: {
        studentId_classId: {
          studentId,
          classId,
        },
      },
      data: {
        status: 'WITHDRAWN' as never,
        withdrawalDate: new Date(),
        withdrawalReason: withdrawDto.withdrawalReason,
      },
    });

    // Decrease enrollment count
    await this.prisma.class.update({
      where: { id: classId },
      data: {
        currentEnrollment: {
          decrement: 1,
        },
        status: 'OPEN_FOR_ENROLLMENT' as never, // Re-open for enrollment
      },
    });

    // Auto-enroll from waitlist if enabled
    const classData = await this.prisma.class.findUnique({
      where: { id: classId },
    });

    if (classData?.autoEnrollFromWaitlist) {
      await this.processWaitlist(classId, organizationId);
    }

    return { message: 'Student withdrawn successfully' };
  }

  /**
   * Add student to waitlist
   */
  async addToWaitlist(classId: number, waitlistDto: AddToWaitlistDto, organizationId: number) {
    // Check class exists
    const classData = await this.findOne(classId, organizationId);

    if (!classData.waitlistEnabled) {
      throw new BadRequestException('Waitlist is not enabled for this class');
    }

    // Check if student exists
    const student = await this.prisma.student.findFirst({
      where: {
        id: waitlistDto.studentId,
        organizationId,
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Check if already on waitlist
    const existingWaitlist = await this.prisma.waitlist.findUnique({
      where: {
        studentId_classId: {
          studentId: waitlistDto.studentId,
          classId,
        },
      },
    });

    if (existingWaitlist) {
      throw new ConflictException('Student is already on the waitlist');
    }

    // Check if already enrolled
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        studentId_classId: {
          studentId: waitlistDto.studentId,
          classId,
        },
      },
    });

    if (enrollment && enrollment.status === 'ACTIVE') {
      throw new ConflictException('Student is already enrolled in this class');
    }

    // Get next position in waitlist
    const maxPosition = await this.prisma.waitlist.findFirst({
      where: { classId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    const nextPosition = (maxPosition?.position || 0) + 1;

    // Add to waitlist
    return this.prisma.waitlist.create({
      data: {
        studentId: waitlistDto.studentId,
        classId,
        position: nextPosition,
        status: 'WAITING' as never,
        isPriority: waitlistDto.isPriority || false,
        priorityNotes: waitlistDto.priorityNotes,
        notes: waitlistDto.notes,
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Process waitlist and auto-enroll next student if enabled
   */
  private async processWaitlist(classId: number, organizationId: number) {
    const classData = await this.prisma.class.findUnique({
      where: { id: classId },
    });

    if (!classData || !classData.autoEnrollFromWaitlist) {
      return;
    }

    // Get next person on waitlist
    const nextWaitlist = await this.prisma.waitlist.findFirst({
      where: {
        classId,
        status: 'WAITING',
      },
      orderBy: [
        { isPriority: 'desc' }, // Priority students first
        { position: 'asc' }, // Then by position
      ],
    });

    if (nextWaitlist && classData.currentEnrollment < classData.maxCapacity) {
      // Auto-enroll
      await this.enrollStudent(
        classId,
        {
          studentId: nextWaitlist.studentId,
          enrollmentNotes: 'Auto-enrolled from waitlist',
        },
        organizationId,
      );

      // Update waitlist status
      await this.prisma.waitlist.update({
        where: { id: nextWaitlist.id },
        data: {
          status: 'ENROLLED' as never,
          enrolledDate: new Date(),
        },
      });
    }
  }

  /**
   * Get class roster (all enrolled students)
   */
  async getClassRoster(classId: number, organizationId: number) {
    await this.findOne(classId, organizationId);

    return this.prisma.enrollment.findMany({
      where: {
        classId,
        status: 'ACTIVE',
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        enrollmentDate: 'asc',
      },
    });
  }

  /**
   * Get class waitlist
   */
  async getClassWaitlist(classId: number, organizationId: number) {
    await this.findOne(classId, organizationId);

    return this.prisma.waitlist.findMany({
      where: {
        classId,
        status: 'WAITING',
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: [{ isPriority: 'desc' }, { position: 'asc' }],
    });
  }
}
