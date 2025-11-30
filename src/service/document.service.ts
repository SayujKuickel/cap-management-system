import { ApiService } from "@/service/base.service";
import {
  buildQueryString,
  resolveServiceCall,
  type QueryValue,
} from "@/service/service-helpers";
import type { ServiceResponse } from "@/types/service";

class DocumentService extends ApiService {
  private readonly basePath = "documents";

  uploadDocument(formData: FormData): Promise<ServiceResponse<unknown>> {
    return resolveServiceCall<unknown>(
      () =>
        this.post(
          `${this.basePath}/upload`,
          formData,
          true,
          { headers: { "Content-Type": "multipart/form-data" } },
        ),
      "Document uploaded successfully.",
      "Failed to upload document",
    );
  }

  getDocumentTypes(): Promise<ServiceResponse<unknown>> {
    return resolveServiceCall<unknown>(
      () => this.get(`${this.basePath}/types`, true),
      "Document types fetched.",
      "Failed to fetch document types",
    );
  }

  getDocument(documentId: string): Promise<ServiceResponse<unknown>> {
    if (!documentId) throw new Error("Document id is required");
    return resolveServiceCall<unknown>(
      () => this.get(`${this.basePath}/${documentId}`, true),
      "Document fetched.",
      "Failed to fetch document",
    );
  }

  deleteDocument(documentId: string): Promise<ServiceResponse<unknown>> {
    if (!documentId) throw new Error("Document id is required");
    return resolveServiceCall<unknown>(
      () => this.delete(`${this.basePath}/${documentId}`, true),
      "Document deleted.",
      "Failed to delete document",
    );
  }

  getOcr(documentId: string): Promise<ServiceResponse<unknown>> {
    if (!documentId) throw new Error("Document id is required");
    return resolveServiceCall<unknown>(
      () => this.get(`${this.basePath}/${documentId}/ocr`, true),
      "OCR results fetched.",
      "Failed to fetch OCR results",
    );
  }

  verifyDocument(
    documentId: string,
    payload: Record<string, unknown>,
  ): Promise<ServiceResponse<unknown>> {
    if (!documentId) throw new Error("Document id is required");
    return resolveServiceCall<unknown>(
      () => this.post(`${this.basePath}/${documentId}/verify`, payload, true),
      "Document verification saved.",
      "Failed to verify document",
    );
  }

  listApplicationDocuments(
    applicationId: string,
    params: Record<string, QueryValue> = {},
  ): Promise<ServiceResponse<unknown>> {
    if (!applicationId) throw new Error("Application id is required");
    const query = buildQueryString(params);
    return resolveServiceCall<unknown>(
      () =>
        this.get(
          `${this.basePath}/application/${applicationId}/list${query}`,
          true,
        ),
      "Application documents fetched.",
      "Failed to fetch application documents",
    );
  }

  getAutofillSuggestions(
    applicationId: string,
  ): Promise<ServiceResponse<unknown>> {
    if (!applicationId) throw new Error("Application id is required");
    return resolveServiceCall<unknown>(
      () =>
        this.get(
          `${this.basePath}/application/${applicationId}/autofill`,
          true,
        ),
      "Autofill suggestions fetched.",
      "Failed to fetch autofill suggestions",
    );
  }

  getDocumentStats(applicationId: string): Promise<ServiceResponse<unknown>> {
    if (!applicationId) throw new Error("Application id is required");
    return resolveServiceCall<unknown>(
      () =>
        this.get(
          `${this.basePath}/application/${applicationId}/stats`,
          true,
        ),
      "Document stats fetched.",
      "Failed to fetch document stats",
    );
  }

  reprocessOcr(documentId: string): Promise<ServiceResponse<unknown>> {
    if (!documentId) throw new Error("Document id is required");
    return resolveServiceCall<unknown>(
      () =>
        this.post(`${this.basePath}/${documentId}/reprocess-ocr`, {}, true),
      "OCR reprocessing triggered.",
      "Failed to reprocess OCR",
    );
  }
}

const documentService = new DocumentService();
export default documentService;
