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
  { id: 1, title: "Documents", component: DocumentsUploadForm },
  { id: 2, title: "Personal Details", component: PersonalDetailsForm },
  { id: 3, title: "Emergency Contact", component: EmergencyContactForm },
  { id: 4, title: "Health Cover", component: HealthCoverForm },
  { id: 5, title: "Language & Culture", component: LanguageCulturalForm },
  { id: 6, title: "Disability", component: DisabilityForm },
  { id: 7, title: "Schooling", component: SchoolingForm },
  { id: 8, title: "Qualifications", component: QualificationsForm },
  { id: 9, title: "Employment", component: EmploymentForm },
  { id: 10, title: "USI", component: USIForm },
  { id: 11, title: "Additional Services", component: AdditionalServicesForm },
  { id: 12, title: "Survey", component: SurveyForm },
  { id: 13, title: "Review", component: ReviewForm },
];

export { APPLICATION_STEP_IDS, REVIEW_STEP_ID, TOTAL_APPLICATION_STEPS };
