/**
 * React hook for session timeout management
 */

import { useEffect, useState, useCallback } from 'react';
import { startSessionTimeout, stopSessionTimeout, resetSessionTimeout } from '../sessionTimeout';

interface UseSessionTimeoutOptions {
  onTimeout: () => void;
  enabled?: boolean;
}

interface UseSessionTimeoutResult {
  isWarning: boolean;
  remainingSeconds: number;
  dismissWarning: () => void;
}

export function useSessionTimeout({
  onTimeout,
  enabled = true,
}: UseSessionTimeoutOptions): UseSessionTimeoutResult {
  const [isWarning, setIsWarning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const handleWarning = useCallback((seconds: number) => {
    setIsWarning(true);
    setRemainingSeconds(seconds);
  }, []);

  const handleTimeout = useCallback(() => {
    setIsWarning(false);
    setRemainingSeconds(0);
    onTimeout();
  }, [onTimeout]);

  const dismissWarning = useCallback(() => {
    setIsWarning(false);
    setRemainingSeconds(0);
    resetSessionTimeout();
  }, []);

  useEffect(() => {
    if (!enabled) return;

    startSessionTimeout(handleTimeout, handleWarning);

    return () => {
      stopSessionTimeout();
    };
  }, [enabled, handleTimeout, handleWarning]);

  return {
    isWarning,
    remainingSeconds,
    dismissWarning,
  };
}
