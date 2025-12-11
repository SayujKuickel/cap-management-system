"use client";

import React, { createContext, useContext, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useApplicationStepStore } from "@/store/useApplicationStep.store";
import { useApplicationFormDataStore } from "@/store/useApplicationFormData.store";
import {
  useApplicationCreateMutation,
  useApplicationGetMutation,
} from "@/hooks/useApplication.hook";

type ApplicationFormContextType = {
  applicationId: string | null;
  currentStep: number;
  isStepCompleted: (step: number) => boolean;
  markStepCompleted: (step: number) => void;
  goToStep: (step: number) => void;
  goToNext: () => void;
  goToPrevious: () => void;
  saveStepData: <T>(stepId: number, data: T) => void;
  getStepData: <T>(stepId: number) => T | undefined;
  isLoading: boolean;
};

const ApplicationFormContext = createContext<ApplicationFormContextType | null>(
  null
);

export const useApplicationFormContext = () => {
  const context = useContext(ApplicationFormContext);
  if (!context) {
    throw new Error(
      "useApplicationFormContext must be used within ApplicationFormProvider"
    );
  }
  return context;
};

export const ApplicationFormProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("applicationId");

  // Store
  const currentStep = useApplicationStepStore((state) => state.currentStep);
  const goToStep = useApplicationStepStore((state) => state.goToStep);
  const goToNext = useApplicationStepStore((state) => state.goToNext);
  const goToPrevious = useApplicationStepStore((state) => state.goToPrevious);
  const markStepCompleted = useApplicationStepStore(
    (state) => state.markStepCompleted
  );
  const isStepCompleted = useApplicationStepStore(
    (state) => state.isStepCompleted
  );
  const initializeStep = useApplicationStepStore(
    (state) => state.initializeStep
  );


  const setStepData = useApplicationFormDataStore((state) => state.setStepData);
  const getStepData = useApplicationFormDataStore((state) => state.getStepData);


  const createApplication = useApplicationCreateMutation();
  const { mutate: fetchApplication, isPending: isFetchingApplication } =
    useApplicationGetMutation(applicationId);

  // Initialize application
  useEffect(() => {
    if (!applicationId) {
      // For new applications, always start at step 1 and clear any existing data
      goToStep(1);
      createApplication.mutate({
        agent_profile_id: "ea7cab76-0e47-4de8-b923-834f0d53abf1",
        course_offering_id: "4ba78380-8158-4941-9420-a1495d88e9d6",
      });
    } else {
      // Set application ID in store
      const store = useApplicationFormDataStore.getState();
      const currentStoreAppId = store.applicationId;

      // If this is a different application, clear the data and start fresh
      if (currentStoreAppId && currentStoreAppId !== applicationId) {
        store.clearAllData();
        goToStep(1);
      }

      store.setApplicationId(applicationId);

      // Check if there's any step data - if not, it's a new application
      const stepData = store.stepData;
      const hasAnyData = Object.keys(stepData).length > 0;

      if (!hasAnyData) {
        // New application with no data - start at step 1
        goToStep(1);
      } else {
        // Existing application with data - initialize based on progress
        initializeStep(applicationId);
      }

      fetchApplication();
    }
  }, [applicationId, initializeStep, goToStep]);

  // Wrap setStepData to match expected signature
  const saveStepDataWrapper = useCallback(
    <T,>(stepId: number, data: T) => {
      setStepData(stepId, data);
    },
    [setStepData]
  );

  // Wrap getStepData to match expected signature
  const getStepDataWrapper = useCallback(
    <T,>(stepId: number): T | undefined => {
      return getStepData<T>(stepId);
    },
    [getStepData]
  );

  const value: ApplicationFormContextType = {
    applicationId,
    currentStep,
    isStepCompleted,
    markStepCompleted,
    goToStep,
    goToNext,
    goToPrevious,
    saveStepData: saveStepDataWrapper,
    getStepData: getStepDataWrapper,
    isLoading: createApplication.isPending || isFetchingApplication,
  };

  return (
    <ApplicationFormContext.Provider value={value}>
      {children}
    </ApplicationFormContext.Provider>
  );
};

