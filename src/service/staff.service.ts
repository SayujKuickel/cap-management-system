import { ApiService } from "@/service/base.service";
import { handleApiError } from "@/utils/handle-api-error";
import type { ServiceResponse } from "@/types/service";
import type { ApplicationDetailResponse } from "@/service/application.service";
import type { Application, Document } from "@/constants/types";

// --- Request Payloads ---

export interface VerifyDocumentPayload {
  status: "VERIFIED" | "REJECTED";
  notes?: string;
}

export interface AssignApplicationPayload {
  staff_id: string;
}

export interface TransitionApplicationPayload {
  to_stage: string;
  notes?: string;
}

export interface AddCommentPayload {
  comment: string;
  is_internal?: boolean;
}

export interface RequestDocumentsPayload {
  document_type_codes: string[];
  message: string;
  due_date?: string;
}

export interface ApproveApplicationPayload {
  offer_details: Record<string, unknown>;
  notes?: string;
}

export interface RejectApplicationPayload {
  rejection_reason: string;
  is_appealable?: boolean;
}

export interface RecordGsAssessmentPayload {
  interview_date: string;
  decision: "pass" | "fail" | "pending";
  scorecard: Record<string, number>;
  notes?: string;
}

export interface GenerateOfferLetterPayload {
  course_start_date: string;
  tuition_fee: number;
  material_fee: number;
  conditions: string[];
  template?: string;
}

// --- Response Types ---

export interface DocumentVerificationResponse {
  document_id: string;
  status: string;
  verified_at: string;
  message: string;
}

export interface ApplicationActionResponse {
  application_id: string;
  current_stage: string;
  message: string;
  updated_at: string;
}

export interface CommentResponse {
  timeline_entry_id: string;
  application_id: string;
  comment: string;
  created_at: string;
}

export interface OfferLetterResponse {
  application_id: string;
  offer_letter_url: string;
  generated_at: string;
  expires_at: string;
}

export interface StaffMetrics {
  total_applications: number;
  submitted_pending_review: number;
  in_staff_review: number;
  awaiting_documents: number;
  in_gs_assessment: number;
  offers_generated: number;
  enrolled: number;
  rejected: number;
  documents_pending_verification: number;
}

class StaffService extends ApiService {
  private readonly basePath = "staff";

