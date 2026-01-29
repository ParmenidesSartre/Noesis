/**
 * CSRF (Cross-Site Request Forgery) Protection
 * Generates and manages CSRF tokens for state-changing requests
 */

import { unsecureStorage } from './secureStorage';

const CSRF_TOKEN_KEY = 'csrf_token';
const CSRF_HEADER_NAME = 'X-CSRF-Token';

/**
 * Generate a cryptographically secure random token
 */
function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Get or create CSRF token for current session
 * Token is stored in sessionStorage and regenerated on each session
 */
export function getCsrfToken(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  let token = unsecureStorage.getItem(CSRF_TOKEN_KEY);

  if (!token) {
    token = generateToken();
    unsecureStorage.setItem(CSRF_TOKEN_KEY, token);
  }

  return token;
}

/**
 * Regenerate CSRF token (call this after login)
 */
export function regenerateCsrfToken(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  const token = generateToken();
  unsecureStorage.setItem(CSRF_TOKEN_KEY, token);
  return token;
}

/**
 * Clear CSRF token (call this on logout)
 */
export function clearCsrfToken(): void {
  if (typeof window === 'undefined') {
    return;
  }

  unsecureStorage.removeItem(CSRF_TOKEN_KEY);
}

/**
 * Get the CSRF header name for API requests
 */
export function getCsrfHeaderName(): string {
  return CSRF_HEADER_NAME;
}

/**
 * Validate that a token exists and is valid format
 */
export function isValidCsrfToken(token: string): boolean {
  return /^[a-f0-9]{64}$/.test(token);
}
