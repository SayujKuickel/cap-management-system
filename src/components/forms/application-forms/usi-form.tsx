"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/forms/form-input";
import { FormCheckbox } from "@/components/ui/forms/form-checkbox";
import { useSearchParams } from "next/navigation";
import { useApplicationStepMutations } from "@/hooks/useApplicationSteps.hook";
import ApplicationStepHeader from "./application-step-header";
import {
  defaultUSIValues,
  usiSchema,
  type USIValues,
} from "@/validation/application/usi";
import { useFormPersistence } from "@/hooks/useFormPersistence.hook";

export default function USIForm() {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("applicationId");
  const stepId = 10; // USI is step 10
  const usiMutation = useApplicationStepMutations(applicationId)[stepId];

  const methods = useForm<USIValues>({
    resolver: zodResolver(usiSchema),
    defaultValues: defaultUSIValues,
  });

  // Enable automatic form persistence
  const { saveOnSubmit } = useFormPersistence({
    applicationId,
    stepId,
    form: methods,
    enabled: !!applicationId,
  });

  const { handleSubmit } = methods;

  const onSubmit = (values: USIValues) => {
    // Save to Zustand store before submitting to API
    if (applicationId) {
      saveOnSubmit(values);
    }
    usiMutation.mutate(values);
  };

  return (
    <FormProvider {...methods}>
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-muted/50 p-4 rounded-lg">
          <p className="text-sm">
            If you already completed nationally recognised training (RSA, White
            Card, First Aid, TAFE, etc.) you may already have a USI. Please
            check before creating a new one:{" "}
            <a
              href="https://www.usi.gov.au/faqs/i-have-forgotten-my-usi/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              https://www.usi.gov.au/faqs/i-have-forgotten-my-usi/
            </a>
          </p>
        </div>

        <FormInput name="usi" label="USI (optional)" placeholder="ABC1234567" />

        <FormCheckbox
          name="consent_to_verify"
          label="I authorize my provider to verify or create a USI on my behalf"
        />

        <ApplicationStepHeader className="mt-4">
          <Button type="submit" disabled={usiMutation.isPending}>
            {usiMutation.isPending ? "Saving..." : "Save & Continue"}
          </Button>
        </ApplicationStepHeader>
      </form>
    </FormProvider>
  );
}
