/**
 * E2E tests for user management endpoints
 */
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { cleanupDatabase } from '../helpers/test-utils';

describe('User Management (e2e)', () => {
  let app: INestApplication;
  let moduleRef: TestingModule;
  let prisma: PrismaService;
  let accessToken: string;
  let organizationId: number;
  let branchId: number;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();

    prisma = moduleRef.get(PrismaService);
  });

  beforeEach(async () => {
    await cleanupDatabase(prisma);

    // Setup: Register organization and login as super admin
    const slug = `user-mgmt-${Date.now()}`;
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        organizationName: 'User Management Test Org',
        organizationEmail: `org-${slug}@example.com`,
        organizationSlug: slug,
        adminName: 'Super Admin',
        adminEmail: `admin-${slug}@example.com`,
        adminPassword: 'Admin123!',
      })
      .expect(201);

    organizationId = registerResponse.body.organization.id;

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: `admin-${slug}@example.com`,
        password: 'Admin123!',
        organizationSlug: slug,
      })
      .expect(200);

    accessToken = loginResponse.body.accessToken;

    // Create a branch for testing
    const branch = await prisma.branch.create({
      data: {
        name: 'Test Branch',
        code: 'TEST-001',
        organizationId,
        address: '123 Test St',
        isActive: true,
      },
    });
    branchId = branch.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /users/teachers', () => {
    it('creates a new teacher with auto-generated credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/users/teachers')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          email: 'teacher@example.com',
          name: 'John Teacher',
          branchId,
          phone: '+1234567890',
          address: '456 Teacher Ave',
          dateOfBirth: '1985-05-15',
          gender: 'Male',
          employeeId: 'EMP-001',
          employmentStartDate: '2024-01-15',
          emergencyContactName: 'Jane Emergency',
          emergencyContactPhone: '+1234567899',
        })
        .expect(201);

      expect(response.body.user).toMatchObject({
        email: 'teacher@example.com',
        name: 'John Teacher',
        role: 'TEACHER',
        branchId,
      });
      expect(response.body.teacher).toHaveProperty('teacherCode');
      expect(response.body.teacher.teacherCode).toMatch(/^TCH-\d{4}-\d{4}$/);
      expect(response.body).toHaveProperty('temporaryPassword');
      expect(response.body.temporaryPassword).toEqual(expect.any(String));
      expect(response.body.temporaryPassword.length).toBeGreaterThanOrEqual(8);
    });

    it('rejects teacher creation without branchId', async () => {
      const response = await request(app.getHttpServer())
        .post('/users/teachers')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          email: 'teacher2@example.com',
          name: 'Jane Teacher',
          phone: '+1234567891',
        })
        .expect(400);

      expect(JSON.stringify(response.body.message)).toContain('branchId');
    });

    it('rejects duplicate email', async () => {
      await request(app.getHttpServer())
        .post('/users/teachers')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          email: 'duplicate@example.com',
          name: 'Teacher One',
          branchId,
        })
        .expect(201);

      const response = await request(app.getHttpServer())
        .post('/users/teachers')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          email: 'duplicate@example.com',
          name: 'Teacher Two',
          branchId,
        })
        .expect(409);

      expect(response.body.message).toContain('already exists');
    });
  });

  describe('POST /users/students', () => {
    it('creates a new student and links to new parent', async () => {
      const response = await request(app.getHttpServer())
        .post('/users/students')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          email: 'student@example.com',
          name: 'Alice Student',
          branchId,
          phone: '+1234567892',
          dateOfBirth: '2010-03-15',
          gender: 'Female',
          gradeLevel: 'Grade 10',
          schoolName: 'ABC High School',
          address: '789 Student Rd',
          parent: {
            email: 'parent@example.com',
            name: 'Parent Name',
            phone: '+1234567893',
            relationship: 'Mother',
            address: '789 Student Rd',
            occupation: 'Engineer',
          },
        })
        .expect(201);

      expect(response.body.student.user).toMatchObject({
        email: 'student@example.com',
        name: 'Alice Student',
        role: 'STUDENT',
        branchId,
      });
      expect(response.body.student.details.studentCode).toMatch(/^\d{4}-TEST-001-\d{4}$/);
      expect(response.body.student).toHaveProperty('temporaryPassword');

      expect(response.body.parent.user).toMatchObject({
        email: 'parent@example.com',
        name: 'Parent Name',
        role: 'PARENT',
      });
      expect(response.body.parent).toHaveProperty('temporaryPassword');
      expect(response.body.parent.isNewParent).toBe(true);
    });

    it('creates student and links to existing parent', async () => {
      // Create first student with parent
      await request(app.getHttpServer())
        .post('/users/students')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'First Child',
          branchId,
          phone: '+1234567894',
          dateOfBirth: '2012-01-01',
          gender: 'Male',
          gradeLevel: 'Grade 8',
          schoolName: 'ABC High School',
          parent: {
            email: 'existing-parent@example.com',
            name: 'Existing Parent',
            phone: '+1234567895',
            relationship: 'Father',
          },
        })
        .expect(201);

      // Create second student with same parent email
      const response = await request(app.getHttpServer())
        .post('/users/students')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Second Child',
          branchId,
          phone: '+1234567896',
          dateOfBirth: '2014-02-02',
          gender: 'Female',
          gradeLevel: 'Grade 6',
          schoolName: 'ABC High School',
          parent: {
            email: 'existing-parent@example.com',
            name: 'Existing Parent',
            phone: '+1234567895',
            relationship: 'Father',
          },
        })
        .expect(201);

      expect(response.body.parent.isNewParent).toBe(false);
      expect(response.body.parent.user.email).toBe('existing-parent@example.com');
    });
  });

  describe('GET /users', () => {
    beforeEach(async () => {
      // Create some test users
      await request(app.getHttpServer())
        .post('/users/teachers')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          email: 'teacher1@example.com',
          name: 'Teacher One',
          branchId,
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/users/students')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Student One',
          branchId,
          phone: '+1234567897',
          dateOfBirth: '2010-01-01',
          gender: 'Male',
          gradeLevel: 'Grade 10',
          schoolName: 'Test School',
          parent: {
            email: 'parent1@example.com',
            name: 'Parent One',
            phone: '+1234567898',
            relationship: 'Father',
          },
        })
        .expect(201);
    });

    it('returns all users for super admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.length).toBeGreaterThanOrEqual(3); // Admin + Teacher + Student + Parent
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ role: 'SUPER_ADMIN' }),
          expect.objectContaining({ role: 'TEACHER' }),
          expect.objectContaining({ role: 'STUDENT' }),
          expect.objectContaining({ role: 'PARENT' }),
        ]),
      );
    });

    it('filters users by role', async () => {
      const response = await request(app.getHttpServer())
        .get('/users?role=TEACHER')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.every((user) => user.role === 'TEACHER')).toBe(true);
    });

    it('filters users by branchId', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users?branchId=${branchId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(
        response.body.every((user) => user.branchId === branchId || user.branchId === null),
      ).toBe(true);
    });
  });

  describe('PATCH /users/:id', () => {
    let teacherId: number;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/users/teachers')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          email: 'updatetest@example.com',
          name: 'Update Test Teacher',
          branchId,
        })
        .expect(201);

      teacherId = response.body.user.id;
    });

    it('updates user details', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/users/${teacherId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Updated Name',
          phone: '+9999999999',
        })
        .expect(200);

      expect(response.body.name).toBe('Updated Name');
      expect(response.body.phone).toBe('+9999999999');
    });
  });

  describe('DELETE /users/:id', () => {
    let teacherId: number;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/users/teachers')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          email: 'deletetest@example.com',
          name: 'Delete Test Teacher',
          branchId,
        })
        .expect(201);

      teacherId = response.body.user.id;
    });

    it('deactivates user', async () => {
      await request(app.getHttpServer())
        .delete(`/users/${teacherId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const user = await prisma.user.findUnique({ where: { id: teacherId } });
      expect(user?.isActive).toBe(false);
    });
  });

  describe('POST /users/:id/reactivate', () => {
    let teacherId: number;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/users/teachers')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          email: 'reactivatetest@example.com',
          name: 'Reactivate Test Teacher',
          branchId,
        })
        .expect(201);

      teacherId = response.body.user.id;

      await request(app.getHttpServer())
        .delete(`/users/${teacherId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('reactivates deactivated user', async () => {
      await request(app.getHttpServer())
        .post(`/users/${teacherId}/reactivate`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201);

      const user = await prisma.user.findUnique({ where: { id: teacherId } });
      expect(user?.isActive).toBe(true);
    });
  });

  describe('POST /users/change-password', () => {
    it('changes password for current user', async () => {
      const response = await request(app.getHttpServer())
        .post('/users/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          oldPassword: 'Admin123!',
          newPassword: 'NewAdmin123!',
        })
        .expect(201);

      expect(response.body.message).toContain('successfully');

      // Verify can login with new password
      const org = await prisma.organization.findUnique({ where: { id: organizationId } });

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: (await prisma.user.findFirst({ where: { organizationId, role: 'SUPER_ADMIN' } }))
            ?.email,
          password: 'NewAdmin123!',
          organizationSlug: org?.slug,
        })
        .expect(200);

      expect(loginResponse.body).toHaveProperty('accessToken');
    });

    it('rejects incorrect old password', async () => {
      const response = await request(app.getHttpServer())
        .post('/users/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          oldPassword: 'WrongPassword123!',
          newPassword: 'NewAdmin123!',
        })
        .expect(400);

      expect(response.body.message).toContain('incorrect');
    });

    it('rejects same password as old', async () => {
      const response = await request(app.getHttpServer())
        .post('/users/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          oldPassword: 'Admin123!',
          newPassword: 'Admin123!',
        })
        .expect(400);

      expect(response.body.message).toContain('same');
    });
  });

  describe('POST /users/:id/reset-password', () => {
    let teacherId: number;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/users/teachers')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          email: 'resettest@example.com',
          name: 'Reset Test Teacher',
          branchId,
        })
        .expect(201);

      teacherId = response.body.user.id;
    });

    it('resets password and returns temporary password', async () => {
      const response = await request(app.getHttpServer())
        .post(`/users/${teacherId}/reset-password`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201);

      expect(response.body).toHaveProperty('temporaryPassword');
      expect(response.body.temporaryPassword).toEqual(expect.any(String));
      expect(response.body.temporaryPassword.length).toBeGreaterThanOrEqual(8);
      expect(response.body.message).toContain('successfully');
    });
  });

  describe('POST /users/set-password', () => {
    it('sets new password for current user', async () => {
      const response = await request(app.getHttpServer())
        .post('/users/set-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          newPassword: 'BrandNew123!',
        })
        .expect(201);

      expect(response.body.message).toContain('successfully');
    });
  });
});
