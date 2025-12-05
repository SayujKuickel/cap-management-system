"use client";

import { Check, Loader2 } from "lucide-react";
import { useCallback } from "react";
import { toast } from "react-hot-toast";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { APPLICATION_FORM_STEPS } from "./form-step-registry";
import { TOTAL_APPLICATION_STEPS } from "@/constants/application-steps";
import { cn } from "@/lib/utils";
import { ApplicationFormProvider, useApplicationFormContext } from "@/contexts/ApplicationFormContext";

const NewApplicationForm = () => {
  // Use form context
  const { currentStep, goToStep, isStepCompleted, isOcrDataLoading, isOcrDataReady } = useApplicationFormContext();

  // Step navigation handler
  const handleStepNavigation = useCallback(
    (stepId: number) => {
      const movingForward = stepId > currentStep;

      // Block forward navigation if current step isn't completed
      if (movingForward && !isStepCompleted(currentStep)) {
        toast.error("Please complete this step before continuing.");
        return;
      }

      goToStep(stepId);
    },
    [currentStep, goToStep, isStepCompleted]
  );

  // Calculate progress and get current step component
  const currentStepDefinition = APPLICATION_FORM_STEPS[currentStep - 1] ?? null;
  const progress = ((currentStep - 1) / (TOTAL_APPLICATION_STEPS - 1)) * 100;


  return (
    <div className="mx-auto w-full">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 lg:items-start">
        {/* Sidebar */}
        <aside 
          className="lg:col-span-1"
          style={{
            position: 'sticky',
            top: '24px',
            alignSelf: 'flex-start',
            height: 'fit-content',
            maxHeight: 'calc(100vh - 3rem)',
            overflowY: 'auto',
            zIndex: 10,
          }}
        >
          <div>
          <Card>
            <CardContent className="px-2 py-3">
              <div className="mb-2 border-b pb-2">
                <Progress value={progress} className="h-1" />
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 gap-1 lg:flex lg:flex-col">
                {APPLICATION_FORM_STEPS.map((step) => (
                  <button
                    type="button"
                    key={step.id}
                    onClick={() => handleStepNavigation(step.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors shrink-0",
                      currentStep === step.id
                        ? "bg-primary text-primary-foreground col-span-3 lg:col-span-1"
                        : "hover:bg-muted justify-center lg:justify-start lg:w-full"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs",
                        currentStep === step.id
                          ? "bg-primary-foreground text-primary"
                          : isStepCompleted(step.id)
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-muted"
                      )}
                    >
                      {currentStep === step.id || isStepCompleted(step.id) ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        step.id
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-sm whitespace-nowrap",
                        currentStep === step.id ? "block" : "hidden lg:block"
                      )}
                    >
                      {step.title}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
          </div>
        </aside>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="mb-6">
                <h2 className="text-2xl">
                  {currentStepDefinition?.title ?? "Application"}
                </h2>
              </div>

              {/* Show loading state while OCR data is being fetched for steps 2-12 */}
              {isOcrDataLoading || !isOcrDataReady ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading extracted data...</span>
                  </div>
                  <div className="space-y-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                </div>
              ) : (
                currentStepDefinition && (
                  <currentStepDefinition.component />
                )
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Wrapper component with context provider
const NewApplicationFormWithProvider = () => {
  return (
    <ApplicationFormProvider>
      <NewApplicationForm />
    </ApplicationFormProvider>
  );
};

export default NewApplicationFormWithProvider;
