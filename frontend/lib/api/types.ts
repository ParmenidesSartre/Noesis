// Enums
export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  BRANCH_ADMIN = 'BRANCH_ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  PARENT = 'PARENT',
}

export enum LeaveType {
  SICK = 'SICK',
  ANNUAL = 'ANNUAL',
  EMERGENCY = 'EMERGENCY',
  UNPAID = 'UNPAID',
}

export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum DocumentType {
  RESUME = 'RESUME',
  CERTIFICATE = 'CERTIFICATE',
  ID_DOCUMENT = 'ID_DOCUMENT',
  POLICE_CLEARANCE = 'POLICE_CLEARANCE',
  CONTRACT = 'CONTRACT',
  DEGREE = 'DEGREE',
  OTHER = 'OTHER',
}

// User Types
export interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
  phone?: string;
  address?: string;
  isActive: boolean;
  dateOfBirth?: string;
  gender?: string;
  profilePhoto?: string;
  organizationId: number;
  branchId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Teacher {
  id: number;
  userId: number;
  user: User;
  organizationId: number;
  branchId: number;
  teacherCode: string;
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
  createdAt: string;
  updatedAt: string;
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface RegisterRequest {
  organizationName: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

// Leave Management Types
export interface LeaveRequest {
  id: number;
  teacherId: number;
  teacher?: Teacher;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  supportingDocuments?: string;
  status: LeaveStatus;
  adminComments?: string;
  reviewedByUserId?: number;
  reviewedBy?: User;
  reviewedAt?: string;
  submittedBy?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeaveRequestDto {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  supportingDocuments?: string;
}

export interface UpdateLeaveRequestDto {
  startDate?: string;
  endDate?: string;
  reason?: string;
  supportingDocuments?: string;
}

export interface ReviewLeaveDto {
  comments?: string;
}

export interface LeaveBalance {
  teacherId: number;
  year: number;
  balances: {
    [key in LeaveType]: {
      total: number | null;
      used: number;
      remaining: number | null;
    };
  };
}

// Document Types
export interface Document {
  id: number;
  teacherId: number;
  documentType: DocumentType;
  description?: string;
  fileName: string;
  storedName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  expiryDate?: string;
  expiryAlerted: boolean;
  uploadedBy?: number;
  uploadedUser?: User;
  uploadedAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
