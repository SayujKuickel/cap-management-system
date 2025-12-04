"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDocuments, useDocumentTypesQuery, useDocumentOcrQuery } from "@/hooks/document.hook";
import { useFormPersistence } from "@/hooks/useFormPersistence.hook";
import { cn } from "@/lib/utils";
import { useApplicationStepStore } from "@/store/useApplicationStep.store";
import { useApplicationFormDataStore } from "@/store/useApplicationFormData.store";
import {
  CheckCircle2,
  FileCheck2,
  FileText,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import ApplicationStepHeader from "./application-step-header";

// Types
type FileUploadState = {
  file: File;
  uploading: boolean;
  uploaded: boolean;
  error?: string;
};

type UploadedFileMetadata = {
  fileName: string;
  fileSize: number;
  uploadedAt: string;
};

type DocumentState = {
  documentTypeId: string;
  files: FileUploadState[];
  uploadedFiles: UploadedFileMetadata[]; // Persisted uploaded files
  uploaded: boolean;
};

type DocumentsFormData = {
  documents: Record<
    string,
    {
      documentTypeId: string;
      uploadedFiles: UploadedFileMetadata[];
      uploaded: boolean;
    }
  >;
};

const STEP_ID = 1;

// Helper Functions
const createInitialState = (
  documentTypes: Array<{ id: string }>
): Record<string, DocumentState> => {
  const state: Record<string, DocumentState> = {};
  documentTypes.forEach((docType) => {
    state[docType.id] = {
      documentTypeId: docType.id,
      files: [],
      uploadedFiles: [],
      uploaded: false,
    };
  });
  return state;
};

const hasUploadedFiles = (state: DocumentState): boolean => {
  return state.files.some((f) => f.uploaded) || state.uploadedFiles.length > 0;
};

const isAllMandatoryUploaded = (
  documentStates: Record<string, DocumentState>,
  documentTypes: Array<{ id: string; is_mandatory: boolean }>
): boolean => {
  const mandatoryDocs = documentTypes.filter((doc) => doc.is_mandatory);
  return mandatoryDocs.every((doc) => {
    const state = documentStates[doc.id];
    return state && hasUploadedFiles(state);
  });
};

const convertToFormData = (
  documentStates: Record<string, DocumentState>
): DocumentsFormData => {
  const documents: DocumentsFormData["documents"] = {};
  Object.keys(documentStates).forEach((key) => {
    const state = documentStates[key];
    // Combine newly uploaded files with persisted uploaded files
    const newUploaded = state.files
      .filter((f) => f.uploaded && !f.error)
      .map((f) => ({
        fileName: f.file.name,
        fileSize: f.file.size,
        uploadedAt: new Date().toISOString(),
      }));

    // Merge with existing uploaded files, avoiding duplicates
    const existingUploaded = state.uploadedFiles || [];
    const allUploaded = [
      ...existingUploaded,
      ...newUploaded.filter(
        (newFile) =>
          !existingUploaded.some(
            (existing) =>
              existing.fileName === newFile.fileName &&
              existing.fileSize === newFile.fileSize
          )
      ),
    ];

    documents[key] = {
      documentTypeId: state.documentTypeId,
      uploadedFiles: allUploaded,
      uploaded: allUploaded.length > 0,
    };
  });
  return { documents };
};

// Main Component
export default function DocumentsUploadForm() {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("applicationId");
  const { uploadDocument } = useDocuments(applicationId);
  const {
    data: documentTypesResponse,
    isLoading: isLoadingDocumentTypes,
    error: documentTypesError,
  } = useDocumentTypesQuery();
  
  // Poll for OCR results - this will automatically populate the store when data is available
  useDocumentOcrQuery(applicationId);

  const goToNext = useApplicationStepStore((state) => state.goToNext);
  const markStepCompleted = useApplicationStepStore(
    (state) => state.markStepCompleted
  );

  // Get sorted document types from API - memoized to prevent recreation
  const sortedDocumentTypes = useMemo(() => {
    if (!documentTypesResponse?.data) return [];
    return [...documentTypesResponse.data].sort(
      (a, b) => a.display_order - b.display_order
    );
  }, [documentTypesResponse?.data]);

  // Create a stable key from document types for dependency tracking
  const documentTypesKey = useMemo(() => {
    if (!documentTypesResponse?.data) return "";
    return documentTypesResponse.data
      .map((d) => d.id)
      .sort()
      .join(",");
  }, [documentTypesResponse?.data]);

  const [documentStates, setDocumentStates] = useState<
    Record<string, DocumentState>
  >({});
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const shouldSaveRef = useRef(false);

  const methods = useForm<DocumentsFormData>({
    defaultValues: { documents: {} },
  });

  // Get persisted data from store
  const getStepData = useApplicationFormDataStore((state) => state.getStepData);

  // Use form persistence hook
  const { saveOnSubmit } = useFormPersistence<DocumentsFormData>({
    applicationId,
    stepId: STEP_ID,
    form: methods,
    onDataLoaded: (data) => {
      // Restore uploaded files from persisted data
      if (data?.documents) {
        setDocumentStates((prev) => {
          const updated = { ...prev };
          Object.keys(data.documents).forEach((key) => {
            const persisted = data.documents[key];
            if (updated[key]) {
              updated[key] = {
                ...updated[key],
                uploadedFiles: persisted.uploadedFiles || [],
                uploaded: persisted.uploaded || false,
              };
            } else {
              // If state doesn't exist yet, create it with persisted data
              updated[key] = {
                documentTypeId: key,
                files: [],
                uploadedFiles: persisted.uploadedFiles || [],
                uploaded: persisted.uploaded || false,
              };
            }
          });
          return updated;
        });
      }
    },
  });

  const mandatoryDocs = useMemo(
    () => sortedDocumentTypes.filter((doc) => doc.is_mandatory),
    [sortedDocumentTypes]
  );

  const allMandatoryUploaded = useMemo(
    () => isAllMandatoryUploaded(documentStates, sortedDocumentTypes),
    [documentStates, sortedDocumentTypes]
  );

  const isAnyFileUploading = uploadingFiles.size > 0;

  // Initialize document states when document types are loaded and restore persisted data
  useEffect(() => {
    if (sortedDocumentTypes.length > 0 && applicationId) {
      setDocumentStates((prev) => {
        // Only initialize if not already initialized
        if (Object.keys(prev).length === 0) {
          const initialState = createInitialState(sortedDocumentTypes);
          
          // Try to restore persisted data
          const persistedData = getStepData<DocumentsFormData>(STEP_ID);
          if (persistedData?.documents) {
            // Merge persisted data with initial state
            Object.keys(persistedData.documents).forEach((key) => {
              const persisted = persistedData.documents[key];
              if (initialState[key]) {
                initialState[key] = {
                  ...initialState[key],
                  uploadedFiles: persisted.uploadedFiles || [],
                  uploaded: persisted.uploaded || false,
                };
              }
            });
          }
          
          return initialState;
        }
        return prev;
      });
    }
  }, [documentTypesKey, applicationId, getStepData]); // Use stable key instead of array reference

  // Auto-save form data to Zustand store
  useEffect(() => {
    if (!applicationId || sortedDocumentTypes.length === 0) return;

    const formData = convertToFormData(documentStates);
    methods.setValue("documents", formData.documents);
    
    // Save to Zustand store if flag is set (for immediate saves after upload/remove)
    if (shouldSaveRef.current) {
      saveOnSubmit(formData);
      shouldSaveRef.current = false;
    }

    if (isAllMandatoryUploaded(documentStates, sortedDocumentTypes)) {
      markStepCompleted(STEP_ID);
    }
  }, [
    documentStates,
    applicationId,
    methods,
    markStepCompleted,
    sortedDocumentTypes,
    saveOnSubmit,
  ]);

  // Handle file upload
  const uploadSingleFile = useCallback(
    async (
      documentTypeId: string,
      file: File,
      fileKey: string
    ): Promise<void> => {
      if (!applicationId) return;

      setUploadingFiles((prev) => new Set(prev).add(fileKey));

      try {
        await uploadDocument.mutateAsync({
          application_id: applicationId,
          document_type_id: documentTypeId,
          file,
        });

        setDocumentStates((prev) => {
          const currentFiles = prev[documentTypeId]?.files || [];
          const existingUploaded = prev[documentTypeId]?.uploadedFiles || [];

          const newUploadedFile = {
            fileName: file.name,
            fileSize: file.size,
            uploadedAt: new Date().toISOString(),
          };

          // Check if file already exists to avoid duplicates
          const fileExists = existingUploaded.some(
            (f) => f.fileName === file.name && f.fileSize === file.size
          );

          return {
            ...prev,
            [documentTypeId]: {
              ...prev[documentTypeId],
              files: currentFiles.map((f) =>
                f.file === file ? { ...f, uploading: false, uploaded: true } : f
              ),
              // Add to uploadedFiles when upload succeeds (avoid duplicates)
              uploadedFiles: fileExists
                ? existingUploaded
                : [...existingUploaded, newUploadedFile],
              uploaded: true,
            },
          };
        });

   

        // Mark that we need to save on next useEffect run
        shouldSaveRef.current = true;
      } catch (error) {
        console.error("Upload failed:", error);
        setDocumentStates((prev) => {
          const currentFiles = prev[documentTypeId]?.files || [];
          return {
            ...prev,
            [documentTypeId]: {
              ...prev[documentTypeId],
              files: currentFiles.map((f) =>
                f.file === file
                  ? {
                      ...f,
                      uploading: false,
                      uploaded: false,
                      error: "Upload failed",
                    }
                  : f
              ),
            },
          };
        });
      } finally {
        setUploadingFiles((prev) => {
          const next = new Set(prev);
          next.delete(fileKey);
          return next;
        });
      }
    },
    [applicationId, uploadDocument]
  );

  const handleFileSelect = useCallback(
    async (documentTypeId: string, files: FileList | null) => {
      if (!files || !applicationId) return;

      const fileArray = Array.from(files);

      // Add files to state
      setDocumentStates((prev) => ({
        ...prev,
        [documentTypeId]: {
          ...prev[documentTypeId],
          files: [
            ...(prev[documentTypeId]?.files || []),
            ...fileArray.map((file) => ({
              file,
              uploading: true,
              uploaded: false,
            })),
          ],
        },
      }));

      // Upload each file
      for (const file of fileArray) {
        const fileKey = `${documentTypeId}-${file.name}-${file.size}`;
        await uploadSingleFile(documentTypeId, file, fileKey);
      }
    },
    [applicationId, uploadSingleFile]
  );

  const handleFileRemove = useCallback(
    (documentTypeId: string, fileIndex: number) => {
      setDocumentStates((prev) => {
        const currentFiles = prev[documentTypeId]?.files || [];
        const fileToRemove = currentFiles[fileIndex];

        // Remove from uploading set if needed
        if (fileToRemove?.uploading) {
          const fileKey = `${documentTypeId}-${fileToRemove.file.name}-${fileToRemove.file.size}`;
          setUploadingFiles((prevSet) => {
            const next = new Set(prevSet);
            next.delete(fileKey);
            return next;
          });
        }

        // If file was uploaded, also remove from uploadedFiles
        const updatedUploadedFiles = fileToRemove?.uploaded
          ? (prev[documentTypeId]?.uploadedFiles || []).filter(
              (f) =>
                !(
                  f.fileName === fileToRemove.file.name &&
                  f.fileSize === fileToRemove.file.size
                )
            )
          : prev[documentTypeId]?.uploadedFiles || [];

        return {
          ...prev,
          [documentTypeId]: {
            ...prev[documentTypeId],
            files: currentFiles.filter((_, i) => i !== fileIndex),
            uploadedFiles: updatedUploadedFiles,
            uploaded: updatedUploadedFiles.length > 0,
          },
        };
      });
      
      // Mark that we need to save on next useEffect run
      shouldSaveRef.current = true;
    },
    []
  );

  const handleRemovePersistedFile = useCallback(
    (documentTypeId: string, fileName: string, fileSize: number) => {
      setDocumentStates((prev) => {
        const existingUploaded = prev[documentTypeId]?.uploadedFiles || [];
        return {
          ...prev,
          [documentTypeId]: {
            ...prev[documentTypeId],
            uploadedFiles: existingUploaded.filter(
              (f) => !(f.fileName === fileName && f.fileSize === fileSize)
            ),
            uploaded: existingUploaded.length > 1,
          },
        };
      });
      
      // Mark that we need to save on next useEffect run
      shouldSaveRef.current = true;
    },
    []
  );

  const handleContinue = useCallback(() => {
    if (!applicationId) return;

    const missingMandatory = mandatoryDocs.filter((doc) => {
      const state = documentStates[doc.id];
      return !state || !hasUploadedFiles(state);
    });

    if (missingMandatory.length > 0) {
      const missingNames = missingMandatory.map((doc) => doc.name).join(", ");
      toast.error(`Please upload all required documents: ${missingNames}`, {
        duration: 5000,
      });
      return;
    }

    // Save form data using persistence hook
    const formData = convertToFormData(documentStates);
    saveOnSubmit(formData);

    markStepCompleted(STEP_ID);
    goToNext();
  }, [
    applicationId,
    mandatoryDocs,
    documentStates,
    saveOnSubmit,
    markStepCompleted,
    goToNext,
  ]);

  // Show loading state
  if (isLoadingDocumentTypes) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">
          Loading document types...
        </span>
      </div>
    );
  }

  // Show error state
  if (documentTypesError || !documentTypesResponse?.success) {
    return (
      <div className="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3">
        <p className="text-sm text-destructive">
          {documentTypesError?.message ||
            documentTypesResponse?.message ||
            "Failed to load document types"}
        </p>
      </div>
    );
  }

  // Show empty state
  if (sortedDocumentTypes.length === 0) {
    return (
      <div className="rounded-md border px-4 py-3">
        <p className="text-sm text-muted-foreground">
          No document types available
        </p>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form className="space-y-6">
        <div className="space-y-4">
          {sortedDocumentTypes.map((docType) => {
            const state = documentStates[docType.id] || {
              documentTypeId: docType.id,
              files: [],
              uploadedFiles: [],
              uploaded: false,
            };

            const hasFiles = state.files.length > 0;
            const hasPersistedFiles = (state.uploadedFiles?.length || 0) > 0;
            const allCurrentUploaded =
              hasFiles && state.files.every((f) => f.uploaded);
            const isUploading = state.files.some((f) => f.uploading);
            const hasAnyUploaded = hasPersistedFiles || allCurrentUploaded;

            return (
              <Card key={docType.id}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{docType.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant={
                              docType.is_mandatory ? "destructive" : "secondary"
                            }
                            className="text-xs"
                          >
                            {docType.is_mandatory ? "Required" : "Optional"}
                          </Badge>
                          {typeof docType.accepts_ocr === 'boolean' && (
                            <Badge 
                              variant={docType.accepts_ocr ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {docType.accepts_ocr
                                ? "Accepts OCR"
                                : "No OCR"}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {hasPersistedFiles && !isUploading && (
                        <div className="relative" title={`${state.uploadedFiles.length} file(s) uploaded`}>
                          <FileCheck2 className="h-5 w-5 text-green-600" />
                          <CheckCircle2 className="h-3 w-3 text-green-500 absolute -bottom-0.5 -right-0.5 bg-white rounded-full" />
                        </div>
                      )}
                      {!hasPersistedFiles && allCurrentUploaded && !isUploading && (
                        <div title="Uploaded successfully">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        </div>
                      )}
                      {isUploading && (
                        <div title="Uploading...">
                          <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                        </div>
                      )}
                      {!hasPersistedFiles && !allCurrentUploaded && !isUploading && hasFiles && (
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>

                    {/* Upload Area */}
                    <div
                      className={cn(
                        "border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer",
                        docType.is_mandatory && !hasAnyUploaded && !hasFiles
                          ? "border-destructive/40"
                          : hasPersistedFiles
                          ? "border-green-500/40 bg-green-50/50"
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
                        disabled={isAnyFileUploading || !applicationId}
                      />
                      <label
                        htmlFor={`file-${docType.id}`}
                        className="cursor-pointer"
                      >
                        {hasPersistedFiles && !hasFiles ? (
                          <>
                            <FileCheck2 className="h-8 w-8 mx-auto mb-2 text-green-600" />
                            <p className="text-sm font-medium text-green-700">
                              {state.uploadedFiles.length} File
                              {state.uploadedFiles.length > 1 ? "s" : ""}{" "}
                              uploaded
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Click to upload additional files
                            </p>
                          </>
                        ) : (
                          <>
                            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              Drop files here to upload or click to browse
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Supported: PDF, JPG, PNG, DOC, DOCX
                            </p>
                          </>
                        )}
                      </label>
                    </div>

                    {/* File List */}
                    {(hasFiles || hasPersistedFiles) && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Files:</p>

                        {/* Show persisted uploaded files first */}
                        {hasPersistedFiles && (
                          <>
                            {state.uploadedFiles.map((uploadedFile, index) => (
                              <div
                                key={`persisted-${index}`}
                                className="flex items-center justify-between p-3 border border-green-500/30 rounded-lg bg-green-50/50"
                              >
                                <div className="flex items-center gap-2 flex-1">
                                  <div className="relative">
                                    <FileCheck2 className="h-4 w-4 text-green-600 shrink-0" />
                                    <CheckCircle2 className="h-2.5 w-2.5 text-green-500 absolute -bottom-0.5 -right-0.5 bg-white rounded-full" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <span className="text-sm truncate block text-green-700 font-medium">
                                      {uploadedFile.fileName}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      (
                                      {(uploadedFile.fileSize / 1024).toFixed(
                                        2
                                      )}{" "}
                                      KB) • Uploaded
                                    </span>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleRemovePersistedFile(
                                      docType.id,
                                      uploadedFile.fileName,
                                      uploadedFile.fileSize
                                    )
                                  }
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </>
                        )}

                        {/* Show current files being uploaded */}
                        {hasFiles && (
                          <>
                            {state.files
                              .filter(
                                (f) =>
                                  !state.uploadedFiles.some(
                                    (uf) =>
                                      uf.fileName === f.file.name &&
                                      uf.fileSize === f.file.size
                                  )
                              )
                              .map((fileState, index) => (
                                <div
                                  key={`current-${index}-${fileState.file.name}`}
                                  className={cn(
                                    "flex items-center justify-between p-3 border rounded-lg",
                                    fileState.uploaded &&
                                      "border-green-500/30 bg-green-50/50",
                                    fileState.error &&
                                      "border-destructive/50 bg-destructive/5"
                                  )}
                                >
                                  <div className="flex items-center gap-2 flex-1">
                                    {fileState.uploading ? (
                                      <Loader2 className="h-4 w-4 text-blue-500 animate-spin shrink-0" />
                                    ) : fileState.uploaded ? (
                                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                                    ) : (
                                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <span
                                        className={cn(
                                          "text-sm truncate block",
                                          fileState.uploaded &&
                                            "text-green-700 font-medium"
                                        )}
                                      >
                                        {fileState.file.name}
                                      </span>
                                      {fileState.error && (
                                        <span className="text-xs text-destructive block mt-0.5">
                                          {fileState.error}
                                        </span>
                                      )}
                                      <span className="text-xs text-muted-foreground">
                                        (
                                        {(fileState.file.size / 1024).toFixed(
                                          2
                                        )}{" "}
                                        KB)
                                        {fileState.uploaded && " • Uploaded"}
                                      </span>
                                    </div>
                                  </div>
                                  {!fileState.uploading && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleFileRemove(docType.id, index)
                                      }
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Continue Button */}
        <ApplicationStepHeader className="mt-4">
          <Button
            type="button"
            onClick={handleContinue}
            disabled={
              isAnyFileUploading || !applicationId || !allMandatoryUploaded
            }
          >
            {isAnyFileUploading
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
