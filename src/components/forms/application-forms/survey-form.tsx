"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
} from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  useApplicationStepMutations,
  useSurveyAvailabilityCodes,
} from "@/hooks/useApplicationSteps.hook";
import { useFormPersistence } from "@/hooks/useFormPersistence.hook";
import {
  createEmptySurveyResponse,
  surveySchema,
  type SurveyValues,
} from "@/validation/application/survey";
import { useSearchParams } from "next/navigation";
import ApplicationStepHeader from "./application-step-header";

export default function SurveyForm() {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("applicationId");
  const stepId = 12; // Survey is step 12
  const surveyMutation = useApplicationStepMutations(applicationId)[stepId];
  const { data: availabilityCodesData, isLoading: isLoadingCodes } =
    useSurveyAvailabilityCodes();

  const methods = useForm<SurveyValues>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      availability_status: "",
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

  const { handleSubmit } = methods;

  const onSubmit = (values: SurveyValues) => {
    // Save to Zustand store before submitting to API
    if (applicationId) {
      saveOnSubmit(values);
    }
    surveyMutation.mutate(values);
  };

  return (
    <FormProvider {...methods}>
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <div>
            {isLoadingCodes ? (
              <p className="text-sm text-muted-foreground">
                Loading availability codes...
              </p>
            ) : availabilityCodesData?.data ? (
              <Controller
                name="availability_status"
                control={methods.control}
                render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      {(availabilityCodesData.data || []).map((code) => (
                        <Label
                          key={code.code}
                          className="flex items-center space-x-2 cursor-pointer p-3 rounded-lg border hover:bg-accent"
                        >
                          <RadioGroupItem value={code.code} />
                          <div className="flex flex-col">
                            <span className="font-medium">{code.label}</span>
                            <span className="text-xs text-muted-foreground">
                              Code: {code.code}
                            </span>
                          </div>
                        </Label>
                      ))}
                    </RadioGroup>
                    {fieldState.error && (
                      <p className="text-sm text-destructive">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />
            ) : (
              <p className="text-sm text-destructive">
                Failed to load availability codes
              </p>
            )}
          </div>
        </div>

        <ApplicationStepHeader className="mt-4">
          <Button type="submit" disabled={surveyMutation.isPending}>
            {surveyMutation.isPending ? "Saving..." : "Save & Continue"}
          </Button>
        </ApplicationStepHeader>
      </form>
    </FormProvider>
  );
}
