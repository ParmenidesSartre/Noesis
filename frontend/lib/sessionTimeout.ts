/**
 * Session timeout management
 * Automatically logs out users after a period of inactivity
 */

export const SESSION_CONFIG = {
  // Inactivity timeout: 30 minutes
  TIMEOUT_MS: 30 * 60 * 1000,
  // Warning before timeout: 2 minutes
  WARNING_MS: 2 * 60 * 1000,
};

type TimeoutCallback = () => void;
type WarningCallback = (remainingSeconds: number) => void;

let timeoutId: NodeJS.Timeout | null = null;
let warningTimeoutId: NodeJS.Timeout | null = null;
let warningIntervalId: NodeJS.Timeout | null = null;
let lastActivity: number = Date.now();
let onTimeout: TimeoutCallback | null = null;
let onWarning: WarningCallback | null = null;

/**
 * Activity events to monitor
 */
const ACTIVITY_EVENTS = [
  'mousedown',
  'mousemove',
  'keydown',
  'scroll',
  'touchstart',
  'click',
];

/**
 * Update last activity timestamp
 */
function updateActivity(): void {
  lastActivity = Date.now();
  resetTimers();
}

/**
 * Clear all timers
 */
function clearTimers(): void {
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }
  if (warningTimeoutId) {
    clearTimeout(warningTimeoutId);
    warningTimeoutId = null;
  }
  if (warningIntervalId) {
    clearInterval(warningIntervalId);
    warningIntervalId = null;
  }
}

/**
 * Reset inactivity timers
 */
function resetTimers(): void {
  clearTimers();

  // Set warning timer (timeout - warning duration)
  const warningTime = SESSION_CONFIG.TIMEOUT_MS - SESSION_CONFIG.WARNING_MS;
  warningTimeoutId = setTimeout(() => {
    if (onWarning) {
      // Calculate remaining seconds
      let remainingSeconds = Math.floor(SESSION_CONFIG.WARNING_MS / 1000);
      onWarning(remainingSeconds);

      // Update countdown every second
      warningIntervalId = setInterval(() => {
        remainingSeconds--;
        if (remainingSeconds <= 0) {
          if (warningIntervalId) {
            clearInterval(warningIntervalId);
            warningIntervalId = null;
          }
        } else if (onWarning) {
          onWarning(remainingSeconds);
        }
      }, 1000);
    }
  }, warningTime);

  // Set logout timer
  timeoutId = setTimeout(() => {
    if (onTimeout) {
      onTimeout();
    }
  }, SESSION_CONFIG.TIMEOUT_MS);
}

/**
 * Start session timeout monitoring
 */
export function startSessionTimeout(
  timeoutCallback: TimeoutCallback,
  warningCallback?: WarningCallback
): void {
  if (typeof window === 'undefined') return;

  onTimeout = timeoutCallback;
  onWarning = warningCallback || null;

  // Set up activity listeners
  ACTIVITY_EVENTS.forEach((event) => {
    window.addEventListener(event, updateActivity, { passive: true });
  });

  // Start timers
  resetTimers();
}

/**
 * Stop session timeout monitoring
 */
export function stopSessionTimeout(): void {
  if (typeof window === 'undefined') return;

  // Remove activity listeners
  ACTIVITY_EVENTS.forEach((event) => {
    window.removeEventListener(event, updateActivity);
  });

  // Clear all timers
  clearTimers();

  onTimeout = null;
  onWarning = null;
}

/**
 * Reset session timeout (useful after user interaction)
 */
export function resetSessionTimeout(): void {
  updateActivity();
}

/**
 * Get time since last activity in milliseconds
 */
export function getInactiveTime(): number {
  return Date.now() - lastActivity;
}

/**
 * Check if session is about to timeout
 */
export function isSessionExpiring(): boolean {
  const inactiveTime = getInactiveTime();
  return inactiveTime >= SESSION_CONFIG.TIMEOUT_MS - SESSION_CONFIG.WARNING_MS;
}
