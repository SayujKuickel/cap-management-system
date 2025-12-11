"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  defaultLanguageAndCultureValues,
  languageAndCultureSchema,
  type LanguageAndCultureValues,
  type LanguageAndCultureFormValues,
} from "@/validation/application/language-cultural";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { FormInput } from "../../ui/forms/form-input";
import { FormRadio } from "../../ui/forms/form-radio";
import { FormSearchableSelect } from "../../ui/forms/form-searchable-select";
import { FormSelect } from "../../ui/forms/form-select";
import { useSearchParams } from "next/navigation";
import { useApplicationStepMutations } from "@/hooks/useApplicationSteps.hook";
import ApplicationStepHeader from "./application-step-header";
import { useFormPersistence } from "@/hooks/useFormPersistence.hook";
import { useDocuments, useDocumentTypesQuery } from "@/hooks/document.hook";
import documentService from "@/service/document.service";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useState, useCallback } from "react";
import { Upload, FileCheck2, Loader2, X, CheckCircle2, Pencil, Trash2 } from "lucide-react";

// Language options for searchable select
const languageOptions = [
  "Afrikaans", "Albanian", "Arabic", "Armenian", "Bengali", "Bulgarian", "Burmese",
  "Cantonese", "Chinese (Mandarin)", "Croatian", "Czech", "Danish", "Dutch", "English",
  "Estonian", "Filipino", "Finnish", "French", "German", "Greek", "Gujarati", "Hebrew",
  "Hindi", "Hungarian", "Indonesian", "Italian", "Japanese", "Kannada", "Khmer", "Korean",
  "Lao", "Latvian", "Lithuanian", "Malay", "Malayalam", "Marathi", "Mongolian", "Nepali",
  "Norwegian", "Persian", "Polish", "Portuguese", "Punjabi", "Romanian", "Russian",
  "Serbian", "Sinhala", "Slovak", "Slovenian", "Spanish", "Swahili", "Swedish", "Tamil",
  "Telugu", "Thai", "Turkish", "Ukrainian", "Urdu", "Vietnamese", "Other"
];

