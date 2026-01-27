import apiClient, { setAuthToken, removeAuthToken } from './client';
import { LoginRequest, LoginResponse, RegisterRequest, User } from './types';

export const authApi = {
  /**
   * Login with email and password
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);

    // Store token and user data
    if (response.data.access_token) {
      setAuthToken(response.data.access_token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    }

    return response.data;
  },

  /**
   * Register a new organization
   */
  async register(data: RegisterRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/register', data);

    // Store token and user data
    if (response.data.access_token) {
      setAuthToken(response.data.access_token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    }

    return response.data;
  },

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      removeAuthToken();
    }
  },

  /**
   * Get current user from local storage
   */
  getCurrentUser(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
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
  isAuthenticated(): boolean {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('access_token');
    }
    return false;
  },
};
