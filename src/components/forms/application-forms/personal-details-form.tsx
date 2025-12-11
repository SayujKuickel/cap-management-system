"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, useCallback } from "react";
import { Upload, FileCheck2, Loader2, X, CheckCircle2 } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FormInput } from "../../ui/forms/form-input";
import { FormRadio } from "../../ui/forms/form-radio";
import { FormTextarea } from "../../ui/forms/form-textarea";
import { FormSelect } from "../../ui/forms/form-select";
import { FormSearchableSelect } from "../../ui/forms/form-searchable-select";
import { useSearchParams } from "next/navigation";
import { useApplicationStepMutations } from "@/hooks/useApplicationSteps.hook";
import {
  defaultPersonalDetailsValues,
  personalDetailsSchema,
  type PersonalDetailsValues,
} from "@/validation/application/personal-details";
import ApplicationStepHeader from "./application-step-header";
import { useFormPersistence } from "@/hooks/useFormPersistence.hook";
import { useDocuments, useDocumentTypesQuery } from "@/hooks/document.hook";
import documentService from "@/service/document.service";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { getCountriesList, getNationalitiesList } from "@/data/country-list";

export default function PersonalDetailsForm() {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("applicationId");
  const stepId = 1; // Personal Details is step 1
  const personalDetailsMutation = useApplicationStepMutations(applicationId)[stepId];

  const methods = useForm<PersonalDetailsValues>({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: defaultPersonalDetailsValues,
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

  // Passport upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Get document types and upload hook
  const { data: documentTypesResponse } = useDocumentTypesQuery();
  const { uploadDocument } = useDocuments(applicationId);

  // Get passport document type ID
  const passportDocType = documentTypesResponse?.data?.find(
    (dt) => dt.code === "PASSPORT"
  );

  // Handle file upload
  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!applicationId || !passportDocType) {
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
          document_type_id: passportDocType.id,
          file,
        });

        toast.success("Passport uploaded! Extracting data...");

        // Poll for OCR results (max 30 seconds)
        const maxAttempts = 15; // 15 attempts * 2 seconds = 30 seconds
        let attempts = 0;

        const pollOcrResults = async (): Promise<void> => {
          attempts++;

          try {
            console.log('[PersonalDetails] 🔍 Polling OCR results, attempt:', attempts);
            const ocrResponse = await documentService.getOcrResults(applicationId);

            console.log('[PersonalDetails] 📦 OCR Response:', {
              success: ocrResponse.success,
              hasData: !!ocrResponse.data,
              response: ocrResponse
            });

            if (ocrResponse.success && ocrResponse.data) {
              console.log('[PersonalDetails] 📊 OCR Sections:', ocrResponse.data.sections);
              console.log('[PersonalDetails] 📋 Personal Details Section:', ocrResponse.data.sections.personal_details);

              const personalDetailsData = ocrResponse.data.sections.personal_details?.extracted_data;
              console.log('[PersonalDetails] 🎯 Extracted Data:', personalDetailsData);

              // Check if OCR is still pending
              const pendingCount = ocrResponse.data.metadata?.ocr_pending || 0;
              console.log('[PersonalDetails] ⏳ Pending OCR jobs:', pendingCount);


              if (personalDetailsData && pendingCount === 0) {
                // OCR completed successfully
                console.log('[PersonalDetails] ✅ OCR COMPLETE!');
                console.log('[PersonalDetails] 📦 Full data object:', personalDetailsData);
                console.log('[PersonalDetails] 🔑 Data keys:', Object.keys(personalDetailsData));
                console.log('[PersonalDetails] 📝 Data entries:', Object.entries(personalDetailsData));

                // Get current form values
                const currentFormValues = methods.getValues();
                console.log('[PersonalDetails] 📋 Current form values:', currentFormValues);

                // Populate form fields with better error handling
                let fieldsPopulated = 0;

                Object.entries(personalDetailsData).forEach(([key, value]) => {
                  try {
                    const fieldKey = key as keyof PersonalDetailsValues;
                    const currentValue = methods.getValues(fieldKey);

                    console.log(`[PersonalDetails] 🔍 Field "${fieldKey}":`, {
                      ocrValue: value,
                      currentValue,
                      valueType: typeof value,
                      willPopulate: !currentValue && value !== null && value !== undefined && value !== ''
                    });

                    // Skip if field already has a value
                    if (currentValue) {
                      console.log(`[PersonalDetails] ⏭️ Skipping "${fieldKey}" - already has value:`, currentValue);
                      return;
                    }

                    // Skip null/undefined values
                    if (value === null || value === undefined || value === '') {
                      console.log(`[PersonalDetails] ⏭️ Skipping "${fieldKey}" - empty OCR value`);
                      return;
                    }

                    // Set the value
                    console.log(`[PersonalDetails] 🎯 Setting "${fieldKey}" to:`, value);
                    methods.setValue(fieldKey, value as any, {
                      shouldValidate: false,
                      shouldDirty: true
                    });
                    fieldsPopulated++;

                    // Verify it was set
                    const newValue = methods.getValues(fieldKey);
                    console.log(`[PersonalDetails] ✓ Verified "${fieldKey}" is now:`, newValue);
                  } catch (error) {
                    console.error(`[PersonalDetails] ❌ Error setting field "${key}":`, error);
                  }
                });

                console.log(`[PersonalDetails] 🎉 Populated ${fieldsPopulated} fields`);
                console.log('[PersonalDetails] 📋 Final form values:', methods.getValues());

                setUploadSuccess(true);
                setIsUploading(false);

                if (fieldsPopulated > 0) {
                  toast.success(`Passport data extracted! ${fieldsPopulated} fields populated.`);
                } else {
                  toast.success("Passport uploaded successfully!");
                }
                return;
              }

              // OCR still processing, continue polling
              if (attempts < maxAttempts) {
                setTimeout(() => pollOcrResults(), 2000); // Poll every 2 seconds
              } else {
                // Timeout
                setUploadSuccess(false);
                setIsUploading(false);
                toast.error("OCR processing timed out. Please try again.");
              }
            } else {
              // No OCR data yet, continue polling
              if (attempts < maxAttempts) {
                setTimeout(() => pollOcrResults(), 2000);
              } else {
                setUploadSuccess(false);
                setIsUploading(false);
                toast.error("Failed to extract data from passport");
              }
            }
          } catch (error) {
            console.error("OCR polling error:", error);
            if (attempts < maxAttempts) {
              setTimeout(() => pollOcrResults(), 2000);
            } else {
              setUploadSuccess(false);
              setIsUploading(false);
              toast.error("Failed to extract data from passport");
            }
          }
        };

        // Start polling after a short delay
        setTimeout(() => pollOcrResults(), 2000);

      } catch (error) {
        console.error("Upload failed:", error);
        toast.error("Failed to upload passport");
        setUploadedFile(null);
        setIsUploading(false);
      }
    },
    [applicationId, passportDocType, uploadDocument, methods]
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

  const onSubmit = (values: PersonalDetailsValues) => {
    if (applicationId) {
      saveOnSubmit(values);
    }
    personalDetailsMutation.mutate(values);
  };

  return (
    <FormProvider {...methods}>
      <form className="space-y-10" onSubmit={methods.handleSubmit(onSubmit)}>
        {/* Passport Upload Section */}
        <Card className="border-primary/20 bg-primary/5 shadow-sm">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileCheck2 className="h-4 w-4 text-primary" />
                <h4 className="font-medium text-sm">Quick Fill with Passport</h4>
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
                    id="passport-upload"
                    className="hidden"
                    accept="image/jpeg,image/jpg,image/png,application/pdf"
                    onChange={handleFileChange}
                    disabled={isUploading || !applicationId}
                  />
                  <label
                    htmlFor="passport-upload"
                    className="cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Upload className="h-4 w-4 text-primary" />
                    <div className="text-left">
                      <p className="text-sm font-medium">
                        Upload passport to auto-fill
                      </p>
                      <p className="text-xs text-muted-foreground">
                        JPG, PNG or PDF (max 10MB)
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

        {/* BASIC INFORMATION */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <Separator className="bg-primary/20" />
          </div>

          <div className="space-y-4">
            {/* Student Origin */}
            <div>
              <FormRadio
                name="student_origin"
                label="Student Origin"
                options={[
                  "Overseas Student (Offshore)",
                  "Overseas Student in Australia (Onshore)",
                  "Resident Student (Domestic)"
                ]}
              />
            </div>

            {/* Title */}
            <div>
              <FormRadio
                name="title"
                label="Title"
                options={["Mr", "Ms", "Mrs", "Other"]}
              />
            </div>

            {/* Full Name */}
            <div>
              <p className="text-sm font-medium mb-2">Enter your Full Name</p>
              <p className="text-xs text-muted-foreground mb-3">
                Please write the name that you used when you applied for your Unique Student Identifier (USI),
                including any middle names. If you do not have a USI please write your name exactly as written
                in the identity document you choose to use
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormInput
                  name="given_name"
                  label="First Name"
                  placeholder="Merritt"
                />
                <FormInput
                  name="middle_name"
                  label="Middle Name(Optional)"
                  placeholder="Quinn Shaw"
                />
                <FormInput
                  name="family_name"
                  label="Last Name"
                  placeholder="Higgins"
                />
              </div>
            </div>

            {/* Gender */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormRadio
                name="gender"
                label="Gender"
                options={["Male", "Female", "Other"]}
              />
              <FormInput
                name="date_of_birth"
                label="Date of birth"
                type="date"
              />
            </div>
          </div>
        </section>

        {/* CONTACT DETAILS */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Contact Details</h3>
            <Separator className="bg-primary/20" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              name="email"
              label="Contact Email Address"
              type="email"
              placeholder="hisucug@mailinator.com"
            />
            <FormInput
              name="alternate_email"
              label="Alternate Email Address(Optional)"
              type="email"
              placeholder="tokuxlt@mailinator.com"
            />
            <FormInput
              name="phone"
              label="Mobile Number"
              placeholder="9875237523"
            />
            <FormInput
              name="home_phone"
              label="Home Phone(Optional)"
              placeholder="9875237523"
            />
          </div>
        </section>

        {/* PASSPORT DETAILS */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Passport Details</h3>
            <Separator className="bg-primary/20" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSearchableSelect
              name="country_of_birth"
              label="Country of Birth"
              placeholder="Select country..."
              searchPlaceholder="Search countries..."
              options={getCountriesList()}
              emptyMessage="No country found."
            />
            <FormSearchableSelect
              name="nationality"
              label="Nationality"
              placeholder="Select nationality..."
              searchPlaceholder="Search nationalities..."
              options={getNationalitiesList()}
              emptyMessage="No nationality found."
            />
            <FormInput
              name="passport_number"
              label="Passport Number"
              placeholder="19"
            />
            <FormInput
              name="passport_expiry"
              label="Passport Expiry Date"
              type="date"
            />
          </div>
        </section>

        {/* VISA DETAILS - Only show for Onshore students */}
        {methods.watch("student_origin") === "Overseas Student in Australia (Onshore)" && (
          <section className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Visa Details</h3>
              <Separator className="bg-primary/20" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormSelect
                name="visa_type"
                label="VISA Type"
                placeholder="Select VISA Type"
                options={[
                  { value: "graduate_485", label: "Graduate 485" },
                  { value: "student_visa", label: "Student Visa" },
                  { value: "tourist_visitor", label: "Tourist/Visitor" },
                  { value: "working_holiday", label: "Working Holiday" },
                  { value: "other", label: "Other" },
                ]}
              />
              <FormInput
                name="visa_number"
                label="VISA Number(Optional)"
                placeholder=""
              />
              <FormInput
                name="visa_expiry"
                label="Expiry Date"
                type="date"
              />
            </div>
          </section>
        )}

        {/* RESIDENTIAL ADDRESS */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Residential Address</h3>
            <Separator className="bg-primary/20" />
          </div>

          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Please provide the physical address (street number and name not post office box) where you usually
              reside rather than any temporary address at which you reside for training, work or other purposes
              before returning to your home.
            </p>
            <p className="text-xs text-muted-foreground">
              If you are from a rural area use the address from your state or territory's rural property addressing
              or 'numbering' system as your residential street address.
            </p>
            <p className="text-xs text-muted-foreground">
              Building/property name is the official place name or common usage name for an address site, including
              the name of a building, Aboriginal community, homestead, building complex, agricultural property, park
              or unbounded address site.
            </p>

            <FormInput
              name="search_address"
              label="Search Address"
              placeholder="Search Address"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormSearchableSelect
                name="country"
                label="Country"
                placeholder="Select country..."
                searchPlaceholder="Search countries..."
                options={getCountriesList()}
                emptyMessage="No country found."
              />
              <FormInput
                name="building_name"
                label="Building / Property name(Optional)"
                placeholder="Bert Randolph"
              />
              <FormInput
                name="flat_unit"
                label="Flat / Unit(Optional)"
                placeholder="Et culpa quis modi e"
              />
              <FormInput
                name="street_number"
                label="Street Number"
                placeholder="549"
              />
              <FormInput
                name="street_name"
                label="Street Name"
                placeholder="Tad Kelly"
              />
              <FormInput
                name="suburb"
                label="City/Town/Suburb"
                placeholder="Ut porro qui in saep"
              />
              <FormInput
                name="state"
                label="State/Province"
                placeholder="wefghjk"
              />
              <FormInput
                name="postcode"
                label="Post Code"
                placeholder="1214"
              />
            </div>
          </div>
        </section>

        {/* POSTAL ADDRESS */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Postal Address</h3>
            <Separator className="bg-primary/20" />
          </div>

          <div className="space-y-4">
            <FormRadio
              name="postal_same_as_residential"
              label="Is your Postal address same as residential address?"
              options={["Yes", "No"]}
            />

            {methods.watch("postal_same_as_residential") === "No" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormSearchableSelect
                  name="postal_country"
                  label="Country(Optional)"
                  placeholder="Select country..."
                  searchPlaceholder="Search countries..."
                  options={getCountriesList()}
                  emptyMessage="No country found."
                />
                <FormInput
                  name="postal_building_name"
                  label="Building/Property name(Optional)"
                  placeholder="Bert Randolph"
                />
                <FormInput
                  name="postal_flat_unit"
                  label="Flat/Unit(Optional)"
                  placeholder="Et culpa quis modi e"
                />
                <FormInput
                  name="postal_street_number"
                  label="Street Number(Optional)"
                  placeholder="549"
                />
                <FormInput
                  name="postal_street_name"
                  label="Street Name(Optional)"
                  placeholder="Tad Kelly"
                />
                <FormInput
                  name="postal_suburb"
                  label="City/Town/Suburb(Optional)"
                  placeholder="Ut porro qui in saep"
                />
                <FormInput
                  name="postal_state"
                  label="State/Province(Optional)"
                  placeholder="wefghjk"
                />
                <FormInput
                  name="postal_postcode"
                  label="Post Code(Optional)"
                  placeholder="1214"
                />
              </div>
            )}
          </div>
        </section>

        {/* OVERSEAS/PERMANENT ADDRESS */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Overseas/Permanent Address</h3>
            <Separator className="bg-primary/20" />
          </div>

          <div className="space-y-4">
            <FormSearchableSelect
              name="overseas_country"
              label="Select country"
              placeholder="Select country..."
              searchPlaceholder="Search countries..."
              options={getCountriesList()}
              emptyMessage="No country found."
            />

            <FormTextarea
              name="overseas_address"
              label="Overseas Address(Optional)"
              placeholder=""
              rows={5}
            />
          </div>
        </section>

        <ApplicationStepHeader className="mt-8 pt-6 border-t">
          <Button type="submit" disabled={personalDetailsMutation.isPending}>
            {personalDetailsMutation.isPending
              ? "Saving..."
              : "Save & Continue"}
          </Button>
        </ApplicationStepHeader>
      </form>
    </FormProvider>
  );
}
