"use client";

import { useEffect, useRef, useCallback } from "react";
import type { UseFormReturn, FieldValues } from "react-hook-form";
import { useApplicationFormDataStore } from "@/store/useApplicationFormData.store";

interface UseFormPersistenceOptions<T extends FieldValues> {
  applicationId: string | null;
  stepId: number;
  form: UseFormReturn<T>;
  enabled?: boolean; // Default: true
  debounceMs?: number; // Default: 500
  onDataLoaded?: (data: T) => void;
}

/**
 * Hook to automatically integrate form persistence with react-hook-form
 * 
 * Features:
 * - Loads saved data when form mounts
 * - Auto-saves form data as user types (debounced)
 * - Saves data on form submit
 * - Handles form reset with persisted data
 */
export const useFormPersistence = <T extends FieldValues>({
  applicationId,
  stepId,
  form,
  enabled = true,
  debounceMs = 500,
  onDataLoaded,
}: UseFormPersistenceOptions<T>) => {
  const setStepData = useApplicationFormDataStore((state) => state.setStepData);
  const getMergedStepData = useApplicationFormDataStore((state) => state.getMergedStepData);
  const ocrData = useApplicationFormDataStore((state) => state.ocrData);
  const isInitialLoadRef = useRef(true);
  const hasLoadedPersistedDataRef = useRef(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastOcrDataRef = useRef<string | null>(null);

  // Load persisted data on mount (using merged data: OCR + user data)
  // Also reload when stepId changes (navigating to a different step)
  useEffect(() => {
    if (!enabled || !applicationId) {
      isInitialLoadRef.current = false;
      return;
    }

    // Reset the loaded flag when stepId changes to allow reloading
    if (hasLoadedPersistedDataRef.current) {
      // Check if we need to reload (e.g., step changed or OCR data just arrived)
      const mergedData = getMergedStepData<T>(stepId);
      const currentValues = form.getValues();
      const isFormEmpty = Object.values(currentValues).every(
        (val) => val === null || val === undefined || val === "" ||
          (Array.isArray(val) && val.length === 0) ||
          (typeof val === "object" && val !== null && Object.keys(val).length === 0)
      );

      // If form is empty but we have data, reload it
      if (isFormEmpty && mergedData) {
        try {
          form.reset(mergedData as T);
          if (onDataLoaded) {
            onDataLoaded(mergedData);
          }
        } catch (error) {
          console.error(`[FormPersistence] Failed to reload persisted data for step ${stepId}:`, error);
        }
      }
      return;
    }

    // Initial load - try to load data, with retry mechanism
    const loadData = () => {
      const mergedData = getMergedStepData<T>(stepId);
      if (mergedData) {
        try {
          // Reset form with merged data (OCR + user data)
          form.reset(mergedData as T);
          hasLoadedPersistedDataRef.current = true;

          // Call optional callback
          if (onDataLoaded) {
            onDataLoaded(mergedData);
          }
        } catch (error) {
          console.error(`[FormPersistence] Failed to load persisted data for step ${stepId}:`, error);
        }
      } else {
        // No data yet - set up a retry mechanism with multiple attempts
        // This handles cases where OCR data hasn't been fetched yet
        let retryCount = 0;
        const maxRetries = 3;

        const tryLoadData = () => {
          const retryData = getMergedStepData<T>(stepId);
          if (retryData) {
            try {
              form.reset(retryData as T);
              hasLoadedPersistedDataRef.current = true;
              if (onDataLoaded) {
                onDataLoaded(retryData);
              }
            } catch (error) {
              console.error(`[FormPersistence] Failed to load persisted data on retry for step ${stepId}:`, error);
            }
          } else if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(tryLoadData, 500); // Retry every 500ms
          }
        };

        const retryTimeout = setTimeout(tryLoadData, 500); // First retry after 500ms

        return () => clearTimeout(retryTimeout);
      }
    };

    const cleanup = loadData();

    // Mark initial load attempt as complete
    isInitialLoadRef.current = false;
    hasLoadedPersistedDataRef.current = true; // Allow saving even if no persisted data was found

    return cleanup;
  }, [enabled, applicationId, stepId, form, getMergedStepData, onDataLoaded]);

  // Watch for OCR data changes and update form if needed
  useEffect(() => {
    if (!enabled || !applicationId || isInitialLoadRef.current) return;

    const stepOcrData = ocrData[stepId];
    const currentOcrDataKey = stepOcrData ? JSON.stringify(stepOcrData) : null;

    // Update if OCR data for this step has changed or just arrived
    if (currentOcrDataKey && currentOcrDataKey !== lastOcrDataRef.current) {
      // Small delay to ensure store has been updated
      const timeoutId = setTimeout(() => {
        const mergedData = getMergedStepData<T>(stepId);
        if (mergedData) {
          // Only reset if user hasn't made changes (empty form or matches current)
          const currentValues = form.getValues();
          const isFormEmpty = Object.values(currentValues).every(
            (val) => val === null || val === undefined || val === "" ||
              (Array.isArray(val) && val.length === 0) ||
              (typeof val === "object" && val !== null && Object.keys(val).length === 0)
          );

          if (isFormEmpty) {
            // Form is empty, safe to prefill with OCR data
            form.reset(mergedData as T);
            lastOcrDataRef.current = currentOcrDataKey;

            // Call callback if provided
            if (onDataLoaded) {
              onDataLoaded(mergedData);
            }
          }
        }
      }, 100); // Small delay to ensure store is updated

      return () => clearTimeout(timeoutId);
    }
  }, [enabled, applicationId, stepId, form, getMergedStepData, ocrData, onDataLoaded]);

  // Debounced save function
  const saveStepDataDebounced = useCallback(
    (data: T) => {
      if (!enabled || !applicationId) return;

      // Clear existing timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Set new timeout
      debounceTimeoutRef.current = setTimeout(() => {
        setStepData(stepId, data);
      }, debounceMs);
    },
    [enabled, applicationId, stepId, setStepData, debounceMs]
  );

  // Watch form values and auto-save (debounced)
  useEffect(() => {
    if (!enabled || !applicationId) return;

    // Wait for initial load to complete before starting auto-save
    if (isInitialLoadRef.current) return;

    const subscription = form.watch((value) => {
      saveStepDataDebounced(value as T);
    });

    return () => {
      subscription.unsubscribe();
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [enabled, applicationId, form, saveStepDataDebounced]);

  // Save immediately on form submit (before mutation)
  const saveOnSubmit = useCallback(
    (values: T) => {
      if (!enabled || !applicationId) return values;

      // Clear any pending debounced save
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      setStepData(stepId, values);
      return values;
    },
    [enabled, applicationId, stepId, setStepData]
  );

  return {
    saveOnSubmit,
    hasPersistedData: hasLoadedPersistedDataRef.current,
  };
};

export default useFormPersistence;

