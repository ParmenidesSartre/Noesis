/**
 * Test Utilities
 *
 * Common helper functions for tests
 */

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import * as request from 'supertest';

/**
 * Creates a test application instance with all necessary configurations
 */
export async function createTestApp(
  module: any,
): Promise<{ app: INestApplication; moduleRef: TestingModule }> {
  const moduleRef: TestingModule = await Test.createTestingModule(module).compile();

  const app = moduleRef.createNestApplication();

  // Apply same pipes as main.ts
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.init();

  return { app, moduleRef };
}

/**
 * Cleans up test database by deleting all records
 * Respects foreign key constraints by deleting in correct order
 */
export async function cleanupDatabase(prisma: PrismaClient): Promise<void> {
  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== '_prisma_migrations')
    .map((name) => `"public"."${name}"`)
    .join(', ');

  try {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
  } catch (error) {
    console.error('Database cleanup error:', error);
  }
}

/**
 * Creates a test JWT token for authentication
 */
export function createTestToken(payload: any, jwtService: any): string {
  return jwtService.sign(payload);
}

/**
 * Helper to make authenticated requests in E2E tests
 */
export function authenticatedRequest(
  app: INestApplication,
  token: string,
): request.SuperTest<request.Test> {
  return request(app.getHttpServer()).set('Authorization', `Bearer ${token}`);
}

/**
 * Generates test user data
 */
export function generateTestUser(overrides: any = {}) {
  return {
    email: `test-${Date.now()}@example.com`,
    password: 'Test123!@#',
    name: 'Test User',
    role: 'STUDENT',
    ...overrides,
  };
}

/**
 * Generates test student data
 */
export function generateTestStudent(overrides: any = {}) {
  return {
    dateOfBirth: new Date('2010-01-01'),
    enrollmentDate: new Date(),
    status: 'ACTIVE',
    emergencyContact: '123-456-7890',
    ...overrides,
  };
}

/**
 * Waits for a condition to be true (useful for async operations)
 */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  timeout = 5000,
  interval = 100,
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  throw new Error('Timeout waiting for condition');
}

/**
 * Mock logger for tests (reduces console noise)
 */
export const mockLogger = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
  setContext: jest.fn(),
};
