// User & Authentication Types
export enum Role {
  SUPER_ADMIN = 'super_admin',
  STAFF_ADMIN = 'staff_admin',
  STAFF_REVIEWER = 'staff_reviewer',
  AGENT = 'agent',
  STUDENT = 'student',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  agentId?: string;
  staffId?: string;
  createdAt: string;
  updatedAt: string;
}

// Application Types
export enum ApplicationStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  OFFER_SENT = 'offer_sent',
  OFFER_ACCEPTED = 'offer_accepted',
  GS_DOCUMENTS_PENDING = 'gs_documents_pending',
  GS_INTERVIEW_SCHEDULED = 'gs_interview_scheduled',
  GS_APPROVED = 'gs_approved',
  FEE_PAYMENT_PENDING = 'fee_payment_pending',
  COE_ISSUED = 'coe_issued',
  REJECTED = 'rejected',
}

export enum ApplicationStage {
  INITIAL_REVIEW = 'initial_review',
  DOCUMENT_VERIFICATION = 'document_verification',
  OFFER_GENERATION = 'offer_generation',
  OFFER_ACCEPTANCE = 'offer_acceptance',
  GS_ASSESSMENT = 'gs_assessment',
  FEE_PAYMENT = 'fee_payment',
  COE_GENERATION = 'coe_generation',
  COMPLETED = 'completed',
}

export interface Application {
  id: string;
  referenceNumber: string;
  agentId: string;
  agentName: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  status: ApplicationStatus;
  currentStage: ApplicationStage;
  assignedStaffId?: string;
  assignedStaffName?: string;
  submittedAt: string;
  updatedAt: string;
  passport?: PassportData;
  academicDocuments?: AcademicDocument[];
  englishTest?: EnglishTestData;
  destination: string;
  course: string;
  intake: string;
}

// Document Types
export enum DocumentType {
  PASSPORT = 'passport',
  SLC_TRANSCRIPT = 'slc_transcript',
  HSC_TRANSCRIPT = 'hsc_transcript',
  BACHELOR_TRANSCRIPT = 'bachelor_transcript',
  ENGLISH_TEST = 'english_test',
  OTHER = 'other',
}

export interface Document {
  id: string;
  applicationId: string;
  type: DocumentType;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  ocrData?: Record<string, unknown>;
  uploadedAt: string;
  uploadedBy: string;
}

export interface PassportData {
  passportNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  issueDate: string;
  expiryDate: string;
  placeOfBirth: string;
  confidence?: number;
}

export interface AcademicDocument {
  type: 'SLC' | 'HSC' | 'Bachelor' | 'Other';
  institution: string;
  yearOfPassing: string;
  grade: string;
  documentUrl: string;
}

export interface EnglishTestData {
  testType: 'IELTS' | 'PTE' | 'DUOLINGO' | 'TOEFL';
  overallScore: number;
  listening?: number;
  reading?: number;
  writing?: number;
  speaking?: number;
  testDate: string;
  documentUrl: string;
}

// GS Document Types
export enum GSDocumentCategory {
  FINANCIAL = 'financial',
  RELATION_PROOF = 'relation_proof',
  TAX_RELATED = 'tax_related',
  INCOME_DOCUMENT = 'income_document',
  BUSINESS_INCOME = 'business_income',
  CIHE_GS_FORM_AGENT = 'cihe_gs_form_agent',
  GS_FORM_STUDENT = 'gs_form_student',
  OTHER = 'other',
}

export interface GSDocument {
  id: string;
  applicationId: string;
  category: GSDocumentCategory;
  fileName: string;
  fileUrl: string;
  uploadedBy: string;
  uploadedByRole: 'agent' | 'student' | 'staff';
  uploadedAt: string;
  verified: boolean;
}

// Interview Types
export enum InterviewOutcome {
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REQUEST_MORE_INFO = 'request_more_info',
}

export interface Interview {
  id: string;
  applicationId: string;
  scheduledAt: string;
  conductedBy: string;
  conductedByName: string;
  meetingLink?: string;
  assessmentForm?: InterviewAssessment;
  outcome?: InterviewOutcome;
  notes?: string;
  completedAt?: string;
}

export interface InterviewAssessment {
  genuineIntent: number; // 1-5
  financialCapacity: number;
  academicBackground: number;
  englishProficiency: number;
  careerPlans: number;
  overallImpression: number;
  redFlags: string[];
  strengths: string[];
}

// Offer Types
export enum OfferStatus {
  PENDING = 'pending',
  SENT = 'sent',
  VIEWED = 'viewed',
  SIGNED = 'signed',
  DECLINED = 'declined',
}

export interface Offer {
  id: string;
  applicationId: string;
  offerLetterUrl: string;
  sentAt: string;
  viewedAt?: string;
  signedAt?: string;
  signature?: string;
  status: OfferStatus;
  expiryDate: string;
}

// COE Types
export interface COE {
  id: string;
  applicationId: string;
  coeNumber: string;
  coeUrl: string;
  uploadedBy: string;
  uploadedAt: string;
  sentToAgent: boolean;
  sentToAgentAt?: string;
  downloaded: boolean;
  downloadedAt?: string;
}

// Activity Types
export interface Activity {
  id: string;
  applicationId: string;
  action: string;
  description: string;
  performedBy: string;
  performedByName: string;
  performedByRole: Role;
  performedAt: string;
  metadata?: Record<string, unknown>;
}

// Dashboard Metrics
export interface AgentDashboardMetrics {
  totalApplications: number;
  pending: number;
  approved: number;
  rejected: number;
  gsStage: number;
  coeIssued: number;
}

export interface StaffDashboardMetrics {
  assignedApplications: number;
  pendingReviews: number;
  interviewsScheduled: number;
  tasksToday: number;
  avgProcessingTime: number;
}

// Notification Types
export enum NotificationType {
  ACTION_REQUIRED = 'action_required',
  STATUS_UPDATE = 'status_update',
  DOCUMENT_REQUEST = 'document_request',
  INTERVIEW_SCHEDULED = 'interview_scheduled',
  OFFER_READY = 'offer_ready',
  SYSTEM = 'system',
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  applicationId?: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

// Filter Types
export interface ApplicationFilters {
  status?: ApplicationStatus[];
  dateRange?: {
    from: string;
    to: string;
  };
  searchQuery?: string;
  destination?: string;
  assignedStaff?: string;
  agentId?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