// Test type options
const testTypeOptions = [
  { value: "ielts", label: "INTERNATIONAL ENGLISH LANGUAGE TESTING SYSTEM (IELTS)" },
  { value: "pte", label: "PEARSON TEST OF ENGLISH (PTE)" },
  { value: "toefl", label: "TEST OF ENGLISH AS A FOREIGN LANGUAGE (TOEFL)" },
  { value: "cambridge", label: "CAMBRIDGE ENGLISH" },
  { value: "oet", label: "OCCUPATIONAL ENGLISH TEST (OET)" },
  { value: "other", label: "OTHER" },
];

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

      const validTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a valid image (JPG, PNG) or PDF file");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }

      setUploadedFile(file);
      setIsUploading(true);
      setUploadSuccess(false);

      try {
        await uploadDocument.mutateAsync({
          application_id: applicationId,
          document_type_id: englishTestDocType.id,
          file,
        });

        toast.success("Test report uploaded! Extracting data...");

        const maxAttempts = 15;
        let attempts = 0;

        const pollOcrResults = async (): Promise<void> => {
          attempts++;

          try {
            const ocrResponse = await documentService.getOcrResults(applicationId);

            if (ocrResponse.success && ocrResponse.data) {
              const languageData = ocrResponse.data.sections.language_cultural?.extracted_data;
              const pendingCount = ocrResponse.data.metadata?.ocr_pending || 0;

              if (languageData && pendingCount === 0) {
                let fieldsPopulated = 0;

                Object.entries(languageData).forEach(([key, value]) => {
                  try {
                    const formFieldKey = key as keyof LanguageAndCultureFormValues;
                    const currentValue = methods.getValues(formFieldKey);

                    if (!currentValue && value !== null && value !== undefined && value !== '') {
                      methods.setValue(formFieldKey, value as any, {
                        shouldValidate: false,
                        shouldDirty: true
                      });
                      fieldsPopulated++;
                    }
                  } catch (error) {
                    console.error(`Error setting field "${key}":`, error);
                  }
                });

                setUploadSuccess(true);
                setIsUploading(false);

                if (fieldsPopulated > 0) {
                  toast.success(`Test data extracted! ${fieldsPopulated} fields populated.`);
                } else {
                  toast.success("Test report uploaded successfully!");
                }
                return;
              }

              if (attempts < maxAttempts) {
                setTimeout(() => pollOcrResults(), 2000);
              } else {
                setUploadSuccess(false);
                setIsUploading(false);
                toast.error("OCR processing timed out.");
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

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
    if (file) handleFileUpload(file);
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setUploadSuccess(false);
  };

  const onSubmit = (values: LanguageAndCultureFormValues) => {
    if (applicationId) {
      saveOnSubmit(values);
    }
    const payload: LanguageAndCultureValues = languageAndCultureSchema.parse(values);
    languageMutation.mutate(payload);
  };

  // Watch for conditional rendering
  const isEnglishMain = methods.watch("is_english_main_language");
  const completedEnglishTest = methods.watch("completed_english_test");

  return (
    <FormProvider {...methods}>
      <form className="space-y-10" onSubmit={methods.handleSubmit(onSubmit)}>
        {/* English Test Upload Section */}
        <Card className="border-primary/20 bg-primary/5 shadow-sm">
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
                      <p className="text-sm font-medium">Upload test report to auto-fill</p>
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
                            <p className="font-medium text-xs truncate">{uploadedFile.name}</p>
                            <p className="text-xs text-muted-foreground">Extracting data...</p>
                          </div>
                        </>
                      ) : uploadSuccess ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-xs truncate">{uploadedFile.name}</p>
                            <p className="text-xs text-green-600">Data extracted!</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <FileCheck2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-xs truncate">{uploadedFile.name}</p>
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

        {/* LANGUAGE AND CULTURAL DIVERSITY */}
        <section className="space-y-6">
          <div className="space-y-6">
            {/* Aboriginal/Torres Strait Islander origin */}
            <div>
              <p className="text-sm mb-1">Are you of Australian Aboriginal and Torres Strait Islander origin?</p>
              <p className="text-xs text-muted-foreground mb-3">
                For persons of both Australian Aboriginal and Torres Strait Islander origin, mark both 'Yes' boxes.
              </p>
              <FormRadio
                name="aboriginal_torres_strait"
                label=""
                options={[
                  "Yes, Both Aboriginal and Torres Strait Islander",
                  "Yes, Only Aboriginal",
                  "Yes, Only Torres Strait Islander",
                  "No, Neither Aboriginal and Torres Strait Islander",
                  "Not Stated / Prefer not to say"
                ]}
              />
            </div>

            {/* Is English main language */}
            <div>
              <p className="text-sm mb-3">Is English your main language?</p>
              <FormRadio
                name="is_english_main_language"
                label=""
                options={["Yes", "No"]}
              />
            </div>

            {/* Conditional: Main Language selection */}
            {isEnglishMain === "No" && (
              <div>
                <FormSearchableSelect
                  name="main_language"
                  label="If No, What is your Main Language?"
                  placeholder="Select Language..."
                  searchPlaceholder="Search languages..."
                  options={languageOptions}
                  emptyMessage="No language found."
                />
              </div>
            )}

            {/* English speaking proficiency */}
            <div>
              <p className="text-sm mb-3">How well do you speak English?</p>
              <FormRadio
                name="english_speaking_proficiency"
                label=""
                options={["Very Well", "Well", "Not Well", "Not at all", "Not Stated"]}
              />
            </div>
          </div>
        </section>

        {/* ENGLISH PROFICIENCY SECTION */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg">English Language Proficiency</h3>
            <Separator className="bg-primary/20" />
          </div>

          <div className="space-y-6">
            {/* Previous studies */}
            <div>
              <p className="text-sm mb-3">Was English the language of instruction in previous secondary or tertiary studies?(Optional)</p>
              <FormRadio
                name="english_instruction_previous_studies"
                label=""
                options={["Yes", "No"]}
              />
            </div>

            {/* Completed English test */}
            <div>
              <p className="text-sm mb-3">Have you completed a test of English Language Proficiency?(Optional)</p>
              <FormRadio
                name="completed_english_test"
                label=""
                options={["Yes", "No"]}
              />
            </div>

            {/* English Test Section - Conditional */}
            {completedEnglishTest === "Yes" && (
              <div className="space-y-4">
                <h4 className="text-sm">English Test</h4>

                {/* Test Details Table */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-3 font-normal">TEST TYPE</th>
                          <th className="text-left p-3 font-normal">DATE OF TEST</th>
                          <th className="text-left p-3 font-normal">LISTENING</th>
                          <th className="text-left p-3 font-normal">WRITING</th>
                          <th className="text-left p-3 font-normal">READING</th>
                          <th className="text-left p-3 font-normal">SPEAKING</th>
                          <th className="text-left p-3 font-normal">OVERALL</th>
                          <th className="text-left p-3 font-normal">ACTION</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t">
                          <td className="p-3">
                            <FormSelect
                              name="english_test_type"
                              label=""
                              placeholder="Select test..."
                              options={testTypeOptions}
                            />
                          </td>
                          <td className="p-3">
                            <FormInput
                              name="english_test_date"
                              label=""
                              type="date"
                            />
                          </td>
                          <td className="p-3">
                            <FormInput
                              name="english_test_listening"
                              label=""
                              placeholder="0.0"
                            />
                          </td>
                          <td className="p-3">
                            <FormInput
                              name="english_test_writing"
                              label=""
                              placeholder="0.0"
                            />
                          </td>
                          <td className="p-3">
                            <FormInput
                              name="english_test_reading"
                              label=""
                              placeholder="0.0"
                            />
                          </td>
                          <td className="p-3">
                            <FormInput
                              name="english_test_speaking"
                              label=""
                              placeholder="0.0"
                            />
                          </td>
                          <td className="p-3">
                            <FormInput
                              name="english_test_overall"
                              label=""
                              placeholder="0.0"
                            />
                          </td>
                          <td className="p-3">
                            <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <ApplicationStepHeader className="mt-8 pt-6 border-t">
          <Button type="submit" disabled={languageMutation.isPending}>
            {languageMutation.isPending ? "Saving..." : "Save & Continue"}
          </Button>
        </ApplicationStepHeader>
      </form>
    </FormProvider>
  );
}
