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

export type ApplicationStatus = 'PENDING' | 'REVIEWING' | 'PROCESSED' | 'REJECTED';
export type OfferStatus = 'PENDING' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
export type Gender = 'Male' | 'Female' | 'Other' | 'Prefer not to say';

export interface Candidate {
  id: string;
  
  // Basic Information
  name: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  dateOfBirth?: string;
  gender?: Gender;
  
  // College/Academic Information
  college: string;
  degree: string;
  branch?: string;
  stream?: string;
  passOutYear: number;
  cgpa?: number;
  backlogs?: number;
  activeBacklogs?: number;
  tenthPercentage?: number;
  twelfthPercentage?: number;
  
  // Documents
  resumeLink?: string;
  photoUrl?: string;
  idProofUrl?: string;
  marksheetUrls?: string[];
  
  // Contact & Location
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  
  // Skills & Experience
  skills?: string[];
  certifications?: string[];
  projects?: string[];
  internships?: string[];
  hasWorkExperience?: boolean;
  yearsOfExperience?: number;
  
  // Application Status
  isEligible: boolean;
  ineligibilityReason?: string;
  applicationStatus?: ApplicationStatus;
  currentStageId?: string;
  
  // Interview & Assessment
  interviewScore?: number;
  technicalScore?: number;
  hrScore?: number;
  overallRating?: number;
  
  // Offer Details
  offerStatus?: OfferStatus;
  offerLetterUrl?: string;
  offeredCTC?: number;
  joiningDate?: string;
  hasJoined?: boolean;
  
  // JD Reference
  jdId: string;
  
  // Tags for filtering
  tags: string[];
  
  // Timestamps
  appliedAt?: string;
  lastActivityAt?: string;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  currentStage?: Stage;
  jd?: JobDescription;
  feedbacks?: Feedback[];
  stageHistory?: CandidateStage[];
  communications?: CandidateComm[];
  
  // Counts
  _count?: {
    feedbacks?: number;
    communications?: number;
    stageHistory?: number;
  };
}

export interface CreateCandidateData {
  // Basic Information
  name: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  dateOfBirth?: string;
  gender?: Gender;
  
  // College/Academic Information
  college: string;
  degree: string;
  branch?: string;
  stream?: string;
  passOutYear: number;
  cgpa?: number;
  backlogs?: number;
  activeBacklogs?: number;
  tenthPercentage?: number;
  twelfthPercentage?: number;
  
  // Documents
  resumeLink?: string;
  photoUrl?: string;
  idProofUrl?: string;
  marksheetUrls?: string[];
  
  // Location
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  
  // Skills & Experience
  skills?: string[];
  certifications?: string[];
  projects?: string[];
  internships?: string[];
  hasWorkExperience?: boolean;
  yearsOfExperience?: number;
  
  // Application Status
  applicationStatus?: ApplicationStatus;
  ineligibilityReason?: string;
  
  // Assessment Scores
  interviewScore?: number;
  technicalScore?: number;
  hrScore?: number;
  overallRating?: number;
  
  // Offer Details
  offerStatus?: OfferStatus;
  offerLetterUrl?: string;
  offeredCTC?: number;
  joiningDate?: string;
  hasJoined?: boolean;
  
  // Required
  jdId: string;
  tags?: string[];
}

export interface UpdateCandidateData extends Partial<CreateCandidateData> {}

export interface CandidateFilters {
  // Pagination
  page?: number;
  limit?: number;
  
  // Stage & Status Filters
  stageId?: string;
  isEligible?: boolean;
  applicationStatus?: ApplicationStatus;
  offerStatus?: OfferStatus;
  
  // Academic Filters
  college?: string;
  degree?: string;
  branch?: string;
  stream?: string;
  passOutYear?: number;
  minCGPA?: number;
  maxCGPA?: number;
  
  // Location Filters
  city?: string;
  state?: string;
  
  // Experience & Demographics
  hasWorkExperience?: boolean;
  hasJoined?: boolean;
  gender?: Gender;
  
  // Skills & Search
  skills?: string; // Comma-separated
  search?: string;
  
  // Sorting
  sortBy?: 'name' | 'email' | 'college' | 'cgpa' | 'passOutYear' | 'appliedAt' | 'lastActivityAt' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// ==================== CANDIDATE STAGE HISTORY ====================

export interface CandidateStage {
  id: string;
  candidateId: string;
  stageId: string;
  enteredAt: string;
  exitedAt?: string;
  notes?: string;
  interviewDate?: string;
  interviewMode?: 'Online' | 'Offline' | 'Telephonic' | 'Video';
  interviewerName?: string;
  createdAt: string;
  updatedAt: string;
  stage?: Stage;
  candidate?: Candidate;
}

export interface MoveStageData {
  stageId: string;
  notes?: string;
  interviewDate?: string;
  interviewMode?: 'Online' | 'Offline' | 'Telephonic' | 'Video';
  interviewerName?: string;
}

export interface BulkMoveStageData {
  candidateIds: string[];
  stageId: string;
  notes?: string;
}

// ==================== CANDIDATE COMMUNICATION ====================

export type CommStatus = 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED';

export interface Communication {
  id: string;
  jdId: string;
  subject: string;
  message: string;
  type: 'EMAIL' | 'SMS';
  createdAt: string;
  updatedAt: string;
}

export interface CandidateComm {
  id: string;
  candidateId: string;
  communicationId: string;
  status: CommStatus;
  sentAt?: string;
  deliveredAt?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
  candidate?: Candidate;
  communication?: Communication;
}

// ==================== BULK UPLOAD TYPES ====================

export type UploadStatus = 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'PARTIAL';

export interface BulkUpload {
  id: string;
  
