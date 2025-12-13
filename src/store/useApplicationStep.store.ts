import { create } from "zustand";
import { TOTAL_APPLICATION_STEPS } from "@/constants/application-steps";
import { useApplicationFormDataStore } from "./useApplicationFormData.store";

// ⚠️ TESTING MODE: Set to 'true' to allow free navigation during testing
// Set to 'false' in production to enforce step completion before navigation
const TESTING_MODE = false;

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
  initializeStep: (applicationId: string | null) => void;
};

const clampStep = (step: number, totalSteps: number) =>
  Math.min(Math.max(step, 1), totalSteps);

const getInitialStep = (
  applicationId: string | null,
  stepData: Record<number, unknown>
): number => {
  // In testing mode, always allow starting at step 1
  if (TESTING_MODE) {
    return 1;
  }

  if (!applicationId) return 1;

  try {
    // Check if step 1 (Documents) is completed
    const step1Data = stepData[1] as
      | { documents?: Record<string, unknown> }
      | undefined;
    const hasStep1Data = !!(
      step1Data?.documents && Object.keys(step1Data.documents).length > 0
    );

    if (!hasStep1Data) {
      return 1; // Step 1 not completed, must start at step 1
    }

    // Step 1 is completed, find first incomplete step starting from step 2
    const stepsWithData = Object.keys(stepData)
      .filter((key) => {
        const stepId = parseInt(key, 10);
        return (
          !isNaN(stepId) &&
          stepId >= 1 &&
          stepId <= TOTAL_APPLICATION_STEPS &&
          stepData[stepId]
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
  } catch (error) {
    console.error("[Store] Failed to get initial step:", error);
    return 1; // Default to step 1 on error
  }
};

export const useApplicationStepStore = create<ApplicationStepState>(
  (set, get) => ({
    currentStep: 1,
    totalSteps: TOTAL_APPLICATION_STEPS,
    completedSteps: [],

    initializeStep: (applicationId: string | null) => {
      const stepData = useApplicationFormDataStore.getState().stepData;
      const initialStep = getInitialStep(applicationId, stepData);
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
