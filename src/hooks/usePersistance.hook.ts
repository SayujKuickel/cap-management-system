"use client";

import { useCallback, useEffect, useRef } from "react";
import type { ApplicationDetailResponse } from "@/service/application.service";

const STORAGE_PREFIX = "application_form_data_";

interface PersistedFormData {
  [stepId: number]: unknown;
  applicationId: string;
  lastSavedAt: string;
}

/**
 * Hook to manage form data persistence in localStorage for multi-step application forms
 * 
 * Features:
 * - Automatically saves form data to localStorage as user progresses
 * - Loads saved data when user navigates back to previous steps
 * - Clears all persisted data on successful form submission
 * - Handles API response data after submission to populate form
 */
export const usePersistence = (applicationId: string | null) => {
  const storageKey = applicationId ? `${STORAGE_PREFIX}${applicationId}` : null;
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSubmittingRef = useRef(false);

  /**
   * Save form data for a specific step to localStorage
   */
  const saveStepData = useCallback(
    (stepId: number, data: unknown) => {
      if (!storageKey || !applicationId) return;

      try {
        const existing = localStorage.getItem(storageKey);
        const persistedData: PersistedFormData = existing
          ? JSON.parse(existing)
          : {
              applicationId,
              lastSavedAt: new Date().toISOString(),
            };

        persistedData[stepId] = data;
        persistedData.lastSavedAt = new Date().toISOString();

        localStorage.setItem(storageKey, JSON.stringify(persistedData));
      } catch (error) {
        console.error("[Persistence] Failed to save step data:", error);
      }
    },
    [storageKey, applicationId]
  );

  /**
   * Get saved form data for a specific step from localStorage
   */
  const getStepData = useCallback(
    <T = unknown>(stepId: number): T | null => {
      if (!storageKey) return null;

      try {
        const existing = localStorage.getItem(storageKey);
        if (!existing) return null;

        const persistedData: PersistedFormData = JSON.parse(existing);
        return (persistedData[stepId] as T) || null;
      } catch (error) {
        console.error("[Persistence] Failed to get step data:", error);
        return null;
      }
    },
    [storageKey]
  );

  /**
   * Get all persisted form data
   */
  const getAllPersistedData = useCallback((): PersistedFormData | null => {
    if (!storageKey) return null;

    try {
      const existing = localStorage.getItem(storageKey);
      if (!existing) return null;

      return JSON.parse(existing) as PersistedFormData;
    } catch (error) {
      console.error("[Persistence] Failed to get all persisted data:", error);
      return null;
    }
  }, [storageKey]);

  /**
   * Clear all persisted data for this application (called after successful submission)
   */
  const clearPersistedData = useCallback(() => {
    if (!storageKey || !applicationId) return;

    try {
      localStorage.removeItem(storageKey);
      
      // Also clear the step position
      const stepKey = `application_current_step_${applicationId}`;
      localStorage.removeItem(stepKey);
    } catch (error) {
      console.error("[Persistence] Failed to clear persisted data:", error);
    }
  }, [storageKey, applicationId]);

  /**
   * Save form data with debouncing to avoid too frequent localStorage writes
   */
  const saveStepDataDebounced = useCallback(
    (stepId: number, data: unknown, delay: number = 500) => {
      if (!storageKey || !applicationId) return;
      if (isSubmittingRef.current) return; // Don't save if submitting

      // Clear existing timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      // Set new timeout
      autoSaveTimeoutRef.current = setTimeout(() => {
        saveStepData(stepId, data);
      }, delay);
    },
    [storageKey, applicationId, saveStepData]
  );

  /**
   * Populate form data from API response (after successful submission)
   */
  const populateFromApiResponse = useCallback(
    (apiResponse: ApplicationDetailResponse) => {
      if (!storageKey || !applicationId) return;

      try {
        const persistedData: PersistedFormData = {
          applicationId,
          lastSavedAt: new Date().toISOString(),
        };

        // Map API response fields to step IDs
        // Step 1: Personal Details
        if (apiResponse.personal_details) {
          persistedData[1] = apiResponse.personal_details;
        }

        // Step 2: Emergency Contact
        if (apiResponse.emergency_contacts) {
          persistedData[2] = apiResponse.emergency_contacts;
        }

        // Step 3: Health Cover
        if (apiResponse.health_cover_policy) {
          persistedData[3] = apiResponse.health_cover_policy;
        }

        // Step 4: Language & Culture
        if (apiResponse.language_cultural_data) {
          persistedData[4] = apiResponse.language_cultural_data;
        }

        // Step 5: Disability Support
        if (apiResponse.disability_support) {
          persistedData[5] = apiResponse.disability_support;
        }

        // Step 6: Schooling History
        if (apiResponse.schooling_history) {
          persistedData[6] = apiResponse.schooling_history;
        }

        // Step 7: Qualifications
        if (apiResponse.qualifications) {
          persistedData[7] = apiResponse.qualifications;
        }

        // Step 8: Employment History
        if (apiResponse.employment_history) {
          persistedData[8] = apiResponse.employment_history;
        }

        // Step 9: USI (stored as usi field in response)
        if (apiResponse.usi) {
          persistedData[9] = { usi: apiResponse.usi };
        }

        // Step 10: Additional Services
        if (apiResponse.additional_services) {
          persistedData[10] = apiResponse.additional_services;
        }

        // Step 11: Survey
        if (apiResponse.survey_responses) {
          persistedData[11] = apiResponse.survey_responses;
        }

        localStorage.setItem(storageKey, JSON.stringify(persistedData));
      } catch (error) {
        console.error("[Persistence] Failed to populate from API response:", error);
      }
    },
    [storageKey, applicationId]
  );

  /**
   * Mark that form submission is in progress (prevents auto-save during submission)
   */
  const setSubmitting = useCallback((isSubmitting: boolean) => {
    isSubmittingRef.current = isSubmitting;
  }, []);

  /**
   * Clear all persisted data for all applications (utility function)
   */
  const clearAllApplicationsData = useCallback(() => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(STORAGE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error("[Persistence] Failed to clear all applications data:", error);
    }
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  return {
    saveStepData,
    saveStepDataDebounced,
    getStepData,
    getAllPersistedData,
    clearPersistedData,
    populateFromApiResponse,
    setSubmitting,
    clearAllApplicationsData,
  };
};

export default usePersistence;
