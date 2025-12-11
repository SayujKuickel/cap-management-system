"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  defaultLanguageAndCultureValues,
  languageAndCultureSchema,
  type LanguageAndCultureValues,
  type LanguageAndCultureFormValues,
} from "@/validation/application/language-cultural";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { FormInput } from "../../ui/forms/form-input";
import { useSearchParams } from "next/navigation";
import { useApplicationStepMutations } from "@/hooks/useApplicationSteps.hook";
import ApplicationStepHeader from "./application-step-header";
import { useFormPersistence } from "@/hooks/useFormPersistence.hook";
import { useDocuments, useDocumentTypesQuery } from "@/hooks/document.hook";
import documentService from "@/service/document.service";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useState, useCallback } from "react";
import { Upload, FileCheck2, Loader2, X, CheckCircle2 } from "lucide-react";

export default function LanguageDefaultForm() {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("applicationId");
  const stepId = 4; // Language & Culture is step 4
  const languageMutation = useApplicationStepMutations(applicationId)[stepId];

  const methods = useForm<LanguageAndCultureFormValues>({
    resolver: zodResolver(languageAndCultureSchema),
    defaultValues: defaultLanguageAndCultureValues,
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

  // English test upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Get document types and upload hook
  const { data: documentTypesResponse } = useDocumentTypesQuery();
  const { uploadDocument } = useDocuments(applicationId);

  // Get English test document type ID
  const englishTestDocType = documentTypesResponse?.data?.find(
    (dt) => dt.code === "ENGLISH_TEST"
  );

  // Handle file upload
  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!applicationId || !englishTestDocType) {
        toast.error("Application not ready for upload");
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

      setUploadedFile(file);
      setIsUploading(true);
      setUploadSuccess(false);

      try {
        // Upload the document
        await uploadDocument.mutateAsync({
          application_id: applicationId,
          document_type_id: englishTestDocType.id,
          file,
        });

        toast.success("Test report uploaded! Extracting data...");

        // Poll for OCR results (max 30 seconds)
        const maxAttempts = 15;
        let attempts = 0;

        const pollOcrResults = async (): Promise<void> => {
          attempts++;

          try {
            console.log('[LanguageCulture] 🔍 Polling OCR results, attempt:', attempts);
            const ocrResponse = await documentService.getOcrResults(applicationId);

            console.log('[LanguageCulture] 📦 OCR Response:', ocrResponse);

            if (ocrResponse.success && ocrResponse.data) {
              const languageData = ocrResponse.data.sections.language_cultural?.extracted_data;
              console.log('[LanguageCulture] 🎯 Extracted Data:', languageData);

              const pendingCount = ocrResponse.data.metadata?.ocr_pending || 0;
              console.log('[LanguageCulture] ⏳ Pending OCR jobs:', pendingCount);

              if (languageData && pendingCount === 0) {
                console.log('[LanguageCulture] ✅ OCR COMPLETE!');
                console.log('[LanguageCulture] 📦 Full data:', languageData);

                // Create a field mapping for OCR data to form fields
                const fieldMapping: Record<string, string> = {
                  'test_type': 'english_test_type',
                  'overall_score': 'english_test_score',
                };

                let fieldsPopulated = 0;

                Object.entries(languageData).forEach(([key, value]) => {
                  try {
                    // Skip component_scores and candidate_name as they're not in the form
                    if (key === 'component_scores' || key === 'candidate_name') {
                      console.log(`[LanguageCulture] ⏭️ Skipping "${key}" - not a form field`);
                      return;
                    }

                    // Map OCR field name to form field name
                    const formFieldKey = (fieldMapping[key] || key) as keyof LanguageAndCultureFormValues;
                    const currentValue = methods.getValues(formFieldKey);

                    console.log(`[LanguageCulture] 🔍 Field "${key}" -> "${formFieldKey}":`, {
                      ocrValue: value,
                      currentValue,
                      willPopulate: !currentValue && value !== null && value !== undefined && value !== ''
                    });

                    if (currentValue) {
                      console.log(`[LanguageCulture] ⏭️ Skipping "${formFieldKey}" - already has value`);
                      return;
                    }

                    if (value === null || value === undefined || value === '') {
                      console.log(`[LanguageCulture] ⏭️ Skipping "${formFieldKey}" - empty value`);
                      return;
                    }

                    console.log(`[LanguageCulture] 🎯 Setting "${formFieldKey}" to:`, value);
                    methods.setValue(formFieldKey, value as any, {
                      shouldValidate: false,
                      shouldDirty: true
                    });
                    fieldsPopulated++;

                    const newValue = methods.getValues(formFieldKey);
                    console.log(`[LanguageCulture] ✓ Verified "${formFieldKey}" is now:`, newValue);
                  } catch (error) {
                    console.error(`[LanguageCulture] ❌ Error setting field "${key}":`, error);
                  }
                });

                console.log(`[LanguageCulture] 🎉 Populated ${fieldsPopulated} fields`);

                setUploadSuccess(true);
                setIsUploading(false);

                if (fieldsPopulated > 0) {
                  toast.success(`Test data extracted! ${fieldsPopulated} fields populated.`);
                } else {
                  toast.success("Test report uploaded successfully!");
                }
                return;
              }

              // OCR still processing
              if (attempts < maxAttempts) {
                setTimeout(() => pollOcrResults(), 2000);
              } else {
                setUploadSuccess(false);
                setIsUploading(false);
                toast.error("OCR processing timed out. Please try again.");
              }
            } else {
              if (attempts < maxAttempts) {
                setTimeout(() => pollOcrResults(), 2000);
              } else {
                setUploadSuccess(false);
                setIsUploading(false);
                toast.error("Failed to extract data from test report");
              }
            }
          } catch (error) {
            console.error("OCR polling error:", error);
            if (attempts < maxAttempts) {
              setTimeout(() => pollOcrResults(), 2000);
            } else {
              setUploadSuccess(false);
              setIsUploading(false);
              toast.error("Failed to extract data from test report");
            }
          }
        };

        setTimeout(() => pollOcrResults(), 2000);

      } catch (error) {
        console.error("Upload failed:", error);
        toast.error("Failed to upload test report");
        setUploadedFile(null);
        setIsUploading(false);
      }
    },
    [applicationId, englishTestDocType, uploadDocument, methods]
  );

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Remove uploaded file
  const handleRemoveFile = () => {
    setUploadedFile(null);
    setUploadSuccess(false);
  };

  const onSubmit = (values: LanguageAndCultureFormValues) => {
    if (applicationId) {
      saveOnSubmit(values);
    }
    const payload: LanguageAndCultureValues =
      languageAndCultureSchema.parse(values);
    languageMutation.mutate(payload);
  };

  return (
    <FormProvider {...methods}>
      <form className="space-y-6" onSubmit={methods.handleSubmit(onSubmit)}>
        {/* English Test Upload Section */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileCheck2 className="h-4 w-4 text-primary" />
                <h4 className="font-medium text-sm">Quick Fill with English Test Report</h4>
              </div>

              {!uploadedFile ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={cn(
                    "border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer",
                    isDragging
                      ? "border-primary bg-primary/10"
                      : "border-muted hover:border-primary/50 hover:bg-accent"
                  )}
                >
                  <input
                    type="file"
                    id="test-upload"
                    className="hidden"
                    accept="image/jpeg,image/jpg,image/png,application/pdf"
                    onChange={handleFileChange}
                    disabled={isUploading || !applicationId}
                  />
                  <label
                    htmlFor="test-upload"
                    className="cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Upload className="h-4 w-4 text-primary" />
                    <div className="text-left">
                      <p className="text-sm font-medium">
                        Upload test report to auto-fill
                      </p>
                      <p className="text-xs text-muted-foreground">
                        IELTS, TOEFL, PTE - JPG, PNG or PDF (max 10MB)
                      </p>
                    </div>
                  </label>
                </div>
              ) : (
                <div className="border rounded-lg p-3 bg-background">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {isUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 text-primary animate-spin flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-xs truncate">
                              {uploadedFile.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Extracting data...
                            </p>
                          </div>
                        </>
                      ) : uploadSuccess ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-xs truncate">
                              {uploadedFile.name}
                            </p>
                            <p className="text-xs text-green-600">
                              Data extracted!
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <FileCheck2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-xs truncate">
                              {uploadedFile.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                    {!isUploading && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveFile}
                        className="h-6 w-6 p-0 flex-shrink-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <FormInput
            name="first_language"
            label="First language"
            placeholder="e.g. Nepali"
          />
          <FormInput
            name="english_proficiency"
            label="English proficiency"
            placeholder="e.g. Advanced"
          />
          <FormInput name="indigenous_status" label="Indigenous status" />
          <FormInput
            name="country_of_birth"
            label="Country of birth"
            placeholder="e.g. Nepal"
          />
          <FormInput
            name="citizenship_status"
            label="Citizenship status"
            placeholder="e.g. Citizen / PR"
          />
          <FormInput
            name="visa_type"
            label="Visa type"
            placeholder="Student visa"
          />
          <FormInput name="visa_expiry" label="Visa expiry" type="date" />
          <FormInput
            name="english_test_type"
            label="English test type"
            placeholder="IELTS / PTE"
          />
          <FormInput
            name="english_test_score"
            label="English test score"
            placeholder="e.g. 7.0"
          />
          <FormInput
            name="english_test_date"
            type="date"
            label="English test date"
          />
        </div>

        {/* Other languages as comma-separated input */}
        <FormInput
          name="other_languages"
          label="Other languages"
          placeholder="Enter languages separated by commas (e.g., Hindi, English, Newari)"
        />

        <ApplicationStepHeader className="mt-4">
          <Button type="submit" disabled={languageMutation.isPending}>
            {languageMutation.isPending ? "Saving..." : "Save & Continue"}
          </Button>
        </ApplicationStepHeader>
      </form>
    </FormProvider>
  );
}
