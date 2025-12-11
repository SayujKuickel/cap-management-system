"use client";
import type { ComponentType } from "react";
import {
  APPLICATION_STEP_IDS,
  REVIEW_STEP_ID,
  TOTAL_APPLICATION_STEPS,
} from "@/constants/application-steps";
import DocumentsUploadForm from "./documents-upload-form";
import AdditionalServicesForm from "./additional-services-form";
import DisabilityForm from "./disability-form";
import EmergencyContactForm from "./emergency-contact-form";
import EmploymentForm from "./employment-form";
import HealthCoverForm from "./health-cover-form";
import LanguageCulturalForm from "./language-cultural-form";
import PersonalDetailsForm from "./personal-details-form";
import QualificationsForm from "./qualifications-form";
import ReviewForm from "./review-form";
import SchoolingForm from "./schooling-form";
import SurveyForm from "./survey-form";
import USIForm from "./usi-form";

export type ApplicationFormStep = {
  id: number;
  title: string;
  component: ComponentType;
};

export const APPLICATION_FORM_STEPS: ApplicationFormStep[] = [
  { id: 1, title: "Personal Details", component: PersonalDetailsForm },
  { id: 2, title: "Emergency Contact", component: EmergencyContactForm },
  { id: 3, title: "Health Cover", component: HealthCoverForm },
  { id: 4, title: "Language & Culture", component: LanguageCulturalForm },
  { id: 5, title: "Disability", component: DisabilityForm },
  { id: 6, title: "Schooling", component: SchoolingForm },
  { id: 7, title: "Qualifications", component: QualificationsForm },
  { id: 8, title: "Employment", component: EmploymentForm },
  { id: 9, title: "USI", component: USIForm },
  { id: 10, title: "Additional Services", component: AdditionalServicesForm },
  { id: 11, title: "Survey", component: SurveyForm },
  { id: 12, title: "Documents", component: DocumentsUploadForm },
  { id: 13, title: "Review", component: ReviewForm },
];

export { APPLICATION_STEP_IDS, REVIEW_STEP_ID, TOTAL_APPLICATION_STEPS };
