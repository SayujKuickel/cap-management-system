import { create } from "zustand";
import { TOTAL_APPLICATION_STEPS } from "@/constants/application-steps";

type ApplicationStepState = {
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];
  goToStep: (step: number) => void;
  goToNext: () => void;
  goToPrevious: () => void;
  setTotalSteps: (total: number) => void;
  markStepCompleted: (step: number) => void;
  isStepCompleted: (step: number) => boolean;
  initializeFromStorage: (applicationId: string | null) => void;
};

const clampStep = (step: number, totalSteps: number) =>
  Math.min(Math.max(step, 1), totalSteps);

const getInitialStepFromStorage = (applicationId: string | null): number => {
  if (!applicationId) return 1;

  try {
    const STORAGE_PREFIX = "application_form_data_";
    const STORAGE_STEP_KEY = "application_current_step_";
    const storageKey = `${STORAGE_PREFIX}${applicationId}`;
    const existing = localStorage.getItem(storageKey);

    // Check if step 1 (Documents) is completed
    if (existing) {
      const persistedData = JSON.parse(existing);
      const step1Data = persistedData?.[1] as
        | { documents?: Record<string, unknown> }
        | undefined;
      const hasStep1Data = !!(
        step1Data?.documents && Object.keys(step1Data.documents).length > 0
      );

      if (!hasStep1Data) {
        return 1; // Step 1 not completed, must start at step 1
      }
    } else {
      return 1; // No persisted data, start at step 1
    }

    // Step 1 is completed, check for saved step position
    const stepKey = `${STORAGE_STEP_KEY}${applicationId}`;
    const savedStep = localStorage.getItem(stepKey);
    if (savedStep) {
      const stepNumber = parseInt(savedStep, 10);
      if (
        stepNumber >= 1 &&
        stepNumber <= TOTAL_APPLICATION_STEPS &&
        !isNaN(stepNumber)
      ) {
        return stepNumber;
      }
    }

    // Find first incomplete step starting from step 2
    if (existing) {
      const persistedData = JSON.parse(existing);
      const stepsWithData = Object.keys(persistedData)
        .filter((key) => {
          const stepId = parseInt(key, 10);
          return (
            !isNaN(stepId) &&
            stepId >= 1 &&
            stepId <= TOTAL_APPLICATION_STEPS &&
            persistedData[stepId]
          );
        })
        .map((key) => parseInt(key, 10));

      // Find first gap starting from step 2
      for (let i = 2; i <= TOTAL_APPLICATION_STEPS; i++) {
        if (!stepsWithData.includes(i)) {
          return i;
        }
      }

      return TOTAL_APPLICATION_STEPS; // All steps complete
    }

    return 2; // Step 1 complete, no other data, go to step 2
  } catch (error) {
    console.error("[Store] Failed to get initial step from storage:", error);
    return 1; // Default to step 1 on error
  }
};

export const useApplicationStepStore = create<ApplicationStepState>(
  (set, get) => ({
    currentStep: 1,
    totalSteps: TOTAL_APPLICATION_STEPS,
    completedSteps: [],

    initializeFromStorage: (applicationId: string | null) => {
      const initialStep = getInitialStepFromStorage(applicationId);
      const totalSteps = get().totalSteps;
      set({ currentStep: clampStep(initialStep, totalSteps) });
    },

    goToStep: (step) =>
      set((state) => ({
        currentStep: clampStep(step, state.totalSteps),
      })),

    goToNext: () =>
      set((state) => ({
        currentStep: clampStep(state.currentStep + 1, state.totalSteps),
      })),

    goToPrevious: () =>
      set((state) => ({
        currentStep: clampStep(state.currentStep - 1, state.totalSteps),
      })),

    setTotalSteps: (totalSteps) =>
      set((state) => ({
        totalSteps,
        currentStep: clampStep(state.currentStep, totalSteps),
      })),

    markStepCompleted: (step) =>
      set((state) => {
        if (state.completedSteps.includes(step)) return state;
        return { completedSteps: [...state.completedSteps, step] };
      }),

    isStepCompleted: (step) => {
      const state = get();
      return state.completedSteps.includes(step);
    },
  })
);
