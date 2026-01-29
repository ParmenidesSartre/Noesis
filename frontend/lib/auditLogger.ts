/**
 * Audit logging for security-relevant events
 * Logs are stored in sessionStorage and can be sent to backend
 */

export enum AuditEventType {
  // Authentication events
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  LOGOUT = 'LOGOUT',
  SESSION_TIMEOUT = 'SESSION_TIMEOUT',

  // Registration events
  REGISTRATION_SUCCESS = 'REGISTRATION_SUCCESS',
  REGISTRATION_FAILURE = 'REGISTRATION_FAILURE',

  // Security events
  RATE_LIMIT_TRIGGERED = 'RATE_LIMIT_TRIGGERED',
  CSRF_TOKEN_GENERATED = 'CSRF_TOKEN_GENERATED',
  ENCRYPTION_KEY_GENERATED = 'ENCRYPTION_KEY_GENERATED',

  // API events
  API_REQUEST = 'API_REQUEST',
  API_RESPONSE = 'API_RESPONSE',
  API_ERROR = 'API_ERROR',

  // Suspicious activity
  SUSPICIOUS_LOGIN_ATTEMPT = 'SUSPICIOUS_LOGIN_ATTEMPT',
  DEVICE_CHANGE_DETECTED = 'DEVICE_CHANGE_DETECTED',
}

export enum AuditSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

export interface AuditLogEntry {
  id: string;
  timestamp: number;
  eventType: AuditEventType;
  severity: AuditSeverity;
  message: string;
  metadata?: Record<string, any>;
  userEmail?: string;
  fingerprint?: string;
  ipAddress?: string;
}

const AUDIT_LOG_KEY = 'audit_logs';
const MAX_LOG_ENTRIES = 100; // Keep last 100 entries in sessionStorage

/**
 * Generate unique ID for log entry
 */
function generateLogId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Get audit logs from sessionStorage
 */
function getLogs(): AuditLogEntry[] {
  if (typeof window === 'undefined') return [];

  const logsStr = sessionStorage.getItem(AUDIT_LOG_KEY);
  if (!logsStr) return [];

  try {
    return JSON.parse(logsStr);
  } catch {
    return [];
  }
}

/**
 * Save audit logs to sessionStorage
 */
function saveLogs(logs: AuditLogEntry[]): void {
  if (typeof window === 'undefined') return;

  // Keep only last MAX_LOG_ENTRIES
  const trimmedLogs = logs.slice(-MAX_LOG_ENTRIES);
  sessionStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(trimmedLogs));
}

/**
 * Log an audit event
 */
export function logAuditEvent(
  eventType: AuditEventType,
  severity: AuditSeverity,
  message: string,
  metadata?: Record<string, any>
): void {
  if (typeof window === 'undefined') return;

  const entry: AuditLogEntry = {
    id: generateLogId(),
    timestamp: Date.now(),
    eventType,
    severity,
    message,
    metadata,
  };

  // Add to logs
  const logs = getLogs();
  logs.push(entry);
  saveLogs(logs);

  // Also log to console in development
  if (process.env.NODE_ENV === 'development') {
    const color =
      severity === AuditSeverity.CRITICAL ? 'color: red; font-weight: bold;' :
      severity === AuditSeverity.ERROR ? 'color: red;' :
      severity === AuditSeverity.WARNING ? 'color: orange;' :
      'color: blue;';

    console.log(
      `%c[AUDIT] ${eventType}`,
      color,
      message,
      metadata || ''
    );
  }
}

/**
 * Get all audit logs
 */
export function getAuditLogs(): AuditLogEntry[] {
  return getLogs();
}

/**
 * Get audit logs by event type
 */
export function getAuditLogsByType(eventType: AuditEventType): AuditLogEntry[] {
  return getLogs().filter((log) => log.eventType === eventType);
}

/**
 * Get audit logs by severity
 */
export function getAuditLogsBySeverity(severity: AuditSeverity): AuditLogEntry[] {
  return getLogs().filter((log) => log.severity === severity);
}

/**
 * Get audit logs in time range
 */
export function getAuditLogsInRange(startTime: number, endTime: number): AuditLogEntry[] {
  return getLogs().filter(
    (log) => log.timestamp >= startTime && log.timestamp <= endTime
  );
}

/**
 * Clear all audit logs
 */
export function clearAuditLogs(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(AUDIT_LOG_KEY);
}

/**
 * Export audit logs as JSON
 */
export function exportAuditLogs(): string {
  return JSON.stringify(getLogs(), null, 2);
}

/**
 * Get audit log statistics
 */
export function getAuditLogStats(): {
  total: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
} {
  const logs = getLogs();

  const byType: Record<string, number> = {};
  const bySeverity: Record<string, number> = {};

  logs.forEach((log) => {
    byType[log.eventType] = (byType[log.eventType] || 0) + 1;
    bySeverity[log.severity] = (bySeverity[log.severity] || 0) + 1;
  });

  return {
    total: logs.length,
    byType,
    bySeverity,
  };
}
