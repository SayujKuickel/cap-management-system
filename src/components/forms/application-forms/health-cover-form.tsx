"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { FormInput } from "../../ui/forms/form-input";
import { FormSelect } from "../../ui/forms/form-select";
import { useSearchParams } from "next/navigation";
import { useApplicationStepMutations } from "@/hooks/useApplicationSteps.hook";
import ApplicationStepHeader from "./application-step-header";
import {
  defaultHealthCoverValues,
  healthCoverSchema,
  type HealthCoverValues,
} from "@/validation/application/health-cover";

export default function HealthCoverForm() {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("applicationId");
  const healthCoverMutation = useApplicationStepMutations(applicationId)[3];

  const methods = useForm<HealthCoverValues>({
    resolver: zodResolver(healthCoverSchema),
    defaultValues: defaultHealthCoverValues,
  });
  const { handleSubmit } = methods;

  return (
    <FormProvider {...methods}>
      <form
        className="space-y-6"
        onSubmit={handleSubmit((values) => {
          healthCoverMutation.mutate(values);
        })}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormInput name="provider" label="Provider" placeholder="Medibank" />

          <FormInput
            name="policy_number"
            label="Policy Number"
            placeholder="ABC12345"
          />

          <FormInput name="start_date" label="Start Date" type="date" />

          <FormInput name="end_date" label="End Date" type="date" />

          <FormSelect
            name="coverage_type"
            label="Coverage Type"
            placeholder="Select coverage type"
            options={[
              { value: "single", label: "Single" },
              { value: "couple", label: "Couple" },
              { value: "family", label: "Family" },
              { value: "overseas", label: "Overseas Visitor" },
              { value: "other", label: "Other" },
            ]}
          />

          <FormInput name="cost" label="Cost" type="number" placeholder="0" />
        </div>

        <ApplicationStepHeader className="mt-4">
          <Button type="submit" disabled={healthCoverMutation.isPending}>
            {healthCoverMutation.isPending ? "Saving..." : "Save "}
          </Button>
        </ApplicationStepHeader>
      </form>
    </FormProvider>
  );
}
