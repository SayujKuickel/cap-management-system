import { ApiService } from "@/service/base.service";
import {
  buildQueryString,
  resolveServiceCall,
  type QueryValue,
} from "@/service/service-helpers";
import type { ServiceResponse } from "@/types/service";

export interface DocumentType {
  id: string;
  code: string;
  name: string;
  stage: string;
  is_mandatory: boolean;
  ocr_model_ref: string;
  display_order: number;
}

export interface DocumentVersion {
  id: string;
  document_id: string;
  blob_url: string;
  checksum: string;
  file_size_bytes: number;
  version_number: number;
  ocr_json: Record<string, unknown>;
  preview_url: string;
  created_at: string;
}

export interface Document {
  id: string;
  application_id: string;
  document_type_id: string;
  status: "pending" | "approved" | "rejected";
  uploaded_by: string;
  uploaded_at: string;
  ocr_status: "pending" | "processing" | "completed" | "failed";
  ocr_completed_at: string | null;
  gs_document_requests: Record<string, unknown>[];
  document_type: DocumentType;
  versions: DocumentVersion[];
  latest_version: DocumentVersion;
  uploader_email: string;
  uploader_name: string;
}

export interface ApplicationDocumentListItem {
  id: string;
  application_id: string;
  document_type_id: string;
  document_type_name: string;
  document_type_code: string;
  status: "pending" | "approved" | "rejected";
  ocr_status: "pending" | "processing" | "completed" | "failed";
  uploaded_at: string;
  uploaded_by: string;
  uploader_email: string;
  file_size_bytes: number;
  latest_version_id: string;
}

export interface OcrSectionData {
  source_document_id: string;
  document_type: string;
  document_name: string;
  extracted_data: Record<string, unknown>;
  confidence_scores: Record<string, number>;
}

export interface OcrResult {
  application_id: string;
  sections: {
    personal_details?: OcrSectionData;
    language_cultural?: OcrSectionData;
    emergency_contacts?: OcrSectionData;
    health_cover?: OcrSectionData;
    disability_support?: OcrSectionData;
    schooling_history?: OcrSectionData[];
    qualifications?: OcrSectionData[];
    employment_history?: OcrSectionData[];
    usi?: OcrSectionData;
    additional_services?: OcrSectionData;
    survey_responses?: OcrSectionData;
    [key: string]: OcrSectionData | OcrSectionData[] | undefined;
  };
  metadata: {
    total_documents: number;
    ocr_completed: number;
    ocr_pending: number;
    ocr_failed: number;
    [key: string]: boolean | number;
  };
}

class DocumentService extends ApiService {
  private readonly basePath = "documents";

  uploadDocument(
    application_id: string,
    document_type_id: string,
    file: File
  ): Promise<ServiceResponse<{ process_ocr: boolean }>> {
    try {
      if (!application_id) throw new Error("Application id is required");
      if (!document_type_id) throw new Error("Document type id is required");
      if (!file) throw new Error("File is required");

      const formData = new FormData();
      formData.append("application_id", application_id);
      formData.append("document_type_id", document_type_id);
      formData.append("file", file);

      return resolveServiceCall<{ process_ocr: boolean }>(
        () =>
          this.post(`${this.basePath}/upload`, formData, true, {
            headers: { "Content-Type": "multipart/form-data" },
          }),
        "Document uploaded successfully.",
        "Failed to upload document"
      );
    } catch (error) {
      return Promise.resolve({
        success: false,
        data: null,
        message:
          error instanceof Error ? error.message : "Failed to upload document",
      });
    }
  }

  getDocumentTypes(): Promise<ServiceResponse<DocumentType[]>> {
    return resolveServiceCall<DocumentType[]>(
      () => this.get(`${this.basePath}/types`, true),
      "Document types fetched successfully.",
      "Failed to fetch document types"
    );
  }

  getOcrResults(applicationId: string): Promise<ServiceResponse<OcrResult>> {
    return resolveServiceCall<OcrResult>(
      () =>
        this.get(
          `${this.basePath}/application/${applicationId}/extracted-data`,
          true
        ),
      "Extracted data fetched successfully.",
      "Failed to fetch extracted data"
    );
  }

  getDocument(
    documentId: string,
    includeVersions: boolean = false
  ): Promise<ServiceResponse<Document>> {
    const queryParams: Record<string, QueryValue> = {
      include_versions: includeVersions,
    };
    const queryString = buildQueryString(queryParams);

    return resolveServiceCall<Document>(
      () => this.get(`${this.basePath}/${documentId}${queryString}`, true),
      "Document fetched successfully.",
      "Failed to fetch document"
    );
  }

  listApplicationDocuments(
    applicationId: string
  ): Promise<ServiceResponse<ApplicationDocumentListItem[]>> {
    return resolveServiceCall<ApplicationDocumentListItem[]>(
      () =>
        this.get(
          `${this.basePath}/application/${applicationId}/list`,
          true
        ),
      "Application documents fetched successfully.",
      "Failed to fetch application documents"
    );
  }
}

const documentService = new DocumentService();
export default documentService;
