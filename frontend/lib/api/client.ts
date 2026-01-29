import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { secureStorage } from '../secureStorage';
import { getCsrfToken, getCsrfHeaderName } from '../csrf';
import { logApiRequest, logApiResponse, logApiError } from '../apiLogger';

// API base URL with version prefix
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_VERSION = '/api/v1';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}${API_VERSION}`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor to add auth token and CSRF protection
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      // Log API request for audit trail
      logApiRequest(config);

      if (config.headers) {
        // Add auth token from secure sessionStorage
        const token = await secureStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add CSRF token for state-changing requests
        const method = config.method?.toUpperCase();
        if (method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
          const csrfToken = getCsrfToken();
          config.headers[getCsrfHeaderName()] = csrfToken;
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    // Log successful API response
    if (typeof window !== 'undefined') {
      logApiResponse(response);
    }
    return response;
  },
  async (error: AxiosError) => {
    // Log API error
    if (typeof window !== 'undefined') {
      logApiError(error);
    }

    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        await removeAuthToken();
        window.location.href = '/login';
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response.data);
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
    }

    return Promise.reject(error);
  }
);

// Token management utilities (async due to encryption)
export const setAuthToken = async (token: string): Promise<void> => {
  if (typeof window !== 'undefined') {
    await secureStorage.setItem('access_token', token);
  }
};

export const removeAuthToken = async (): Promise<void> => {
  if (typeof window !== 'undefined') {
    secureStorage.removeItem('access_token');
    secureStorage.removeItem('user');
  }
};

export const getAuthToken = async (): Promise<string | null> => {
  if (typeof window !== 'undefined') {
    return await secureStorage.getItem('access_token');
  }
  return null;
};

export default apiClient;
