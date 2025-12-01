"use client";

import React, { useEffect } from "react";
import {
  useForm,
  FormProvider,
  type UseFormReturn,
  type FieldValues,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ZodType } from "zod";
import { Button } from "@/components/ui/button";
import ApplicationStepHeader from "./application-step-header";
import { useApplicationFormContext } from "@/contexts/ApplicationFormContext";
import { useApplicationStepMutations } from "@/hooks/useApplicationSteps.hook";

type FormStepWrapperProps<T extends FieldValues> = {
  stepId: number;
  schema: ZodType<T>;
  defaultValues: T;
  onSubmit?: (data: T) => void;
  children: (methods: UseFormReturn<T>) => React.ReactNode;
  submitButtonText?: string;
};

export function FormStepWrapper<T extends FieldValues>({
  stepId,
  schema,
  defaultValues,
  onSubmit,
  children,
  submitButtonText = "Save & Continue",
}: FormStepWrapperProps<T>) {
  const {
    applicationId,
    saveStepData,
    getStepData,
    markStepCompleted,
    goToNext,
  } = useApplicationFormContext();

  const stepMutation =
    useApplicationStepMutations(applicationId)?.[
      stepId as keyof ReturnType<typeof useApplicationStepMutations>
    ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const methods = useForm({
    resolver: zodResolver(schema as any) as any,
    defaultValues: defaultValues as any,
    mode: "onChange",
  }) as UseFormReturn<T>;

  // Load persisted data on mount
  useEffect(() => {
    if (applicationId) {
      const persistedData = getStepData<T>(stepId);
      if (persistedData) {
        methods.reset(persistedData);
      }
    }
  }, [applicationId, stepId]);

  // Auto-save to localStorage (debounced)
  useEffect(() => {
    if (!applicationId) return;

    const subscription = methods.watch((data) => {
      const timeoutId = setTimeout(() => {
        saveStepData(stepId, data);
      }, 500);

      return () => clearTimeout(timeoutId);
    });

    return () => subscription.unsubscribe();
  }, [applicationId, stepId, methods, saveStepData]);

  const handleFormSubmit = async (data: T) => {
    if (!applicationId) return;

    // Save to localStorage
    saveStepData(stepId, data);

    // Custom submit handler
    if (onSubmit) {
      onSubmit(data);
      return;
    }

    // Default API submission
    if (stepMutation) {
      stepMutation.mutate(data as any, {
        onSuccess: () => {
          markStepCompleted(stepId);
          goToNext();
        },
      });
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        className="space-y-6"
        onSubmit={methods.handleSubmit(handleFormSubmit)}
      >
        {children(methods)}

        <ApplicationStepHeader className="mt-6">
          <Button
            type="submit"
            disabled={stepMutation?.isPending || !applicationId}
          >
            {stepMutation?.isPending ? "Saving..." : submitButtonText}
          </Button>
        </ApplicationStepHeader>
      </form>
    </FormProvider>
  );
}
