"use client";

import { useEffect } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { FormCheckbox } from "../../ui/forms/form-checkbox";
import { FormRadio } from "../../ui/forms/form-radio";
import { Separator } from "@/components/ui/separator";

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
  const stepId = 5; // Disability is step 5
  const disabilityMutation = useApplicationStepMutations(applicationId)[stepId];

  const methods = useForm<DisabilityFormValues>({
    resolver: zodResolver(disabilitySchema),
    defaultValues: defaultDisabilityValues,
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

  const hasDisability = useWatch({
    control: methods.control,
    name: "has_disability",
  });

  // Reset disability checkboxes when "No" is selected
  useEffect(() => {
    if (hasDisability === "No") {
      methods.setValue("disability_hearing", false);
      methods.setValue("disability_physical", false);
      methods.setValue("disability_intellectual", false);
      methods.setValue("disability_learning", false);
      methods.setValue("disability_mental_illness", false);
      methods.setValue("disability_acquired_brain", false);
      methods.setValue("disability_vision", false);
      methods.setValue("disability_medical_condition", false);
      methods.setValue("disability_other", false);
    }
  }, [hasDisability, methods]);

  const onSubmit = (values: DisabilityFormValues) => {
    if (applicationId) {
      saveOnSubmit(values);
    }
    const payload: DisabilityValues = disabilitySchema.parse(values);
    disabilityMutation.mutate(payload);
  };

  return (
    <FormProvider {...methods}>
      <form className="space-y-8" onSubmit={methods.handleSubmit(onSubmit)}>
        <section className="space-y-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm mb-3">
                Do you consider yourself to have a disability, impairment or long-term condition?
              </p>
              <FormRadio
                name="has_disability"
                label=""
                options={["Yes", "No"]}
              />
            </div>

            {hasDisability === "Yes" && (
              <div className="space-y-3 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-sm">If Yes, select the below list.</p>
                <div className="space-y-3 pl-1">
                  <FormCheckbox name="disability_hearing" label="Hearing/deaf" />
                  <FormCheckbox name="disability_physical" label="Physical" />
                  <FormCheckbox name="disability_intellectual" label="Intellectual" />
                  <FormCheckbox name="disability_learning" label="Learning" />
                  <FormCheckbox name="disability_mental_illness" label="Mental illness" />
                  <FormCheckbox name="disability_acquired_brain" label="Acquired brain impairment" />
                  <FormCheckbox name="disability_vision" label="Vision" />
                  <FormCheckbox name="disability_medical_condition" label="Medical condition-18" />
                  <FormCheckbox name="disability_other" label="Other-19" />
                </div>
              </div>
            )}
          </div>
        </section>

        <ApplicationStepHeader className="mt-8 pt-6 border-t">
          <Button type="submit" disabled={disabilityMutation.isPending}>
            {disabilityMutation.isPending ? "Saving..." : "Save & Continue"}
          </Button>
        </ApplicationStepHeader>
      </form>
    </FormProvider>
  );
}
