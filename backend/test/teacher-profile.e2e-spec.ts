/**
 * E2E tests for teacher profile management endpoints
 */
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { cleanupDatabase } from './helpers/test-utils';

describe('Teacher Profile Management (e2e)', () => {
  let app: INestApplication;
  let moduleRef: TestingModule;
  let prisma: PrismaService;
  let superAdminToken: string;
  let teacherToken: string;
  let organizationId: number;
  let branchId: number;
  let teacherId: number;
  let teacherUserId: number;

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
    const slug = `teacher-profile-${Date.now()}`;
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        organizationName: 'Teacher Profile Test Org',
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

    // Create a teacher
    const teacherResponse = await request(app.getHttpServer())
      .post('/users/teachers')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        email: 'teacher@example.com',
        name: 'John Teacher',
        branchId,
        phone: '+1234567890',
      })
      .expect(201);

    teacherId = teacherResponse.body.teacher.id;
    teacherUserId = teacherResponse.body.user.id;

    // Login as teacher
    const teacherPassword = teacherResponse.body.temporaryPassword;
    const teacherLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'teacher@example.com',
        password: teacherPassword,
        organizationSlug: slug,
      })
      .expect(200);

    teacherToken = teacherLoginResponse.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /users/teachers/:id/profile', () => {
    it('allows teacher to view their own profile', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/teachers/${teacherId}/profile`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: teacherId,
        userId: teacherUserId,
        teacherCode: expect.any(String),
      });
      expect(response.body.user).toMatchObject({
        id: teacherUserId,
        email: 'teacher@example.com',
        name: 'John Teacher',
      });
      expect(response.body.user.password).toBeUndefined();
    });

    it('allows super admin to view teacher profile', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/teachers/${teacherId}/profile`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: teacherId,
        userId: teacherUserId,
      });
    });

    it('prevents teacher from viewing another teacher profile', async () => {
      // Create another teacher
      const otherTeacherResponse = await request(app.getHttpServer())
        .post('/users/teachers')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          email: 'teacher2@example.com',
          name: 'Jane Teacher',
          branchId,
        })
        .expect(201);

      const otherTeacherId = otherTeacherResponse.body.teacher.id;

      await request(app.getHttpServer())
        .get(`/users/teachers/${otherTeacherId}/profile`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(403);
    });

    it('returns 404 for non-existent teacher', async () => {
      await request(app.getHttpServer())
        .get('/users/teachers/99999/profile')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(404);
    });
  });

  describe('PATCH /users/teachers/:id/profile', () => {
    it('allows teacher to update their own profile with subject specialization', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/users/teachers/${teacherId}/profile`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          primarySubjects: ['Mathematics', 'Physics'],
          secondarySubjects: ['Chemistry'],
          gradeLevels: ['Primary 5', 'Primary 6', 'Secondary 1'],
          languagesSpoken: ['English', 'Mandarin'],
        })
        .expect(200);

      expect(response.body.message).toContain('successfully');
      expect(response.body.teacher.primarySubjects).toEqual(['Mathematics', 'Physics']);
      expect(response.body.teacher.secondarySubjects).toEqual(['Chemistry']);
      expect(response.body.teacher.gradeLevels).toEqual(['Primary 5', 'Primary 6', 'Secondary 1']);
      expect(response.body.teacher.languagesSpoken).toEqual(['English', 'Mandarin']);
    });

    it('allows teacher to update professional qualifications', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/users/teachers/${teacherId}/profile`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          highestQualification: "Bachelor's Degree",
          degreeName: 'Bachelor of Science in Mathematics',
          institution: 'National University of Singapore',
          graduationYear: 2015,
          certifications: [
            {
              name: 'MOE Teaching Certificate',
              year: 2016,
              issuingOrganization: 'Ministry of Education Singapore',
            },
            {
              name: 'Advanced Mathematics Pedagogy',
              year: 2018,
              issuingOrganization: 'NIE Singapore',
            },
          ],
        })
        .expect(200);

      expect(response.body.teacher.highestQualification).toBe("Bachelor's Degree");
      expect(response.body.teacher.degreeName).toBe('Bachelor of Science in Mathematics');
      expect(response.body.teacher.institution).toBe('National University of Singapore');
      expect(response.body.teacher.graduationYear).toBe(2015);
      expect(response.body.teacher.certifications).toHaveLength(2);
      expect(response.body.teacher.certifications[0].name).toBe('MOE Teaching Certificate');
    });

    it('allows admin to update teacher employment details', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/users/teachers/${teacherId}/profile`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          employmentType: 'Full-time',
          contractStartDate: '2024-01-15',
          workSchedule: {
            monday: ['09:00-12:00', '14:00-17:00'],
            tuesday: ['09:00-12:00', '14:00-17:00'],
            wednesday: ['09:00-12:00'],
          },
          monthlySalary: 4500.0,
        })
        .expect(200);

      expect(response.body.teacher.employmentType).toBe('Full-time');
      expect(response.body.teacher.contractStartDate).toBeDefined();
      expect(response.body.teacher.workSchedule).toHaveProperty('monday');
      expect(response.body.teacher.workSchedule.monday).toEqual(['09:00-12:00', '14:00-17:00']);
      expect(response.body.teacher.monthlySalary).toBe(4500.0);
    });

    it('allows teacher to update professional profile (bio, philosophy, achievements)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/users/teachers/${teacherId}/profile`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          bio: 'Experienced mathematics teacher with 8 years of teaching experience.',
          teachingPhilosophy: 'I believe in making mathematics fun and accessible to all students.',
          achievements: 'Top Teacher Award 2023, 95% student pass rate for O-Levels',
          experience: 8,
        })
        .expect(200);

      expect(response.body.teacher.bio).toContain('Experienced mathematics teacher');
      expect(response.body.teacher.teachingPhilosophy).toContain('making mathematics fun');
      expect(response.body.teacher.achievements).toContain('Top Teacher Award');
      expect(response.body.teacher.experience).toBe(8);
    });

    it('allows teacher to update document URLs', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/users/teachers/${teacherId}/profile`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          resumeUrl: 'https://storage.example.com/resumes/teacher-123.pdf',
          certificatesUrl: 'https://storage.example.com/certificates/teacher-123/',
        })
        .expect(200);

      expect(response.body.teacher.resumeUrl).toBe(
        'https://storage.example.com/resumes/teacher-123.pdf',
      );
      expect(response.body.teacher.certificatesUrl).toBe(
        'https://storage.example.com/certificates/teacher-123/',
      );
    });

    it('allows updating hourly rate for part-time teachers', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/users/teachers/${teacherId}/profile`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          employmentType: 'Part-time',
          hourlyRate: 50.0,
        })
        .expect(200);

      expect(response.body.teacher.employmentType).toBe('Part-time');
      expect(response.body.teacher.hourlyRate).toBe(50.0);
    });

    it('prevents teacher from updating another teacher profile', async () => {
      // Create another teacher
      const otherTeacherResponse = await request(app.getHttpServer())
        .post('/users/teachers')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          email: 'teacher2@example.com',
          name: 'Jane Teacher',
          branchId,
        })
        .expect(201);

      const otherTeacherId = otherTeacherResponse.body.teacher.id;

      await request(app.getHttpServer())
        .patch(`/users/teachers/${otherTeacherId}/profile`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          bio: 'Trying to update another teacher profile',
        })
        .expect(403);
    });

    it('validates qualification enum values', async () => {
      await request(app.getHttpServer())
        .patch(`/users/teachers/${teacherId}/profile`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          highestQualification: 'InvalidQualification',
        })
        .expect(400);
    });

    it('validates employment type enum values', async () => {
      await request(app.getHttpServer())
        .patch(`/users/teachers/${teacherId}/profile`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          employmentType: 'InvalidType',
        })
        .expect(400);
    });

    it('allows partial updates without affecting other fields', async () => {
      // First update: set multiple fields
      await request(app.getHttpServer())
        .patch(`/users/teachers/${teacherId}/profile`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          primarySubjects: ['Mathematics'],
          bio: 'Original bio',
          experience: 5,
        })
        .expect(200);

      // Second update: only update bio
      const response = await request(app.getHttpServer())
        .patch(`/users/teachers/${teacherId}/profile`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          bio: 'Updated bio',
        })
        .expect(200);

      // Verify primarySubjects and experience remain unchanged
      expect(response.body.teacher.primarySubjects).toEqual(['Mathematics']);
      expect(response.body.teacher.bio).toBe('Updated bio');
      expect(response.body.teacher.experience).toBe(5);
    });
  });

  describe('Complete profile update workflow', () => {
    it('allows teacher to build complete professional profile over multiple updates', async () => {
      // Step 1: Add subject specialization
      await request(app.getHttpServer())
        .patch(`/users/teachers/${teacherId}/profile`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          primarySubjects: ['Mathematics', 'Physics'],
          gradeLevels: ['Secondary 3', 'Secondary 4'],
          languagesSpoken: ['English', 'Mandarin'],
        })
        .expect(200);

      // Step 2: Add qualifications
      await request(app.getHttpServer())
        .patch(`/users/teachers/${teacherId}/profile`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          highestQualification: "Master's Degree",
          degreeName: 'Master of Education in Mathematics',
          institution: 'National Institute of Education',
          graduationYear: 2018,
        })
        .expect(200);

      // Step 3: Add professional profile
      await request(app.getHttpServer())
        .patch(`/users/teachers/${teacherId}/profile`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          bio: 'Passionate educator with focus on STEM subjects',
          experience: 10,
        })
        .expect(200);

      // Step 4: Verify complete profile
      const response = await request(app.getHttpServer())
        .get(`/users/teachers/${teacherId}/profile`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);

      expect(response.body.primarySubjects).toEqual(['Mathematics', 'Physics']);
      expect(response.body.highestQualification).toBe("Master's Degree");
      expect(response.body.bio).toContain('Passionate educator');
      expect(response.body.experience).toBe(10);
    });
  });
});
