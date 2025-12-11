export const APPLICATION_STEP_IDS = [
  1, // Personal Details
  2, // Emergency Contact
  3, // Health Cover
  4, // Language & Culture
  5, // Disability
  6, // Schooling
  7, // Qualifications
  8, // Employment
  9, // USI
  10, // Additional Services
  11, // Survey
  12, // Documents
] as const;

export const REVIEW_STEP_ID = 13;
export const TOTAL_APPLICATION_STEPS = 13;

export type ApplicationStepId = (typeof APPLICATION_STEP_IDS)[number];
