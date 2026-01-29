import apiClient from './client';

export enum CourseCategory {
  UPSR = 'UPSR',
  PT3 = 'PT3',
  SPM = 'SPM',
  STPM = 'STPM',
  MATRICULATION = 'MATRICULATION',
  IGCSE = 'IGCSE',
  O_LEVEL = 'O_LEVEL',
  A_LEVEL = 'A_LEVEL',
  ACADEMIC = 'ACADEMIC',
  ENRICHMENT = 'ENRICHMENT',
  LANGUAGE = 'LANGUAGE',
  SPECIAL_PROGRAM = 'SPECIAL_PROGRAM',
}

export enum CourseLevel {
  STANDARD_1 = 'STANDARD_1',
  STANDARD_2 = 'STANDARD_2',
  STANDARD_3 = 'STANDARD_3',
  STANDARD_4 = 'STANDARD_4',
  STANDARD_5 = 'STANDARD_5',
  STANDARD_6 = 'STANDARD_6',
  FORM_1 = 'FORM_1',
  FORM_2 = 'FORM_2',
  FORM_3 = 'FORM_3',
  FORM_4 = 'FORM_4',
  FORM_5 = 'FORM_5',
  FORM_6_LOWER = 'FORM_6_LOWER',
  FORM_6_UPPER = 'FORM_6_UPPER',
  MIXED = 'MIXED',
}

export enum DifficultyLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  MIXED = 'MIXED',
}

export enum SessionDuration {
  THIRTY_MIN = 'THIRTY_MIN',
  FORTY_FIVE_MIN = 'FORTY_FIVE_MIN',
  SIXTY_MIN = 'SIXTY_MIN',
  NINETY_MIN = 'NINETY_MIN',
  ONE_TWENTY_MIN = 'ONE_TWENTY_MIN',
}

export interface Course {
  id: number;
  organizationId: number;
  name: string;
  code: string;
  description?: string;
  objectives?: string;
  category: CourseCategory;
  difficultyLevel: DifficultyLevel;
  gradeLevels: CourseLevel[];
  minAge?: number;
  maxAge?: number;
  prerequisites?: string;
  sessionDuration: SessionDuration;
  totalWeeks?: number;
  isOngoing: boolean;
  maxClassSize: number;
  minClassSize: number;
  baseFeePerSession?: number;
  baseFeePerMonth?: number;
  baseFeePerTerm?: number;
  materialFee?: number;
  registrationFee?: number;
  trialSessionFee?: number;
  textbooks?: Array<{ title: string; isbn?: string; required?: boolean }>;
  additionalMaterials?: string;
  digitalResources?: string;
  isActive: boolean;
  enrollmentOpen: boolean;
  waitlistEnabled: boolean;
  publicVisibility: boolean;
  isTemplate: boolean;
  createdAt: string;
  updatedAt: string;
  courseBranches?: CourseBranch[];
  _count?: {
    classes: number;
  };
}

export interface CourseBranch {
  id: number;
  courseId: number;
  branchId: number;
  isOffered: boolean;
  customFeePerSession?: number;
  customFeePerMonth?: number;
  customFeePerTerm?: number;
  customMaterialFee?: number;
  customRegistrationFee?: number;
  customMaxClassSize?: number;
  customMinClassSize?: number;
  branchNotes?: string;
  createdAt: string;
  updatedAt: string;
  branch?: {
    id: number;
    name: string;
    code: string;
    isActive?: boolean;
  };
}

export interface CreateCourseRequest {
  name: string;
  code: string;
  description?: string;
  objectives?: string;
  category: CourseCategory;
  difficultyLevel: DifficultyLevel;
  gradeLevels: CourseLevel[];
  minAge?: number;
  maxAge?: number;
  prerequisites?: string;
  sessionDuration: SessionDuration;
  totalWeeks?: number;
  isOngoing: boolean;
  maxClassSize: number;
  minClassSize: number;
  baseFeePerSession?: number;
  baseFeePerMonth?: number;
  baseFeePerTerm?: number;
  materialFee?: number;
  registrationFee?: number;
  trialSessionFee?: number;
  textbooks?: Array<{ title: string; isbn?: string; required?: boolean }>;
  additionalMaterials?: string;
  digitalResources?: string;
  isActive: boolean;
  enrollmentOpen: boolean;
  waitlistEnabled: boolean;
  publicVisibility: boolean;
  isTemplate: boolean;
}

