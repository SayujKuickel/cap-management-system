"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import { Controller, FormProvider, useForm } from "react-hook-form";
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

type ApplicationType = "onshore" | "offshore";

type DocumentsFormData = {
  applicationType?: ApplicationType;
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

// Document category mappings
const DOCUMENT_CATEGORIES = {
  onshore: {
    passport: ["PASSPORT"],
    academicDocuments: ["TRANSCRIPT_10", "TRANSCRIPT_12"],
    visa: ["PREVIOUS_VISA"],
    oshc: ["HEALTH_COVER"],
  },
  offshore: {
    passport: ["PASSPORT"],
    englishTest: ["ENGLISH_TEST"],
    academicDocuments: ["TRANSCRIPT_10", "TRANSCRIPT_12"],
  },
} as const;

// Helper to get document category
const getDocumentCategory = (
  docCode: string,
  applicationType: ApplicationType
): string | null => {
  if (!applicationType) return null;

  const categories = DOCUMENT_CATEGORIES[applicationType];
  for (const [categoryName, codes] of Object.entries(categories)) {
    if (codes.includes(docCode as any)) {
      return categoryName;
    }
  }
  return "other"; // Documents not in specific categories
};

// Category display names
const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  passport: "Passport",
  academicDocuments: "Academic Documents",
  visa: "Visa",
  oshc: "Overseas Student Health Cover (OSHC)",
  englishTest: "English Test (IELTS/PTE)",
  other: "Other Documents",
};

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

const hasUploadedFiles = (state: DocumentState | undefined): boolean => {
  if (!state) return false;
  return state.files?.some((f) => f.uploaded) || (state.uploadedFiles?.length ?? 0) > 0;
};

