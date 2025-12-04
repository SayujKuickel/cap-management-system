"use client";

import { useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import documentService, { type DocumentType, type OcrResult } from "@/service/document.service";
import type { ServiceResponse } from "@/types/service";
import type { QueryValue } from "@/service/service-helpers";
import { useApplicationFormDataStore } from "@/store/useApplicationFormData.store";

// Types
type UploadDocumentParams = {
  application_id: string;
  document_type_id: string;
  file: File;
};

type VerifyDocumentParams = Record<string, unknown>;

type ListApplicationDocumentsParams = Record<string, QueryValue>;

// Query hooks
export const useDocumentTypesQuery = () => {
  return useQuery<ServiceResponse<DocumentType[]>, Error>({
    queryKey: ["document-types"],
    queryFn: async () => {
      const response = await documentService.getDocumentTypes();
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch document types");
      }
      return response;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes - document types rarely change
  });
};

export const useDocumentOcrQuery = (applicationId: string | null) => {
  const populateFromOcrResult = useApplicationFormDataStore(
    (state) => state.populateFromOcrResult
  );
  const processedDataRef = useRef<string | null>(null);

  const query = useQuery<ServiceResponse<OcrResult>, Error>({
    queryKey: ["document-ocr", applicationId],
    queryFn: async () => {
      if (!applicationId) throw new Error("Application ID is required");
      const response = await documentService.getOcrResults(applicationId);
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch OCR results");
      }
      return response;
    },
    enabled: !!applicationId,
    // Poll every 3 seconds if there are pending OCR jobs
    refetchInterval: (query) => {
      const pendingCount = query.state.data?.data?.metadata?.ocr_pending;
      return pendingCount && pendingCount > 0 ? 3000 : false;
    },
  });

  // When OCR data is fetched, populate the store
  useEffect(() => {
    if (query.data?.data) {
      const dataKey = JSON.stringify(query.data.data);
      // Only process if data has changed
      if (processedDataRef.current !== dataKey) {
        populateFromOcrResult(query.data.data);
        processedDataRef.current = dataKey;
      }
    }
  }, [query.data?.data, populateFromOcrResult]);

  return query;
};

export const useDocumentQuery = (
  documentId: string | null,
  includeVersions: boolean = false
) => {
  return useQuery({
    queryKey: ["document", documentId, includeVersions],
    queryFn: async () => {
      if (!documentId) throw new Error("Document ID is required");
      const response = await documentService.getDocument(
        documentId,
        includeVersions
      );
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch document");
      }
      return response;
    },
    enabled: !!documentId,
  });
};

export const useApplicationDocumentsQuery = (applicationId: string | null) => {
  return useQuery({
    queryKey: ["application-documents", applicationId],
    queryFn: async () => {
      if (!applicationId) throw new Error("Application ID is required");
      const response = await documentService.listApplicationDocuments(
        applicationId
      );
      if (!response.success) {
        throw new Error(
          response.message || "Failed to fetch application documents"
        );
      }
      return response;
    },
    enabled: !!applicationId,
    staleTime: 1000 * 10, // 10 seconds - documents can change frequently
  });
};

// Mutation hooks
export const useUploadDocument = () => {
  const queryClient = useQueryClient();
  const populateFromOcrResult = useApplicationFormDataStore(
    (state) => state.populateFromOcrResult
  );

  return useMutation<
    ServiceResponse<{ process_ocr: boolean }>,
    Error,
    UploadDocumentParams
  >({
    mutationFn: async ({ application_id, document_type_id, file }) => {
      const response = await documentService.uploadDocument(
        application_id,
        document_type_id,
        file
      );
      if (!response.success) {
        throw new Error(response.message || "Failed to upload document");
      }
      return response;
    },
    onSuccess: async (response, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: ["application-documents", variables.application_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["document-stats", variables.application_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["autofill-suggestions", variables.application_id],
      });

      // If OCR processing was triggered, fetch and populate OCR data
      if (response.data?.process_ocr) {
        // Invalidate OCR query to trigger refetch
        queryClient.invalidateQueries({
          queryKey: ["document-ocr", variables.application_id],
        });

        // Fetch OCR results after a short delay to allow processing
        setTimeout(async () => {
          try {
            const ocrResponse = await documentService.getOcrResults(
              variables.application_id
            );
            if (ocrResponse.success && ocrResponse.data) {
              // Populate Zustand store with OCR data
              populateFromOcrResult(ocrResponse.data);
              toast.success("Document data extracted and prefilled!");
            }
          } catch (error) {
            console.error("[Document] Failed to fetch OCR results:", error);
            // Don't show error toast - OCR might still be processing
          }
        }, 2000); // Wait 2 seconds before fetching OCR results
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to upload document");
    },
  });
};

// Main hook that exports all document operations
export const useDocuments = (applicationId: string | null) => {
  const uploadDocument = useUploadDocument();

  return {
    // Mutations
    uploadDocument,
  };
};

export default useDocuments;
