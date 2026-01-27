import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import * as path from 'path';
import * as fs from 'fs';

describe('Document Upload System (E2E)', () => {
  let app: INestApplication;
  let moduleRef: TestingModule;
  let prisma: PrismaService;
  let superAdminToken: string;
  let teacherToken: string;
  let teacherId: number;
  let teacher2Id: number;
  let organizationId: number;
  let branchId: number;

  // Test file paths
  const testPdfPath = path.join(__dirname, '../fixtures/test-resume.pdf');
  const testImagePath = path.join(__dirname, '../fixtures/test-certificate.jpg');
  const testLargeFilePath = path.join(__dirname, '../fixtures/large-file.pdf');
  const testInvalidFilePath = path.join(__dirname, '../fixtures/test-file.txt');

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    prisma = moduleRef.get<PrismaService>(PrismaService);

    // Create test fixtures directory if it doesn't exist
    const fixturesDir = path.join(__dirname, '../fixtures');
    if (!fs.existsSync(fixturesDir)) {
      fs.mkdirSync(fixturesDir, { recursive: true });
    }

    // Create test PDF file (small valid file)
    const pdfContent = Buffer.from(
      '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n190\n%%EOF',
    );
    fs.writeFileSync(testPdfPath, pdfContent);

    // Create test JPG file (1x1 red pixel)
    const jpgContent = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43, 0x00, 0x08, 0x06, 0x06, 0x07, 0x06,
      0x05, 0x08, 0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0a, 0x0c, 0x14, 0x0d, 0x0c, 0x0b, 0x0b,
      0x0c, 0x19, 0x12, 0x13, 0x0f, 0x14, 0x1d, 0x1a, 0x1f, 0x1e, 0x1d, 0x1a, 0x1c, 0x1c, 0x20,
      0x24, 0x2e, 0x27, 0x20, 0x22, 0x2c, 0x23, 0x1c, 0x1c, 0x28, 0x37, 0x29, 0x2c, 0x30, 0x31,
      0x34, 0x34, 0x34, 0x1f, 0x27, 0x39, 0x3d, 0x38, 0x32, 0x3c, 0x2e, 0x33, 0x34, 0x32, 0xff,
      0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01, 0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00,
      0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x03, 0xff, 0xc4, 0x00, 0x14, 0x10, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0xda, 0x00, 0x08,
      0x01, 0x01, 0x00, 0x00, 0x3f, 0x00, 0x37, 0xff, 0xd9,
    ]);
    fs.writeFileSync(testImagePath, jpgContent);

    // Create large file (>10MB) for size validation testing
    const largeContent = Buffer.alloc(11 * 1024 * 1024); // 11MB
    fs.writeFileSync(testLargeFilePath, largeContent);

    // Create invalid file type (.txt)
    fs.writeFileSync(testInvalidFilePath, 'This is a text file');

    // Register organization with unique identifiers
    const timestamp = Date.now();
    const adminEmail = `docadmin-${timestamp}@example.com`;
    const adminPassword = 'AdminPass123!';

    const orgResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        organizationName: 'Document Test Tuition',
        organizationSlug: `doc-test-tuition-${timestamp}`,
        organizationEmail: `org-${timestamp}@doctest.com`,
        adminName: 'Doc Admin',
        adminEmail,
        adminPassword,
        adminPhone: '+1234567899',
      })
      .expect(201);

    organizationId = orgResponse.body.organization.id;

    // Login as super admin to get tokens
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: adminEmail,
        password: adminPassword,
      })
      .expect(200);

    superAdminToken = loginResponse.body.accessToken;

    // Create a branch
    const branch = await prisma.branch.create({
      data: {
        name: 'Main Branch',
        code: 'MAIN',
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
        name: 'Test Teacher',
        email: `teacher-${timestamp}@example.com`,
        password: 'TeacherPass123!',
        phone: '+1234567890',
        branchId,
      })
      .expect(201);

    teacherId = teacherResponse.body.teacher.id;

    // Create another teacher
    const teacher2Response = await request(app.getHttpServer())
      .post('/users/teachers')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        name: 'Teacher Two',
        email: `teacher2-${timestamp}@example.com`,
        password: 'TeacherPass123!',
        phone: '+1234567891',
        branchId,
      })
      .expect(201);

    teacher2Id = teacher2Response.body.teacher.id;

    // Login as teacher
    const teacherLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: `teacher-${timestamp}@example.com`,
        password: 'TeacherPass123!',
      })
      .expect(200);

    teacherToken = teacherLogin.body.accessToken;
  });

  afterAll(async () => {
    // Clean up test files
    const testFiles = [testPdfPath, testImagePath, testLargeFilePath, testInvalidFilePath];
    testFiles.forEach((filePath) => {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    await app.close();
  });

  describe('POST /users/teachers/:id/documents', () => {
    it('allows teacher to upload their own resume', async () => {
      const response = await request(app.getHttpServer())
        .post(`/users/teachers/${teacherId}/documents`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .attach('file', testPdfPath)
        .field('documentType', 'resume')
        .field('description', 'My professional resume')
        .expect(201);

      expect(response.body).toMatchObject({
        teacherId,
        documentType: 'resume',
        description: 'My professional resume',
        fileName: expect.stringContaining('.pdf'),
        fileSize: expect.any(Number),
        mimeType: 'application/pdf',
      });
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('fileUrl');
      expect(response.body).toHaveProperty('uploadedAt');
    });

    it('allows teacher to upload certificate with expiry date', async () => {
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 2); // Expires in 2 years

      const response = await request(app.getHttpServer())
        .post(`/users/teachers/${teacherId}/documents`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .attach('file', testImagePath)
        .field('documentType', 'certificate')
        .field('description', 'Teaching Certification')
        .field('expiryDate', expiryDate.toISOString())
        .expect(201);

      expect(response.body).toMatchObject({
        teacherId,
        documentType: 'certificate',
        description: 'Teaching Certification',
        mimeType: 'image/jpeg',
      });
      expect(response.body.expiryDate).toBeTruthy();
      expect(new Date(response.body.expiryDate).getTime()).toBeCloseTo(expiryDate.getTime(), -3);
    });

    it('allows admin to upload document for any teacher', async () => {
      const response = await request(app.getHttpServer())
        .post(`/users/teachers/${teacher2Id}/documents`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .attach('file', testPdfPath)
        .field('documentType', 'id_document')
        .field('description', 'Identity Card Copy')
        .expect(201);

      expect(response.body.teacherId).toBe(teacher2Id);
    });

    it('rejects file larger than 10MB', async () => {
      await request(app.getHttpServer())
        .post(`/users/teachers/${teacherId}/documents`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .attach('file', testLargeFilePath)
        .field('documentType', 'resume')
        .expect(400);
    });

    it('rejects invalid file type', async () => {
      await request(app.getHttpServer())
        .post(`/users/teachers/${teacherId}/documents`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .attach('file', testInvalidFilePath)
        .field('documentType', 'resume')
        .expect(400);
    });

    it('prevents teacher from uploading document for another teacher', async () => {
      await request(app.getHttpServer())
        .post(`/users/teachers/${teacher2Id}/documents`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .attach('file', testPdfPath)
        .field('documentType', 'resume')
        .expect(403);
    });

    it('requires authentication', async () => {
      await request(app.getHttpServer())
        .post(`/users/teachers/${teacherId}/documents`)
        .attach('file', testPdfPath)
        .field('documentType', 'resume')
        .expect(401);
    });

    it('validates required fields', async () => {
      await request(app.getHttpServer())
        .post(`/users/teachers/${teacherId}/documents`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .attach('file', testPdfPath)
        // Missing documentType
        .expect(400);
    });
  });

  describe('GET /users/teachers/:id/documents', () => {
    beforeAll(async () => {
      // Upload multiple documents for testing
      await request(app.getHttpServer())
        .post(`/users/teachers/${teacherId}/documents`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .attach('file', testPdfPath)
        .field('documentType', 'resume')
        .field('description', 'Resume 2024')
        .expect(201);

      await request(app.getHttpServer())
        .post(`/users/teachers/${teacherId}/documents`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .attach('file', testImagePath)
        .field('documentType', 'certificate')
        .field('description', 'MOE Certificate')
        .expect(201);
    });

    it('allows teacher to view their own documents', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/teachers/${teacherId}/documents`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('documentType');
      expect(response.body[0]).toHaveProperty('fileUrl');
    });

    it('allows admin to view any teacher documents', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/teachers/${teacherId}/documents`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
    });

    it('filters documents by type', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/teachers/${teacherId}/documents?type=resume`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      response.body.forEach((doc: { documentType: string }) => {
        expect(doc.documentType).toBe('resume');
      });
    });

    it('prevents teacher from viewing another teacher documents', async () => {
      await request(app.getHttpServer())
        .get(`/users/teachers/${teacher2Id}/documents`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(403);
    });
  });

  describe('GET /users/teachers/:teacherId/documents/:documentId', () => {
    let documentId: number;

    beforeAll(async () => {
      const uploadResponse = await request(app.getHttpServer())
        .post(`/users/teachers/${teacherId}/documents`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .attach('file', testPdfPath)
        .field('documentType', 'resume')
        .field('description', 'Test Resume')
        .expect(201);

      documentId = uploadResponse.body.id;
    });

    it('allows teacher to view their own document details', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/teachers/${teacherId}/documents/${documentId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: documentId,
        teacherId,
        documentType: 'resume',
      });
    });

    it('allows admin to view any document', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/teachers/${teacherId}/documents/${documentId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response.body.id).toBe(documentId);
    });

    it('returns 404 for non-existent document', async () => {
      await request(app.getHttpServer())
        .get(`/users/teachers/${teacherId}/documents/99999`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(404);
    });
  });

  describe('GET /users/teachers/:teacherId/documents/:documentId/download', () => {
    let documentId: number;

    beforeAll(async () => {
      const uploadResponse = await request(app.getHttpServer())
        .post(`/users/teachers/${teacherId}/documents`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .attach('file', testPdfPath)
        .field('documentType', 'resume')
        .field('description', 'Downloadable Resume')
        .expect(201);

      documentId = uploadResponse.body.id;
    });

    it('allows teacher to download their own document', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/teachers/${teacherId}/documents/${documentId}/download`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);

      expect(response.headers['content-type']).toContain('application');
      expect(response.body).toBeTruthy();
    });

    it('allows admin to download any document', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/teachers/${teacherId}/documents/${documentId}/download`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response.body).toBeTruthy();
    });

    it('prevents teacher from downloading another teacher document', async () => {
      await request(app.getHttpServer())
        .get(`/users/teachers/${teacher2Id}/documents/${documentId}/download`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(403);
    });
  });

  describe('PATCH /users/teachers/:teacherId/documents/:documentId', () => {
    let documentId: number;

    beforeAll(async () => {
      const uploadResponse = await request(app.getHttpServer())
        .post(`/users/teachers/${teacherId}/documents`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .attach('file', testPdfPath)
        .field('documentType', 'certificate')
        .field('description', 'Old Description')
        .expect(201);

      documentId = uploadResponse.body.id;
    });

    it('allows teacher to update their document metadata', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/users/teachers/${teacherId}/documents/${documentId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          description: 'Updated Description',
          expiryDate: '2026-12-31',
        })
        .expect(200);

      expect(response.body.description).toBe('Updated Description');
      expect(response.body.expiryDate).toBeTruthy();
    });

    it('allows admin to update any document', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/users/teachers/${teacherId}/documents/${documentId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          description: 'Admin Updated Description',
        })
        .expect(200);

      expect(response.body.description).toBe('Admin Updated Description');
    });

    it('prevents teacher from updating another teacher document', async () => {
      await request(app.getHttpServer())
        .patch(`/users/teachers/${teacher2Id}/documents/${documentId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          description: 'Unauthorized Update',
        })
        .expect(403);
    });
  });

  describe('DELETE /users/teachers/:teacherId/documents/:documentId', () => {
    let documentId: number;

    beforeEach(async () => {
      const uploadResponse = await request(app.getHttpServer())
        .post(`/users/teachers/${teacherId}/documents`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .attach('file', testPdfPath)
        .field('documentType', 'other')
        .field('description', 'Document to Delete')
        .expect(201);

      documentId = uploadResponse.body.id;
    });

    it('allows teacher to delete their own document', async () => {
      await request(app.getHttpServer())
        .delete(`/users/teachers/${teacherId}/documents/${documentId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);

      // Verify document is deleted
      await request(app.getHttpServer())
        .get(`/users/teachers/${teacherId}/documents/${documentId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(404);
    });

    it('allows admin to delete any document', async () => {
      await request(app.getHttpServer())
        .delete(`/users/teachers/${teacherId}/documents/${documentId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);
    });

    it('prevents teacher from deleting another teacher document', async () => {
      await request(app.getHttpServer())
        .delete(`/users/teachers/${teacher2Id}/documents/${documentId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(403);
    });

    it('returns 404 when deleting non-existent document', async () => {
      await request(app.getHttpServer())
        .delete(`/users/teachers/${teacherId}/documents/99999`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(404);
    });
  });

  describe('GET /users/teachers/documents/expiring', () => {
    beforeAll(async () => {
      // Upload document expiring in 10 days
      const expiringSoon = new Date();
      expiringSoon.setDate(expiringSoon.getDate() + 10);

      await request(app.getHttpServer())
        .post(`/users/teachers/${teacherId}/documents`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .attach('file', testPdfPath)
        .field('documentType', 'certificate')
        .field('description', 'Expiring Certificate')
        .field('expiryDate', expiringSoon.toISOString())
        .expect(201);

      // Upload document expiring in 60 days
      const expiringLater = new Date();
      expiringLater.setDate(expiringLater.getDate() + 60);

      await request(app.getHttpServer())
        .post(`/users/teachers/${teacherId}/documents`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .attach('file', testPdfPath)
        .field('documentType', 'certificate')
        .field('description', 'Later Expiring Certificate')
        .field('expiryDate', expiringLater.toISOString())
        .expect(201);
    });

    it('allows admin to view expiring documents within 30 days', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/teachers/documents/expiring?days=30')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
      response.body.forEach((doc: { expiryDate: string }) => {
        const daysUntilExpiry = Math.ceil(
          (new Date(doc.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
        );
        expect(daysUntilExpiry).toBeLessThanOrEqual(30);
      });
    });

    it('prevents non-admin from accessing expiring documents endpoint', async () => {
      await request(app.getHttpServer())
        .get('/users/teachers/documents/expiring')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(403);
    });
  });

  describe('Complete workflow', () => {
    it('uploads, retrieves, updates, downloads, and deletes document', async () => {
      // Step 1: Upload document
      const uploadResponse = await request(app.getHttpServer())
        .post(`/users/teachers/${teacherId}/documents`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .attach('file', testPdfPath)
        .field('documentType', 'resume')
        .field('description', 'Complete Workflow Resume')
        .expect(201);

      const documentId = uploadResponse.body.id;
      expect(documentId).toBeTruthy();

      // Step 2: Retrieve document list
      const listResponse = await request(app.getHttpServer())
        .get(`/users/teachers/${teacherId}/documents`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);

      const foundDoc = listResponse.body.find((doc: { id: number }) => doc.id === documentId);
      expect(foundDoc).toBeTruthy();

      // Step 3: Update document metadata
      const updateResponse = await request(app.getHttpServer())
        .patch(`/users/teachers/${teacherId}/documents/${documentId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          description: 'Workflow Updated Resume',
        })
        .expect(200);

      expect(updateResponse.body.description).toBe('Workflow Updated Resume');

      // Step 4: Download document
      await request(app.getHttpServer())
        .get(`/users/teachers/${teacherId}/documents/${documentId}/download`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);

      // Step 5: Delete document
      await request(app.getHttpServer())
        .delete(`/users/teachers/${teacherId}/documents/${documentId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);

      // Step 6: Verify deletion
      await request(app.getHttpServer())
        .get(`/users/teachers/${teacherId}/documents/${documentId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(404);
    });
  });
});
