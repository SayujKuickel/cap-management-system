import { ApiService } from "@/service/base.service";
import { handleApiError } from "@/utils/handle-api-error";
import type { ServiceResponse } from "@/types/service";
import {
  AdditionalServicesValues,
  DisabilitySupportValues,
  EmergencyContactValues,
  EmploymentHistoryValues,
  HealthCoverValues,
  LanguageCulturalValues,
  PersonalDetailsValues,
  PreviousQualificationsValues,
  SchoolingHistoryValues,
  SurveyValues,
  UsiValues,
  additionalServicesSchema,
  disabilitySupportSchema,
  emergencyContactSchema,
  employmentHistorySchema,
  healthCoverSchema,
  languageCulturalSchema,
  personalDetailsSchema,
  previousQualificationsSchema,
  schoolingHistorySchema,
  surveySchema,
  usiSchema,
} from "@/validation/application.validation";

export interface StepUpdateResponse {
  applicationId?: string;
  step?: number;
  completed?: boolean;
  updatedAt?: string;
  message?: string;
}

export interface SurveyAvailabilityCode {
  code: string;
  label: string;
}

class ApplicationStepsService extends ApiService {
  private readonly basePath = "applications";

  private stepPath(applicationId: string, step: number, slug: string) {
    if (!applicationId) throw new Error("Application id is required");
    return `${this.basePath}/${applicationId}/steps/${step}/${slug}`;
  }

  updatePersonalDetails = async (
    applicationId: string,
    input: PersonalDetailsValues
  ): Promise<ServiceResponse<StepUpdateResponse>> => {
    try {
      const body = personalDetailsSchema.parse(input);
      const data = await this.patch<StepUpdateResponse>(
        this.stepPath(applicationId, 1, "personal-details"),
        body,
        true
      );
      return {
        success: true,
        message: "Personal details saved.",
        data,
      };
    } catch (error) {
      return handleApiError<StepUpdateResponse>(
        error,
        "Failed to save personal details"
      );
    }
  };

  updateEmergencyContact = async (
    applicationId: string,
    input: EmergencyContactValues
  ): Promise<ServiceResponse<StepUpdateResponse>> => {
    try {
      const body = emergencyContactSchema.parse(input);
      const data = await this.patch<StepUpdateResponse>(
        this.stepPath(applicationId, 2, "emergency-contact"),
        body,
        true
      );
      return {
        success: true,
        message: "Emergency contact saved.",
        data,
      };
    } catch (error) {
      return handleApiError<StepUpdateResponse>(
        error,
        "Failed to save emergency contact"
      );
    }
  };

  updateHealthCover = async (
    applicationId: string,
    input: HealthCoverValues
  ): Promise<ServiceResponse<StepUpdateResponse>> => {
    try {
      const body = healthCoverSchema.parse(input);
      const data = await this.patch<StepUpdateResponse>(
        this.stepPath(applicationId, 3, "health-cover"),
        body,
        true
      );
      return {
        success: true,
        message: "Health cover saved.",
        data,
      };
    } catch (error) {
      return handleApiError<StepUpdateResponse>(
        error,
        "Failed to save health cover details"
      );
    }
  };

  updateLanguageCultural = async (
    applicationId: string,
    input: LanguageCulturalValues
  ): Promise<ServiceResponse<StepUpdateResponse>> => {
    try {
      const body = languageCulturalSchema.parse(input);
      const data = await this.patch<StepUpdateResponse>(
        this.stepPath(applicationId, 4, "language-cultural"),
        body,
        true
      );
      return {
        success: true,
        message: "Language & cultural information saved.",
        data,
      };
    } catch (error) {
      return handleApiError<StepUpdateResponse>(
        error,
        "Failed to save language & cultural information"
      );
    }
  };

  updateDisabilitySupport = async (
    applicationId: string,
    input: DisabilitySupportValues
  ): Promise<ServiceResponse<StepUpdateResponse>> => {
    try {
      const body = disabilitySupportSchema.parse(input);
      const data = await this.patch<StepUpdateResponse>(
        this.stepPath(applicationId, 5, "disability-support"),
        body,
        true
      );
      return {
        success: true,
        message: "Disability details saved.",
        data,
      };
    } catch (error) {
      return handleApiError<StepUpdateResponse>(
        error,
        "Failed to save disability details"
      );
    }
  };

