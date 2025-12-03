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
}

const documentService = new DocumentService();
export default documentService;
