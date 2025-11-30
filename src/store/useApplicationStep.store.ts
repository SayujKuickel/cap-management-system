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
};

const clampStep = (step: number, totalSteps: number) =>
  Math.min(Math.max(step, 1), totalSteps);

export const useApplicationStepStore = create<ApplicationStepState>((set, get) => ({
  currentStep: 1,
  totalSteps: TOTAL_APPLICATION_STEPS,
  completedSteps: [],
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
}));
