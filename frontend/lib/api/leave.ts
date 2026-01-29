import apiClient from './client';
import {
  LeaveRequest,
  CreateLeaveRequestDto,
  UpdateLeaveRequestDto,
  ReviewLeaveDto,
  LeaveBalance,
  LeaveStatus,
  LeaveType,
} from './types';

export const leaveApi = {
  /**
   * Submit a leave request
   */
  async createLeaveRequest(
    teacherId: number,
    data: CreateLeaveRequestDto
  ): Promise<LeaveRequest> {
    const response = await apiClient.post<LeaveRequest>(
      `/users/teachers/${teacherId}/leave-requests`,
      data
    );
    return response.data;
  },

  /**
   * Get leave requests for a teacher
   */
  async getLeaveRequests(
    teacherId: number,
    filters?: {
      status?: LeaveStatus;
      leaveType?: LeaveType;
      year?: number;
    }
  ): Promise<LeaveRequest[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.leaveType) params.append('leaveType', filters.leaveType);
    if (filters?.year) params.append('year', filters.year.toString());

    const response = await apiClient.get<LeaveRequest[]>(
      `/users/teachers/${teacherId}/leave-requests?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Get a single leave request
   */
  async getLeaveRequest(teacherId: number, leaveRequestId: number): Promise<LeaveRequest> {
    const response = await apiClient.get<LeaveRequest>(
      `/users/teachers/${teacherId}/leave-requests/${leaveRequestId}`
    );
    return response.data;
  },

  /**
   * Update a pending leave request
   */
  async updateLeaveRequest(
    teacherId: number,
    leaveRequestId: number,
    data: UpdateLeaveRequestDto
  ): Promise<LeaveRequest> {
    const response = await apiClient.patch<LeaveRequest>(
      `/users/teachers/${teacherId}/leave-requests/${leaveRequestId}`,
      data
    );
    return response.data;
  },

  /**
   * Approve a leave request (admin only)
   */
  async approveLeaveRequest(
    teacherId: number,
    leaveRequestId: number,
    data?: ReviewLeaveDto
  ): Promise<LeaveRequest> {
    const response = await apiClient.patch<LeaveRequest>(
      `/users/teachers/${teacherId}/leave-requests/${leaveRequestId}/approve`,
      data || {}
    );
    return response.data;
  },

  /**
   * Reject a leave request (admin only)
   */
  async rejectLeaveRequest(
    teacherId: number,
    leaveRequestId: number,
    data: ReviewLeaveDto
  ): Promise<LeaveRequest> {
    const response = await apiClient.patch<LeaveRequest>(
      `/users/teachers/${teacherId}/leave-requests/${leaveRequestId}/reject`,
      data
    );
    return response.data;
  },

  /**
   * Cancel a leave request
   */
  async cancelLeaveRequest(teacherId: number, leaveRequestId: number): Promise<void> {
    await apiClient.delete(`/users/teachers/${teacherId}/leave-requests/${leaveRequestId}`);
  },

  /**
   * Get leave balance for a teacher
   */
  async getLeaveBalance(teacherId: number, year?: number): Promise<LeaveBalance> {
    const params = year ? `?year=${year}` : '';
    const response = await apiClient.get<LeaveBalance>(
      `/users/teachers/${teacherId}/leave-balance${params}`
    );
    return response.data;
  },

  /**
   * Get all pending leave requests (admin only)
   */
  async getAllPendingLeaves(): Promise<LeaveRequest[]> {
    const response = await apiClient.get<LeaveRequest[]>('/users/leave-requests/pending');
    return response.data;
  },
};
