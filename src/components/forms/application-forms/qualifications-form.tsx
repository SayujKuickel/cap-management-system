"use client";

import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { FormInput } from "../../ui/forms/form-input";
import { useSearchParams } from "next/navigation";
import { useApplicationStepMutations } from "@/hooks/useApplicationSteps.hook";
import ApplicationStepHeader from "./application-step-header";
import {
  createEmptyQualification,
  qualificationsSchema,
  type QualificationsFormValues,
} from "@/validation/application/qualifications";
import { useFormPersistence } from "@/hooks/useFormPersistence.hook";

export default function QualificationsForm() {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("applicationId");
  const stepId = 7; // Qualifications is step 7
  const qualificationsMutation =
    useApplicationStepMutations(applicationId)[stepId];

  const methods = useForm<QualificationsFormValues>({
    resolver: zodResolver(qualificationsSchema),
    defaultValues: {
      qualifications: [createEmptyQualification()],
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
    name: "qualifications",
  });

  const canAddMore = fields.length < 10;

  const onSubmit = (values: QualificationsFormValues) => {
    // Save to Zustand store before submitting to API
    if (applicationId) {
      saveOnSubmit(values);
    }
    qualificationsMutation.mutate(values);
  };

  return (
    <FormProvider {...methods}>
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Previous Qualifications</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!canAddMore}
            onClick={() => append(createEmptyQualification())}
          >
            Add Qualification
          </Button>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="space-y-4 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">
                  Qualification {index + 1}
                </p>

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

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormInput
                  name={`qualifications.${index}.qualification_name`}
                  label="Qualification Name"
                  placeholder="e.g. Bachelor of IT"
                />

                <FormInput
                  name={`qualifications.${index}.institution`}
                  label="Institution"
                  placeholder="e.g. XYZ University"
                />

                <FormInput
                  name={`qualifications.${index}.field_of_study`}
                  label="Field of Study"
                  placeholder="e.g. Software Engineering"
                />

                <FormInput
                  name={`qualifications.${index}.grade`}
                  label="Grade"
                  placeholder="e.g. Distinction"
                />

                <FormInput
                  name={`qualifications.${index}.completion_date`}
                  label="Completion Date"
                  type="date"
                />

                <FormInput
                  name={`qualifications.${index}.certificate_number`}
                  label="Certificate Number"
                  placeholder="e.g. CERT-123456"
                />
              </div>
            </div>
          ))}
        </div>

        <ApplicationStepHeader className="mt-4">
          <Button
            type="submit"
            disabled={qualificationsMutation.isPending}
          >
            {qualificationsMutation.isPending
              ? "Saving..."
              : "Save & Continue"}
          </Button>
        </ApplicationStepHeader>
      </form>
    </FormProvider>
  );
}
