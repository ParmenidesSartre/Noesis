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

// Mock data for testing
const mockBranches: Branch[] = [
  {
    id: 1,
    name: 'Main Campus',
    code: 'MC001',
    address: '123 Education Street, City Center, Country',
    phone: '+1234567890',
    email: 'main@noesis.edu',
    isActive: true,
    organizationId: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'North Branch',
    code: 'NB002',
    address: '456 Learning Avenue, North District, Country',
    phone: '+1234567891',
    email: 'north@noesis.edu',
    isActive: true,
    organizationId: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    name: 'South Branch',
    code: 'SB003',
    address: '789 Knowledge Boulevard, South District, Country',
    phone: '+1234567892',
    email: 'south@noesis.edu',
    isActive: false,
    organizationId: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const branchesApi = {
  /**
   * Get all branches (MOCKED)
   */
  async getAll(): Promise<Branch[]> {
    // Mock delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockBranches;
  },

  /**
   * Get branch by ID (MOCKED)
   */
  async getById(id: number): Promise<Branch> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const branch = mockBranches.find(b => b.id === id);
    if (!branch) throw new Error('Branch not found');
    return branch;
  },

  /**
   * Create a new branch (MOCKED)
   */
  async create(data: CreateBranchRequest): Promise<Branch> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newBranch: Branch = {
      id: mockBranches.length + 1,
      ...data,
      isActive: true,
      organizationId: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockBranches.push(newBranch);
    return newBranch;
  },

  /**
   * Update branch (MOCKED)
   */
  async update(id: number, data: UpdateBranchRequest): Promise<Branch> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockBranches.findIndex(b => b.id === id);
    if (index === -1) throw new Error('Branch not found');
    mockBranches[index] = {
      ...mockBranches[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return mockBranches[index];
  },

  /**
   * Delete branch (MOCKED)
   */
  async delete(id: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockBranches.findIndex(b => b.id === id);
    if (index === -1) throw new Error('Branch not found');
    mockBranches.splice(index, 1);
  },
};
