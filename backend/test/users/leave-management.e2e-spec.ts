import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { Role } from '@prisma/client';

describe('Teacher Leave Management (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let superAdminToken: string;
  let branchAdminToken: string;
  let teacherToken: string;
  let teacher2Token: string;
  let studentToken: string;
  let orgId: number;
  let branchId: number;
  let teacherId: number;
  let teacher2Id: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    // Clean up database
    await prisma.leaveRequest.deleteMany();
    await prisma.document.deleteMany();
    await prisma.parentStudentLink.deleteMany();
    await prisma.parent.deleteMany();
    await prisma.student.deleteMany();
    await prisma.teacher.deleteMany();
    await prisma.branch.deleteMany();
    await prisma.organization.deleteMany();
    await prisma.user.deleteMany();

    // Create organization
    const org = await prisma.organization.create({
      data: { name: 'Leave Test School', isActive: true },
    });
    orgId = org.id;

    // Create branch
    const branch = await prisma.branch.create({
      data: {
        name: 'Main Campus',
        organizationId: orgId,
        address: '123 Test St',
        isActive: true,
      },
    });
    branchId = branch.id;

    // Create super admin
    const superAdmin = await prisma.user.create({
      data: {
        email: 'superadmin@test.com',
        password: 'hashedpass',
        firstName: 'Super',
        lastName: 'Admin',
        role: Role.SUPER_ADMIN,
        organizationId: orgId,
        isActive: true,
      },
    });

    // Create branch admin
    const branchAdmin = await prisma.user.create({
      data: {
        email: 'branchadmin@test.com',
        password: 'hashedpass',
        firstName: 'Branch',
        lastName: 'Admin',
        role: Role.BRANCH_ADMIN,
        organizationId: orgId,
        branchId: branchId,
        isActive: true,
      },
    });

    // Create teacher 1
    const teacher = await prisma.user.create({
      data: {
        email: 'teacher@test.com',
        password: 'hashedpass',
        firstName: 'John',
        lastName: 'Teacher',
        role: Role.TEACHER,
        organizationId: orgId,
        branchId: branchId,
        isActive: true,
        teacher: {
          create: {
            organizationId: orgId,
            branchId: branchId,
            employeeId: 'T001',
            dateOfJoining: new Date('2024-01-01'),
            isActive: true,
          },
        },
      },
      include: { teacher: true },
    });
    teacherId = teacher.teacher.id;

    // Create teacher 2
    const teacher2 = await prisma.user.create({
      data: {
        email: 'teacher2@test.com',
        password: 'hashedpass',
        firstName: 'Jane',
        lastName: 'Teacher',
        role: Role.TEACHER,
        organizationId: orgId,
        branchId: branchId,
        isActive: true,
        teacher: {
          create: {
            organizationId: orgId,
            branchId: branchId,
            employeeId: 'T002',
            dateOfJoining: new Date('2024-01-01'),
            isActive: true,
          },
        },
      },
      include: { teacher: true },
    });
    teacher2Id = teacher2.teacher.id;

    // Create student
    const student = await prisma.user.create({
      data: {
        email: 'student@test.com',
        password: 'hashedpass',
        firstName: 'Test',
        lastName: 'Student',
        role: Role.STUDENT,
        organizationId: orgId,
        branchId: branchId,
        isActive: true,
        student: {
          create: {
            organizationId: orgId,
            branchId: branchId,
            enrollmentNumber: 'S001',
            dateOfBirth: new Date('2010-01-01'),
            isActive: true,
          },
        },
      },
    });

    // Get auth tokens
    const superAdminRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'superadmin@test.com', password: 'hashedpass' });
    superAdminToken = superAdminRes.body.access_token;

    const branchAdminRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'branchadmin@test.com', password: 'hashedpass' });
    branchAdminToken = branchAdminRes.body.access_token;

    const teacherRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'teacher@test.com', password: 'hashedpass' });
    teacherToken = teacherRes.body.access_token;

    const teacher2Res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'teacher2@test.com', password: 'hashedpass' });
    teacher2Token = teacher2Res.body.access_token;

    const studentRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'student@test.com', password: 'hashedpass' });
    studentToken = studentRes.body.access_token;
  });

  afterAll(async () => {
    await prisma.leaveRequest.deleteMany();
    await prisma.document.deleteMany();
    await prisma.parentStudentLink.deleteMany();
    await prisma.parent.deleteMany();
    await prisma.student.deleteMany();
    await prisma.teacher.deleteMany();
    await prisma.branch.deleteMany();
    await prisma.organization.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
    await app.close();
  });

  describe('POST /users/teachers/:id/leave-requests - Submit Leave Request', () => {
    it('should allow teacher to submit sick leave request', async () => {
      const response = await request(app.getHttpServer())
        .post(`/users/teachers/${teacherId}/leave-requests`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          leaveType: 'SICK',
          startDate: '2024-06-01',
          endDate: '2024-06-03',
          reason: 'Medical appointment and recovery',
          supportingDocuments: 'Medical certificate attached',
        })
        .expect(201);

      expect(response.body).toMatchObject({
        teacherId,
        leaveType: 'SICK',
        status: 'PENDING',
        reason: 'Medical appointment and recovery',
      });
      expect(response.body.id).toBeDefined();
      expect(new Date(response.body.startDate)).toEqual(new Date('2024-06-01'));
      expect(new Date(response.body.endDate)).toEqual(new Date('2024-06-03'));
      expect(response.body.totalDays).toBe(3);
    });

    it('should allow teacher to submit annual leave request', async () => {
      const response = await request(app.getHttpServer())
        .post(`/users/teachers/${teacherId}/leave-requests`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          leaveType: 'ANNUAL',
          startDate: '2024-07-15',
          endDate: '2024-07-19',
          reason: 'Family vacation',
        })
        .expect(201);

      expect(response.body.leaveType).toBe('ANNUAL');
      expect(response.body.totalDays).toBe(5);
    });

    it('should allow teacher to submit emergency leave request', async () => {
      const response = await request(app.getHttpServer())
        .post(`/users/teachers/${teacherId}/leave-requests`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          leaveType: 'EMERGENCY',
          startDate: '2024-06-10',
          endDate: '2024-06-10',
          reason: 'Family emergency',
        })
        .expect(201);

      expect(response.body.leaveType).toBe('EMERGENCY');
      expect(response.body.totalDays).toBe(1);
    });

    it('should allow teacher to submit unpaid leave request', async () => {
      const response = await request(app.getHttpServer())
        .post(`/users/teachers/${teacherId}/leave-requests`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          leaveType: 'UNPAID',
          startDate: '2024-08-01',
          endDate: '2024-08-05',
          reason: 'Personal matters',
        })
        .expect(201);

      expect(response.body.leaveType).toBe('UNPAID');
      expect(response.body.totalDays).toBe(5);
    });

    it('should reject leave request with end date before start date', async () => {
      await request(app.getHttpServer())
        .post(`/users/teachers/${teacherId}/leave-requests`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          leaveType: 'SICK',
          startDate: '2024-06-10',
          endDate: '2024-06-05',
          reason: 'Invalid date range',
        })
        .expect(400);
    });

    it('should reject leave request with past dates', async () => {
      await request(app.getHttpServer())
        .post(`/users/teachers/${teacherId}/leave-requests`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          leaveType: 'SICK',
          startDate: '2020-01-01',
          endDate: '2020-01-03',
          reason: 'Past dates',
        })
        .expect(400);
    });

    it('should reject leave request without reason', async () => {
      await request(app.getHttpServer())
        .post(`/users/teachers/${teacherId}/leave-requests`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          leaveType: 'SICK',
          startDate: '2024-06-15',
          endDate: '2024-06-16',
        })
        .expect(400);
    });

    it('should prevent teacher from submitting leave for another teacher', async () => {
      await request(app.getHttpServer())
        .post(`/users/teachers/${teacher2Id}/leave-requests`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          leaveType: 'SICK',
          startDate: '2024-06-20',
          endDate: '2024-06-21',
          reason: 'Not my leave',
        })
        .expect(403);
    });

    it('should prevent student from submitting teacher leave request', async () => {
      await request(app.getHttpServer())
        .post(`/users/teachers/${teacherId}/leave-requests`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          leaveType: 'SICK',
          startDate: '2024-06-25',
          endDate: '2024-06-26',
          reason: 'Unauthorized',
        })
        .expect(403);
    });

    it('should allow branch admin to submit leave on behalf of teacher', async () => {
      const response = await request(app.getHttpServer())
        .post(`/users/teachers/${teacherId}/leave-requests`)
        .set('Authorization', `Bearer ${branchAdminToken}`)
        .send({
          leaveType: 'SICK',
          startDate: '2024-09-01',
          endDate: '2024-09-02',
          reason: 'Submitted by admin',
        })
        .expect(201);

      expect(response.body.teacherId).toBe(teacherId);
      expect(response.body.submittedBy).toBeDefined();
    });
  });

  describe('GET /users/teachers/:id/leave-requests - Get Teacher Leave Requests', () => {
    let leaveId1: number;
    let leaveId2: number;

    beforeAll(async () => {
      // Create test leave requests
      const leave1 = await prisma.leaveRequest.create({
        data: {
          teacherId,
          leaveType: 'SICK',
          startDate: new Date('2024-06-01'),
          endDate: new Date('2024-06-03'),
          totalDays: 3,
          reason: 'Flu',
          status: 'PENDING',
        },
      });
      leaveId1 = leave1.id;

      const leave2 = await prisma.leaveRequest.create({
        data: {
          teacherId,
          leaveType: 'ANNUAL',
          startDate: new Date('2024-07-01'),
          endDate: new Date('2024-07-05'),
          totalDays: 5,
          reason: 'Vacation',
          status: 'APPROVED',
          reviewedByUserId: (await prisma.user.findFirst({ where: { role: Role.BRANCH_ADMIN } })).id,
          reviewedAt: new Date(),
        },
      });
      leaveId2 = leave2.id;
    });

    it('should allow teacher to view their own leave requests', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/teachers/${teacherId}/leave-requests`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
      expect(response.body.some((l) => l.id === leaveId1)).toBe(true);
      expect(response.body.some((l) => l.id === leaveId2)).toBe(true);
    });

    it('should allow filtering by leave status', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/teachers/${teacherId}/leave-requests?status=APPROVED`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);

      expect(response.body.every((l) => l.status === 'APPROVED')).toBe(true);
      expect(response.body.some((l) => l.id === leaveId2)).toBe(true);
    });

    it('should allow filtering by leave type', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/teachers/${teacherId}/leave-requests?leaveType=SICK`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);

      expect(response.body.every((l) => l.leaveType === 'SICK')).toBe(true);
    });

    it('should allow branch admin to view teacher leave requests', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/teachers/${teacherId}/leave-requests`)
        .set('Authorization', `Bearer ${branchAdminToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
    });

    it('should prevent teacher from viewing another teacher leave requests', async () => {
      await request(app.getHttpServer())
        .get(`/users/teachers/${teacher2Id}/leave-requests`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(403);
    });
  });

  describe('GET /users/teachers/:teacherId/leave-requests/:id - Get Single Leave Request', () => {
    let leaveId: number;

    beforeAll(async () => {
      const leave = await prisma.leaveRequest.create({
        data: {
          teacherId,
          leaveType: 'SICK',
          startDate: new Date('2024-08-01'),
          endDate: new Date('2024-08-02'),
          totalDays: 2,
          reason: 'Medical checkup',
          status: 'PENDING',
        },
      });
      leaveId = leave.id;
    });

    it('should allow teacher to view their own leave request details', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/teachers/${teacherId}/leave-requests/${leaveId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: leaveId,
        teacherId,
        leaveType: 'SICK',
        status: 'PENDING',
        reason: 'Medical checkup',
        totalDays: 2,
      });
    });

    it('should allow admin to view leave request details', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/teachers/${teacherId}/leave-requests/${leaveId}`)
        .set('Authorization', `Bearer ${branchAdminToken}`)
        .expect(200);

      expect(response.body.id).toBe(leaveId);
    });

    it('should return 404 for non-existent leave request', async () => {
      await request(app.getHttpServer())
        .get(`/users/teachers/${teacherId}/leave-requests/99999`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(404);
    });
  });

  describe('PATCH /users/teachers/:teacherId/leave-requests/:id/approve - Approve Leave', () => {
    let pendingLeaveId: number;

    beforeEach(async () => {
      const leave = await prisma.leaveRequest.create({
        data: {
          teacherId,
          leaveType: 'ANNUAL',
          startDate: new Date('2024-10-01'),
          endDate: new Date('2024-10-05'),
          totalDays: 5,
          reason: 'Annual vacation',
          status: 'PENDING',
        },
      });
      pendingLeaveId = leave.id;
    });

    it('should allow branch admin to approve leave request', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/users/teachers/${teacherId}/leave-requests/${pendingLeaveId}/approve`)
        .set('Authorization', `Bearer ${branchAdminToken}`)
        .send({ comments: 'Approved for vacation' })
        .expect(200);

      expect(response.body).toMatchObject({
        id: pendingLeaveId,
        status: 'APPROVED',
        adminComments: 'Approved for vacation',
      });
      expect(response.body.reviewedByUserId).toBeDefined();
      expect(response.body.reviewedAt).toBeDefined();
    });

    it('should allow super admin to approve leave request', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/users/teachers/${teacherId}/leave-requests/${pendingLeaveId}/approve`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ comments: 'Approved by super admin' })
        .expect(200);

      expect(response.body.status).toBe('APPROVED');
    });

    it('should prevent teacher from approving their own leave', async () => {
      await request(app.getHttpServer())
        .patch(`/users/teachers/${teacherId}/leave-requests/${pendingLeaveId}/approve`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ comments: 'Self approval attempt' })
        .expect(403);
    });

    it('should prevent approving already approved leave', async () => {
      await prisma.leaveRequest.update({
        where: { id: pendingLeaveId },
        data: { status: 'APPROVED' },
      });

      await request(app.getHttpServer())
        .patch(`/users/teachers/${teacherId}/leave-requests/${pendingLeaveId}/approve`)
        .set('Authorization', `Bearer ${branchAdminToken}`)
        .send({ comments: 'Double approval' })
        .expect(400);
    });
  });

  describe('PATCH /users/teachers/:teacherId/leave-requests/:id/reject - Reject Leave', () => {
    let pendingLeaveId: number;

    beforeEach(async () => {
      const leave = await prisma.leaveRequest.create({
        data: {
          teacherId,
          leaveType: 'UNPAID',
          startDate: new Date('2024-11-01'),
          endDate: new Date('2024-11-10'),
          totalDays: 10,
          reason: 'Extended personal leave',
          status: 'PENDING',
        },
      });
      pendingLeaveId = leave.id;
    });

    it('should allow branch admin to reject leave request with reason', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/users/teachers/${teacherId}/leave-requests/${pendingLeaveId}/reject`)
        .set('Authorization', `Bearer ${branchAdminToken}`)
        .send({ comments: 'Too many days requested during peak period' })
        .expect(200);

      expect(response.body).toMatchObject({
        id: pendingLeaveId,
        status: 'REJECTED',
        adminComments: 'Too many days requested during peak period',
      });
      expect(response.body.reviewedByUserId).toBeDefined();
      expect(response.body.reviewedAt).toBeDefined();
    });

    it('should require rejection reason/comments', async () => {
      await request(app.getHttpServer())
        .patch(`/users/teachers/${teacherId}/leave-requests/${pendingLeaveId}/reject`)
        .set('Authorization', `Bearer ${branchAdminToken}`)
        .send({})
        .expect(400);
    });

    it('should prevent teacher from rejecting leave requests', async () => {
      await request(app.getHttpServer())
        .patch(`/users/teachers/${teacherId}/leave-requests/${pendingLeaveId}/reject`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ comments: 'Cannot reject' })
        .expect(403);
    });
  });

  describe('PATCH /users/teachers/:teacherId/leave-requests/:id - Update Leave Request', () => {
    let pendingLeaveId: number;

    beforeEach(async () => {
      const leave = await prisma.leaveRequest.create({
        data: {
          teacherId,
          leaveType: 'SICK',
          startDate: new Date('2024-12-01'),
          endDate: new Date('2024-12-02'),
          totalDays: 2,
          reason: 'Original reason',
          status: 'PENDING',
        },
      });
      pendingLeaveId = leave.id;
    });

    it('should allow teacher to update pending leave request', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/users/teachers/${teacherId}/leave-requests/${pendingLeaveId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          startDate: '2024-12-01',
          endDate: '2024-12-03',
          reason: 'Extended recovery period',
        })
        .expect(200);

      expect(response.body).toMatchObject({
        id: pendingLeaveId,
        totalDays: 3,
        reason: 'Extended recovery period',
      });
    });

    it('should prevent updating approved leave request', async () => {
      await prisma.leaveRequest.update({
        where: { id: pendingLeaveId },
        data: { status: 'APPROVED' },
      });

      await request(app.getHttpServer())
        .patch(`/users/teachers/${teacherId}/leave-requests/${pendingLeaveId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ reason: 'Cannot update' })
        .expect(400);
    });

    it('should prevent updating rejected leave request', async () => {
      await prisma.leaveRequest.update({
        where: { id: pendingLeaveId },
        data: { status: 'REJECTED' },
      });

      await request(app.getHttpServer())
        .patch(`/users/teachers/${teacherId}/leave-requests/${pendingLeaveId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ reason: 'Cannot update' })
        .expect(400);
    });
  });

  describe('DELETE /users/teachers/:teacherId/leave-requests/:id - Cancel Leave Request', () => {
    let pendingLeaveId: number;

    beforeEach(async () => {
      const leave = await prisma.leaveRequest.create({
        data: {
          teacherId,
          leaveType: 'ANNUAL',
          startDate: new Date('2025-01-15'),
          endDate: new Date('2025-01-20'),
          totalDays: 6,
          reason: 'Planned vacation',
          status: 'PENDING',
        },
      });
      pendingLeaveId = leave.id;
    });

    it('should allow teacher to cancel pending leave request', async () => {
      await request(app.getHttpServer())
        .delete(`/users/teachers/${teacherId}/leave-requests/${pendingLeaveId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);

      const deleted = await prisma.leaveRequest.findUnique({
        where: { id: pendingLeaveId },
      });
      expect(deleted).toBeNull();
    });

    it('should allow admin to cancel any leave request', async () => {
      await request(app.getHttpServer())
        .delete(`/users/teachers/${teacherId}/leave-requests/${pendingLeaveId}`)
        .set('Authorization', `Bearer ${branchAdminToken}`)
        .expect(200);
    });

    it('should prevent canceling approved leave without admin permission', async () => {
      await prisma.leaveRequest.update({
        where: { id: pendingLeaveId },
        data: { status: 'APPROVED' },
      });

      await request(app.getHttpServer())
        .delete(`/users/teachers/${teacherId}/leave-requests/${pendingLeaveId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(403);
    });
  });

  describe('GET /users/teachers/:id/leave-balance - Get Leave Balance', () => {
    beforeAll(async () => {
      // Create various leave requests for balance calculation
      await prisma.leaveRequest.createMany({
        data: [
          {
            teacherId,
            leaveType: 'SICK',
            startDate: new Date('2024-01-10'),
            endDate: new Date('2024-01-12'),
            totalDays: 3,
            reason: 'Sick leave 1',
            status: 'APPROVED',
          },
          {
            teacherId,
            leaveType: 'SICK',
            startDate: new Date('2024-02-05'),
            endDate: new Date('2024-02-06'),
            totalDays: 2,
            reason: 'Sick leave 2',
            status: 'APPROVED',
          },
          {
            teacherId,
            leaveType: 'ANNUAL',
            startDate: new Date('2024-03-01'),
            endDate: new Date('2024-03-05'),
            totalDays: 5,
            reason: 'Annual leave 1',
            status: 'APPROVED',
          },
          {
            teacherId,
            leaveType: 'EMERGENCY',
            startDate: new Date('2024-04-15'),
            endDate: new Date('2024-04-15'),
            totalDays: 1,
            reason: 'Emergency',
            status: 'APPROVED',
          },
        ],
      });
    });

    it('should return leave balance for teacher', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/teachers/${teacherId}/leave-balance`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        teacherId,
        year: new Date().getFullYear(),
      });
      expect(response.body.balances).toBeDefined();
      expect(response.body.balances.SICK).toBeDefined();
      expect(response.body.balances.ANNUAL).toBeDefined();
    });

    it('should allow specifying year for balance', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/teachers/${teacherId}/leave-balance?year=2024`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);

      expect(response.body.year).toBe(2024);
    });

    it('should allow admin to view teacher leave balance', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/teachers/${teacherId}/leave-balance`)
        .set('Authorization', `Bearer ${branchAdminToken}`)
        .expect(200);

      expect(response.body.teacherId).toBe(teacherId);
    });
  });

  describe('GET /users/leave-requests/pending - Get All Pending Requests (Admin)', () => {
    beforeAll(async () => {
      // Create pending leave requests for both teachers
      await prisma.leaveRequest.createMany({
        data: [
          {
            teacherId,
            leaveType: 'SICK',
            startDate: new Date('2024-05-01'),
            endDate: new Date('2024-05-02'),
            totalDays: 2,
            reason: 'Pending sick leave',
            status: 'PENDING',
          },
          {
            teacherId: teacher2Id,
            leaveType: 'ANNUAL',
            startDate: new Date('2024-05-10'),
            endDate: new Date('2024-05-15'),
            totalDays: 6,
            reason: 'Pending annual leave',
            status: 'PENDING',
          },
        ],
      });
    });

    it('should allow branch admin to view all pending leave requests', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/leave-requests/pending')
        .set('Authorization', `Bearer ${branchAdminToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
      expect(response.body.every((l) => l.status === 'PENDING')).toBe(true);
    });

    it('should prevent teacher from viewing all pending requests', async () => {
      await request(app.getHttpServer())
        .get('/users/leave-requests/pending')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(403);
    });
  });

  describe('Complete Leave Workflow', () => {
    it('should complete full leave request, approval, and balance tracking workflow', async () => {
      // Step 1: Teacher submits leave request
      const submitRes = await request(app.getHttpServer())
        .post(`/users/teachers/${teacherId}/leave-requests`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          leaveType: 'ANNUAL',
          startDate: '2024-12-20',
          endDate: '2024-12-27',
          reason: 'Year-end vacation',
        })
        .expect(201);

      const leaveId = submitRes.body.id;
      expect(submitRes.body.status).toBe('PENDING');
      expect(submitRes.body.totalDays).toBe(8);

      // Step 2: Admin views pending requests
      const pendingRes = await request(app.getHttpServer())
        .get('/users/leave-requests/pending')
        .set('Authorization', `Bearer ${branchAdminToken}`)
        .expect(200);

      expect(pendingRes.body.some((l) => l.id === leaveId)).toBe(true);

      // Step 3: Admin approves leave
      const approveRes = await request(app.getHttpServer())
        .patch(`/users/teachers/${teacherId}/leave-requests/${leaveId}/approve`)
        .set('Authorization', `Bearer ${branchAdminToken}`)
        .send({ comments: 'Approved for year-end break' })
        .expect(200);

      expect(approveRes.body.status).toBe('APPROVED');
      expect(approveRes.body.adminComments).toBe('Approved for year-end break');

      // Step 4: Verify leave balance updated
      const balanceRes = await request(app.getHttpServer())
        .get(`/users/teachers/${teacherId}/leave-balance?year=2024`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);

      expect(balanceRes.body.balances.ANNUAL.used).toBeGreaterThan(0);

      // Step 5: Teacher views approved leave
      const viewRes = await request(app.getHttpServer())
        .get(`/users/teachers/${teacherId}/leave-requests/${leaveId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);

      expect(viewRes.body.status).toBe('APPROVED');
    });
  });
});
