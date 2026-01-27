/**
 * E2E tests for tenant registration flow
 *
 * Covers creation of organization and initial admin user.
 * Tests drive expected payload and behaviors before implementation.
 */
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Role, SubscriptionPlan } from '@prisma/client';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { cleanupDatabase } from '../helpers/test-utils';

describe('Auth Registration (e2e)', () => {
  let app: INestApplication;
  let moduleRef: TestingModule;
  let prisma: PrismaService;

  const basePayload = {
    organizationName: 'ABC Tuition Centre',
    organizationEmail: 'hello@abctuition.com',
    organizationPhone: '+65 1234 5678',
    adminName: 'Alice Admin',
    adminEmail: 'alice.admin@abctuition.com',
    adminPassword: 'Str0ngP@ssword!',
  };

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

  describe('POST /auth/register', () => {
    it('registers a new organization with an admin user and sets trial period', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...basePayload,
          plan: SubscriptionPlan.STARTER,
        })
        .expect(201);

      expect(response.body).toMatchObject({
        organization: {
          name: basePayload.organizationName,
          email: basePayload.organizationEmail,
          phone: basePayload.organizationPhone,
          plan: SubscriptionPlan.STARTER,
          planStatus: 'TRIAL',
          isActive: true,
          slug: 'abc-tuition-centre',
        },
        adminUser: {
          email: basePayload.adminEmail,
          name: basePayload.adminName,
          role: Role.SUPER_ADMIN,
          isActive: true,
        },
      });

      expect(response.body.adminUser).not.toHaveProperty('password');

      const persistedOrg = await prisma.organization.findUnique({
        where: { id: response.body.organization.id },
      });
      const persistedUser = await prisma.user.findUnique({
        where: { id: response.body.adminUser.id },
      });

      expect(persistedUser?.password).toBeDefined();
      expect(persistedUser?.password).not.toBe(basePayload.adminPassword);
      expect(persistedUser?.organizationId).toBe(persistedOrg?.id);
      expect(persistedOrg?.planStatus).toBe('TRIAL');

      const fourteenDaysFromNow = Date.now() + 14 * 24 * 60 * 60 * 1000;
      const thirteenDaysFromNow = Date.now() + 13 * 24 * 60 * 60 * 1000;

      expect(
        persistedOrg?.trialEndsAt && new Date(persistedOrg.trialEndsAt).getTime(),
      ).toBeGreaterThan(thirteenDaysFromNow);
      expect(
        persistedOrg?.trialEndsAt && new Date(persistedOrg.trialEndsAt).getTime(),
      ).toBeLessThanOrEqual(fourteenDaysFromNow + 1000);
    });

    it('rejects duplicate organization email or slug', async () => {
      await request(app.getHttpServer()).post('/auth/register').send(basePayload).expect(201);

      const secondResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...basePayload,
          adminEmail: 'new.admin@abctuition.com',
        })
        .expect(409);

      expect(secondResponse.body.message).toContain('Organization already exists');
    });

    it('validates payload and rejects weak passwords', async () => {
      const invalidResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...basePayload,
          adminPassword: 'short',
        })
        .expect(400);

      expect(invalidResponse.body.message).toEqual(
        expect.arrayContaining([expect.stringContaining('adminPassword')]),
      );
    });
  });
});
