"use client";

import React, { createContext, useContext, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useApplicationStepStore } from "@/store/useApplicationStep.store";
import { useApplicationFormDataStore } from "@/store/useApplicationFormData.store";
import {
  useApplicationCreateMutation,
  useApplicationGetMutation,
} from "@/hooks/useApplication.hook";
import { useDocumentOcrQuery } from "@/hooks/document.hook";

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
  isOcrDataLoading: boolean;
  isOcrDataReady: boolean;
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

  // Zustand store for form data
  const setStepData = useApplicationFormDataStore((state) => state.setStepData);
  const getStepData = useApplicationFormDataStore((state) => state.getStepData);

  // API hooks
  const createApplication = useApplicationCreateMutation();
  const { mutate: fetchApplication, isPending: isFetchingApplication } =
    useApplicationGetMutation(applicationId);

  // Always fetch OCR data when applicationId is available (for all steps)
  // This ensures OCR data is available when navigating to any step
  const ocrQuery = useDocumentOcrQuery(applicationId);

  // For steps 2-12, we need OCR data to be ready before showing the form
  const needsOcrData = currentStep >= 2 && currentStep <= 12;
  const isOcrDataLoading = needsOcrData && (ocrQuery.isFetching || ocrQuery.isLoading);

  // Watch OCR data in store to determine if it's ready
  const ocrData = useApplicationFormDataStore((state) => state.ocrData);
  const lastRefetchedStepRef = React.useRef<number | null>(null);

  // Determine if OCR data is ready based on query state and store state
  const isOcrDataReady = React.useMemo(() => {
    if (!needsOcrData) {
      // Step 1 doesn't need OCR data
      return true;
    }

    if (!applicationId) {
      return false;
    }

    // If query is still loading/fetching, not ready yet
    if (ocrQuery.isFetching || ocrQuery.isLoading) {
      return false;
    }

    // If query succeeded and we have data in the response
    if (ocrQuery.isSuccess && ocrQuery.data?.data) {
      // Check if data has been populated into store
      const hasOcrDataInStore = Object.keys(ocrData).length > 0;
      return hasOcrDataInStore;
    }

    // If query finished (error or no data), allow proceeding anyway
    if (ocrQuery.isError || (!ocrQuery.isFetching && !ocrQuery.isLoading)) {
      return true;
    }

    // Default: not ready
    return false;
  }, [needsOcrData, applicationId, ocrQuery.isFetching, ocrQuery.isLoading, ocrQuery.isSuccess, ocrQuery.data, ocrQuery.isError, ocrData]);

  // Force refetch OCR data when navigating to steps that might need it (steps 2-12)
  useEffect(() => {
    if (applicationId && needsOcrData) {
      // Only refetch if we haven't already refetched for this step
      if (lastRefetchedStepRef.current !== currentStep) {
        lastRefetchedStepRef.current = currentStep;
        
        // Check if we already have OCR data in store
        const store = useApplicationFormDataStore.getState();
        const hasOcrData = Object.keys(store.ocrData).length > 0;
        
        if (!hasOcrData || !ocrQuery.data?.data) {
          // Need to fetch OCR data
          ocrQuery.refetch().catch((error) => {
            console.error('[ApplicationForm] Failed to refetch OCR data:', error);
          });
        }
      }
    }
  }, [applicationId, currentStep, ocrQuery, needsOcrData]);

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
    isOcrDataLoading,
    isOcrDataReady,
  };

  return (
    <ApplicationFormContext.Provider value={value}>
      {children}
    </ApplicationFormContext.Provider>
  );
};

