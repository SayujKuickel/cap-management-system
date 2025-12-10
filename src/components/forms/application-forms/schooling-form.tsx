"use client";

import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
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

export default function SchoolingForm() {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("applicationId");
  const stepId = 7; // Schooling is step 7
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
          {fields.map((field, index) => (
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
          ))}
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
