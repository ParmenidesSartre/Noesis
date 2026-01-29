import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export enum AuditEventType {
  // Authentication events
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  LOGOUT = 'LOGOUT',
  SESSION_TIMEOUT = 'SESSION_TIMEOUT',

  // Registration events
  REGISTRATION_SUCCESS = 'REGISTRATION_SUCCESS',
  REGISTRATION_FAILURE = 'REGISTRATION_FAILURE',

  // Authorization events
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  FORBIDDEN_ACCESS = 'FORBIDDEN_ACCESS',

  // Data access events
  DATA_ACCESS = 'DATA_ACCESS',
  DATA_MODIFICATION = 'DATA_MODIFICATION',
  DATA_DELETION = 'DATA_DELETION',

  // Security events
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  DEVICE_CHANGE_DETECTED = 'DEVICE_CHANGE_DETECTED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',

  // API events
  API_REQUEST = 'API_REQUEST',
  API_ERROR = 'API_ERROR',
}

export enum AuditSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

export interface CreateAuditLogDto {
  eventType: AuditEventType;
  severity: AuditSeverity;
  message: string;
  metadata?: Record<string, unknown>;
  userId?: number;
  userEmail?: string;
  organizationId?: number;
  ipAddress?: string;
  userAgent?: string;
  fingerprint?: string;
}

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create an audit log entry
   */
  async log(dto: CreateAuditLogDto) {
    try {
      return await this.prisma.auditLog.create({
        data: {
          eventType: dto.eventType,
          severity: dto.severity,
          message: dto.message,
          metadata: dto.metadata || {},
          userId: dto.userId,
          userEmail: dto.userEmail,
          organizationId: dto.organizationId,
          ipAddress: dto.ipAddress,
          userAgent: dto.userAgent,
          fingerprint: dto.fingerprint,
        },
      });
    } catch (error) {
      // Audit logging should never break the application
      // Log to console instead
      console.error('Failed to create audit log:', error);
      console.error('Audit log data:', dto);
    }
  }

  /**
   * Log authentication success
   */
  async logLoginSuccess(
    userEmail: string,
    userId: number,
    organizationId: number,
    ipAddress?: string,
    userAgent?: string,
    fingerprint?: string,
  ) {
    return this.log({
      eventType: AuditEventType.LOGIN_SUCCESS,
      severity: AuditSeverity.INFO,
      message: `User logged in successfully: ${userEmail}`,
      userId,
      userEmail,
      organizationId,
      ipAddress,
      userAgent,
      fingerprint,
    });
  }

  /**
   * Log authentication failure
   */
  async logLoginFailure(
    email: string,
    reason: string,
    ipAddress?: string,
    userAgent?: string,
    fingerprint?: string,
  ) {
    return this.log({
      eventType: AuditEventType.LOGIN_FAILURE,
      severity: AuditSeverity.WARNING,
      message: `Failed login attempt for ${email}: ${reason}`,
      userEmail: email,
      ipAddress,
      userAgent,
      fingerprint,
      metadata: { reason },
    });
  }

  /**
   * Log logout
   */
  async logLogout(
    userEmail: string,
    userId?: number,
    organizationId?: number,
    ipAddress?: string,
  ) {
    return this.log({
      eventType: AuditEventType.LOGOUT,
      severity: AuditSeverity.INFO,
      message: `User logged out: ${userEmail}`,
      userId,
      userEmail,
      organizationId,
      ipAddress,
    });
  }

  /**
   * Log registration success
   */
  async logRegistrationSuccess(
    organizationName: string,
    adminEmail: string,
    organizationId: number,
    ipAddress?: string,
  ) {
    return this.log({
      eventType: AuditEventType.REGISTRATION_SUCCESS,
      severity: AuditSeverity.INFO,
      message: `New organization registered: ${organizationName}`,
      userEmail: adminEmail,
      organizationId,
      ipAddress,
      metadata: { organizationName },
    });
  }

  /**
   * Log registration failure
   */
  async logRegistrationFailure(
    email: string,
    reason: string,
    ipAddress?: string,
  ) {
    return this.log({
      eventType: AuditEventType.REGISTRATION_FAILURE,
      severity: AuditSeverity.WARNING,
      message: `Failed registration attempt: ${reason}`,
      userEmail: email,
      ipAddress,
      metadata: { reason },
    });
  }

  /**
   * Log suspicious activity
   */
  async logSuspiciousActivity(
    description: string,
    severity: AuditSeverity,
    metadata?: Record<string, unknown>,
    userEmail?: string,
    ipAddress?: string,
  ) {
    return this.log({
      eventType: AuditEventType.SUSPICIOUS_ACTIVITY,
      severity,
      message: description,
      userEmail,
      ipAddress,
      metadata,
    });
  }

  /**
   * Get audit logs with filters
   */
  async findAll(filters?: {
    eventType?: string;
    severity?: string;
    userId?: number;
    organizationId?: number;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }) {
    const where: {
      eventType?: string;
      severity?: string;
      userId?: number;
      organizationId?: number;
      timestamp?: { gte?: Date; lte?: Date };
    } = {};

    if (filters?.eventType) where.eventType = filters.eventType;
    if (filters?.severity) where.severity = filters.severity;
    if (filters?.userId) where.userId = filters.userId;
    if (filters?.organizationId) where.organizationId = filters.organizationId;

    if (filters?.startDate || filters?.endDate) {
      where.timestamp = {};
      if (filters.startDate) where.timestamp.gte = filters.startDate;
      if (filters.endDate) where.timestamp.lte = filters.endDate;
    }

    return this.prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: filters?.limit || 100,
      skip: filters?.offset || 0,
    });
  }

  /**
   * Get audit log statistics
   */
  async getStatistics(organizationId?: number) {
    const where = organizationId ? { organizationId } : {};

    const [
      total,
      byEventType,
      bySeverity,
      recentCritical,
    ] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.groupBy({
        by: ['eventType'],
        where,
        _count: true,
      }),
      this.prisma.auditLog.groupBy({
        by: ['severity'],
        where,
        _count: true,
      }),
      this.prisma.auditLog.findMany({
        where: { ...where, severity: AuditSeverity.CRITICAL },
        orderBy: { timestamp: 'desc' },
        take: 10,
      }),
    ]);

    return {
      total,
      byEventType: byEventType.reduce((acc, item) => {
        acc[item.eventType] = item._count;
        return acc;
      }, {} as Record<string, number>),
      bySeverity: bySeverity.reduce((acc, item) => {
        acc[item.severity] = item._count;
        return acc;
      }, {} as Record<string, number>),
      recentCritical,
    };
  }

  /**
   * Delete old audit logs (cleanup job)
   * Keeps logs for specified number of days
   */
  async cleanupOldLogs(daysToKeep: number = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.prisma.auditLog.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
      },
    });

    console.log(`Deleted ${result.count} audit logs older than ${daysToKeep} days`);
    return result;
  }
}