const isAllMandatoryUploaded = (
  documentStates: Record<string, DocumentState>,
  documentTypes: Array<{ id: string; is_mandatory: boolean }>
): boolean => {
  if (!documentTypes || documentTypes.length === 0) return true;
  const mandatoryDocs = documentTypes.filter((doc) => doc.is_mandatory);
  if (mandatoryDocs.length === 0) return true;
  return mandatoryDocs.every((doc) => {
    const state = documentStates[doc.id];
    return hasUploadedFiles(state);
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
    defaultValues: {
      applicationType: "onshore",
      documents: {}
    },
  });

  // Get persisted data from store
  const getStepData = useApplicationFormDataStore((state) => state.getStepData);

  // Use form persistence hook
  const { saveOnSubmit } = useFormPersistence<DocumentsFormData>({
    applicationId,
    stepId: STEP_ID,
    form: methods,
    onDataLoaded: (data) => {
      // Restore application type if present
      if (data?.applicationType) {
        methods.setValue("applicationType", data.applicationType);
      }

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

  // Get application type from form
  const applicationType = methods.watch("applicationType") as ApplicationType | undefined;

  // Filter and categorize documents based on application type
  const categorizedDocuments = useMemo(() => {
    if (!applicationType || !sortedDocumentTypes.length) {
      return { other: sortedDocumentTypes };
    }

    const categories: Record<string, typeof sortedDocumentTypes> = {};

    sortedDocumentTypes.forEach((doc) => {
      const category = getDocumentCategory(doc.code, applicationType) || "other";
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(doc);
    });

    return categories;
  }, [applicationType, sortedDocumentTypes]);

  // Get mandatory docs for current application type (excluding "other" category)
  const mandatoryDocs = useMemo(() => {
    if (!applicationType) return [];

    // Only check mandatory documents from specific categories (not "other")
    const relevantCategories = Object.entries(categorizedDocuments).filter(
      ([category]) => category !== "other"
    );
    const relevantDocs = relevantCategories.flatMap(([, docs]) => docs);

    // Return only mandatory documents from relevant categories
    return relevantDocs.filter((doc) => doc.is_mandatory);
  }, [applicationType, categorizedDocuments]);

  const allMandatoryUploaded = useMemo(
    () => {
      if (!applicationType) return false;
      return isAllMandatoryUploaded(documentStates, mandatoryDocs);
    },
    [documentStates, mandatoryDocs, applicationType]
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
    // Ensure applicationType is included in form data
    const currentApplicationType = methods.getValues("applicationType");
    if (currentApplicationType) {
      formData.applicationType = currentApplicationType;
    }

    // Save to Zustand store if flag is set (for immediate saves after upload/remove)
    if (shouldSaveRef.current) {
      saveOnSubmit({ ...formData, applicationType: currentApplicationType });
      shouldSaveRef.current = false;
    }

    if (applicationType && isAllMandatoryUploaded(documentStates, mandatoryDocs)) {
      markStepCompleted(STEP_ID);
    }
  }, [
    documentStates,
    applicationId,
    methods,
    markStepCompleted,
    sortedDocumentTypes,
    saveOnSubmit,
    applicationType,
    mandatoryDocs,
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
    const currentApplicationType = methods.getValues("applicationType");
    saveOnSubmit({ ...formData, applicationType: currentApplicationType });

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
        {/* Application Type Selection */}
        <Card className="border-border dark:border-gray-700 dark:bg-gray-800/50">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold mb-3 block dark:text-gray-100">
                  Application Type
                </Label>
                <Controller
                  name="applicationType"
                  control={methods.control}
                  render={({ field }) => (
                    <RadioGroup
                      value={field.value || ""}
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Clear document states when switching types
                        setDocumentStates({});
                      }}
                      className="flex gap-6"
                    >
                      <Label className="flex items-center space-x-2 cursor-pointer p-4 rounded-lg border dark:border-gray-600 hover:bg-accent dark:hover:bg-gray-700/50 transition-colors">
                        <RadioGroupItem value="onshore" />
                        <div className="flex flex-col">
                          <span className="font-medium dark:text-gray-100">Onshore</span>
                          <span className="text-xs text-muted-foreground dark:text-gray-400">
                            Applying from within Australia
                          </span>
                        </div>
                      </Label>
                      <Label className="flex items-center space-x-2 cursor-pointer p-4 rounded-lg border dark:border-gray-600 hover:bg-accent dark:hover:bg-gray-700/50 transition-colors">
                        <RadioGroupItem value="offshore" />
                        <div className="flex flex-col">
                          <span className="font-medium dark:text-gray-100">Offshore</span>
                          <span className="text-xs text-muted-foreground dark:text-gray-400">
                            Applying from outside Australia
                          </span>
                        </div>
                      </Label>
                    </RadioGroup>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents by Category */}
        {!applicationType ? (
          <Card className="border-border dark:border-gray-700 dark:bg-gray-800/50">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground dark:text-gray-400 text-center py-8">
                Please select an application type to view required documents
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(categorizedDocuments).map(([category, docs]) => {
              // Skip empty categories
              if (docs.length === 0) return null;

              return (
                <div key={category} className="space-y-4">
                  {/* Category Header */}
                  <div className="border-b dark:border-gray-700 pb-2">
                    <h3 className="text-lg font-semibold dark:text-gray-100">
                      {CATEGORY_DISPLAY_NAMES[category] || category}
                    </h3>
                    {category === "other" && (
                      <p className="text-sm text-muted-foreground dark:text-gray-400 mt-1">
                        Optional documents
                      </p>
                    )}
                  </div>

                  {/* Documents in this category */}
                  <div className="space-y-4">
                    {docs.map((docType) => {
                      const state = documentStates[docType.id] || {
                        documentTypeId: docType.id,
                        files: [],
                        uploadedFiles: [],
                        uploaded: false,
                      };

                      const hasFiles = (state.files?.length || 0) > 0;
                      const hasPersistedFiles = (state.uploadedFiles?.length || 0) > 0;
                      const allCurrentUploaded =
                        hasFiles && (state.files?.every((f) => f.uploaded) ?? false);
                      const isUploading = state.files?.some((f) => f.uploading) ?? false;
                      const hasAnyUploaded = hasPersistedFiles || allCurrentUploaded;

                      // Documents in "other" category are always optional, regardless of API flag
                      const isOtherCategory = category === "other";
                      const isRequired = !isOtherCategory && docType.is_mandatory;

                      return (
                        <Card key={docType.id} className="border-border dark:border-gray-700 dark:bg-gray-800/50">
                          <CardContent className="pt-6">
                            <div className="space-y-4">
                              {/* Header */}
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium dark:text-gray-100">{docType.name}</h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge
                                      variant={
                                        isRequired ? "destructive" : "secondary"
                                      }
                                      className="text-xs"
                                    >
                                      {isRequired ? "Required" : "Optional"}
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
                                  "border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer dark:border-gray-600 dark:hover:border-primary/70",
                                  isRequired && !hasAnyUploaded && !hasFiles
                                    ? "border-destructive/40 dark:border-destructive/60"
                                    : hasPersistedFiles
                                      ? "border-green-500/40 bg-green-50/50 dark:border-green-500/50 dark:bg-green-900/20"
                                      : "border-muted dark:bg-gray-900/30"
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
                                      <FileCheck2 className="h-8 w-8 mx-auto mb-2 text-green-600 dark:text-green-400" />
                                      <p className="text-sm font-medium text-green-700 dark:text-green-300">
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
                                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground dark:text-gray-400" />
                                      <p className="text-sm text-muted-foreground dark:text-gray-300">
                                        Drop files here to upload or click to browse
                                      </p>
                                      <p className="text-xs text-muted-foreground dark:text-gray-400 mt-1">
                                        Supported: PDF, JPG, PNG, DOC, DOCX
                                      </p>
                                    </>
                                  )}
                                </label>
                              </div>

                              {/* File List */}
                              {(hasFiles || hasPersistedFiles) && (
                                <div className="space-y-2">
                                  <p className="text-sm font-medium dark:text-gray-100">Files:</p>

                                  {/* Show persisted uploaded files first */}
                                  {hasPersistedFiles && (
                                    <>
                                      {state.uploadedFiles.map((uploadedFile, index) => (
                                        <div
                                          key={`persisted-${index}`}
                                          className="flex items-center justify-between p-3 border border-green-500/30 rounded-lg bg-green-50/50 dark:border-green-500/40 dark:bg-green-900/20"
                                        >
                                          <div className="flex items-center gap-2 flex-1">
                                            <div className="relative">
                                              <FileCheck2 className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
                                              <CheckCircle2 className="h-2.5 w-2.5 text-green-500 absolute -bottom-0.5 -right-0.5 bg-white rounded-full" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <span className="text-sm truncate block text-green-700 dark:text-green-300 font-medium">
                                                {uploadedFile.fileName}
                                              </span>
                                              <span className="text-xs text-muted-foreground dark:text-gray-400">
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
                                      {(state.files || [])
                                        .filter(
                                          (f) =>
                                            !(state.uploadedFiles || []).some(
                                              (uf) =>
                                                uf.fileName === f.file.name &&
                                                uf.fileSize === f.file.size
                                            )
                                        )
                                        .map((fileState, index) => (
                                          <div
                                            key={`current-${index}-${fileState.file.name}`}
                                            className={cn(
                                              "flex items-center justify-between p-3 border rounded-lg dark:border-gray-600",
                                              fileState.uploaded &&
                                              "border-green-500/30 bg-green-50/50 dark:border-green-500/40 dark:bg-green-900/20",
                                              fileState.error &&
                                              "border-destructive/50 bg-destructive/5 dark:border-destructive/60 dark:bg-destructive/10"
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
                                                    "text-sm truncate block dark:text-gray-200",
                                                    fileState.uploaded &&
                                                    "text-green-700 dark:text-green-300 font-medium"
                                                  )}
                                                >
                                                  {fileState.file.name}
                                                </span>
                                                {fileState.error && (
                                                  <span className="text-xs text-destructive block mt-0.5">
                                                    {fileState.error}
                                                  </span>
                                                )}
                                                <span className="text-xs text-muted-foreground dark:text-gray-400">
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
                </div>
              );
            })}
          </div>
        )}

        {/* Continue Button */}
        <ApplicationStepHeader className="mt-4">
          <Button
            type="button"
            onClick={handleContinue}
            disabled={
              isAnyFileUploading || !applicationId || !allMandatoryUploaded || !applicationType
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