export interface AssignCourseToBranchRequest {
  branchId: number;
  isOffered: boolean;
  customFeePerSession?: number;
  customFeePerMonth?: number;
  customFeePerTerm?: number;
  customMaterialFee?: number;
  customRegistrationFee?: number;
  customMaxClassSize?: number;
  customMinClassSize?: number;
  branchNotes?: string;
}

export const coursesApi = {
  async getAll(filters?: {
    category?: string;
    isActive?: boolean;
    isTemplate?: boolean;
    branchId?: number;
  }): Promise<Course[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
    if (filters?.isTemplate !== undefined) params.append('isTemplate', String(filters.isTemplate));
    if (filters?.branchId) params.append('branchId', String(filters.branchId));

    const response = await apiClient.get<Course[]>(`/courses?${params.toString()}`);
    return response.data;
  },

  async getById(id: number): Promise<Course> {
    const response = await apiClient.get<Course>(`/courses/${id}`);
    return response.data;
  },

  async create(data: CreateCourseRequest): Promise<Course> {
    const response = await apiClient.post<Course>('/courses', data);
    return response.data;
  },

  async update(id: number, data: Partial<CreateCourseRequest>): Promise<Course> {
    const response = await apiClient.patch<Course>(`/courses/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/courses/${id}`);
  },

  async assignToBranch(courseId: number, data: AssignCourseToBranchRequest): Promise<CourseBranch> {
    const response = await apiClient.post<CourseBranch>(`/courses/${courseId}/branches`, data);
    return response.data;
  },

  async removeFromBranch(courseId: number, branchId: number): Promise<void> {
    await apiClient.delete(`/courses/${courseId}/branches/${branchId}`);
  },

  async getCourseBranches(courseId: number): Promise<CourseBranch[]> {
    const response = await apiClient.get<CourseBranch[]>(`/courses/${courseId}/branches`);
    return response.data;
  },
};

// Helper functions for display
export const getCourseCategoryLabel = (category: CourseCategory): string => {
  const labels: Record<CourseCategory, string> = {
    [CourseCategory.UPSR]: 'UPSR',
    [CourseCategory.PT3]: 'PT3',
    [CourseCategory.SPM]: 'SPM',
    [CourseCategory.STPM]: 'STPM',
    [CourseCategory.MATRICULATION]: 'Matriculation',
    [CourseCategory.IGCSE]: 'IGCSE',
    [CourseCategory.O_LEVEL]: 'O-Level',
    [CourseCategory.A_LEVEL]: 'A-Level',
    [CourseCategory.ACADEMIC]: 'Academic',
    [CourseCategory.ENRICHMENT]: 'Enrichment',
    [CourseCategory.LANGUAGE]: 'Language',
    [CourseCategory.SPECIAL_PROGRAM]: 'Special Program',
  };
  return labels[category] || category;
};

export const getCourseLevelLabel = (level: CourseLevel): string => {
  const labels: Record<CourseLevel, string> = {
    [CourseLevel.STANDARD_1]: 'Standard 1',
    [CourseLevel.STANDARD_2]: 'Standard 2',
    [CourseLevel.STANDARD_3]: 'Standard 3',
    [CourseLevel.STANDARD_4]: 'Standard 4',
    [CourseLevel.STANDARD_5]: 'Standard 5',
    [CourseLevel.STANDARD_6]: 'Standard 6',
    [CourseLevel.FORM_1]: 'Form 1',
    [CourseLevel.FORM_2]: 'Form 2',
    [CourseLevel.FORM_3]: 'Form 3',
    [CourseLevel.FORM_4]: 'Form 4',
    [CourseLevel.FORM_5]: 'Form 5',
    [CourseLevel.FORM_6_LOWER]: 'Form 6 Lower',
    [CourseLevel.FORM_6_UPPER]: 'Form 6 Upper',
    [CourseLevel.MIXED]: 'Mixed Levels',
  };
  return labels[level] || level;
};

export const getSessionDurationLabel = (duration: SessionDuration): string => {
  const labels: Record<SessionDuration, string> = {
    [SessionDuration.THIRTY_MIN]: '30 minutes',
    [SessionDuration.FORTY_FIVE_MIN]: '45 minutes',
    [SessionDuration.SIXTY_MIN]: '1 hour',
    [SessionDuration.NINETY_MIN]: '1.5 hours',
    [SessionDuration.ONE_TWENTY_MIN]: '2 hours',
  };
  return labels[duration] || duration;
};
