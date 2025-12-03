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
  createEmptyEmploymentEntry,
  employmentSchema,
  type EmploymentFormValues,
} from "@/validation/application/employment";
import { useFormPersistence } from "@/hooks/useFormPersistence.hook";

export default function EmploymentForm() {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("applicationId");
  const stepId = 9; // Employment is step 9
  const employmentMutation = useApplicationStepMutations(applicationId)[stepId];

  const methods = useForm<EmploymentFormValues>({
    resolver: zodResolver(employmentSchema),
    defaultValues: {
      entries: [createEmptyEmploymentEntry()],
    },
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

  const onSubmit = (values: EmploymentFormValues) => {
    // Save to Zustand store before submitting to API
    if (applicationId) {
      saveOnSubmit(values);
    }
    employmentMutation.mutate(values);
  };

  return (
    <FormProvider {...methods}>
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Employment History</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!canAddMore}
            onClick={() => append(createEmptyEmploymentEntry())}
          >
            Add Entry
          </Button>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="space-y-4 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Entry {index + 1}</p>

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
                  name={`entries.${index}.employer`}
                  label="Employer"
                  placeholder="e.g. ABC Pty Ltd"
                />

                <FormInput
                  name={`entries.${index}.role`}
                  label="Role"
                  placeholder="e.g. IT Support Engineer"
                />

                <FormInput
                  name={`entries.${index}.industry`}
                  label="Industry"
                  placeholder="e.g. Information Technology"
                />

                <FormInput
                  name={`entries.${index}.responsibilities`}
                  label="Responsibilities"
                  placeholder="e.g. Help desk, ticket triage..."
                />

                <FormInput
                  name={`entries.${index}.start_date`}
                  label="Start Date"
                  type="date"
                />

                <FormInput
                  name={`entries.${index}.end_date`}
                  label="End Date"
                  type="date"
                />
              </div>

              <FormCheckbox
                name={`entries.${index}.is_current`}
                label="I currently work in this role"
              />
            </div>
          ))}
        </div>

        <ApplicationStepHeader className="mt-4">
          <Button type="submit" disabled={employmentMutation.isPending}>
            {employmentMutation.isPending ? "Saving..." : "Save & Continue"}
          </Button>
        </ApplicationStepHeader>
      </form>
    </FormProvider>
  );
}
