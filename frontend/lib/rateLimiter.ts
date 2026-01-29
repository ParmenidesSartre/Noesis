/**
 * Client-side rate limiting for forms
 * Prevents spam and brute force attempts with exponential backoff
 */

import { unsecureStorage } from './secureStorage';

interface RateLimitState {
  attempts: number;
  lastAttempt: number;
  blockedUntil: number;
}

const RATE_LIMIT_PREFIX = 'rl_';

// Rate limit configuration
const LIMITS = {
  login: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    baseBlockMs: 30 * 1000, // 30 seconds
  },
  register: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    baseBlockMs: 60 * 1000, // 1 minute
  },
  default: {
    maxAttempts: 10,
    windowMs: 60 * 1000, // 1 minute
    baseBlockMs: 5 * 1000, // 5 seconds
  },
};

type RateLimitKey = keyof typeof LIMITS;

/**
 * Get rate limit state for a specific key
 */
function getState(key: string): RateLimitState {
  const stateStr = unsecureStorage.getItem(`${RATE_LIMIT_PREFIX}${key}`);
  if (stateStr) {
    try {
      return JSON.parse(stateStr);
    } catch {
      return { attempts: 0, lastAttempt: 0, blockedUntil: 0 };
    }
  }
  return { attempts: 0, lastAttempt: 0, blockedUntil: 0 };
}

/**
 * Save rate limit state
 */
function setState(key: string, state: RateLimitState): void {
  unsecureStorage.setItem(`${RATE_LIMIT_PREFIX}${key}`, JSON.stringify(state));
}

/**
 * Calculate exponential backoff duration
 */
function calculateBackoff(attempts: number, baseBlockMs: number): number {
  // Exponential backoff: baseBlock * 2^(attempts - maxAttempts)
  const exponent = Math.max(0, attempts - 1);
  return baseBlockMs * Math.pow(2, exponent);
}

/**
 * Check if request is allowed
 */
export function isRateLimited(
  key: RateLimitKey | string
): { allowed: boolean; retryAfter?: number; message?: string } {
  if (typeof window === 'undefined') {
    return { allowed: true };
  }

  const config = LIMITS[key as RateLimitKey] || LIMITS.default;
  const state = getState(key);
  const now = Date.now();

  // Check if currently blocked
  if (state.blockedUntil > now) {
    const retryAfter = Math.ceil((state.blockedUntil - now) / 1000);
    return {
      allowed: false,
      retryAfter,
      message: `Too many attempts. Please wait ${retryAfter} seconds before trying again.`,
    };
  }

  // Reset if outside time window
  if (now - state.lastAttempt > config.windowMs) {
    setState(key, { attempts: 0, lastAttempt: 0, blockedUntil: 0 });
    return { allowed: true };
  }

  // Check if exceeded max attempts
  if (state.attempts >= config.maxAttempts) {
    const blockDuration = calculateBackoff(state.attempts - config.maxAttempts + 1, config.baseBlockMs);
    const blockedUntil = now + blockDuration;
    const retryAfter = Math.ceil(blockDuration / 1000);

    setState(key, {
      ...state,
      blockedUntil,
    });

    return {
      allowed: false,
      retryAfter,
      message: `Too many attempts. Please wait ${retryAfter} seconds before trying again.`,
    };
  }

  return { allowed: true };
}

/**
 * Record a failed attempt
 */
export function recordAttempt(key: RateLimitKey | string, success: boolean = false): void {
  if (typeof window === 'undefined') return;

  const state = getState(key);
  const now = Date.now();
  const config = LIMITS[key as RateLimitKey] || LIMITS.default;

  if (success) {
    // Clear attempts on success
    setState(key, { attempts: 0, lastAttempt: now, blockedUntil: 0 });
  } else {
    // Increment attempts on failure
    const newAttempts = state.attempts + 1;

    // Calculate block duration if exceeded max attempts
    let blockedUntil = 0;
    if (newAttempts >= config.maxAttempts) {
      const blockDuration = calculateBackoff(newAttempts - config.maxAttempts + 1, config.baseBlockMs);
      blockedUntil = now + blockDuration;
    }

    setState(key, {
      attempts: newAttempts,
      lastAttempt: now,
      blockedUntil,
    });
  }
}

/**
 * Clear rate limit for a key (e.g., after successful login)
 */
export function clearRateLimit(key: RateLimitKey | string): void {
  if (typeof window === 'undefined') return;
  unsecureStorage.removeItem(`${RATE_LIMIT_PREFIX}${key}`);
}

/**
 * Get remaining attempts before rate limit
 */
export function getRemainingAttempts(key: RateLimitKey | string): number {
  if (typeof window === 'undefined') return 0;

  const config = LIMITS[key as RateLimitKey] || LIMITS.default;
  const state = getState(key);
  const now = Date.now();

  // If outside time window, full attempts available
  if (now - state.lastAttempt > config.windowMs) {
    return config.maxAttempts;
  }

  return Math.max(0, config.maxAttempts - state.attempts);
}

/**
 * Format time remaining for user display
 */
export function formatRetryAfter(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  }
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
}
