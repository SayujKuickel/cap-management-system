"use client";

import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useCallback } from "react";
import { Upload, FileCheck2, Loader2, X, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FormInput } from "../../ui/forms/form-input";
import { FormCheckbox } from "../../ui/forms/form-checkbox";
import { useSearchParams } from "next/navigation";
import { useApplicationStepMutations } from "@/hooks/useApplicationSteps.hook";
import ApplicationStepHeader from "./application-step-header";
import {
  createEmptySchoolingEntry,
  schoolingSchema,
  type SchoolingValues,
} from "@/validation/application/schooling";
import { useFormPersistence } from "@/hooks/useFormPersistence.hook";
import { useDocuments, useDocumentTypesQuery } from "@/hooks/document.hook";
import documentService from "@/service/document.service";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";

// Upload state for each entry
type UploadState = {
  file: File | null;
  isUploading: boolean;
  uploadSuccess: boolean;
  isDragging: boolean;
};

export default function SchoolingForm() {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("applicationId");
  const stepId = 6; // Schooling is step 6
  const schoolingMutation = useApplicationStepMutations(applicationId)[stepId];

  const methods = useForm<SchoolingValues>({
    resolver: zodResolver(schoolingSchema),
    defaultValues: {
      entries: [createEmptySchoolingEntry()],
    },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  // Enable automatic form persistence
  const { saveOnSubmit } = useFormPersistence({
    applicationId,
    stepId,
    form: methods,
    enabled: !!applicationId,
  });

  const { control, handleSubmit } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "entries",
  });

  // Upload state for each entry
  const [uploadStates, setUploadStates] = useState<Record<number, UploadState>>({});

  // Get document types and upload hook
  const { data: documentTypesResponse } = useDocumentTypesQuery();
  const { uploadDocument } = useDocuments(applicationId);

  // Debug: Log available document types
  console.log('[Schooling] Available document types:', documentTypesResponse?.data?.map(dt => ({ code: dt.code, name: dt.name })));

  // Get academic transcript document type ID - try multiple possible codes
  let academicDocType = documentTypesResponse?.data?.find(
    (dt) => dt.code === "ACADEMIC_TRANSCRIPT" ||
      dt.code === "ACADEMIC" ||
      dt.code === "TRANSCRIPT" ||
      dt.code === "SCHOOLING" ||
      dt.code.includes("ACADEMIC") ||
      dt.code.includes("SCHOOL")
  );

  // Fallback: if no academic type found, use the first available document type
  if (!academicDocType && documentTypesResponse?.data && documentTypesResponse.data.length > 0) {
    academicDocType = documentTypesResponse.data[0];
    console.log('[Schooling] No academic document type found, using fallback:', academicDocType);
  }

  console.log('[Schooling] Found academic document type:', academicDocType);

  // Initialize upload state for an entry
  const getUploadState = (index: number): UploadState => {
    return uploadStates[index] || {
      file: null,
      isUploading: false,
      uploadSuccess: false,
      isDragging: false,
    };
  };

  // Update upload state for an entry
  const updateUploadState = (index: number, updates: Partial<UploadState>) => {
    setUploadStates((prev) => ({
      ...prev,
      [index]: { ...getUploadState(index), ...updates },
    }));
  };

  // Handle file upload for a specific entry
  const handleFileUpload = useCallback(
    async (file: File, entryIndex: number) => {
      if (!applicationId) {
        toast.error("No application ID found");
        console.error('[Schooling] No application ID');
        return;
      }

      if (!academicDocType) {
        toast.error("Academic document type not configured. Please contact support.");
        console.error('[Schooling] No academic document type found. Available types:', documentTypesResponse?.data);
        return;
      }

      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a valid image (JPG, PNG) or PDF file");
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }

      updateUploadState(entryIndex, {
        file,
        isUploading: true,
        uploadSuccess: false,
      });

      try {
        // Upload the document
        await uploadDocument.mutateAsync({
          application_id: applicationId,
          document_type_id: academicDocType.id,
          file,
        });

        toast.success("Academic document uploaded! Extracting data...");

        // Poll for OCR results (max 30 seconds)
        const maxAttempts = 15;
        let attempts = 0;

        const pollOcrResults = async (): Promise<void> => {
          attempts++;

          try {
            console.log(`[Schooling Entry ${entryIndex}] 🔍 Polling OCR results, attempt:`, attempts);
            const ocrResponse = await documentService.getOcrResults(applicationId);

            console.log(`[Schooling Entry ${entryIndex}] 📦 OCR Response:`, ocrResponse);

            if (ocrResponse.success && ocrResponse.data) {
              const schoolingData = ocrResponse.data.sections.schooling_history;
              console.log(`[Schooling Entry ${entryIndex}] 🎯 Schooling Data:`, schoolingData);

              const pendingCount = ocrResponse.data.metadata?.ocr_pending || 0;
              console.log(`[Schooling Entry ${entryIndex}] ⏳ Pending OCR jobs:`, pendingCount);

              // If OCR is complete but no schooling data extracted
              if (pendingCount === 0 && (!schoolingData || (Array.isArray(schoolingData) && schoolingData.length === 0))) {
                console.log(`[Schooling Entry ${entryIndex}] ℹ️ OCR complete but no data extracted`);

                updateUploadState(entryIndex, {
                  uploadSuccess: false,
                  isUploading: false,
                });

                toast.success("Document uploaded! Please fill in the details manually.");
                return;
              }

              // Check if we have schooling data and OCR is complete
              if (schoolingData && Array.isArray(schoolingData) && schoolingData.length > 0 && pendingCount === 0) {
                console.log(`[Schooling Entry ${entryIndex}] ✅ OCR COMPLETE!`);

                // Get the most recent schooling entry (last in array)
                const latestEntry = schoolingData[schoolingData.length - 1];
                const extractedData = latestEntry.extracted_data;
                console.log(`[Schooling Entry ${entryIndex}] 📦 Extracted Data:`, extractedData);

                if (extractedData) {
                  let fieldsPopulated = 0;

                  // Map OCR fields to form fields
                  const fieldMapping: Record<string, string> = {
                    'institution_name': 'institution',
                    'degree': 'qualification_level',
                    'major': 'field_of_study',
                    'gpa': 'result',
                    'grade': 'result',
                  };

                  Object.entries(extractedData).forEach(([key, value]) => {
                    try {
                      // Map OCR field name to form field name
                      const formFieldKey = fieldMapping[key] || key;
                      const fieldPath = `entries.${entryIndex}.${formFieldKey}` as any;
                      const currentValue = methods.getValues(fieldPath);

                      console.log(`[Schooling Entry ${entryIndex}] 🔍 Field "${key}" -> "${formFieldKey}":`, {
                        ocrValue: value,
                        currentValue,
                        willPopulate: !currentValue && value !== null && value !== undefined && value !== ''
                      });

                      if (currentValue && currentValue !== "" && currentValue !== 0) {
                        console.log(`[Schooling Entry ${entryIndex}] ⏭️ Skipping "${formFieldKey}" - already has value`);
                        return;
                      }

                      if (value === null || value === undefined || value === '') {
                        console.log(`[Schooling Entry ${entryIndex}] ⏭️ Skipping "${formFieldKey}" - empty value`);
                        return;
                      }

                      console.log(`[Schooling Entry ${entryIndex}] 🎯 Setting "${formFieldKey}" to:`, value);
                      methods.setValue(fieldPath, value as any, {
                        shouldValidate: false,
                        shouldDirty: true
                      });
                      fieldsPopulated++;

                      const newValue = methods.getValues(fieldPath);
                      console.log(`[Schooling Entry ${entryIndex}] ✓ Verified "${formFieldKey}" is now:`, newValue);
                    } catch (error) {
                      console.error(`[Schooling Entry ${entryIndex}] ❌ Error setting field "${key}":`, error);
                    }
                  });

                  console.log(`[Schooling Entry ${entryIndex}] 🎉 Populated ${fieldsPopulated} fields`);

                  updateUploadState(entryIndex, {
                    uploadSuccess: true,
                    isUploading: false,
                  });

                  if (fieldsPopulated > 0) {
                    toast.success(`Academic data extracted! ${fieldsPopulated} fields populated.`);
                  } else {
                    toast.success("Academic document uploaded successfully!");
                  }
                  return;
                }
              }

              // OCR still processing
              if (attempts < maxAttempts) {
                setTimeout(() => pollOcrResults(), 2000);
              } else {
                updateUploadState(entryIndex, {
                  uploadSuccess: false,
                  isUploading: false,
                });
                toast.error("OCR processing timed out. Please try again.");
              }
            } else {
              if (attempts < maxAttempts) {
                setTimeout(() => pollOcrResults(), 2000);
              } else {
                updateUploadState(entryIndex, {
                  uploadSuccess: false,
                  isUploading: false,
                });
                toast.error("Failed to extract data from academic document");
              }
            }
          } catch (error) {
            console.error("OCR polling error:", error);
            if (attempts < maxAttempts) {
              setTimeout(() => pollOcrResults(), 2000);
            } else {
              updateUploadState(entryIndex, {
                uploadSuccess: false,
                isUploading: false,
              });
              toast.error("Failed to extract data from academic document");
            }
          }
        };

        setTimeout(() => pollOcrResults(), 2000);

      } catch (error) {
        console.error("Upload failed:", error);
        toast.error("Failed to upload academic document");
        updateUploadState(entryIndex, {
          file: null,
          isUploading: false,
        });
      }
    },
    [applicationId, academicDocType, uploadDocument, methods]
  );

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, entryIndex: number) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, entryIndex);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent, entryIndex: number) => {
    e.preventDefault();
    updateUploadState(entryIndex, { isDragging: true });
  };

  const handleDragLeave = (e: React.DragEvent, entryIndex: number) => {
    e.preventDefault();
    updateUploadState(entryIndex, { isDragging: false });
  };

  const handleDrop = (e: React.DragEvent, entryIndex: number) => {
    e.preventDefault();
    updateUploadState(entryIndex, { isDragging: false });

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file, entryIndex);
    }
  };

  // Remove uploaded file
  const handleRemoveFile = (entryIndex: number) => {
    updateUploadState(entryIndex, {
      file: null,
      uploadSuccess: false,
    });
  };

  const canAddMore = fields.length < 10;

  const onSubmit = (values: SchoolingValues) => {
    // Save to Zustand store before submitting to API
    if (applicationId) {
      saveOnSubmit(values);
    }
    schoolingMutation.mutate(values);
  };

  return (
    <FormProvider {...methods}>
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Schooling History</h3>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!canAddMore}
            onClick={() => append(createEmptySchoolingEntry())}
          >
            Add Entry
          </Button>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => {
            const uploadState = getUploadState(index);

            return (
              <div key={field.id} className="space-y-4 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm">Entry {index + 1}</p>

                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>

                {/* Document Upload Section */}
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <FileCheck2 className="h-3 w-3 text-primary" />
                        <h4 className="font-medium text-xs">Upload Academic Document</h4>
                      </div>

                      {!uploadState.file ? (
                        <div
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDragLeave={(e) => handleDragLeave(e, index)}
                          onDrop={(e) => handleDrop(e, index)}
                          className={cn(
                            "border-2 border-dashed rounded-lg p-3 text-center transition-colors cursor-pointer",
                            uploadState.isDragging
                              ? "border-primary bg-primary/10"
                              : "border-muted hover:border-primary/50 hover:bg-accent"
                          )}
                        >
                          <input
                            type="file"
                            id={`academic-upload-${index}`}
                            className="hidden"
                            accept="image/jpeg,image/jpg,image/png,application/pdf"
                            onChange={(e) => handleFileChange(e, index)}
                            disabled={uploadState.isUploading || !applicationId}
                          />
                          <label
                            htmlFor={`academic-upload-${index}`}
                            className="cursor-pointer flex items-center justify-center gap-2"
                          >
                            <Upload className="h-3 w-3 text-primary" />
                            <div className="text-left">
                              <p className="text-xs font-medium">
                                Upload transcript/certificate
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                JPG, PNG or PDF (max 10MB)
                              </p>
                            </div>
                          </label>
                        </div>
                      ) : (
                        <div className="border rounded-lg p-2 bg-background">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              {uploadState.isUploading ? (
                                <>
                                  <Loader2 className="h-3 w-3 text-primary animate-spin flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-[10px] truncate">
                                      {uploadState.file.name}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">
                                      Extracting data...
                                    </p>
                                  </div>
                                </>
                              ) : uploadState.uploadSuccess ? (
                                <>
                                  <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-[10px] truncate">
                                      {uploadState.file.name}
                                    </p>
                                    <p className="text-[10px] text-green-600">
                                      Data extracted!
                                    </p>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <FileCheck2 className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-[10px] truncate">
                                      {uploadState.file.name}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">
                                      {(uploadState.file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                  </div>
                                </>
                              )}
                            </div>
                            {!uploadState.isUploading && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveFile(index)}
                                className="h-5 w-5 p-0 flex-shrink-0"
                              >
                                <X className="h-2 w-2" />
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    name={`entries.${index}.institution`}
                    label="Institution"
                    placeholder="e.g. ABC High School"
                  />

                  <FormInput
                    name={`entries.${index}.country`}
                    label="Country"
                    placeholder="e.g. Nepal"
                  />

                  <FormInput
                    name={`entries.${index}.qualification_level`}
                    label="Qualification Level"
                    placeholder="e.g. Year 12, Diploma"
                  />

                  <FormInput
                    name={`entries.${index}.field_of_study`}
                    label="Field of Study"
                    placeholder="e.g. Science, Business"
                  />

                  <FormInput
                    name={`entries.${index}.start_year`}
                    label="Start Year"
                    type="number"
                    placeholder="2020"
                  />

                  <FormInput
                    name={`entries.${index}.end_year`}
                    label="End Year"
                    type="number"
                    placeholder="2024"
                  />
                </div>

                <FormCheckbox
                  name={`entries.${index}.currently_attending`}
                  label="I am currently attending this institution"
                />

                <FormInput
                  name={`entries.${index}.result`}
                  label="Result"
                  placeholder="e.g. GPA, Percentage, Pass"
                />
              </div>
            );
          })}
        </div>

        <ApplicationStepHeader className="mt-4">
          <Button type="submit" disabled={schoolingMutation.isPending}>
            {schoolingMutation.isPending ? "Saving..." : "Save & Continue"}
          </Button>
        </ApplicationStepHeader>
      </form>
    </FormProvider>
  );
}
