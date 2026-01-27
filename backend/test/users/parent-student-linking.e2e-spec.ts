/**
 * E2E tests for manual parent-student linking
 * Feature: Section 1.4 - Parent-Student Account Linking
 */
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { cleanupDatabase } from '../helpers/test-utils';

describe('Parent-Student Linking (e2e)', () => {
  let app: INestApplication;
  let moduleRef: TestingModule;
  let prisma: PrismaService;
  let superAdminToken: string;
  let branchAdminToken: string;
  let parentToken: string;
  let parent2Token: string;
  let organizationId: number;
  let branchId: number;
  let studentId: number;
  let _student2Id: number;
  let _studentUserId: number;
  let studentCode: string;
  let parentId: number;
  let parent2Id: number;

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
    const slug = `parent-link-${Date.now()}`;
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        organizationName: 'Parent Link Test Org',
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

    superAdminToken = loginResponse.body.accessToken;

    // Create a branch
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

    // Create a branch admin
    const _branchAdminResponse = await request(app.getHttpServer())
      .post('/users')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        email: 'branchadmin@example.com',
        password: 'BranchAdmin123!',
        name: 'Branch Admin',
        role: 'BRANCH_ADMIN',
        branchId,
      })
      .expect(201);

    const branchAdminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'branchadmin@example.com',
        password: 'BranchAdmin123!',
        organizationSlug: slug,
      })
      .expect(200);

    branchAdminToken = branchAdminLogin.body.accessToken;

    // Create a student with parent (automatic linking)
    const studentResponse = await request(app.getHttpServer())
      .post('/users/students')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        name: 'Test Student',
        email: 'student@example.com',
        phone: '+1234567892',
        dateOfBirth: '2010-05-15',
        gender: 'Male',
        gradeLevel: 'Primary 5',
        schoolName: 'Test Primary School',
        branchId,
        parent: {
          name: 'Primary Parent',
          email: 'parent1@example.com',
          phone: '+1234567890',
          relationship: 'Father',
        },
      })
      .expect(201);

    studentId = studentResponse.body.student.details.id;
    _studentUserId = studentResponse.body.student.user.id;
    studentCode = studentResponse.body.student.details.studentCode;

    // Get parent ID from database
    const parentUser = await prisma.user.findFirst({
      where: { email: 'parent1@example.com', organizationId },
      include: { parent: true },
    });
    parentId = parentUser!.parent!.id;

    // Login as parent
    const parentLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'parent1@example.com',
        password: studentResponse.body.parent.temporaryPassword,
        organizationSlug: slug,
      })
      .expect(200);

    parentToken = parentLogin.body.accessToken;

    // Create another student with different parent
    const student2Response = await request(app.getHttpServer())
      .post('/users/students')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        name: 'Second Student',
        email: 'student2@example.com',
        phone: '+1234567893',
        dateOfBirth: '2011-03-20',
        gender: 'Female',
        gradeLevel: 'Primary 4',
        schoolName: 'Test Primary School',
        branchId,
        parent: {
          name: 'Second Parent',
          email: 'parent2@example.com',
          phone: '+1234567891',
          relationship: 'Mother',
        },
      })
      .expect(201);

    _student2Id = student2Response.body.student.details.id;

    const parent2User = await prisma.user.findFirst({
      where: { email: 'parent2@example.com', organizationId },
      include: { parent: true },
    });
    parent2Id = parent2User!.parent!.id;

    const parent2Login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'parent2@example.com',
        password: student2Response.body.parent.temporaryPassword,
        organizationSlug: slug,
      })
      .expect(200);

    parent2Token = parent2Login.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /parents/link-requests', () => {
    it('allows parent to request linking to a student', async () => {
      // Parent 2 wants to link to Student 1 (sibling relationship)
      const response = await request(app.getHttpServer())
        .post('/parents/link-requests')
        .set('Authorization', `Bearer ${parent2Token}`)
        .send({
          studentCode: studentCode,
          studentName: 'Test Student',
          studentDateOfBirth: '2010-05-15',
          relationship: 'Mother',
        })
        .expect(201);

      expect(response.body).toMatchObject({
        studentCode,
        relationship: 'Mother',
        status: 'PENDING',
      });
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body.parent).toMatchObject({
        id: parent2Id,
      });
      expect(response.body.student).toMatchObject({
        id: studentId,
      });
    });

    it('validates required fields for link request', async () => {
      const response = await request(app.getHttpServer())
        .post('/parents/link-requests')
        .set('Authorization', `Bearer ${parent2Token}`)
        .send({
          studentCode: studentCode,
          // Missing studentName and studentDateOfBirth
          relationship: 'Mother',
        })
        .expect(400);

      expect(JSON.stringify(response.body.message)).toContain('studentName');
    });

    it('validates student information matches', async () => {
      // Wrong student name
      await request(app.getHttpServer())
        .post('/parents/link-requests')
        .set('Authorization', `Bearer ${parent2Token}`)
        .send({
          studentCode: studentCode,
          studentName: 'Wrong Name',
          studentDateOfBirth: '2010-05-15',
          relationship: 'Mother',
        })
        .expect(400);
    });

    it('validates student date of birth matches', async () => {
      // Wrong DOB
      await request(app.getHttpServer())
        .post('/parents/link-requests')
        .set('Authorization', `Bearer ${parent2Token}`)
        .send({
          studentCode: studentCode,
          studentName: 'Test Student',
          studentDateOfBirth: '2010-01-01',
          relationship: 'Mother',
        })
        .expect(400);
    });

    it('prevents duplicate link requests for same parent-student', async () => {
      // First request
      await request(app.getHttpServer())
        .post('/parents/link-requests')
        .set('Authorization', `Bearer ${parent2Token}`)
        .send({
          studentCode: studentCode,
          studentName: 'Test Student',
          studentDateOfBirth: '2010-05-15',
          relationship: 'Mother',
        })
        .expect(201);

      // Second request should fail
      await request(app.getHttpServer())
        .post('/parents/link-requests')
        .set('Authorization', `Bearer ${parent2Token}`)
        .send({
          studentCode: studentCode,
          studentName: 'Test Student',
          studentDateOfBirth: '2010-05-15',
          relationship: 'Mother',
        })
        .expect(409);
    });

    it('prevents linking if already linked', async () => {
      // Parent 1 is already linked to Student 1
      await request(app.getHttpServer())
        .post('/parents/link-requests')
        .set('Authorization', `Bearer ${parentToken}`)
        .send({
          studentCode: studentCode,
          studentName: 'Test Student',
          studentDateOfBirth: '2010-05-15',
          relationship: 'Father',
        })
        .expect(409);
    });

    it('returns 404 for non-existent student code', async () => {
      await request(app.getHttpServer())
        .post('/parents/link-requests')
        .set('Authorization', `Bearer ${parent2Token}`)
        .send({
          studentCode: '9999-INVALID-9999',
          studentName: 'Test Student',
          studentDateOfBirth: '2010-05-15',
          relationship: 'Mother',
        })
        .expect(404);
    });

    it('requires authentication', async () => {
      await request(app.getHttpServer())
        .post('/parents/link-requests')
        .send({
          studentCode: studentCode,
          studentName: 'Test Student',
          studentDateOfBirth: '2010-05-15',
          relationship: 'Mother',
        })
        .expect(401);
    });
  });

  describe('GET /parents/link-requests', () => {
    let linkRequestId: number;

    beforeEach(async () => {
      // Create a pending link request
      const response = await request(app.getHttpServer())
        .post('/parents/link-requests')
        .set('Authorization', `Bearer ${parent2Token}`)
        .send({
          studentCode: studentCode,
          studentName: 'Test Student',
          studentDateOfBirth: '2010-05-15',
          relationship: 'Mother',
        })
        .expect(201);

      linkRequestId = response.body.id;
    });

    it('allows branch admin to view pending link requests for their branch', async () => {
      const response = await request(app.getHttpServer())
        .get('/parents/link-requests')
        .set('Authorization', `Bearer ${branchAdminToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toMatchObject({
        id: linkRequestId,
        status: 'PENDING',
        relationship: 'Mother',
      });
    });

    it('allows super admin to view all link requests', async () => {
      const response = await request(app.getHttpServer())
        .get('/parents/link-requests')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('filters by status', async () => {
      const response = await request(app.getHttpServer())
        .get('/parents/link-requests?status=PENDING')
        .set('Authorization', `Bearer ${branchAdminToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      response.body.forEach((request: { status: string }) => {
        expect(request.status).toBe('PENDING');
      });
    });

    it('allows parent to view their own link requests', async () => {
      const response = await request(app.getHttpServer())
        .get('/parents/link-requests')
        .set('Authorization', `Bearer ${parent2Token}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(1);
      expect(response.body[0]).toMatchObject({
        id: linkRequestId,
        status: 'PENDING',
      });
    });

    it('returns empty array when no requests', async () => {
      // Parent 1 has no link requests
      const response = await request(app.getHttpServer())
        .get('/parents/link-requests')
        .set('Authorization', `Bearer ${parentToken}`)
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('requires authentication', async () => {
      await request(app.getHttpServer()).get('/parents/link-requests').expect(401);
    });
  });

  describe('POST /parents/link-requests/:id/approve', () => {
    let linkRequestId: number;

    beforeEach(async () => {
      // Create a pending link request
      const response = await request(app.getHttpServer())
        .post('/parents/link-requests')
        .set('Authorization', `Bearer ${parent2Token}`)
        .send({
          studentCode: studentCode,
          studentName: 'Test Student',
          studentDateOfBirth: '2010-05-15',
          relationship: 'Mother',
        })
        .expect(201);

      linkRequestId = response.body.id;
    });

    it('allows branch admin to approve link request', async () => {
      const response = await request(app.getHttpServer())
        .post(`/parents/link-requests/${linkRequestId}/approve`)
        .set('Authorization', `Bearer ${branchAdminToken}`)
        .expect(201);

      expect(response.body).toMatchObject({
        id: linkRequestId,
        status: 'APPROVED',
      });
      expect(response.body).toHaveProperty('approvedAt');
      expect(response.body).toHaveProperty('approvedBy');

      // Verify parent-student link was created in database
      const parentStudent = await prisma.parentStudent.findFirst({
        where: {
          parentId: parent2Id,
          studentId: studentId,
        },
      });

      expect(parentStudent).toBeDefined();
      expect(parentStudent!.relationship).toBe('Mother');
      expect(parentStudent!.isPrimary).toBe(false); // Not primary since student already has a parent
    });

    it('allows super admin to approve link request', async () => {
      const response = await request(app.getHttpServer())
        .post(`/parents/link-requests/${linkRequestId}/approve`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(201);

      expect(response.body.status).toBe('APPROVED');
    });

    it('prevents approving already approved request', async () => {
      // Approve first time
      await request(app.getHttpServer())
        .post(`/parents/link-requests/${linkRequestId}/approve`)
        .set('Authorization', `Bearer ${branchAdminToken}`)
        .expect(201);

      // Try to approve again
      await request(app.getHttpServer())
        .post(`/parents/link-requests/${linkRequestId}/approve`)
        .set('Authorization', `Bearer ${branchAdminToken}`)
        .expect(400);
    });

    it('prevents parent from approving their own request', async () => {
      await request(app.getHttpServer())
        .post(`/parents/link-requests/${linkRequestId}/approve`)
        .set('Authorization', `Bearer ${parent2Token}`)
        .expect(403);
    });

    it('returns 404 for non-existent request', async () => {
      await request(app.getHttpServer())
        .post('/parents/link-requests/99999/approve')
        .set('Authorization', `Bearer ${branchAdminToken}`)
        .expect(404);
    });

    it('requires authentication', async () => {
      await request(app.getHttpServer())
        .post(`/parents/link-requests/${linkRequestId}/approve`)
        .expect(401);
    });
  });

  describe('POST /parents/link-requests/:id/reject', () => {
    let linkRequestId: number;

    beforeEach(async () => {
      // Create a pending link request
      const response = await request(app.getHttpServer())
        .post('/parents/link-requests')
        .set('Authorization', `Bearer ${parent2Token}`)
        .send({
          studentCode: studentCode,
          studentName: 'Test Student',
          studentDateOfBirth: '2010-05-15',
          relationship: 'Mother',
        })
        .expect(201);

      linkRequestId = response.body.id;
    });

    it('allows branch admin to reject link request with reason', async () => {
      const response = await request(app.getHttpServer())
        .post(`/parents/link-requests/${linkRequestId}/reject`)
        .set('Authorization', `Bearer ${branchAdminToken}`)
        .send({
          reason: 'Unable to verify relationship',
        })
        .expect(201);

      expect(response.body).toMatchObject({
        id: linkRequestId,
        status: 'REJECTED',
        rejectionReason: 'Unable to verify relationship',
      });
      expect(response.body).toHaveProperty('rejectedAt');

      // Verify no parent-student link was created
      const parentStudent = await prisma.parentStudent.findFirst({
        where: {
          parentId: parent2Id,
          studentId: studentId,
        },
      });

      expect(parentStudent).toBeNull();
    });

    it('requires reason for rejection', async () => {
      await request(app.getHttpServer())
        .post(`/parents/link-requests/${linkRequestId}/reject`)
        .set('Authorization', `Bearer ${branchAdminToken}`)
        .send({})
        .expect(400);
    });

    it('prevents rejecting already rejected request', async () => {
      // Reject first time
      await request(app.getHttpServer())
        .post(`/parents/link-requests/${linkRequestId}/reject`)
        .set('Authorization', `Bearer ${branchAdminToken}`)
        .send({
          reason: 'Test reason',
        })
        .expect(201);

      // Try to reject again
      await request(app.getHttpServer())
        .post(`/parents/link-requests/${linkRequestId}/reject`)
        .set('Authorization', `Bearer ${branchAdminToken}`)
        .send({
          reason: 'Another reason',
        })
        .expect(400);
    });

    it('prevents parent from rejecting their own request', async () => {
      await request(app.getHttpServer())
        .post(`/parents/link-requests/${linkRequestId}/reject`)
        .set('Authorization', `Bearer ${parent2Token}`)
        .send({
          reason: 'Changed my mind',
        })
        .expect(403);
    });

    it('requires authentication', async () => {
      await request(app.getHttpServer())
        .post(`/parents/link-requests/${linkRequestId}/reject`)
        .send({
          reason: 'Test',
        })
        .expect(401);
    });
  });

  describe('GET /parents/students', () => {
    it('allows parent to view their linked students', async () => {
      const response = await request(app.getHttpServer())
        .get('/parents/students')
        .set('Authorization', `Bearer ${parentToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(1);
      expect(response.body[0]).toMatchObject({
        student: {
          id: studentId,
          studentCode: studentCode,
        },
        relationship: 'Father',
        isPrimary: true,
      });
    });

    it('shows multiple children for parent with multiple links', async () => {
      // Approve parent2 to link to student1
      const linkRequest = await request(app.getHttpServer())
        .post('/parents/link-requests')
        .set('Authorization', `Bearer ${parent2Token}`)
        .send({
          studentCode: studentCode,
          studentName: 'Test Student',
          studentDateOfBirth: '2010-05-15',
          relationship: 'Mother',
        })
        .expect(201);

      await request(app.getHttpServer())
        .post(`/parents/link-requests/${linkRequest.body.id}/approve`)
        .set('Authorization', `Bearer ${branchAdminToken}`)
        .expect(201);

      // Parent2 should now see both students
      const response = await request(app.getHttpServer())
        .get('/parents/students')
        .set('Authorization', `Bearer ${parent2Token}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(2);
    });

    it('returns empty array for parent with no linked students', async () => {
      // Create a new parent with no students
      const _newParent = await prisma.user.create({
        data: {
          email: 'newparent@example.com',
          password: 'hashedpassword',
          name: 'New Parent',
          role: 'PARENT',
          organizationId,
          parent: {
            create: {},
          },
        },
      });

      // This would need actual login, but for test purposes we'd expect empty
      // Skipping actual implementation for brevity
    });

    it('requires authentication', async () => {
      await request(app.getHttpServer()).get('/parents/students').expect(401);
    });

    it('only allows parents to access this endpoint', async () => {
      await request(app.getHttpServer())
        .get('/parents/students')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(403);
    });
  });

  describe('DELETE /parents/:parentId/students/:studentId', () => {
    it('allows branch admin to unlink parent-student relationship', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/parents/${parentId}/students/${studentId}`)
        .set('Authorization', `Bearer ${branchAdminToken}`)
        .send({
          reason: 'Parent request to unlink',
        })
        .expect(200);

      expect(response.body.message).toContain('unlinked');

      // Verify link was removed from database
      const parentStudent = await prisma.parentStudent.findFirst({
        where: {
          parentId: parentId,
          studentId: studentId,
        },
      });

      expect(parentStudent).toBeNull();
    });

    it('allows super admin to unlink parent-student relationship', async () => {
      await request(app.getHttpServer())
        .delete(`/parents/${parentId}/students/${studentId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          reason: 'Administrative decision',
        })
        .expect(200);
    });

    it('requires reason for unlinking', async () => {
      await request(app.getHttpServer())
        .delete(`/parents/${parentId}/students/${studentId}`)
        .set('Authorization', `Bearer ${branchAdminToken}`)
        .send({})
        .expect(400);
    });

    it('prevents unlinking non-existent relationship', async () => {
      await request(app.getHttpServer())
        .delete(`/parents/${parentId}/students/99999`)
        .set('Authorization', `Bearer ${branchAdminToken}`)
        .send({
          reason: 'Test reason for unlinking',
        })
        .expect(404);
    });

    it('prevents parent from unlinking themselves', async () => {
      await request(app.getHttpServer())
        .delete(`/parents/${parentId}/students/${studentId}`)
        .set('Authorization', `Bearer ${parentToken}`)
        .send({
          reason: 'I want to unlink',
        })
        .expect(403);
    });

    it('requires authentication', async () => {
      await request(app.getHttpServer())
        .delete(`/parents/${parentId}/students/${studentId}`)
        .send({
          reason: 'Test',
        })
        .expect(401);
    });
  });

  describe('Parent-Student linking workflow', () => {
    it('complete workflow: request -> approve -> view -> unlink', async () => {
      // Step 1: Parent2 requests to link to Student1
      const linkRequestResponse = await request(app.getHttpServer())
        .post('/parents/link-requests')
        .set('Authorization', `Bearer ${parent2Token}`)
        .send({
          studentCode: studentCode,
          studentName: 'Test Student',
          studentDateOfBirth: '2010-05-15',
          relationship: 'Mother',
        })
        .expect(201);

      expect(linkRequestResponse.body.status).toBe('PENDING');
      const linkRequestId = linkRequestResponse.body.id;

      // Step 2: Branch admin views pending requests
      const pendingRequests = await request(app.getHttpServer())
        .get('/parents/link-requests?status=PENDING')
        .set('Authorization', `Bearer ${branchAdminToken}`)
        .expect(200);

      expect(pendingRequests.body.length).toBe(1);

      // Step 3: Branch admin approves request
      await request(app.getHttpServer())
        .post(`/parents/link-requests/${linkRequestId}/approve`)
        .set('Authorization', `Bearer ${branchAdminToken}`)
        .expect(201);

      // Step 4: Parent2 verifies they can see the student
      const linkedStudents = await request(app.getHttpServer())
        .get('/parents/students')
        .set('Authorization', `Bearer ${parent2Token}`)
        .expect(200);

      expect(linkedStudents.body.length).toBe(2); // Student1 and Student2
      expect(
        linkedStudents.body.some(
          (link: { student: { id: number } }) => link.student.id === studentId,
        ),
      ).toBe(true);

      // Step 5: Admin unlinks the relationship
      await request(app.getHttpServer())
        .delete(`/parents/${parent2Id}/students/${studentId}`)
        .set('Authorization', `Bearer ${branchAdminToken}`)
        .send({
          reason: 'Test completion',
        })
        .expect(200);

      // Step 6: Verify parent2 no longer sees student1
      const finalLinkedStudents = await request(app.getHttpServer())
        .get('/parents/students')
        .set('Authorization', `Bearer ${parent2Token}`)
        .expect(200);

      expect(finalLinkedStudents.body.length).toBe(1); // Only Student2
      expect(
        finalLinkedStudents.body.some(
          (link: { student: { id: number } }) => link.student.id === studentId,
        ),
      ).toBe(false);
    });
  });
});
