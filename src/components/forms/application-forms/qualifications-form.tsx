"use client";

import { useForm, useFieldArray, FormProvider, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FormInput } from "../../ui/forms/form-input";
import { FormRadio } from "../../ui/forms/form-radio";
import { useSearchParams } from "next/navigation";
import { useApplicationStepMutations } from "@/hooks/useApplicationSteps.hook";
import ApplicationStepHeader from "./application-step-header";
import {
  createEmptyQualification,
  qualificationsSchema,
  type QualificationsFormValues,
  defaultQualificationsValues,
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
    defaultValues: defaultQualificationsValues,
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

  const hasQualifications = useWatch({
    control,
    name: "has_qualifications",
  });

  // Reset qualifications when "No" is selected
  useEffect(() => {
    if (hasQualifications === "No") {
      methods.setValue("qualifications", []);
    } else if (hasQualifications === "Yes" && fields.length === 0) {
      append(createEmptyQualification() as any);
    }
  }, [hasQualifications, methods, fields.length, append]);

  const canAddMore = fields.length < 10;

  const onSubmit = (values: QualificationsFormValues) => {
    if (applicationId) {
      saveOnSubmit(values);
    }
    qualificationsMutation.mutate(values);
  };

  return (
    <FormProvider {...methods}>
      <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
        <section className="space-y-6">
          <div className="space-y-6">
            <div>
              <p className="text-sm mb-3">Have you successfully completed any previous qualifications?</p>
              <FormRadio
                name="has_qualifications"
                label=""
                options={["Yes", "No"]}
              />
            </div>

            {hasQualifications === "Yes" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm">Qualifications List</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!canAddMore}
                    onClick={() => append(createEmptyQualification() as any)}
                  >
                    Add Qualification
                  </Button>
                </div>

                <div className="space-y-6">
                  {fields.map((field, index) => (
                    <div key={field.id} className="space-y-4 rounded-lg border p-4 bg-muted/5">
                      <div className="flex items-center justify-between">
                        <p className="text-sm">
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
              </div>
            )}
          </div>
        </section>

        <ApplicationStepHeader className="mt-8 pt-6 border-t">
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