  updateSchoolingHistory = async (
    applicationId: string,
    input: SchoolingHistoryValues
  ): Promise<ServiceResponse<StepUpdateResponse>> => {
    try {
      const body = schoolingHistorySchema.parse(input);
      const data = await this.patch<StepUpdateResponse>(
        this.stepPath(applicationId, 6, "schooling-history"),
        body,
        true
      );
      return {
        success: true,
        message: "Schooling history saved.",
        data,
      };
    } catch (error) {
      return handleApiError<StepUpdateResponse>(
        error,
        "Failed to save schooling history"
      );
    }
  };

  updatePreviousQualifications = async (
    applicationId: string,
    input: PreviousQualificationsValues
  ): Promise<ServiceResponse<StepUpdateResponse>> => {
    try {
      const body = previousQualificationsSchema.parse(input);
      const data = await this.patch<StepUpdateResponse>(
        this.stepPath(applicationId, 7, "qualifications"),
        body,
        true
      );
      return {
        success: true,
        message: "Qualification details saved.",
        data,
      };
    } catch (error) {
      return handleApiError<StepUpdateResponse>(
        error,
        "Failed to save qualification details"
      );
    }
  };

  updateEmploymentHistory = async (
    applicationId: string,
    input: EmploymentHistoryValues
  ): Promise<ServiceResponse<StepUpdateResponse>> => {
    try {
      const body = employmentHistorySchema.parse(input);
      const data = await this.patch<StepUpdateResponse>(
        this.stepPath(applicationId, 8, "employment-history"),
        body,
        true
      );
      return {
        success: true,
        message: "Employment history saved.",
        data,
      };
    } catch (error) {
      return handleApiError<StepUpdateResponse>(
        error,
        "Failed to save employment history"
      );
    }
  };

  updateUsi = async (
    applicationId: string,
    input: UsiValues
  ): Promise<ServiceResponse<StepUpdateResponse>> => {
    try {
      const body = usiSchema.parse(input);
      const data = await this.patch<StepUpdateResponse>(
        this.stepPath(applicationId, 9, "usi"),
        body,
        true
      );
      return {
        success: true,
        message: "USI details saved.",
        data,
      };
    } catch (error) {
      return handleApiError<StepUpdateResponse>(
        error,
        "Failed to save USI details"
      );
    }
  };

  updateAdditionalServices = async (
    applicationId: string,
    input: AdditionalServicesValues
  ): Promise<ServiceResponse<StepUpdateResponse>> => {
    try {
      const body = additionalServicesSchema.parse(input);
      const data = await this.patch<StepUpdateResponse>(
        this.stepPath(applicationId, 10, "additional-services"),
        body,
        true
      );
      return {
        success: true,
        message: "Additional services saved.",
        data,
      };
    } catch (error) {
      return handleApiError<StepUpdateResponse>(
        error,
        "Failed to save additional services"
      );
    }
  };

  updateSurvey = async (
    applicationId: string,
    input: SurveyValues
  ): Promise<ServiceResponse<StepUpdateResponse>> => {
    try {
      const body = surveySchema.parse(input);

      const newBody = {
        ...body,
        availability_status: body.availability_status,
      };
      const data = await this.patch<StepUpdateResponse>(
        this.stepPath(applicationId, 11, "survey"),
        newBody,
        true
      );
      return {
        success: true,
        message: "Survey saved.",
        data,
      };
    } catch (error) {
      return handleApiError<StepUpdateResponse>(error, "Failed to save survey");
    }
  };

  getDocumentStatus = async (
    applicationId: string
  ): Promise<ServiceResponse<unknown>> => {
    if (!applicationId) throw new Error("Application id is required");
    try {
      const data = await this.get<unknown>(
        this.stepPath(applicationId, 12, "documents"),
        true
      );
      return {
        success: true,
        message: "Document status fetched.",
        data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to fetch document status");
    }
  };

  getSurveyAvailabilityCodes = async (): Promise<
    ServiceResponse<SurveyAvailabilityCode[]>
  > => {
    try {
      const data = await this.get<SurveyAvailabilityCode[]>(
        `${this.basePath}/survey-availability-codes`,
        false
      );
      return {
        success: true,
        message: "Survey availability codes fetched.",
        data,
      };
    } catch (error) {
      return handleApiError<SurveyAvailabilityCode[]>(
        error,
        "Failed to fetch survey availability codes"
      );
    }
  };
}

const applicationStepsService = new ApplicationStepsService();
export default applicationStepsService;
