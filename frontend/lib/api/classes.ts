import apiClient from './client';

export enum ClassType {
  REGULAR_GROUP = 'REGULAR_GROUP',
  SMALL_GROUP = 'SMALL_GROUP',
  ONE_ON_ONE = 'ONE_ON_ONE',
  ONLINE = 'ONLINE',
  HYBRID = 'HYBRID',
  INTENSIVE = 'INTENSIVE',
  WORKSHOP = 'WORKSHOP',
}

export enum ClassStatus {
  DRAFT = 'DRAFT',
  OPEN_FOR_ENROLLMENT = 'OPEN_FOR_ENROLLMENT',
  FULL = 'FULL',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  ON_HOLD = 'ON_HOLD',
}

export enum EnrollmentStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  WITHDRAWN = 'WITHDRAWN',
  TRANSFERRED = 'TRANSFERRED',
  ON_LEAVE = 'ON_LEAVE',
}

export interface ClassScheduleItem {
  day: string;
  startTime: string;
  endTime: string;
}

export interface Class {
  id: number;
  organizationId: number;
  branchId: number;
  courseId: number;
  teacherId: number;
  coTeacherId?: number;
  roomId?: number;
  name: string;
  classCode: string;
  classType: ClassType;
  classLevel?: string;
  termName?: string;
  academicYear?: number;
  startDate: string;
  endDate: string;
  totalWeeks?: number;
  holidayBreaks?: any[];
  schedule: ClassScheduleItem[];
  scheduleNotes?: string;
  maxCapacity: number;
  minCapacity: number;
  currentEnrollment: number;
  feePerSession?: number;
  feePerMonth?: number;
  feePerTerm?: number;
  materialFee?: number;
  allowLateEnrollment: boolean;
  lateEnrollmentCutoffDate?: string;
  allowMidTermWithdrawal: boolean;
  waitlistEnabled: boolean;
  autoEnrollFromWaitlist: boolean;
  status: ClassStatus;
  statusReason?: string;
  syllabus?: string;
  materials?: any[];
  digitalResources?: string;
  classAnnouncements?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  course?: {
    name: string;
    code: string;
    category: string;
  };
  teacher?: {
    id: number;
    user: {
      name: string;
      email: string;
    };
  };
  coTeacher?: {
    id: number;
    user: {
      name: string;
      email: string;
    };
  };
  room?: {
    name: string;
    capacity: number;
  };
  branch?: {
    name: string;
    code: string;
  };
  _count?: {
    enrollments: number;
    waitlist: number;
  };
}

export interface CreateClassRequest {
  name: string;
  classCode?: string;
  courseId: number;
  teacherId: number;
  coTeacherId?: number;
  roomId?: number;
  classType: ClassType;
  classLevel?: string;
  termName?: string;
  academicYear?: number;
  startDate: string;
  endDate: string;
  totalWeeks?: number;
  holidayBreaks?: any[];
  schedule: ClassScheduleItem[];
  scheduleNotes?: string;
  maxCapacity: number;
  minCapacity: number;
  feePerSession?: number;
  feePerMonth?: number;
  feePerTerm?: number;
  materialFee?: number;
  allowLateEnrollment?: boolean;
  lateEnrollmentCutoffDate?: string;
  allowMidTermWithdrawal?: boolean;
  waitlistEnabled?: boolean;
  autoEnrollFromWaitlist?: boolean;
  status?: ClassStatus;
  syllabus?: string;
  materials?: any[];
  digitalResources?: string;
  classAnnouncements?: string;
}

export interface EnrollStudentRequest {
  studentId: number;
  agreedFeePerMonth?: number;
  discountApplied?: number;
  enrollmentNotes?: string;
}

export interface AddToWaitlistRequest {
  studentId: number;
  isPriority?: boolean;
  priorityNotes?: string;
  notes?: string;
}

export interface WithdrawStudentRequest {
  withdrawalReason: string;
}

