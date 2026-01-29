import apiClient from './client';

export interface Branch {
  id: number;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  organizationId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBranchRequest {
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface UpdateBranchRequest {
  name?: string;
  code?: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
}

export const branchesApi = {
  /**
   * Get all branches
   */
  async getAll(): Promise<Branch[]> {
    const response = await apiClient.get<Branch[]>('/branches');
    return response.data;
  },

  /**
   * Get branch by ID
   */
  async getById(id: number): Promise<Branch> {
    const response = await apiClient.get<Branch>(`/branches/${id}`);
    return response.data;
  },

  /**
   * Create a new branch
   */
  async create(data: CreateBranchRequest): Promise<Branch> {
    const response = await apiClient.post<Branch>('/branches', data);
    return response.data;
  },

  /**
   * Update branch
   */
  async update(id: number, data: UpdateBranchRequest): Promise<Branch> {
    const response = await apiClient.patch<Branch>(`/branches/${id}`, data);
    return response.data;
  },

  /**
   * Delete branch
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/branches/${id}`);
  },
};
