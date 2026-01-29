/**
 * API Request/Response Logger
 * Logs all API calls for debugging and audit purposes
 */

import { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { logAuditEvent, AuditEventType, AuditSeverity } from './auditLogger';

interface ApiLogEntry {
  id: string;
  timestamp: number;
  method: string;
  url: string;
  requestHeaders?: Record<string, any>;
  requestBody?: any;
  responseStatus?: number;
  responseData?: any;
  responseHeaders?: Record<string, any>;
  duration?: number;
  error?: string;
}

const API_LOG_KEY = 'api_request_logs';
const MAX_API_LOGS = 50; // Keep last 50 API requests

/**
 * Sanitize sensitive data from logs
 */
function sanitizeData(data: any): any {
  if (!data) return data;

  const sensitiveKeys = ['password', 'token', 'access_token', 'authorization', 'api_key', 'secret'];

  if (typeof data === 'object' && !Array.isArray(data)) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
        sanitized[key] = '***REDACTED***';
      } else if (typeof value === 'object') {
        sanitized[key] = sanitizeData(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  return data;
}

/**
 * Get API logs from sessionStorage
 */
function getApiLogs(): ApiLogEntry[] {
  if (typeof window === 'undefined') return [];

  const logsStr = sessionStorage.getItem(API_LOG_KEY);
  if (!logsStr) return [];

  try {
    return JSON.parse(logsStr);
  } catch {
    return [];
  }
}

/**
 * Save API logs to sessionStorage
 */
function saveApiLogs(logs: ApiLogEntry[]): void {
  if (typeof window === 'undefined') return;

  const trimmedLogs = logs.slice(-MAX_API_LOGS);
  sessionStorage.setItem(API_LOG_KEY, JSON.stringify(trimmedLogs));
}

/**
 * Log API request
 */
export function logApiRequest(config: AxiosRequestConfig): string {
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  const logEntry: ApiLogEntry = {
    id: requestId,
    timestamp: Date.now(),
    method: (config.method || 'GET').toUpperCase(),
    url: config.url || '',
    requestHeaders: sanitizeData(config.headers),
    requestBody: sanitizeData(config.data),
  };

  const logs = getApiLogs();
  logs.push(logEntry);
  saveApiLogs(logs);

  // Log to audit trail
  logAuditEvent(
    AuditEventType.API_REQUEST,
    AuditSeverity.INFO,
    `API Request: ${logEntry.method} ${logEntry.url}`,
    { requestId, method: logEntry.method, url: logEntry.url }
  );

  // Store requestId in config for correlation
  (config as any)._requestId = requestId;

  return requestId;
}

/**
 * Log API response
 */
export function logApiResponse(response: AxiosResponse): void {
  const requestId = (response.config as any)._requestId;
  if (!requestId) return;

  const logs = getApiLogs();
  const logIndex = logs.findIndex((log) => log.id === requestId);

  if (logIndex !== -1) {
    const duration = Date.now() - logs[logIndex].timestamp;

    logs[logIndex] = {
      ...logs[logIndex],
      responseStatus: response.status,
      responseData: sanitizeData(response.data),
      responseHeaders: sanitizeData(response.headers),
      duration,
    };

    saveApiLogs(logs);

    // Log to audit trail
    logAuditEvent(
      AuditEventType.API_RESPONSE,
      AuditSeverity.INFO,
      `API Response: ${response.status} ${logs[logIndex].method} ${logs[logIndex].url} (${duration}ms)`,
      {
        requestId,
        status: response.status,
        duration,
      }
    );
  }
}

/**
 * Log API error
 */
export function logApiError(error: AxiosError): void {
  const requestId = (error.config as any)?._requestId;

  const errorMessage = error.response?.data
    ? JSON.stringify(error.response.data)
    : error.message;

  if (requestId) {
    const logs = getApiLogs();
    const logIndex = logs.findIndex((log) => log.id === requestId);

    if (logIndex !== -1) {
      const duration = Date.now() - logs[logIndex].timestamp;

      logs[logIndex] = {
        ...logs[logIndex],
        responseStatus: error.response?.status,
        responseData: sanitizeData(error.response?.data),
        duration,
        error: errorMessage,
      };

      saveApiLogs(logs);
    }
  }

  // Log to audit trail
  logAuditEvent(
    AuditEventType.API_ERROR,
    error.response?.status === 401 || error.response?.status === 403
      ? AuditSeverity.WARNING
      : AuditSeverity.ERROR,
    `API Error: ${error.message}`,
    {
      requestId,
      status: error.response?.status,
      error: errorMessage,
      url: error.config?.url,
      method: error.config?.method,
    }
  );
}

/**
 * Get all API logs
 */
export function getAllApiLogs(): ApiLogEntry[] {
  return getApiLogs();
}

/**
 * Get failed API requests
 */
export function getFailedApiRequests(): ApiLogEntry[] {
  return getApiLogs().filter(
    (log) => log.error || (log.responseStatus && log.responseStatus >= 400)
  );
}

/**
 * Clear API logs
 */
export function clearApiLogs(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(API_LOG_KEY);
}

/**
 * Export API logs as JSON
 */
export function exportApiLogs(): string {
  return JSON.stringify(getApiLogs(), null, 2);
}

/**
 * Get API performance statistics
 */
export function getApiPerformanceStats(): {
  totalRequests: number;
  averageDuration: number;
  successRate: number;
  failedRequests: number;
} {
  const logs = getApiLogs();
  const completedRequests = logs.filter((log) => log.duration !== undefined);

  const totalRequests = logs.length;
  const failedRequests = logs.filter(
    (log) => log.error || (log.responseStatus && log.responseStatus >= 400)
  ).length;

  const averageDuration =
    completedRequests.length > 0
      ? completedRequests.reduce((sum, log) => sum + (log.duration || 0), 0) /
        completedRequests.length
      : 0;

  const successRate =
    totalRequests > 0 ? ((totalRequests - failedRequests) / totalRequests) * 100 : 0;

  return {
    totalRequests,
    averageDuration: Math.round(averageDuration),
    successRate: Math.round(successRate * 100) / 100,
    failedRequests,
  };
}
