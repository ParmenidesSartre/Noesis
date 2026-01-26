import { HealthCheckService, HttpHealthIndicator, PrismaHealthIndicator, MemoryHealthIndicator, DiskHealthIndicator } from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';
export declare class HealthController {
    private health;
    private http;
    private prismaHealth;
    private memory;
    private disk;
    private prisma;
    constructor(health: HealthCheckService, http: HttpHealthIndicator, prismaHealth: PrismaHealthIndicator, memory: MemoryHealthIndicator, disk: DiskHealthIndicator, prisma: PrismaService);
    check(): Promise<import("@nestjs/terminus").HealthCheckResult>;
    liveness(): {
        status: string;
        timestamp: string;
    };
    readiness(): Promise<import("@nestjs/terminus").HealthCheckResult>;
}
