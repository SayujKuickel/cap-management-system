export const APPLICATION_STEP_IDS = [
  1, // Documents
  2, // Personal Details
  3, // Emergency Contact
  4, // Health Cover
  5, // Language & Culture
  6, // Disability
  7, // Schooling
  8, // Qualifications
  9, // Employment
  10, // USI
  11, // Additional Services
  12, // Survey
] as const;

export const REVIEW_STEP_ID = 13;
export const TOTAL_APPLICATION_STEPS = 13;

export type ApplicationStepId = (typeof APPLICATION_STEP_IDS)[number];