  // Relation
  jdId: string;
  jd?: {
    id: string;
    title: string;
    department: string;
  };
  
  // File info
  fileName: string;
  fileUrl?: string;
  fileSize?: number; // bytes
  fileType?: string; // CSV, XLSX, etc.
  
  // Processing stats
  totalRows: number;
  successCount: number;
  failureCount: number;
  processedRows: number; // progress tracking
  
  // Status
  status: UploadStatus;
  
  // Error handling
  errorLog?: any; // Array of row-level errors
  errorMessage?: string; // High-level failure reason
  
  // Audit
  uploadedBy: string;
  uploader?: {
    id: string;
    name: string;
    email: string;
  };
  
  // Retry support
  retryCount: number;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface BulkUploadResult {
  id: string;
  totalRows: number;
  successCount: number;
  failureCount: number;
  processedRows: number;
  status: UploadStatus;
  errorLog?: any;
  errorMessage?: string;
  retryCount: number;
  completedAt?: string;
}

export interface BulkUploadListItem extends BulkUpload {
  progress: number; // Calculated percentage (0-100)
}

export interface BulkUploadError {
  row: number;
  error: string;
  data: any;
}

export interface BulkUploadStats {
  total: number;
  processing: number;
  completed: number;
  failed: number;
  partial: number;
}

export interface CreateBulkUploadData {
  jdId: string;
  fileName: string;
  fileSize?: number;
  fileType?: string;
  totalRows?: number;
}

export interface UpdateBulkUploadData {
  totalRows?: number;
  successCount?: number;
  failureCount?: number;
  processedRows?: number;
  status?: UploadStatus;
  errorLog?: any;
  errorMessage?: string;
  completedAt?: string;
}

export interface BulkUploadFilters {
  page?: number;
  limit?: number;
  status?: UploadStatus;
  jdId?: string;
  uploadedBy?: string;
  startDate?: string;
  endDate?: string;
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

// ==================== EMAIL ENUMS ====================

export enum EmailStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  BOUNCED = 'BOUNCED',
}

export enum EmailType {
  BULK = 'BULK',
  INDIVIDUAL = 'INDIVIDUAL',
}

export enum TemplateCategory {
  INTERVIEW_CALL = 'INTERVIEW_CALL',
  TEST_LINK = 'TEST_LINK',
  REJECTION = 'REJECTION',
  OFFER = 'OFFER',
  SHORTLIST = 'SHORTLIST',
  REMINDER = 'REMINDER',
  FEEDBACK_REQUEST = 'FEEDBACK_REQUEST',
  ONBOARDING = 'ONBOARDING',
  GENERAL = 'GENERAL',
}

// ==================== EMAIL INTERFACES ====================

export interface Email {
  id: string;
  jdId: string;
  type: EmailType;
  templateId?: string | null;
  subject: string;
  message: string;
  htmlBody?: string | null;
  attachments: string[];
  variables?: any;
  filters?: any;
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  failedCount: number;
  bouncedCount: number;
  scheduledAt?: string | null;
  sentAt?: string | null;
  completedAt?: string | null;
  priority: number;
  sentBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CandidateEmail {
  id: string;
  emailId: string;
  candidateId: string;
  recipientEmail: string;
  recipientName: string;
  personalizedSubject: string;
  personalizedMessage: string;
  personalizedHtmlBody?: string | null;
  status: EmailStatus;
  sentAt?: string | null;
  failedAt?: string | null;
  failureReason?: string | null;
  smtpResponse?: string | null;
  messageId?: string | null;
  retryCount: number;
  maxRetries: number;
  createdAt: string;
  updatedAt: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  description?: string | null;
  category: TemplateCategory;
  subject: string;
  body: string;
  htmlBody?: string | null;
  variables: string[];
  defaultValues?: any;
  previewData?: any;
  attachments: string[];
  usageCount: number;
  lastUsedAt?: string | null;
  isActive: boolean;
  isDefault: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== EMAIL DTOs ====================

export interface CreateEmailDto {
  jdId: string;
  type?: EmailType;
  templateId?: string;
  subject: string;
  message: string;
  htmlBody?: string;
  attachments?: string[];
  variables?: Record<string, any>;
  filters?: Record<string, any>;
  candidateIds?: string[];
  scheduledAt?: string;
  priority?: number;
  sentBy?: string;
}

export interface UpdateEmailDto {
  subject?: string;
  message?: string;
  htmlBody?: string;
  attachments?: string[];
  variables?: Record<string, any>;
  scheduledAt?: string;
  priority?: number;
}

export interface SendEmailResponse {
  emailId: string;
  totalRecipients: number;
  status: 'pending' | 'scheduled' | 'processing' | 'sent';
  message: string;
  scheduledAt?: string;
}

export interface EmailStats {
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  failedCount: number;
  bouncedCount: number;
  pendingCount: number;
  successRate: number;
}

export interface EmailWithRelations extends Email {
  jd?: {
    id: string;
    title: string;
    department?: string;
  };
  template?: EmailTemplate | null;
  sender?: {
    id: string;
    name: string;
    email: string;
  };
  recipients?: CandidateEmail[];
  stats?: EmailStats;
}

export interface CandidateEmailWithRelations extends CandidateEmail {
  email?: {
    id: string;
    subject: string;
    type: EmailType;
  };
  candidate?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface TemplateVariables {
  [key: string]: string | number | boolean;
}

export interface EmailFilters {
  stageId?: string | string[];
  isEligible?: boolean;
  minCGPA?: number;
  passOutYear?: number | number[];
  college?: string | string[];
  degree?: string | string[];
  applicationStatus?: string | string[];
  [key: string]: any;
}

export interface CreateTemplateDto {
  name: string;
  description?: string;
  category: TemplateCategory;
  subject: string;
  body: string;
  htmlBody?: string;
  variables?: string[];
  defaultValues?: Record<string, any>;
  previewData?: Record<string, any>;
  attachments?: string[];
  isDefault?: boolean;
}

export interface UpdateTemplateDto {
  name?: string;
  description?: string;
  category?: TemplateCategory;
  subject?: string;
  body?: string;
  htmlBody?: string;
  variables?: string[];
  defaultValues?: Record<string, any>;
  previewData?: Record<string, any>;
  attachments?: string[];
  isActive?: boolean;
  isDefault?: boolean;
}

export interface TemplatePreviewDto {
  templateId: string;
  variables?: Record<string, any>;
}

export interface TemplatePreviewResponse {
  subject: string;
  body: string;
  htmlBody?: string;
}

export interface EmailQueryParams {
  jdId?: string;
  type?: EmailType;
  status?: EmailStatus;
  sentBy?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'sentAt' | 'priority';
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface TemplateQueryParams {
  category?: TemplateCategory;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'category' | 'usageCount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface EmailListResponse {
  data: EmailWithRelations[];
  pagination: Pagination;
}

export interface TemplateListResponse {
  templates: EmailTemplate[];
  pagination: Pagination;
}

export interface CandidateEmailListResponse {
  emails: CandidateEmailWithRelations[];
  pagination: Pagination;
}

export interface SendIndividualEmailDto {
  candidateId: string;
  jdId: string;
  templateId?: string;
  subject: string;
  message: string;
  htmlBody?: string;
  attachments?: string[];
  variables?: Record<string, any>;
}

export interface SendBulkEmailDto {
  jdId: string;
  templateId?: string;
  subject: string;
  message: string;
  htmlBody?: string;
  attachments?: string[];
  variables?: Record<string, any>;
  filters?: EmailFilters;
  candidateIds?: string[];
}

export interface EmailSendingResult {
  candidateEmailId: string;
  candidateId: string;
  candidateName: string;
  recipientEmail: string;
  status: 'success' | 'failed';
  error?: string;
}

export interface BulkEmailProgress {
  emailId: string;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  inProgress: boolean;
  results: EmailSendingResult[];
}

// ==================== FEEDBACK TYPES ====================

export type FeedbackRecommendation = 'STRONG_YES' | 'YES' | 'MAYBE' | 'NO';

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
  recommendation?: FeedbackRecommendation;
  createdAt: string;
  updatedAt: string;
  givenBy?: {
    id: string;
    name: string;
    email: string;
  };
  candidate?: Candidate;
}

export interface CreateFeedbackData {
  candidateId: string;
  rating: number;
  comments: string;
  technicalSkills?: number;
  communication?: number;
  cultureFit?: number;
  problemSolving?: number;
  recommendation?: FeedbackRecommendation;
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

export interface FormState<T> {
  data: T;
  loading: boolean;
  error: string | null;
  success: boolean;
}

export interface ListResponse<T> {
  items: T[];
  pagination: Pagination;
}

export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiRequestConfig {
  method: ApiMethod;
  url: string;
  data?: any;
  params?: any;
  headers?: Record<string, string>;
}

// ==================== OFFER & SCORE UPDATES ====================

export interface BulkUpdateOffersData {
  candidateIds: string[];
  offerStatus: OfferStatus;
}

export interface UpdateOfferStatusData {
  offerStatus: OfferStatus;
  offerLetterUrl?: string;
  offeredCTC?: number;
  joiningDate?: string;
}

export interface UpdateScoresData {
  interviewScore?: number;
  technicalScore?: number;
  hrScore?: number;
  overallRating?: number;
}

export interface SkillsFilterParams {
  skills: string; // Comma-separated
  matchAll?: boolean;
}
