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
  organizationSlug?: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface RegisterRequest {
  organizationName: string;
  organizationEmail: string;
  organizationPhone?: string;
  organizationAddress?: string;
  organizationCountry?: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
}

export interface RegisterResponse {
  organization: {
    id: number;
    name: string;
    slug: string;
    email: string;
    phone?: string;
    address?: string;
    country?: string;
  };
  adminUser: User;
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

// User Management Types
export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  role: Role;
  branchId?: number;
  phone?: string;
  address?: string;
}

export interface UpdateUserRequest {
  name?: string;
  phone?: string;
  address?: string;
  branchId?: number;
  isActive?: boolean;
}

export interface CreateTeacherRequest {
  email: string;
  name: string;
  branchId: number;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  employeeId?: string;
  employmentStartDate?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export interface ParentInfo {
  email: string;
  name: string;
  phone: string;
  relationship: string;
  address?: string;
  occupation?: string;
  officePhone?: string;
  preferredContactMethod?: string;
}

export interface CreateStudentRequest {
  email?: string;
  name: string;
  branchId: number;
  phone: string;
  dateOfBirth: string;
  gender: string;
  gradeLevel: string;
  schoolName: string;
  address?: string;
  medicalInfo?: string;
  specialNeeds?: string;
  previousTuitionCenter?: string;
  referralSource?: string;
  parent: ParentInfo;
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
