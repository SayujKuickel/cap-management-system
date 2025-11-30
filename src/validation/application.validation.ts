import { z } from "zod";

import {
  additionalServicesSchema,
  type AdditionalServicesValues,
} from "./application/additional-services";
import {
  disabilitySchema,
  type DisabilityValues,
} from "./application/disability";
import {
  documentsSchema,
  type DocumentsFormValues,
  type DocumentType,
} from "./application/documents";
import {
  emergencyContactsSchema,
  type EmergencyContactsValues,
} from "./application/emergency-contacts";
import {
  employmentSchema,
  type EmploymentFormValues,
} from "./application/employment";
import {
  healthCoverSchema,
  type HealthCoverValues,
} from "./application/health-cover";
import {
  languageAndCultureSchema,
  type LanguageAndCultureValues,
} from "./application/language-cultural";
import {
  personalDetailsSchema,
  type PersonalDetailsValues,
} from "./application/personal-details";
import {
  qualificationsSchema,
  type QualificationsFormValues,
} from "./application/qualifications";
import { schoolingSchema, type SchoolingValues } from "./application/schooling";
import { surveySchema, type SurveyValues } from "./application/survey";
import { usiSchema, type USIValues } from "./application/usi";

// Draft creation schema (extend when API contract is finalized)
export const applicationCreateSchema = z.object({
  agent_profile_id: z.string().uuid(),
  course_offering_id: z.string().uuid(),
});
export type ApplicationCreateValues = z.infer<typeof applicationCreateSchema>;

export {
  additionalServicesSchema,
  disabilitySchema,
  documentsSchema,
  emergencyContactsSchema,
  employmentSchema,
  healthCoverSchema,
  languageAndCultureSchema,
  personalDetailsSchema,
  qualificationsSchema,
  schoolingSchema,
  surveySchema,
  usiSchema,
};

export type {
  AdditionalServicesValues,
  DisabilityValues,
  DocumentsFormValues,
  DocumentType,
  EmergencyContactsValues,
  EmploymentFormValues,
  HealthCoverValues,
  LanguageAndCultureValues,
  PersonalDetailsValues,
  QualificationsFormValues,
  SchoolingValues,
  SurveyValues,
  USIValues,
};

// Legacy aliases used across services/hooks
export {
  disabilitySchema as disabilitySupportSchema,
  emergencyContactsSchema as emergencyContactSchema,
  employmentSchema as employmentHistorySchema,
  languageAndCultureSchema as languageCulturalSchema,
  qualificationsSchema as previousQualificationsSchema,
  schoolingSchema as schoolingHistorySchema,
};

export type DisabilitySupportValues = DisabilityValues;
export type EmergencyContactValues = EmergencyContactsValues;
export type EmploymentHistoryValues = EmploymentFormValues;
export type LanguageCulturalValues = LanguageAndCultureValues;
export type PreviousQualificationsValues = QualificationsFormValues;
export type SchoolingHistoryValues = SchoolingValues;
export type UsiValues = USIValues;
