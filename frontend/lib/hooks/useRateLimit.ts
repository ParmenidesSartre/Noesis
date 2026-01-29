/**
 * React hook for rate limiting form submissions
 */

import { useState, useCallback } from 'react';
import { isRateLimited, recordAttempt, clearRateLimit, getRemainingAttempts } from '../rateLimiter';

interface UseRateLimitResult {
  isBlocked: boolean;
  retryAfter: number | undefined;
  rateLimitMessage: string | undefined;
  remainingAttempts: number;
  checkRateLimit: () => boolean;
  recordSuccess: () => void;
  recordFailure: () => void;
  reset: () => void;
}

export function useRateLimit(key: string): UseRateLimitResult {
  const [isBlocked, setIsBlocked] = useState(false);
  const [retryAfter, setRetryAfter] = useState<number | undefined>(undefined);
  const [rateLimitMessage, setRateLimitMessage] = useState<string | undefined>(undefined);
  const [remainingAttempts, setRemainingAttempts] = useState(getRemainingAttempts(key));

  /**
   * Check if the action is rate limited
   * Returns true if allowed, false if blocked
   */
  const checkRateLimit = useCallback((): boolean => {
    const result = isRateLimited(key);

    if (!result.allowed) {
      setIsBlocked(true);
      setRetryAfter(result.retryAfter);
      setRateLimitMessage(result.message);
      return false;
    }

    setIsBlocked(false);
    setRetryAfter(undefined);
    setRateLimitMessage(undefined);
    setRemainingAttempts(getRemainingAttempts(key));
    return true;
  }, [key]);

  /**
   * Record a successful attempt (clears rate limit)
   */
  const recordSuccess = useCallback(() => {
    recordAttempt(key, true);
    setIsBlocked(false);
    setRetryAfter(undefined);
    setRateLimitMessage(undefined);
    setRemainingAttempts(getRemainingAttempts(key));
  }, [key]);

  /**
   * Record a failed attempt
   */
  const recordFailure = useCallback(() => {
    recordAttempt(key, false);
    setRemainingAttempts(getRemainingAttempts(key));
  }, [key]);

  /**
   * Reset rate limit for this key
   */
  const reset = useCallback(() => {
    clearRateLimit(key);
    setIsBlocked(false);
    setRetryAfter(undefined);
    setRateLimitMessage(undefined);
    setRemainingAttempts(getRemainingAttempts(key));
  }, [key]);

  return {
    isBlocked,
    retryAfter,
    rateLimitMessage,
    remainingAttempts,
    checkRateLimit,
    recordSuccess,
    recordFailure,
    reset,
  };
}