  getMetrics = async (): Promise<ServiceResponse<StaffMetrics>> => {
    try {
      const data = await this.get<StaffMetrics>(`${this.basePath}/metrics`, true);
      return {
        success: true,
        message: "Staff metrics fetched.",
        data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to fetch staff metrics");
    }
  };

  getAllMetrics = async (): Promise<ServiceResponse<StaffMetrics>> => {
    try {
      const data = await this.get<StaffMetrics>(
        `${this.basePath}/metrics/all`,
        true
      );
      return {
        success: true,
        message: "Organization metrics fetched.",
        data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to fetch organization metrics");
    }
  };

  getPendingApplications = async (): Promise<
    ServiceResponse<Application[]>
  > => {
    try {
      const data = await this.get<Application[]>(
        `${this.basePath}/applications/pending`,
        true
      );
      return {
        success: true,
        message: "Pending applications fetched.",
        data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to fetch pending applications", []);
    }
  };

  getApplicationForReview = async (
    applicationId: string
  ): Promise<ServiceResponse<ApplicationDetailResponse>> => {
    if (!applicationId) throw new Error("Application id is required");
    try {
      const data = await this.get<ApplicationDetailResponse>(
        `${this.basePath}/applications/${applicationId}`,
        true
      );
      return {
        success: true,
        message: "Application details fetched.",
        data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to fetch application details");
    }
  };

  getPendingDocuments = async (): Promise<ServiceResponse<Document[]>> => {
    try {
      const data = await this.get<Document[]>(
        `${this.basePath}/documents/pending`,
        true
      );
      return {
        success: true,
        message: "Pending documents fetched.",
        data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to fetch pending documents", []);
    }
  };

  verifyDocument = async (
    documentId: string,
    payload: VerifyDocumentPayload
  ): Promise<ServiceResponse<DocumentVerificationResponse>> => {
    if (!documentId) throw new Error("Document id is required");
    try {
      const data = await this.patch<DocumentVerificationResponse>(
        `${this.basePath}/documents/${documentId}/verify`,
        payload,
        true
      );
      return {
        success: true,
        message: "Document verification updated.",
        data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to update document verification");
    }
  };

  assignApplication = async (
    applicationId: string,
    payload: AssignApplicationPayload
  ): Promise<ServiceResponse<ApplicationActionResponse>> => {
    if (!applicationId) throw new Error("Application id is required");
    try {
      const data = await this.patch<ApplicationActionResponse>(
        `${this.basePath}/applications/${applicationId}/assign`,
        payload,
        true
      );
      return {
        success: true,
        message: "Application assignment updated.",
        data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to assign application");
    }
  };

  transitionApplication = async (
    applicationId: string,
    payload: TransitionApplicationPayload
  ): Promise<ServiceResponse<ApplicationActionResponse>> => {
    if (!applicationId) throw new Error("Application id is required");
    try {
      const data = await this.patch<ApplicationActionResponse>(
        `${this.basePath}/applications/${applicationId}/transition`,
        payload,
        true
      );
      return {
        success: true,
        message: "Application stage transitioned.",
        data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to transition application");
    }
  };

  addComment = async (
    applicationId: string,
    payload: AddCommentPayload
  ): Promise<ServiceResponse<CommentResponse>> => {
    if (!applicationId) throw new Error("Application id is required");
    try {
      const data = await this.post<CommentResponse>(
        `${this.basePath}/applications/${applicationId}/comments`,
        payload,
        true
      );
      return {
        success: true,
        message: "Comment added.",
        data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to add comment");
    }
  };

  requestDocuments = async (
    applicationId: string,
    payload: RequestDocumentsPayload
  ): Promise<ServiceResponse<ApplicationActionResponse>> => {
    if (!applicationId) throw new Error("Application id is required");
    try {
      const data = await this.post<ApplicationActionResponse>(
        `${this.basePath}/applications/${applicationId}/request-documents`,
        payload,
        true
      );
      return {
        success: true,
        message: "Document request sent.",
        data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to request documents");
    }
  };

  approveApplication = async (
    applicationId: string,
    payload: ApproveApplicationPayload
  ): Promise<ServiceResponse<ApplicationActionResponse>> => {
    if (!applicationId) throw new Error("Application id is required");
    try {
      const data = await this.post<ApplicationActionResponse>(
        `${this.basePath}/applications/${applicationId}/approve`,
        payload,
        true
      );
      return {
        success: true,
        message: "Application approved.",
        data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to approve application");
    }
  };

  rejectApplication = async (
    applicationId: string,
    payload: RejectApplicationPayload
  ): Promise<ServiceResponse<ApplicationActionResponse>> => {
    if (!applicationId) throw new Error("Application id is required");
    try {
      const data = await this.post<ApplicationActionResponse>(
        `${this.basePath}/applications/${applicationId}/reject`,
        payload,
        true
      );
      return {
        success: true,
        message: "Application rejected.",
        data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to reject application");
    }
  };

  recordGsAssessment = async (
    applicationId: string,
    payload: RecordGsAssessmentPayload
  ): Promise<ServiceResponse<ApplicationActionResponse>> => {
    if (!applicationId) throw new Error("Application id is required");
    try {
      const data = await this.post<ApplicationActionResponse>(
        `${this.basePath}/applications/${applicationId}/gs-assessment`,
        payload,
        true
      );
      return {
        success: true,
        message: "GS assessment recorded.",
        data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to record GS assessment");
    }
  };

  generateOfferLetter = async (
    applicationId: string,
    payload: GenerateOfferLetterPayload
  ): Promise<ServiceResponse<OfferLetterResponse>> => {
    if (!applicationId) throw new Error("Application id is required");
    try {
      const data = await this.post<OfferLetterResponse>(
        `${this.basePath}/applications/${applicationId}/generate-offer-letter`,
        payload,
        true
      );
      return {
        success: true,
        message: "Offer letter generated.",
        data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to generate offer letter");
    }
  };
}

const staffService = new StaffService();
export default staffService;

