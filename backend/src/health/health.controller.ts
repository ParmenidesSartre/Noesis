import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  PrismaHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from '../auth/decorators/public.decorator';

/**
 * Health check controller
 * Provides endpoints for monitoring application health
 * Used by load balancers and monitoring systems
 */
@ApiTags('Health')
@Controller('health')
@Public() // Health endpoints are public for monitoring
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private prismaHealth: PrismaHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    private prisma: PrismaService,
  ) {}

  /**
   * Basic health check
   * Returns 200 if application is running
   */
  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Basic health check' })
  @ApiResponse({ status: 200, description: 'Application is healthy' })
  @ApiResponse({ status: 503, description: 'Application is unhealthy' })
  check() {
    return this.health.check([
      // Check database connection
      () => this.prismaHealth.pingCheck('database', this.prisma),

      // Check memory usage (heap should not exceed 150MB)
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),

      // Check disk storage (should have at least 50% free)
      () =>
        this.disk.checkStorage('storage', {
          path: process.platform === 'win32' ? 'C:/' : '/',
          thresholdPercent: 0.5,
        }),
    ]);
  }

  /**
   * Liveness probe
   * Indicates if the application is running
   * Used by Kubernetes/container orchestrators
   */
  @Get('/liveness')
  @ApiOperation({ summary: 'Liveness probe' })
  @ApiResponse({ status: 200, description: 'Application is alive' })
  liveness() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Readiness probe
   * Indicates if the application is ready to accept traffic
   * Used by Kubernetes/container orchestrators
   */
  @Get('/readiness')
  @HealthCheck()
  @ApiOperation({ summary: 'Readiness probe' })
  @ApiResponse({ status: 200, description: 'Application is ready' })
  @ApiResponse({ status: 503, description: 'Application is not ready' })
  readiness() {
    return this.health.check([
      // Only check critical dependencies
      () => this.prismaHealth.pingCheck('database', this.prisma),
    ]);
  }
}
