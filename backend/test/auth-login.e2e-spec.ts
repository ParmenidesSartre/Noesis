/**
 * E2E tests for login/logout flows
 */
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { cleanupDatabase } from './helpers/test-utils';

describe('Auth Login/Logout (e2e)', () => {
  let app: INestApplication;
  let moduleRef: TestingModule;
  let prisma: PrismaService;

  const baseRegisterPayload = (slug: string) => ({
    organizationName: 'Login Test Org',
    organizationEmail: `login-test-${slug}@example.com`,
    organizationSlug: slug,
    adminName: 'Login Admin',
    adminEmail: `admin-${slug}@example.com`,
    adminPassword: 'Str0ngP@ssword!',
  });

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
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/login', () => {
    it('logs in with valid credentials and returns JWT', async () => {
      const slug = `login-org-${Date.now()}`;
      const registrationPayload = baseRegisterPayload(slug);

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registrationPayload)
        .expect(201);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: registrationPayload.adminEmail,
          password: registrationPayload.adminPassword,
          organizationSlug: slug,
        })
        .expect(200);

      expect(loginResponse.body).toHaveProperty('accessToken');
      expect(loginResponse.body.accessToken).toEqual(expect.any(String));
      expect(loginResponse.body.accessToken.length).toBeGreaterThan(20);

      expect(loginResponse.body.user).toMatchObject({
        email: registrationPayload.adminEmail,
        name: registrationPayload.adminName,
        role: 'SUPER_ADMIN',
        organizationId: expect.any(Number),
      });

      expect(loginResponse.body.organization).toMatchObject({
        slug,
        name: registrationPayload.organizationName,
      });
    });

    it('rejects invalid password', async () => {
      const slug = `login-org-${Date.now()}`;
      const registrationPayload = baseRegisterPayload(slug);

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registrationPayload)
        .expect(201);

      const invalidLogin = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: registrationPayload.adminEmail,
          password: 'WrongP@ssword!',
          organizationSlug: slug,
        })
        .expect(401);

      expect(invalidLogin.body.message).toContain('Invalid credentials');
    });
  });

  describe('POST /auth/logout', () => {
    it('acknowledges logout', async () => {
      const response = await request(app.getHttpServer()).post('/auth/logout').expect(200);

      expect(response.body).toEqual({ message: 'Logged out' });
    });
  });
});
