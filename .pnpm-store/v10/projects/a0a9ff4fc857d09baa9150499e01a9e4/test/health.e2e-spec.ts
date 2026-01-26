/**
 * E2E Tests for Health Check Endpoints
 *
 * Tests the health check endpoints in a real application context
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Health Check (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /health', () => {
    it('should return health status with all checks', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('info');
          expect(res.body).toHaveProperty('details');
          expect(res.body.status).toBe('ok');
        });
    });

    it('should include database check', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body.info).toHaveProperty('database');
          expect(res.body.info.database.status).toBe('up');
        });
    });

    it('should include memory check', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body.info).toHaveProperty('memory_heap');
          expect(res.body.info.memory_heap.status).toBe('up');
        });
    });

    it('should include disk check', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body.info).toHaveProperty('storage');
          expect(res.body.info.storage.status).toBe('up');
        });
    });
  });

  describe('GET /health/liveness', () => {
    it('should return 200 if app is alive', () => {
      return request(app.getHttpServer())
        .get('/health/liveness')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body.status).toBe('ok');
        });
    });
  });

  describe('GET /health/readiness', () => {
    it('should return 200 if app is ready', () => {
      return request(app.getHttpServer())
        .get('/health/readiness')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body.status).toBe('ok');
        });
    });

    it('should check database connection', () => {
      return request(app.getHttpServer())
        .get('/health/readiness')
        .expect(200)
        .expect((res) => {
          expect(res.body.info).toHaveProperty('database');
          expect(res.body.info.database.status).toBe('up');
        });
    });
  });

  describe('Response headers', () => {
    it('should include correlation ID in response', () => {
      return request(app.getHttpServer())
        .get('/health/liveness')
        .expect(200)
        .expect((res) => {
          expect(res.headers).toHaveProperty('x-correlation-id');
        });
    });

    it('should respect custom correlation ID from request', () => {
      const customId = 'test-correlation-id-123';

      return request(app.getHttpServer())
        .get('/health/liveness')
        .set('X-Correlation-Id', customId)
        .expect(200)
        .expect((res) => {
          expect(res.headers['x-correlation-id']).toBe(customId);
        });
    });
  });
});
