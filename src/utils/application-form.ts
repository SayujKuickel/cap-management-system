export type FormDataState = Record<string, unknown>;

export const clampStep = (step: number, totalSteps: number) =>
  Math.max(1, Math.min(step, totalSteps));

export const buildApplicationPayload = (state: FormDataState) => state;
