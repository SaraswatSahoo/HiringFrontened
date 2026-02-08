// ==================== USER & AUTH TYPES ====================

export type UserRole = 'ADMIN' | 'HR' | 'RECRUITER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt?: string;
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

// ==================== JOB DESCRIPTION TYPES ====================

export type JDStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'CLOSED';

export interface JobDescription {
  id: string;
  title: string;
  description: string;
  department: string;
  location?: string;
  status: JDStatus;
  
  // Compensation
  salaryMin?: number;
  salaryMax?: number;
  openings: number;
  
  // Eligibility Criteria
  eligibleDegrees: string[];
  eligibleStreams: string[];
  eligibleYears: number[];
  minCGPA?: number;
  
  // Additional Requirements
  responsibilities?: string;
  skills: string[];
  
  // Job Details
  employmentType?: string; // "Full-time", "Part-time", "Contract", "Internship"
  experienceLevel?: string; // "Fresher", "0-2 years", "2-5 years", "5+ years"
  workMode?: string; // "Onsite", "Remote", "Hybrid"
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdById?: string;
  
  // Relations
  createdBy?: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
  
  // Counts
  _count?: {
    candidates?: number;
    stages?: number;
  };

  stages?: Stage[];
}

export interface CreateJDData {
  title: string;
  description: string;
  department: string;
  location?: string;
  status?: JDStatus;
  
  // Compensation
  salaryMin?: number;
  salaryMax?: number;
  openings?: number;
  
  // Eligibility
  eligibleDegrees?: string[];
  eligibleStreams?: string[];
  eligibleYears?: number[];
  minCGPA?: number;
  
  // Additional
  responsibilities?: string;
  skills?: string[];
  employmentType?: string;
  experienceLevel?: string;
  workMode?: string;
}

export interface UpdateJDData extends Partial<CreateJDData> {
  status?: JDStatus;
}

export interface JDFilters {
  page?: number;
  limit?: number;
  status?: JDStatus;
  department?: string;
  location?: string;
  workMode?: string;
  search?: string;
}

// ==================== STAGE TYPES ====================

export type StageType = 'APPLIED' | 'SHORTLISTED' | 'INTERVIEWED' | 'SELECTED' | 'REJECTED';

export interface Stage {
  id: string;
  name: string;
  type: StageType;
  order: number;
  description?: string;
  isActive: boolean;
  jdId: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    currentCandidates?: number;
    candidateStages?: number;
  };
}

// ==================== CANDIDATE TYPES ====================

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  
  // Academic Information
  college: string;
  degree: string;
  branch?: string;
  passOutYear: number;
  cgpa?: number;
  backlogs?: number;
  tenthPercentage?: number;
  twelfthPercentage?: number;
  
  // Documents
  resumeLink?: string;
  
  // Status
  isEligible: boolean;
  tags: string[];
  
  // References
  currentStageId?: string;
  jdId: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  
  // Relations
  currentStage?: Stage;
  jd?: JobDescription;
}

export interface CreateCandidateData {
  name: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  college: string;
  degree: string;
  branch?: string;
  passOutYear: number;
  cgpa?: number;
  backlogs?: number;
  tenthPercentage?: number;
  twelfthPercentage?: number;
  resumeLink?: string;
  jdId: string;
  tags?: string[];
}

export interface UpdateCandidateData extends Partial<CreateCandidateData> {}

export interface CandidateFilters {
  jdId?: string;
  page?: number;
  limit?: number;
  stageId?: string;
  isEligible?: boolean;
  college?: string;
  degree?: string;
  branch?: string;
  passOutYear?: number;
  minCGPA?: number;
  maxCGPA?: number;
  search?: string;
}

// ==================== BULK UPLOAD TYPES ====================

export type UploadStatus = 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'PARTIAL';

export interface BulkUpload {
  id: string;
  jdId: string;
  fileName: string;
  fileUrl?: string;
  totalRows: number;
  successCount: number;
  failureCount: number;
  status: UploadStatus;
  errorLog?: any;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface BulkUploadResult {
  id: string;
  totalRows: number;
  successCount: number;
  failureCount: number;
  status: UploadStatus;
  errorLog?: any;
}

// ==================== DASHBOARD & ANALYTICS TYPES ====================

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
  selectionRate?: string;
}

export interface JDStats {
  totalCandidates: number;
  eligibleCandidates: number;
  ineligibleCandidates: number;
  openings: number;
  fillRate: string;
  stages: {
    name: string;
    type: StageType;
    count: number;
  }[];
  dashboard?: {
    id: string;
    totalCandidates: number;
    eligibleCount: number;
    shortlistedCount: number;
    interviewedCount: number;
    selectedCount: number;
    rejectedCount: number;
    avgTimeToHire?: number;
    avgRating?: number;
  };
}

export interface CGPADistribution {
  distribution: {
    '9.0-10.0': number;
    '8.0-8.9': number;
    '7.0-7.9': number;
    '6.0-6.9': number;
    'Below 6.0': number;
  };
  totalCandidates: number;
  avgCGPA: string | null;
}

export interface DegreeStats {
  degree: string;
  count: number;
  percentage: string;
}

export interface StreamStats {
  stream: string;
  count: number;
  percentage: string;
  avgCGPA: string | null;
}

// ==================== COMMUNICATION TYPES ====================

export type CommChannel = 'EMAIL' | 'WHATSAPP' | 'SMS';
export type CommStatus = 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED';

export interface Communication {
  id: string;
  jdId: string;
  channel: CommChannel;
  templateId?: string;
  subject?: string;
  message: string;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Template {
  id: string;
  name: string;
  channel: CommChannel;
  category: string; // "INTERVIEW_CALL", "TEST_LINK", "REJECTION", "OFFER"
  subject?: string;
  body: string;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==================== FEEDBACK TYPES ====================

export interface Feedback {
  id: string;
  candidateId: string;
  givenById: string;
  rating: number; // 1-5
  comments: string;
  technicalSkills?: number;
  communication?: number;
  cultureFit?: number;
  problemSolving?: number;
  recommendation?: string; // "STRONG_YES", "YES", "MAYBE", "NO"
  createdAt: string;
  updatedAt: string;
  givenBy?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateFeedbackData {
  candidateId: string;
  rating: number;
  comments: string;
  technicalSkills?: number;
  communication?: number;
  cultureFit?: number;
  problemSolving?: number;
  recommendation?: string;
}

// ==================== PAGINATION & API RESPONSE ====================

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  pagination?: Pagination;
}

export interface ApiError {
  error: string;
  message?: string;
  statusCode?: number;
}

// ==================== ACTIVITY LOG ====================

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: any;
  ipAddress?: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

// ==================== UTILITY TYPES ====================

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SearchParams extends PaginationParams {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Form state types
export interface FormState<T> {
  data: T;
  loading: boolean;
  error: string | null;
  success: boolean;
}

// List response types
export interface ListResponse<T> {
  items: T[];
  pagination: Pagination;
}

// Generic API types
export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiRequestConfig {
  method: ApiMethod;
  url: string;
  data?: any;
  params?: any;
  headers?: Record<string, string>;
}
