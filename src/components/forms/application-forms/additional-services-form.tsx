"use client";

import { useForm, useFieldArray, FormProvider, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/forms/form-input";
import { FormCheckbox } from "@/components/ui/forms/form-checkbox";
import { useSearchParams } from "next/navigation";
import { useApplicationStepMutations } from "@/hooks/useApplicationSteps.hook";
import ApplicationStepHeader from "./application-step-header";
import {
  additionalServicesSchema,
  createEmptyAdditionalService,
  type AdditionalServicesValues,
} from "@/validation/application/additional-services";

export default function AdditionalServicesForm() {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("applicationId");
  const additionalServicesMutation =
    useApplicationStepMutations(applicationId)[10];

  const methods = useForm<AdditionalServicesValues>({
    resolver: zodResolver(additionalServicesSchema),
    defaultValues: {
      services: [createEmptyAdditionalService()],
    },
  });

  const { control, handleSubmit } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "services",
  });

  const services = useWatch({
    control,
    name: "services",
  }) ?? [];
  const totalAdditionalFees = services
    .filter((s) => s.selected)
    .reduce((sum, s) => sum + (s.fee || 0), 0);

  const canAddMore = fields.length < 10; // tweak if you want

  const onSubmit = (values: AdditionalServicesValues) => {
    additionalServicesMutation.mutate(values);
  };

  return (
    <FormProvider {...methods}>
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Additional Services</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!canAddMore}
            onClick={() => append(createEmptyAdditionalService())}
          >
            Add Service
          </Button>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="space-y-4 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Service {index + 1}</p>
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
                  name={`services.${index}.service_id`}
                  label="Service ID"
                  placeholder="e.g. SVC-001"
                />

                <FormInput
                  name={`services.${index}.name`}
                  label="Service Name"
                  placeholder="e.g. Airport Pickup"
                />

                <FormInput
                  name={`services.${index}.description`}
                  label="Description"
                  placeholder="Short description of the service"
                />

                <FormInput
                  name={`services.${index}.fee`}
                  label="Fee"
                  type="number"
                  placeholder="0"
                />
              </div>

              <FormCheckbox
                name={`services.${index}.selected`}
                label="Select this service"
              />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border rounded-lg px-4 py-3">
          <span className="text-sm font-medium">
            Total additional fees (selected services)
          </span>
          <span className="font-semibold">
            ${totalAdditionalFees.toFixed(2)}
          </span>
        </div>

        <ApplicationStepHeader className="mt-4">
          <Button
            type="submit"
            disabled={additionalServicesMutation.isPending}
          >
            {additionalServicesMutation.isPending
              ? "Saving..."
              : "Save & Continue"}
          </Button>
        </ApplicationStepHeader>
      </form>
    </FormProvider>
  );
}
