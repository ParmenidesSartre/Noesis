/**
 * Failed login attempt tracking per user email
 * Tracks login failures across sessions (persists in localStorage)
 * Different from rate limiting - this tracks per email, not per session
 */

import { logAuditEvent, AuditEventType, AuditSeverity } from './auditLogger';

interface FailedAttempt {
  email: string;
  timestamp: number;
  fingerprint?: string;
}

interface UserAttemptRecord {
  email: string;
  attempts: FailedAttempt[];
  lockedUntil: number;
  totalFailures: number;
}

const FAILED_ATTEMPTS_KEY = 'failed_login_attempts';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30 * 60 * 1000; // 30 minutes
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Get all failed login records
 */
function getAllRecords(): Record<string, UserAttemptRecord> {
  if (typeof window === 'undefined') return {};

  const recordsStr = localStorage.getItem(FAILED_ATTEMPTS_KEY);
  if (!recordsStr) return {};

  try {
    return JSON.parse(recordsStr);
  } catch {
    return {};
  }
}

/**
 * Save failed login records
 */
function saveRecords(records: Record<string, UserAttemptRecord>): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(FAILED_ATTEMPTS_KEY, JSON.stringify(records));
}

/**
 * Get record for specific email
 */
function getRecordForEmail(email: string): UserAttemptRecord {
  const records = getAllRecords();
  return (
    records[email.toLowerCase()] || {
      email: email.toLowerCase(),
      attempts: [],
      lockedUntil: 0,
      totalFailures: 0,
    }
  );
}

/**
 * Clean old attempts outside the time window
 */
function cleanOldAttempts(record: UserAttemptRecord): UserAttemptRecord {
  const now = Date.now();
  const cutoff = now - ATTEMPT_WINDOW_MS;

  return {
    ...record,
    attempts: record.attempts.filter((attempt) => attempt.timestamp > cutoff),
  };
}

/**
 * Check if user is locked out
 */
export function isUserLockedOut(email: string): {
  locked: boolean;
  remainingTime?: number;
  message?: string;
} {
  if (!email) return { locked: false };

  const record = getRecordForEmail(email);
  const now = Date.now();

  // Check if currently locked
  if (record.lockedUntil > now) {
    const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return {
      locked: true,
      remainingTime: remainingSeconds,
      message: `Account temporarily locked due to multiple failed login attempts. Please try again in ${Math.ceil(remainingSeconds / 60)} minutes.`,
    };
  }

  return { locked: false };
}

/**
 * Record a failed login attempt
 */
export function recordFailedLogin(email: string, fingerprint?: string): void {
  if (!email) return;

  const records = getAllRecords();
  let record = getRecordForEmail(email);

  // Clean old attempts
  record = cleanOldAttempts(record);

  // Add new attempt
  const newAttempt: FailedAttempt = {
    email: email.toLowerCase(),
    timestamp: Date.now(),
    fingerprint,
  };

  record.attempts.push(newAttempt);
  record.totalFailures++;

  // Check if should lock account
  if (record.attempts.length >= MAX_ATTEMPTS) {
    record.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;

    // Log suspicious activity
    logAuditEvent(
      AuditEventType.SUSPICIOUS_LOGIN_ATTEMPT,
      AuditSeverity.WARNING,
      `Account locked after ${MAX_ATTEMPTS} failed login attempts`,
      {
        email: email.toLowerCase(),
        attemptCount: record.attempts.length,
        totalFailures: record.totalFailures,
        lockoutDuration: LOCKOUT_DURATION_MS / 1000 / 60, // minutes
      }
    );
  }

  // Save updated record
  records[email.toLowerCase()] = record;
  saveRecords(records);
}

/**
 * Clear failed attempts for user (after successful login)
 */
export function clearFailedAttempts(email: string): void {
  if (!email) return;

  const records = getAllRecords();
  const emailLower = email.toLowerCase();

  if (records[emailLower]) {
    // Keep totalFailures for statistics, but clear attempts and lockout
    records[emailLower] = {
      ...records[emailLower],
      attempts: [],
      lockedUntil: 0,
    };
    saveRecords(records);
  }
}

/**
 * Get failed attempt statistics for email
 */
export function getFailedAttemptStats(email: string): {
  recentAttempts: number;
  totalFailures: number;
  isLocked: boolean;
  lockoutRemaining?: number;
} {
  if (!email) {
    return {
      recentAttempts: 0,
      totalFailures: 0,
      isLocked: false,
    };
  }

  const record = cleanOldAttempts(getRecordForEmail(email));
  const lockStatus = isUserLockedOut(email);

  return {
    recentAttempts: record.attempts.length,
    totalFailures: record.totalFailures,
    isLocked: lockStatus.locked,
    lockoutRemaining: lockStatus.remainingTime,
  };
}

/**
 * Detect if attempts are coming from different devices (suspicious)
 */
export function detectSuspiciousPattern(email: string): {
  suspicious: boolean;
  reason?: string;
} {
  if (!email) return { suspicious: false };

  const record = cleanOldAttempts(getRecordForEmail(email));

  // Check if attempts from multiple fingerprints
  const fingerprints = record.attempts
    .map((a) => a.fingerprint)
    .filter((f) => f !== undefined);

  const uniqueFingerprints = new Set(fingerprints);

  if (uniqueFingerprints.size > 1) {
    return {
      suspicious: true,
      reason: `Login attempts from ${uniqueFingerprints.size} different devices`,
    };
  }

  // Check if rapid successive attempts (less than 5 seconds apart)
  for (let i = 1; i < record.attempts.length; i++) {
    const timeDiff = record.attempts[i].timestamp - record.attempts[i - 1].timestamp;
    if (timeDiff < 5000) {
      // Less than 5 seconds
      return {
        suspicious: true,
        reason: 'Rapid successive login attempts (possible bot)',
      };
    }
  }

  return { suspicious: false };
}

/**
 * Get all locked accounts
 */
export function getLockedAccounts(): string[] {
  const records = getAllRecords();
  const now = Date.now();

  return Object.values(records)
    .filter((record) => record.lockedUntil > now)
    .map((record) => record.email);
}

/**
 * Clear all failed login data (admin function)
 */
export function clearAllFailedLogins(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(FAILED_ATTEMPTS_KEY);
}
