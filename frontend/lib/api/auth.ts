import apiClient, { setAuthToken, removeAuthToken } from './client';
import { secureStorage } from '../secureStorage';
import { regenerateCsrfToken, clearCsrfToken } from '../csrf';
import { logAuditEvent, AuditEventType, AuditSeverity } from '../auditLogger';
import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, User } from './types';

export const authApi = {
  /**
   * Login with email and password
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);

    // Store token and user data encrypted in sessionStorage
    if (response.data.access_token) {
      await setAuthToken(response.data.access_token);
      if (typeof window !== 'undefined') {
        await secureStorage.setItem('user', JSON.stringify(response.data.user));
        // Regenerate CSRF token for new session
        regenerateCsrfToken();
      }
    }

    return response.data;
  },

  /**
   * Register a new organization
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await apiClient.post<RegisterResponse>('/auth/register', data);
    return response.data;
  },

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    // Get user email before logout
    const user = await this.getCurrentUser();

    try {
      await apiClient.post('/auth/logout');
    } finally {
      // Log logout event
      logAuditEvent(
        AuditEventType.LOGOUT,
        AuditSeverity.INFO,
        `User logged out`,
        { email: user?.email }
      );

      await removeAuthToken();
      clearCsrfToken();
    }
  },

  /**
   * Get current user from secure storage
   */
  async getCurrentUser(): Promise<User | null> {
    if (typeof window !== 'undefined') {
      const userStr = await secureStorage.getItem('user');
      if (userStr) {
        try {
          return JSON.parse(userStr) as User;
        } catch {
          return null;
        }
      }
    }
    return null;
  },

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    if (typeof window !== 'undefined') {
      const token = await secureStorage.getItem('access_token');
      return !!token;
    }
    return false;
  },
};
