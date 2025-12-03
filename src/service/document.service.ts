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
  accepts_ocr: boolean;
  display_order: number;
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
}

const documentService = new DocumentService();
export default documentService;
