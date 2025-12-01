"use client";

import React, { createContext, useContext, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useApplicationStepStore } from "@/store/useApplicationStep.store";
import {
  useApplicationCreateMutation,
  useApplicationGetMutation,
} from "@/hooks/useApplication.hook";
import { usePersistence } from "@/hooks/usePersistance.hook";

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
  const initializeFromStorage = useApplicationStepStore(
    (state) => state.initializeFromStorage
  );

  // API hooks
  const createApplication = useApplicationCreateMutation();
  const { mutate: fetchApplication, isPending: isFetchingApplication } =
    useApplicationGetMutation(applicationId);

  // Persistence
  const { saveStepData, getStepData } = usePersistence(applicationId);

  // Initialize application
  useEffect(() => {
    if (!applicationId) {
      createApplication.mutate({
        agent_profile_id: "ea7cab76-0e47-4de8-b923-834f0d53abf1",
        course_offering_id: "4ba78380-8158-4941-9420-a1495d88e9d6",
      });
    } else {
      initializeFromStorage(applicationId);
      fetchApplication();
    }
  }, [applicationId]);

  // Wrap getStepData to convert null to undefined
  const getStepDataWrapper = useCallback(
    <T,>(stepId: number): T | undefined => {
      const data = getStepData<T>(stepId);
      return data ?? undefined;
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
    saveStepData: useCallback(saveStepData, [applicationId]),
    getStepData: getStepDataWrapper,
    isLoading: createApplication.isPending || isFetchingApplication,
  };

  return (
    <ApplicationFormContext.Provider value={value}>
      {children}
    </ApplicationFormContext.Provider>
  );
};

