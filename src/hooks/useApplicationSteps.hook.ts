"use client";
import { useMutation } from "@tanstack/react-query";
import {
  APPLICATION_STEP_IDS,
  type ApplicationStepId,
} from "@/constants/application-steps";
import applicationStepsService from "@/service/application-steps.service";
import { useApplicationStepStore } from "@/store/useApplicationStep.store";
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
} from "@/validation/application.validation";
import type { ServiceResponse } from "@/types/service";
import type { StepUpdateResponse } from "@/service/application-steps.service";
import { toast } from "react-hot-toast";
import { usePersistence } from "@/hooks/usePersistance.hook";

type StepMutationFn<TInput> = (
  applicationId: string,
  payload: TInput
) => Promise<ServiceResponse<StepUpdateResponse>>;

export const STEP_SAVE_ORDER = APPLICATION_STEP_IDS;

const useStepMutation = <TInput>(
  stepId: ApplicationStepId,
  mutationFn: StepMutationFn<TInput>,
  applicationId: string | null
) => {
  const markStepCompleted = useApplicationStepStore(
    (state) => state.markStepCompleted
  );
  const goToNext = useApplicationStepStore((state) => state.goToNext);
  const { saveStepData } = usePersistence(applicationId);

  return useMutation<ServiceResponse<StepUpdateResponse>, Error, TInput>({
    mutationKey: ["application-step", stepId, applicationId],
    mutationFn: async (payload: TInput) => {
      if (!applicationId) {
        throw new Error("Missing application reference.");
      }
      const response = await mutationFn(applicationId, payload);
      if (!response?.success) {
        throw new Error(response?.message || `Failed to save step ${stepId}.`);
      }
      return response;
    },
    onSuccess: (response, payload) => {
      const message =
        response?.message || `Step ${stepId} saved successfully.`;
      toast.success(message);
      console.log("[Application] step saved", {
        stepId,
        applicationId,
        message,
        payload,
      });
      
      // Save to localStorage after successful API save
      if (applicationId) {
        saveStepData(stepId, payload);
      }
      
      markStepCompleted(stepId);
      goToNext();
    },
    onError: (error) => {
      const message =
        error?.message || `Failed to save step ${stepId}. Please try again.`;
      toast.error(message);
      console.error("[Application] step save failed", {
        stepId,
        applicationId,
        error,
      });
    },
  });
};

export const useApplicationStepMutations = (applicationId: string | null) => ({
  2: useStepMutation<PersonalDetailsValues>(
    2,
    (id, payload) => applicationStepsService.updatePersonalDetails(id, payload),
    applicationId
  ),
  3: useStepMutation<EmergencyContactValues>(
    3,
    (id, payload) =>
      applicationStepsService.updateEmergencyContact(id, payload),
    applicationId
  ),
  4: useStepMutation<HealthCoverValues>(
    4,
    (id, payload) => applicationStepsService.updateHealthCover(id, payload),
    applicationId
  ),
  5: useStepMutation<LanguageCulturalValues>(
    5,
    (id, payload) =>
      applicationStepsService.updateLanguageCultural(id, payload),
    applicationId
  ),
  6: useStepMutation<DisabilitySupportValues>(
    6,
    (id, payload) =>
      applicationStepsService.updateDisabilitySupport(id, payload),
    applicationId
  ),
  7: useStepMutation<SchoolingHistoryValues>(
    7,
    (id, payload) =>
      applicationStepsService.updateSchoolingHistory(id, payload),
    applicationId
  ),
  8: useStepMutation<PreviousQualificationsValues>(
    8,
    (id, payload) =>
      applicationStepsService.updatePreviousQualifications(id, payload),
    applicationId
  ),
  9: useStepMutation<EmploymentHistoryValues>(
    9,
    (id, payload) =>
      applicationStepsService.updateEmploymentHistory(id, payload),
    applicationId
  ),
  10: useStepMutation<UsiValues>(
    10,
    (id, payload) => applicationStepsService.updateUsi(id, payload),
    applicationId
  ),
  11: useStepMutation<AdditionalServicesValues>(
    11,
    (id, payload) =>
      applicationStepsService.updateAdditionalServices(id, payload),
    applicationId
  ),
  12: useStepMutation<SurveyValues>(
    12,
    (id, payload) => applicationStepsService.updateSurvey(id, payload),
    applicationId
  ),
});
