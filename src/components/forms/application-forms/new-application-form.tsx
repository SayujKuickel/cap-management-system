"use client";

import { Check } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { toast } from "react-hot-toast";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { APPLICATION_FORM_STEPS } from "./form-step-registry";
import { TOTAL_APPLICATION_STEPS } from "@/constants/application-steps";
import { cn } from "@/lib/utils";
import { useApplicationStepStore } from "@/store/useApplicationStep.store";
import {
  useApplicationCreateMutation,
  useApplicationGetMutation,
} from "@/hooks/useApplication.hook";
import { usePersistence } from "@/hooks/usePersistance.hook";
import { documentTypes } from "@/data/document-types.data";

const STORAGE_STEP_KEY = "application_current_step_";

const NewApplicationForm = () => {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("applicationId");

  // Store selectors
  const currentStep = useApplicationStepStore((state) => state.currentStep);
  const goToStep = useApplicationStepStore((state) => state.goToStep);
  const setTotalSteps = useApplicationStepStore((state) => state.setTotalSteps);
  const initializeFromStorage = useApplicationStepStore(
    (state) => state.initializeFromStorage
  );
  const isStepCompleted = useApplicationStepStore(
    (state) => state.isStepCompleted
  );

  // Hooks
  const createApplication = useApplicationCreateMutation();
  const { getAllPersistedData } = usePersistence(applicationId);
  const {
    mutate: fetchApplication,
    isPending: isFetchingApplication,
  } = useApplicationGetMutation(applicationId);

  // Refs to prevent duplicate operations
  const hasInitializedRef = useRef(false);
  const hasCreatedRef = useRef(false);
  const hasFetchedRef = useRef(false);
  
  // Check if step 1 (Documents) is completed based on localStorage
  useEffect(() => {
    if (!applicationId) return;
    
    try {
      const persistedData = getAllPersistedData();
      const documentsData = persistedData?.[1] as
        | { documents?: Record<string, { fileCount: number; uploaded: boolean }> }
        | undefined;
      
      // Check if all mandatory documents have been uploaded
      if (documentsData?.documents) {
        const mandatoryDocs = documentTypes.filter(
          (doc) => doc.is_mandatory
        );
        
        const allMandatoryUploaded = mandatoryDocs.every((doc) => {
          const docData = documentsData.documents?.[doc.id];
          return docData && docData.fileCount > 0 && docData.uploaded;
        });
        
        if (allMandatoryUploaded && !isStepCompleted(1)) {
          useApplicationStepStore.getState().markStepCompleted(1);
        }
      }
    } catch (error) {
      // Silently fail - step completion check is optional
    }
  }, [applicationId, getAllPersistedData, isStepCompleted, currentStep]);

  // Initialize total steps and step position
  useLayoutEffect(() => {
    setTotalSteps(TOTAL_APPLICATION_STEPS);

    // Initialize step from localStorage synchronously to prevent flicker
    if (applicationId && !hasInitializedRef.current) {
      initializeFromStorage(applicationId);
      hasInitializedRef.current = true;
    } else if (!applicationId) {
      // Reset initialization flag when applicationId is cleared
      hasInitializedRef.current = false;
      goToStep(1);
    }
  }, [applicationId, setTotalSteps, initializeFromStorage, goToStep]);

  // Create application if needed
  useEffect(() => {
    if (!applicationId && !hasCreatedRef.current) {
      hasCreatedRef.current = true;
      createApplication.mutate({
        agent_profile_id: "ea7cab76-0e47-4de8-b923-834f0d53abf1",
        course_offering_id: "4ba78380-8158-4941-9420-a1495d88e9d6",
      });
    } else if (applicationId) {
      hasCreatedRef.current = false; // Reset when applicationId changes
    }
  }, [applicationId, createApplication]);

  // Fetch application data if applicationId exists
  useEffect(() => {
    if (applicationId && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchApplication();
    } else if (!applicationId) {
      hasFetchedRef.current = false; // Reset when applicationId is cleared
    }
  }, [applicationId, fetchApplication]);

  // Save current step to localStorage
  useEffect(() => {
    if (!applicationId) return;

    try {
      const stepKey = `${STORAGE_STEP_KEY}${applicationId}`;
      localStorage.setItem(stepKey, currentStep.toString());
    } catch (error) {
      console.error("[NewApplicationForm] Failed to save step position:", error);
    }
  }, [applicationId, currentStep]);

  // Step navigation handler
  const handleStepNavigation = useCallback(
    (stepId: number) => {
      const movingForward = stepId > currentStep;

      // Block navigation from step 1 if documents aren't uploaded
      if (currentStep === 1 && movingForward && !isStepCompleted(1)) {
        const persistedData = getAllPersistedData();
        const documentsData = persistedData?.[1] as
          | { documents?: Record<string, { fileCount: number }> }
          | undefined;

        const hasDocuments = documentsData?.documents
          ? Object.values(documentsData.documents).some(
              (doc) => doc.fileCount > 0
            )
          : false;

        if (!hasDocuments) {
          toast.error(
            "Please upload all required documents before continuing."
          );
          return;
        }
      }

      // Block forward navigation if current step isn't completed
      if (movingForward && !isStepCompleted(currentStep)) {
        toast.error("Please submit this step before continuing.");
        return;
      }

      goToStep(stepId);
    },
    [currentStep, goToStep, isStepCompleted, getAllPersistedData]
  );

  // Calculate progress and get current step component
  const currentStepDefinition = APPLICATION_FORM_STEPS[currentStep - 1] ?? null;
  const progress = ((currentStep - 1) / (TOTAL_APPLICATION_STEPS - 1)) * 100;

  return (
    <div className="mx-auto w-full">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8 z-10">
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

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="mb-6">
                <h2 className="text-2xl">
                  {currentStepDefinition?.title ?? "Application"}
                </h2>
              </div>

              {currentStepDefinition && (
                <currentStepDefinition.component />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NewApplicationForm;