export const classesApi = {
  async getAll(filters?: {
    branchId?: number;
    courseId?: number;
    teacherId?: number;
    status?: string;
    termName?: string;
    academicYear?: number;
  }): Promise<Class[]> {
    const params = new URLSearchParams();
    if (filters?.branchId) params.append('branchId', String(filters.branchId));
    if (filters?.courseId) params.append('courseId', String(filters.courseId));
    if (filters?.teacherId) params.append('teacherId', String(filters.teacherId));
    if (filters?.status) params.append('status', filters.status);
    if (filters?.termName) params.append('termName', filters.termName);
    if (filters?.academicYear) params.append('academicYear', String(filters.academicYear));

    const response = await apiClient.get<Class[]>(`/classes?${params.toString()}`);
    return response.data;
  },

  async getById(id: number): Promise<Class> {
    const response = await apiClient.get<Class>(`/classes/${id}`);
    return response.data;
  },

  async create(data: CreateClassRequest): Promise<Class> {
    const response = await apiClient.post<Class>('/classes', data);
    return response.data;
  },

  async update(id: number, data: Partial<CreateClassRequest>): Promise<Class> {
    const response = await apiClient.patch<Class>(`/classes/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/classes/${id}`);
  },

  async enrollStudent(classId: number, data: EnrollStudentRequest): Promise<any> {
    const response = await apiClient.post(`/classes/${classId}/enroll`, data);
    return response.data;
  },

  async withdrawStudent(
    classId: number,
    studentId: number,
    data: WithdrawStudentRequest,
  ): Promise<any> {
    const response = await apiClient.post(
      `/classes/${classId}/students/${studentId}/withdraw`,
      data,
    );
    return response.data;
  },

  async addToWaitlist(classId: number, data: AddToWaitlistRequest): Promise<any> {
    const response = await apiClient.post(`/classes/${classId}/waitlist`, data);
    return response.data;
  },

  async getClassRoster(classId: number): Promise<any[]> {
    const response = await apiClient.get(`/classes/${classId}/roster`);
    return response.data;
  },

  async getClassWaitlist(classId: number): Promise<any[]> {
    const response = await apiClient.get(`/classes/${classId}/waitlist`);
    return response.data;
  },
};

// Helper functions
export const getClassTypeLabel = (type: ClassType): string => {
  const labels: Record<ClassType, string> = {
    [ClassType.REGULAR_GROUP]: 'Regular Group',
    [ClassType.SMALL_GROUP]: 'Small Group',
    [ClassType.ONE_ON_ONE]: 'One-on-One',
    [ClassType.ONLINE]: 'Online',
    [ClassType.HYBRID]: 'Hybrid',
    [ClassType.INTENSIVE]: 'Intensive',
    [ClassType.WORKSHOP]: 'Workshop',
  };
  return labels[type] || type;
};

export const getClassStatusLabel = (status: ClassStatus): string => {
  const labels: Record<ClassStatus, string> = {
    [ClassStatus.DRAFT]: 'Draft',
    [ClassStatus.OPEN_FOR_ENROLLMENT]: 'Open for Enrollment',
    [ClassStatus.FULL]: 'Full',
    [ClassStatus.IN_PROGRESS]: 'In Progress',
    [ClassStatus.COMPLETED]: 'Completed',
    [ClassStatus.CANCELLED]: 'Cancelled',
    [ClassStatus.ON_HOLD]: 'On Hold',
  };
  return labels[status] || status;
};

export const getClassStatusColor = (status: ClassStatus): string => {
  const colors: Record<ClassStatus, string> = {
    [ClassStatus.DRAFT]: 'bg-gray-100 text-gray-800 border-gray-200',
    [ClassStatus.OPEN_FOR_ENROLLMENT]: 'bg-green-100 text-green-800 border-green-200',
    [ClassStatus.FULL]: 'bg-orange-100 text-orange-800 border-orange-200',
    [ClassStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800 border-blue-200',
    [ClassStatus.COMPLETED]: 'bg-purple-100 text-purple-800 border-purple-200',
    [ClassStatus.CANCELLED]: 'bg-red-100 text-red-800 border-red-200',
    [ClassStatus.ON_HOLD]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};

export const getDayLabel = (day: string): string => {
  const labels: Record<string, string> = {
    MONDAY: 'Mon',
    TUESDAY: 'Tue',
    WEDNESDAY: 'Wed',
    THURSDAY: 'Thu',
    FRIDAY: 'Fri',
    SATURDAY: 'Sat',
    SUNDAY: 'Sun',
  };
  return labels[day] || day;
};

export const formatSchedule = (schedule: ClassScheduleItem[]): string => {
  if (!schedule || schedule.length === 0) return 'No schedule';

  return schedule
    .map((item) => `${getDayLabel(item.day)} ${item.startTime}-${item.endTime}`)
    .join(', ');
};
