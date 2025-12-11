"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useDocuments, useDocumentTypesQuery } from "@/hooks/document.hook";
import { useFormPersistence } from "@/hooks/useFormPersistence.hook";
import { cn } from "@/lib/utils";
import { useApplicationStepStore } from "@/store/useApplicationStep.store";
import { useApplicationFormDataStore } from "@/store/useApplicationFormData.store";
import {
  CheckCircle2,
  Download,
  Eye,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import ApplicationStepHeader from "./application-step-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  uploadedFiles: UploadedFileMetadata[];
  uploaded: boolean;
};

type DocumentsFormData = {
  documents: Record<string, {
    documentTypeId: string;
    uploadedFiles: UploadedFileMetadata[];
    uploaded: boolean;
  }>;
};

const STEP_ID = 12;

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
  return mandatoryDocs.every((doc) => hasUploadedFiles(documentStates[doc.id]));
};

const convertToFormData = (
  documentStates: Record<string, DocumentState>
): DocumentsFormData => {
  const documents: DocumentsFormData["documents"] = {};
  Object.keys(documentStates).forEach((key) => {
    const state = documentStates[key];
    const newUploaded = state.files
      .filter((f) => f.uploaded && !f.error)
      .map((f) => ({
        fileName: f.file.name,
        fileSize: f.file.size,
        uploadedAt: new Date().toISOString(),
      }));

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

  const goToNext = useApplicationStepStore((state) => state.goToNext);
  const markStepCompleted = useApplicationStepStore((state) => state.markStepCompleted);

  const sortedDocumentTypes = useMemo(() => {
    if (!documentTypesResponse?.data) return [];
    return [...documentTypesResponse.data].sort((a, b) => {

      if (a.is_mandatory !== b.is_mandatory) {
        return a.is_mandatory ? -1 : 1;
      }

      return a.display_order - b.display_order;
    });
  }, [documentTypesResponse?.data]);

  const documentTypesKey = useMemo(() => {
    if (!documentTypesResponse?.data) return "";
    return documentTypesResponse.data.map((d) => d.id).sort().join(",");
  }, [documentTypesResponse?.data]);

  const [documentStates, setDocumentStates] = useState<Record<string, DocumentState>>({});
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const shouldSaveRef = useRef(false);

  const methods = useForm<DocumentsFormData>({
    defaultValues: { documents: {} },
  });

  const getStepData = useApplicationFormDataStore((state) => state.getStepData);

  const { saveOnSubmit } = useFormPersistence<DocumentsFormData>({
    applicationId,
    stepId: STEP_ID,
    form: methods,
    onDataLoaded: (data) => {
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

  const allMandatoryUploaded = useMemo(
    () => isAllMandatoryUploaded(documentStates, sortedDocumentTypes),
    [documentStates, sortedDocumentTypes]
  );

  const isAnyFileUploading = uploadingFiles.size > 0;

  // Set first document as selected when loaded
  useEffect(() => {
    if (sortedDocumentTypes.length > 0 && !selectedDocumentId) {
      setSelectedDocumentId(sortedDocumentTypes[0].id);
    }
  }, [sortedDocumentTypes, selectedDocumentId]);

  // Initialize document states
  useEffect(() => {
    if (sortedDocumentTypes.length > 0 && applicationId) {
      setDocumentStates((prev) => {
        if (Object.keys(prev).length === 0) {
          const initialState = createInitialState(sortedDocumentTypes);
          const persistedData = getStepData<DocumentsFormData>(STEP_ID);
          if (persistedData?.documents) {
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
  }, [documentTypesKey, applicationId, getStepData]);

  // Auto-save
  useEffect(() => {
    if (!applicationId || sortedDocumentTypes.length === 0) return;

    const formData = convertToFormData(documentStates);
    methods.setValue("documents", formData.documents);

    if (shouldSaveRef.current) {
      saveOnSubmit(formData);
      shouldSaveRef.current = false;
    }

    if (isAllMandatoryUploaded(documentStates, sortedDocumentTypes)) {
      markStepCompleted(STEP_ID);
    }
  }, [documentStates, applicationId, methods, markStepCompleted, sortedDocumentTypes, saveOnSubmit]);

  const uploadSingleFile = useCallback(
    async (documentTypeId: string, file: File, fileKey: string): Promise<void> => {
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
              uploadedFiles: fileExists ? existingUploaded : [...existingUploaded, newUploadedFile],
              uploaded: true,
            },
          };
        });

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
                f.file === file ? { ...f, uploading: false, uploaded: false, error: "Upload failed" } : f
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

      setDocumentStates((prev) => ({
        ...prev,
        [documentTypeId]: {
          ...prev[documentTypeId],
          files: [
            ...(prev[documentTypeId]?.files || []),
            ...fileArray.map((file) => ({ file, uploading: true, uploaded: false })),
          ],
        },
      }));

      for (const file of fileArray) {
        const fileKey = `${documentTypeId}-${file.name}-${file.size}`;
        await uploadSingleFile(documentTypeId, file, fileKey);
      }
    },
    [applicationId, uploadSingleFile]
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
      shouldSaveRef.current = true;
    },
    []
  );

  const handleContinue = useCallback(() => {
    if (!applicationId) return;

    const missingMandatory = sortedDocumentTypes.filter((doc) => {
      const state = documentStates[doc.id];
      return doc.is_mandatory && (!state || !hasUploadedFiles(state));
    });

    if (missingMandatory.length > 0) {
      const missingNames = missingMandatory.map((doc) => doc.name).join(", ");
      toast.error(`Please upload all required documents: ${missingNames}`, { duration: 5000 });
      return;
    }

    const formData = convertToFormData(documentStates);
    saveOnSubmit(formData);
    markStepCompleted(STEP_ID);
    goToNext();
  }, [applicationId, sortedDocumentTypes, documentStates, saveOnSubmit, markStepCompleted, goToNext]);

  // Get all uploaded files across all document types
  const allUploadedFiles = useMemo(() => {
    const files: Array<{
      fileName: string;
      documentName: string;
      fileSize: number;
      uploadedAt: string;
    }> = [];

    sortedDocumentTypes.forEach((docType) => {
      const state = documentStates[docType.id];
      if (state?.uploadedFiles) {
        state.uploadedFiles.forEach((file) => {
          files.push({
            ...file,
            documentName: docType.name,
          });
        });
      }
    });

    return files;
  }, [documentStates, sortedDocumentTypes]);

  if (isLoadingDocumentTypes) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Loading document types...</span>
      </div>
    );
  }

  if (documentTypesError || !documentTypesResponse?.success) {
    return (
      <div className="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3">
        <p className="text-sm text-destructive">
          {documentTypesError?.message || documentTypesResponse?.message || "Failed to load document types"}
        </p>
      </div>
    );
  }

  if (sortedDocumentTypes.length === 0) {
    return (
      <div className="rounded-md border px-4 py-3">
        <p className="text-sm text-muted-foreground">No document types available</p>
      </div>
    );
  }

  const selectedDocument = sortedDocumentTypes.find((d) => d.id === selectedDocumentId);
  const selectedState = selectedDocumentId ? documentStates[selectedDocumentId] : null;

  return (
    <FormProvider {...methods}>
      <form className="space-y-6">
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="upload">Upload Documents</TabsTrigger>
            <TabsTrigger value="gallery">Documents Gallery</TabsTrigger>
          </TabsList>

          {/* Upload Documents Tab */}
          <TabsContent value="upload" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Document Types Grid - 2 columns */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-lg font-semibold">Document Types</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-3">
                  {sortedDocumentTypes.map((docType) => {
                    const state = documentStates[docType.id];
                    const isUploaded = hasUploadedFiles(state);
                    const isSelected = selectedDocumentId === docType.id;

                    return (
                      <button
                        key={docType.id}
                        type="button"
                        onClick={() => setSelectedDocumentId(docType.id)}
                        className={cn(
                          "w-full text-left px-3 py-2.5 rounded-lg border transition-all duration-200",
                          isSelected && "bg-blue-50 border-blue-500 shadow-sm",
                          !isSelected && "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-blue-600 truncate leading-tight">{docType.name}</p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <Badge
                                variant={docType.is_mandatory ? "default" : "secondary"}
                                className={cn(
                                  "text-[10px] px-1.5 py-0 h-4",
                                  docType.is_mandatory && "bg-orange-500 hover:bg-orange-600"
                                )}
                              >
                                {docType.is_mandatory ? "Compulsory" : "Optional"}
                              </Badge>
                              {isUploaded && (
                                <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4 bg-green-600 hover:bg-green-700">
                                  Uploaded
                                </Badge>
                              )}
                            </div>
                          </div>
                          {isUploaded && <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0 mt-0.5" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Main Upload Area - 3 columns (wider) */}
              <div className="lg:col-span-3 space-y-4">
                {selectedDocument && (
                  <Card className="border-gray-200">
                    <CardContent className="pt-6">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-xl font-semibold">{selectedDocument.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{selectedDocument.name}</p>
                        </div>

                        {/* Upload Area */}
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-16 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-200 cursor-pointer bg-gray-50/50">
                          <input
                            type="file"
                            id={`file-${selectedDocument.id}`}
                            className="hidden"
                            multiple
                            onChange={(e) => handleFileSelect(selectedDocument.id, e.target.files)}
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            disabled={isAnyFileUploading || !applicationId}
                          />
                          <label htmlFor={`file-${selectedDocument.id}`} className="cursor-pointer block">
                            <Upload className="h-16 w-16 mx-auto mb-4 text-gray-400" strokeWidth={1.5} />
                            <p className="text-base text-gray-600 font-medium">Drop files here to upload</p>
                          </label>
                        </div>

                        {/* Files Table */}
                        {selectedState?.uploadedFiles && selectedState.uploadedFiles.length > 0 && (
                          <div className="mt-6">
                            <table className="w-full">
                              <thead className="border-b">
                                <tr className="text-left text-sm text-muted-foreground">
                                  <th className="pb-3 font-medium">NAME</th>
                                  <th className="pb-3 font-medium">SIZE</th>
                                  <th className="pb-3 font-medium">DATE ADDED</th>
                                  <th className="pb-3 font-medium">ACTION</th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectedState.uploadedFiles.map((file, index) => (
                                  <tr key={index} className="border-b last:border-0">
                                    <td className="py-3 text-sm">{file.fileName}</td>
                                    <td className="py-3 text-sm">{(file.fileSize / 1024).toFixed(2)} KB</td>
                                    <td className="py-3 text-sm">
                                      {new Date(file.uploadedAt).toLocaleDateString()}
                                    </td>
                                    <td className="py-3">
                                      <div className="flex items-center gap-2">
                                        <Button type="button" variant="ghost" size="sm">
                                          <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button type="button" variant="ghost" size="sm">
                                          <Download className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            handleRemovePersistedFile(
                                              selectedDocument.id,
                                              file.fileName,
                                              file.fileSize
                                            )
                                          }
                                        >
                                          <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Documents Gallery Tab */}
          <TabsContent value="gallery" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                {allUploadedFiles.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No documents uploaded yet</p>
                ) : (
                  <table className="w-full">
                    <thead className="border-b">
                      <tr className="text-left text-sm text-muted-foreground">
                        <th className="pb-3 font-medium">FILE NAME</th>
                        <th className="pb-3 font-medium">DOCUMENT NAME</th>
                        <th className="pb-3 font-medium">SIZE</th>
                        <th className="pb-3 font-medium">ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allUploadedFiles.map((file, index) => (
                        <tr key={index} className="border-b last:border-0">
                          <td className="py-3 text-sm">{file.fileName}</td>
                          <td className="py-3 text-sm">{file.documentName}</td>
                          <td className="py-3 text-sm">{(file.fileSize / 1024).toFixed(2)} KB</td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <Button type="button" variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button type="button" variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button type="button" variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Continue Button */}
        <ApplicationStepHeader className="mt-4">
          <Button
            type="button"
            onClick={handleContinue}
            disabled={isAnyFileUploading || !applicationId || !allMandatoryUploaded}
          >
            {isAnyFileUploading ? "Uploading..." : allMandatoryUploaded ? "Save & Continue" : "Upload Required Documents"}
          </Button>
        </ApplicationStepHeader>
      </form>
    </FormProvider>
  );
}
