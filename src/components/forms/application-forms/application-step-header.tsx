"use client";

import { ChevronLeft } from "lucide-react";
import type { PropsWithChildren } from "react";

import { Button } from "@/components/ui/button";
import { useApplicationStepStore } from "@/store/useApplicationStep.store";

type StepHeaderProps = PropsWithChildren<{
  className?: string;
}>;

const ApplicationStepHeader = ({ className, children }: StepHeaderProps) => {
  const currentStep = useApplicationStepStore((state) => state.currentStep);
  const totalSteps = useApplicationStepStore((state) => state.totalSteps);
  const goToPrevious = useApplicationStepStore((state) => state.goToPrevious);

  return (
    <div className={`flex items-center gap-3 ${className ?? ""}`}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          goToPrevious();
        }}
        disabled={currentStep === 1}
        className="gap-2"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>

      <span className="flex-1 text-center text-sm text-muted-foreground">
        Step {currentStep} of {totalSteps}
      </span>

      {children ? (
        <div className="flex items-center gap-2">{children}</div>
      ) : null}
    </div>
  );
};

export default ApplicationStepHeader;
