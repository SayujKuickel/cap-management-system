import { ApiService } from "@/service/base.service";
import { resolveServiceCall } from "@/service/service-helpers";
import type { ServiceResponse } from "@/types/service";

type Payload = Record<string, unknown>;

class StaffService extends ApiService {
  private readonly basePath = "staff";

  getMetrics(): Promise<ServiceResponse<unknown>> {
    return resolveServiceCall<unknown>(
      () => this.get(`${this.basePath}/metrics`, true),
      "Staff metrics fetched.",
      "Failed to fetch staff metrics",
    );
  }

  getAllMetrics(): Promise<ServiceResponse<unknown>> {
    return resolveServiceCall<unknown>(
      () => this.get(`${this.basePath}/metrics/all`, true),
      "Organization metrics fetched.",
      "Failed to fetch organization metrics",
    );
  }

  getPendingApplications(): Promise<ServiceResponse<unknown>> {
    return resolveServiceCall<unknown>(
      () => this.get(`${this.basePath}/applications/pending`, true),
      "Pending applications fetched.",
      "Failed to fetch pending applications",
    );
  }

  getApplicationForReview(
    applicationId: string,
  ): Promise<ServiceResponse<unknown>> {
    if (!applicationId) throw new Error("Application id is required");
    return resolveServiceCall<unknown>(
      () => this.get(`${this.basePath}/applications/${applicationId}`, true),
      "Application details fetched.",
      "Failed to fetch application details",
    );
  }

  getPendingDocuments(): Promise<ServiceResponse<unknown>> {
    return resolveServiceCall<unknown>(
      () => this.get(`${this.basePath}/documents/pending`, true),
      "Pending documents fetched.",
      "Failed to fetch pending documents",
    );
  }

  verifyDocument(
    documentId: string,
    payload: Payload,
  ): Promise<ServiceResponse<unknown>> {
    if (!documentId) throw new Error("Document id is required");
    return resolveServiceCall<unknown>(
      () =>
        this.patch(`${this.basePath}/documents/${documentId}/verify`, payload, true),
      "Document verification updated.",
      "Failed to update document verification",
    );
  }

  assignApplication(
    applicationId: string,
    payload: Payload,
  ): Promise<ServiceResponse<unknown>> {
    if (!applicationId) throw new Error("Application id is required");
    return resolveServiceCall<unknown>(
      () =>
        this.patch(
          `${this.basePath}/applications/${applicationId}/assign`,
          payload,
          true,
        ),
      "Application assignment updated.",
      "Failed to assign application",
    );
  }

  transitionApplication(
    applicationId: string,
    payload: Payload,
  ): Promise<ServiceResponse<unknown>> {
    if (!applicationId) throw new Error("Application id is required");
    return resolveServiceCall<unknown>(
      () =>
        this.patch(
          `${this.basePath}/applications/${applicationId}/transition`,
          payload,
          true,
        ),
      "Application stage transitioned.",
      "Failed to transition application",
    );
  }

  addComment(
    applicationId: string,
    payload: Payload,
  ): Promise<ServiceResponse<unknown>> {
    if (!applicationId) throw new Error("Application id is required");
    return resolveServiceCall<unknown>(
      () =>
        this.post(
          `${this.basePath}/applications/${applicationId}/comments`,
          payload,
          true,
        ),
      "Comment added.",
      "Failed to add comment",
    );
  }

  requestDocuments(
    applicationId: string,
    payload: Payload,
  ): Promise<ServiceResponse<unknown>> {
    if (!applicationId) throw new Error("Application id is required");
    return resolveServiceCall<unknown>(
      () =>
        this.post(
          `${this.basePath}/applications/${applicationId}/request-documents`,
          payload,
          true,
        ),
      "Document request sent.",
      "Failed to request documents",
    );
  }

  approveApplication(
    applicationId: string,
    payload: Payload,
  ): Promise<ServiceResponse<unknown>> {
    if (!applicationId) throw new Error("Application id is required");
    return resolveServiceCall<unknown>(
      () =>
        this.post(
          `${this.basePath}/applications/${applicationId}/approve`,
          payload,
          true,
        ),
      "Application approved.",
      "Failed to approve application",
    );
  }

  rejectApplication(
    applicationId: string,
    payload: Payload,
  ): Promise<ServiceResponse<unknown>> {
    if (!applicationId) throw new Error("Application id is required");
    return resolveServiceCall<unknown>(
      () =>
        this.post(
          `${this.basePath}/applications/${applicationId}/reject`,
          payload,
          true,
        ),
      "Application rejected.",
      "Failed to reject application",
    );
  }

  recordGsAssessment(
    applicationId: string,
    payload: Payload,
  ): Promise<ServiceResponse<unknown>> {
    if (!applicationId) throw new Error("Application id is required");
    return resolveServiceCall<unknown>(
      () =>
        this.post(
          `${this.basePath}/applications/${applicationId}/gs-assessment`,
          payload,
          true,
        ),
      "GS assessment recorded.",
      "Failed to record GS assessment",
    );
  }

  generateOfferLetter(
    applicationId: string,
    payload: Payload,
  ): Promise<ServiceResponse<unknown>> {
    if (!applicationId) throw new Error("Application id is required");
    return resolveServiceCall<unknown>(
      () =>
        this.post(
          `${this.basePath}/applications/${applicationId}/generate-offer-letter`,
          payload,
          true,
        ),
      "Offer letter generated.",
      "Failed to generate offer letter",
    );
  }
}

const staffService = new StaffService();
export default staffService;
