"use client";

import { useEffect } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { FormInput } from "../../ui/forms/form-input";
import { FormCheckbox } from "../../ui/forms/form-checkbox";
import { FormSelect } from "../../ui/forms/form-select";

import {
  disabilitySchema,
  type DisabilityValues,
  type DisabilityFormValues,
  defaultDisabilityValues,
} from "@/validation/application/disability";
import { useSearchParams } from "next/navigation";
import { useApplicationStepMutations } from "@/hooks/useApplicationSteps.hook";
import ApplicationStepHeader from "./application-step-header";
import { useFormPersistence } from "@/hooks/useFormPersistence.hook";

export default function DisabilityForm() {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("applicationId");
  const stepId = 6; // Disability is step 6
  const disabilityMutation = useApplicationStepMutations(applicationId)[stepId];

  const form = useForm<DisabilityFormValues>({
    resolver: zodResolver(disabilitySchema),
    defaultValues: defaultDisabilityValues,
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  // Enable automatic form persistence
  const { saveOnSubmit } = useFormPersistence({
    applicationId,
    stepId,
    form: form,
    enabled: !!applicationId,
  });

  const hasDisability = useWatch({
    control: form.control,
    name: "has_disability",
  });
  const hasDocumentation = useWatch({
    control: form.control,
    name: "has_documentation",
  });

  useEffect(() => {
    if (!hasDisability) {
      form.setValue("disability_type", "");
      form.setValue("disability_details", "");
      form.setValue("support_required", "");
      form.setValue("has_documentation", false);
      form.setValue("documentation_status", "");
      form.setValue("adjustments_needed", "");
    }
  }, [hasDisability, form]);

  useEffect(() => {
    if (!hasDocumentation) {
      form.setValue("documentation_status", "");
      form.setValue("adjustments_needed", "");
    }
  }, [hasDocumentation, form]);

  const onSubmit = (values: DisabilityFormValues) => {
    // Save to Zustand store before submitting to API
    if (applicationId) {
      saveOnSubmit(values);
    }
    const payload: DisabilityValues = disabilitySchema.parse(values);
    disabilityMutation.mutate(payload);
  };

  return (
    <FormProvider {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <FormCheckbox
            name="has_disability"
            label="I have a disability, impairment, or long-term condition"
          />

          {hasDisability && (
            <>
              <FormInput
                name="disability_type"
                label="Disability Type"
                placeholder="e.g., Vision, Physical, Learning"
              />

              <FormInput
                name="disability_details"
                label="Disability Details"
                placeholder="Provide details about your condition"
              />

              <FormInput
                name="support_required"
                label="Support Required"
                placeholder="What support do you require?"
              />

              <FormCheckbox
                name="has_documentation"
                label="I have documentation"
              />

              {hasDocumentation && (
                <>
                  <FormSelect
                    name="documentation_status"
                    label="Documentation Status"
                    placeholder="Select documentation status"
                    options={[
                      { value: "pending", label: "Pending" },
                      { value: "submitted", label: "Submitted" },
                      { value: "not_available", label: "Not available" },
                    ]}
                  />

                  <FormInput
                    name="adjustments_needed"
                    label="Adjustments Needed"
                    placeholder="Enter adjustments separated by commas (e.g., Extra time, Quiet room, Assistive technology)"
                  />
                </>
              )}
            </>
          )}
        </div>

        <ApplicationStepHeader className="mt-4">
          <Button type="submit" disabled={disabilityMutation.isPending}>
            {disabilityMutation.isPending ? "Saving..." : "Save & Continue"}
          </Button>
        </ApplicationStepHeader>
      </form>
    </FormProvider>
  );
}
