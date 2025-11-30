"use client";

import { useEffect, useRef } from "react";
import type { UseFormReturn, FieldValues } from "react-hook-form";
import { usePersistence } from "./usePersistance.hook";

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
  const { getStepData, saveStepDataDebounced, saveStepData } = usePersistence(applicationId);
  const isInitialLoadRef = useRef(true);
  const hasLoadedPersistedDataRef = useRef(false);

  // Load persisted data on mount
  useEffect(() => {
    if (!enabled || !applicationId || hasLoadedPersistedDataRef.current) {
      isInitialLoadRef.current = false;
      return;
    }

    const persistedData = getStepData<T>(stepId);
    if (persistedData) {
      try {
        // Reset form with persisted data
        form.reset(persistedData as T);
        hasLoadedPersistedDataRef.current = true;
        
        // Call optional callback
        if (onDataLoaded) {
          onDataLoaded(persistedData);
        }
      } catch (error) {
        console.error(`[FormPersistence] Failed to load persisted data for step ${stepId}:`, error);
      }
    }
    
    // Mark initial load as complete (whether data was loaded or not)
    isInitialLoadRef.current = false;
    hasLoadedPersistedDataRef.current = true; // Allow saving even if no persisted data was found
  }, [enabled, applicationId, stepId, form, getStepData, onDataLoaded]);

  // Watch form values and auto-save (debounced)
  useEffect(() => {
    if (!enabled || !applicationId) return;
    
    // Wait for initial load to complete before starting auto-save
    if (isInitialLoadRef.current) return;

    const subscription = form.watch((value) => {
      saveStepDataDebounced(stepId, value, debounceMs);
    });

    return () => subscription.unsubscribe();
  }, [
    enabled,
    applicationId,
    stepId,
    form,
    saveStepDataDebounced,
    debounceMs,
  ]);

  // Save immediately on form submit (before mutation)
  const saveOnSubmit = (values: T) => {
    if (!enabled || !applicationId) return values;
    
    saveStepData(stepId, values);
    return values;
  };

  return {
    saveOnSubmit,
    hasPersistedData: hasLoadedPersistedDataRef.current,
  };
};

export default useFormPersistence;

