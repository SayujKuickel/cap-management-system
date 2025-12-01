"use client";

import { useState, useMemo, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Upload, X, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { useDocuments } from "@/hooks/document.hook";
import ApplicationStepHeader from "./application-step-header";
import { useApplicationStepStore } from "@/store/useApplicationStep.store";
import { usePersistence } from "@/hooks/usePersistance.hook";
import { documentTypes } from "@/data/document-types.data";
import { toast } from "react-hot-toast";

// Sort document types by display_order
const sortedDocumentTypes = [...documentTypes].sort(
  (a, b) => a.display_order - b.display_order
);

type DocumentUploadState = {
  documentTypeId: string;
  files: File[];
  uploaded: boolean;
};

type DocumentsFormValues = {
  documents: Record<string, DocumentUploadState>;
};

const defaultDocumentsFormValues: DocumentsFormValues = {
  documents: {},
};

export default function DocumentsUploadForm() {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("applicationId");
  const stepId = 1; // Documents is step 1
  const { uploadDocument } = useDocuments(applicationId);
  const goToNext = useApplicationStepStore((state) => state.goToNext);
  const markStepCompleted = useApplicationStepStore(
    (state) => state.markStepCompleted
  );
  const { getStepData, saveStepData } = usePersistence(applicationId);

  // Initialize document states from document types
  const [documentStates, setDocumentStates] = useState<
    Record<string, DocumentUploadState>
  >(() => {
    const initial: Record<string, DocumentUploadState> = {};
    sortedDocumentTypes.forEach((docType) => {
      initial[docType.id] = {
        documentTypeId: docType.id,
        files: [],
        uploaded: false,
      };
    });
    return initial;
  });

  const methods = useForm<DocumentsFormValues>({
    defaultValues: defaultDocumentsFormValues,
  });

  // Load persisted data (metadata only - File objects can't be restored from localStorage)
  useEffect(() => {
    if (!applicationId) return;

    const persistedData = getStepData<{ documents: Record<string, { documentTypeId: string; fileCount: number; uploaded: boolean }> }>(stepId);
    if (persistedData && persistedData.documents) {
      // Restore upload status - files are already uploaded to API, so we just track that
      setDocumentStates((prev) => {
        const updated = { ...prev };
        Object.keys(persistedData.documents).forEach((key) => {
          const metadata = persistedData.documents[key];
          if (updated[key]) {
            updated[key] = {
              ...updated[key],
              uploaded: metadata.uploaded,
              // Files array stays empty - files are already uploaded to API
            };
          }
        });
        return updated;
      });
    }
  }, [applicationId, stepId, getStepData]);

  // Save to persistence when document states change (only metadata, not File objects)
  useEffect(() => {
    if (!applicationId) return;
    
    // Create metadata-only version for persistence (File objects can't be serialized)
    const metadataOnly: Record<string, { documentTypeId: string; fileCount: number; uploaded: boolean }> = {};
    Object.keys(documentStates).forEach((key) => {
      const state = documentStates[key];
      metadataOnly[key] = {
        documentTypeId: state.documentTypeId,
        fileCount: state.files.length,
        uploaded: state.uploaded,
      };
    });
    
    saveStepData(stepId, { documents: metadataOnly });
  }, [documentStates, applicationId, stepId, saveStepData]);

  const handleFileSelect = async (
    documentTypeId: string,
    files: FileList | null
  ) => {
    if (!files || !applicationId) return;

    const fileArray = Array.from(files);

    // Update local state immediately
    setDocumentStates((prev) => ({
      ...prev,
      [documentTypeId]: {
        ...prev[documentTypeId],
        files: [...(prev[documentTypeId]?.files || []), ...fileArray],
      },
    }));

    // Upload each file
    for (const file of fileArray) {
      try {
        await uploadDocument.mutateAsync({
          application_id: applicationId,
          document_type_id: documentTypeId,
          file,
        });

        // Mark as uploaded after successful upload
        setDocumentStates((prev) => ({
          ...prev,
          [documentTypeId]: {
            ...prev[documentTypeId],
            uploaded: true,
          },
        }));
      } catch (error) {
        console.error("Failed to upload document:", error);
        // Remove the file from state if upload failed
        setDocumentStates((prev) => ({
          ...prev,
          [documentTypeId]: {
            ...prev[documentTypeId],
            files: prev[documentTypeId]?.files.filter((f) => f !== file) || [],
          },
        }));
      }
    }
  };

  const handleFileRemove = (documentTypeId: string, fileIndex: number) => {
    setDocumentStates((prev) => ({
      ...prev,
      [documentTypeId]: {
        ...prev[documentTypeId],
        files: prev[documentTypeId]?.files.filter((_, i) => i !== fileIndex),
      },
    }));
  };

  const handleContinue = () => {
    if (!applicationId) return;

    // Check if all mandatory documents are uploaded
    const mandatoryDocs = sortedDocumentTypes.filter((doc) => doc.is_mandatory);
    const missingMandatory = mandatoryDocs.filter((doc) => {
      const state = documentStates[doc.id];
      // A document is valid if it has files (selected/uploading/uploaded)
      return !state || state.files.length === 0;
    });

    // Block continuation if required documents are missing
    if (missingMandatory.length > 0) {
      const missingNames = missingMandatory.map((doc) => doc.name).join(", ");
      toast.error(
        `Please upload all required documents: ${missingNames}`,
        { duration: 5000 }
      );
      return;
    }

    // Save final state
    const metadataOnly: Record<string, { documentTypeId: string; fileCount: number; uploaded: boolean }> = {};
    Object.keys(documentStates).forEach((key) => {
      const state = documentStates[key];
      metadataOnly[key] = {
        documentTypeId: state.documentTypeId,
        fileCount: state.files.length,
        uploaded: state.uploaded,
      };
    });
    
    saveStepData(stepId, { documents: metadataOnly });

    // Mark step as completed and go to next
    markStepCompleted(stepId);
    goToNext();
  };

  // Check if all mandatory documents are uploaded
  const mandatoryDocs = useMemo(
    () => sortedDocumentTypes.filter((doc) => doc.is_mandatory),
    []
  );

  const allMandatoryUploaded = useMemo(
    () =>
      mandatoryDocs.every((doc) => {
        const state = documentStates[doc.id];
        // A document is valid if it has files (selected/uploading/uploaded)
        return state && state.files.length > 0;
      }),
    [mandatoryDocs, documentStates]
  );

  return (
    <FormProvider {...methods}>
      <form className="space-y-6">
        <div className="space-y-4">
          {sortedDocumentTypes.map((docType) => {
            const state = documentStates[docType.id] || {
              documentTypeId: docType.id,
              files: [],
              uploaded: false,
            };

            return (
              <Card key={docType.id}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{docType.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant={docType.is_mandatory ? "destructive" : "secondary"}
                            className="text-xs"
                          >
                            {docType.is_mandatory ? "Required" : "Optional"}
                          </Badge>
                          {docType.accepts_ocr && (
                            <Badge variant="outline" className="text-xs">
                              OCR Enabled
                            </Badge>
                          )}
                          {state.files.length > 0 && (
                            <Badge variant="default" className="text-xs">
                              {state.files.length} File
                              {state.files.length > 1 ? "s" : ""} Uploaded
                            </Badge>
                          )}
                        </div>
                      </div>
                      {state.files.length > 0 && (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      )}
                    </div>

                    <div
                      className={cn(
                        "border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer",
                        docType.is_mandatory && state.files.length === 0
                          ? "border-destructive/40"
                          : "border-muted"
                      )}
                    >
                      <input
                        type="file"
                        id={`file-${docType.id}`}
                        className="hidden"
                        multiple
                        onChange={(e) =>
                          handleFileSelect(docType.id, e.target.files)
                        }
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        disabled={uploadDocument.isPending || !applicationId}
                      />
                      <label
                        htmlFor={`file-${docType.id}`}
                        className="cursor-pointer"
                      >
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Drop files here to upload or click to browse
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Supported: PDF, JPG, PNG, DOC, DOCX
                        </p>
                      </label>
                    </div>

                    {state.files.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Uploaded Files:</p>
                        {state.files.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex items-center gap-2 flex-1">
                              <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                              <span className="text-sm truncate">{file.name}</span>
                              <span className="text-xs text-muted-foreground shrink-0">
                                ({(file.size / 1024).toFixed(2)} KB)
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleFileRemove(docType.id, index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {!allMandatoryUploaded && (
          <div className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">
                Required Documents Missing
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Please upload all required documents before continuing to the next step.
              </p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {mandatoryDocs.map((doc) => {
                  const state = documentStates[doc.id];
                  const isUploaded = state && state.files.length > 0;
                  return (
                    <li
                      key={doc.id}
                      className={cn(
                        "flex items-center gap-2",
                        isUploaded && "text-green-600"
                      )}
                    >
                      {isUploaded ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      )}
                      {doc.name}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}

        <ApplicationStepHeader className="mt-4">
          <Button
            type="button"
            onClick={handleContinue}
            disabled={
              uploadDocument.isPending ||
              !applicationId ||
              !allMandatoryUploaded
            }
          >
            {uploadDocument.isPending
              ? "Uploading..."
              : allMandatoryUploaded
              ? "Save & Continue"
              : "Upload Required Documents"}
          </Button>
        </ApplicationStepHeader>
      </form>
    </FormProvider>
  );
}

