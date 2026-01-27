import apiClient from './client';
import { User, Teacher, Role } from './types';

export interface CreateTeacherDto {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  branchId: number;
  employeeId?: string;
  primarySubjects?: string[];
  secondarySubjects?: string[];
  gradeLevels?: string[];
  qualifications?: string;
  experience?: number;
}

export interface UpdateTeacherProfileDto {
  phone?: string;
  address?: string;
  primarySubjects?: string[];
  secondarySubjects?: string[];
  gradeLevels?: string[];
  languagesSpoken?: string[];
  highestQualification?: string;
  degreeName?: string;
  institution?: string;
  graduationYear?: number;
  certifications?: Array<{ name: string; year: number }>;
  employmentType?: string;
  contractStartDate?: string;
  contractEndDate?: string;
  workSchedule?: Record<string, string[]>;
  hourlyRate?: number;
  monthlySalary?: number;
  bio?: string;
  teachingPhilosophy?: string;
  achievements?: string;
  experience?: number;
}

export const usersApi = {
  /**
   * Get all users with optional filters
   */
  async getUsers(filters?: {
    role?: Role;
    branchId?: number;
    isActive?: boolean;
  }): Promise<User[]> {
    const params = new URLSearchParams();
    if (filters?.role) params.append('role', filters.role);
    if (filters?.branchId) params.append('branchId', filters.branchId.toString());
    if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());

    const response = await apiClient.get<User[]>(`/users?${params.toString()}`);
    return response.data;
  },

  /**
   * Get a single user by ID
   */
  async getUser(userId: number): Promise<User> {
    const response = await apiClient.get<User>(`/users/${userId}`);
    return response.data;
  },

  /**
   * Create a new teacher
   */
  async createTeacher(data: CreateTeacherDto): Promise<{ user: User; teacher: Teacher; temporaryPassword: string }> {
    const response = await apiClient.post<{ user: User; teacher: Teacher; temporaryPassword: string }>(
      '/users/teachers',
      data
    );
    return response.data;
  },

  /**
   * Get teacher profile
   */
  async getTeacherProfile(teacherId: number): Promise<Teacher> {
    const response = await apiClient.get<Teacher>(`/users/teachers/${teacherId}/profile`);
    return response.data;
  },

  /**
   * Update teacher profile
   */
  async updateTeacherProfile(teacherId: number, data: UpdateTeacherProfileDto): Promise<Teacher> {
    const response = await apiClient.patch<Teacher>(`/users/teachers/${teacherId}/profile`, data);
    return response.data;
  },

  /**
   * Update user
   */
  async updateUser(userId: number, data: Partial<User>): Promise<User> {
    const response = await apiClient.patch<User>(`/users/${userId}`, data);
    return response.data;
  },

  /**
   * Deactivate user
   */
  async deactivateUser(userId: number): Promise<void> {
    await apiClient.delete(`/users/${userId}`);
  },

  /**
   * Reactivate user
   */
  async reactivateUser(userId: number): Promise<User> {
    const response = await apiClient.post<User>(`/users/${userId}/reactivate`);
    return response.data;
  },

  /**
   * Change password
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await apiClient.post('/users/change-password', {
      oldPassword,
      newPassword,
    });
  },

  /**
   * Admin reset user password
   */
  async resetPassword(userId: number): Promise<{ temporaryPassword: string }> {
    const response = await apiClient.post<{ temporaryPassword: string }>(
      `/users/${userId}/reset-password`
    );
    return response.data;
  },
};
