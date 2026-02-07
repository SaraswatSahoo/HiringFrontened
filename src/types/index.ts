export type UserRole = 'ADMIN' | 'HR' | 'RECRUITER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role?: UserRole;
}

export type JDStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'CLOSED';

export interface JobDescription {
  id: string;
  title: string;
  description: string;
  department: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  openings?: number;
  status: JDStatus;
  eligibleDegrees: string[];
  eligibleYears: number[];
  minCGPA?: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    candidates?: number;
    stages?: number;
  };
}

export type StageType = 'APPLIED' | 'SHORTLISTED' | 'INTERVIEWED' | 'SELECTED' | 'REJECTED';

export interface Stage {
  id: string;
  name: string;
  type: StageType;
  order: number;
  jdId: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  college: string;
  degree: string;
  branch?: string;
  passOutYear: number;
  cgpa?: number;
  resumeLink?: string;
  isEligible: boolean;
  tags: string[];
  currentStageId: string;
  jdId: string;
  createdAt: string;
  currentStage?: Stage;
}

export interface BulkUpload {
  id: string;
  jdId: string;
  fileName: string;
  totalRows?: number;
  successCount?: number;
  failureCount?: number;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'PARTIAL';
  errorLog?: any;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardSummary {
  totalCandidates: number;
  eligibleCandidates: number;
  shortlisted: number;
  interviewed: number;
  selected: number;
  rejected: number;
  eligibilityRate: string;
  selectionRate: string;
  totalColleges: number;
}

export interface StageStats {
  stageId: string;
  stageName: string;
  stageType: StageType;
  count: number;
  percentage: string;
}

export interface CollegePerformance {
  collegeName: string;
  totalApplied: number;
  totalEligible: number;
  totalShortlisted: number;
  totalSelected: number;
  avgCGPA: string | null;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  pagination?: Pagination;
}
