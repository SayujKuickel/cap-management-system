import { create } from "zustand";
import type { ApplicationDetailResponse } from "@/service/application.service";
import type { OcrResult } from "@/service/document.service";

type FormDataState = {
  // User input data for each step
  stepData: Record<number, unknown>;
  // OCR extracted data (used as defaults)
  ocrData: Record<number, unknown>;
  // Application ID
  applicationId: string | null;
  
  // Actions
  setApplicationId: (id: string | null) => void;
  setStepData: <T>(stepId: number, data: T) => void;
  getStepData: <T>(stepId: number) => T | undefined;
  setOcrData: <T>(stepId: number, data: T) => void;
  getOcrData: <T>(stepId: number) => T | undefined;
  getMergedStepData: <T>(stepId: number) => T | undefined;
  clearStepData: (stepId: number) => void;
  clearAllData: () => void;
  populateFromApiResponse: (apiResponse: ApplicationDetailResponse) => void;
  populateFromOcrResult: (ocrResult: OcrResult) => void;
};

// Helper to merge OCR data with user data (user data takes precedence)
const mergeData = <T>(
  ocrData: T | undefined,
  userData: T | undefined
): T | undefined => {
  if (!ocrData && !userData) return undefined;
  if (!ocrData) return userData;
  if (!userData) return ocrData;

  // For arrays, return user data if exists, otherwise OCR data
  if (Array.isArray(userData)) return userData as T;
  if (Array.isArray(ocrData)) return ocrData as T;

  // If both are objects, merge them deeply (user data takes precedence)
  if (
    typeof ocrData === "object" &&
    typeof userData === "object" &&
    !Array.isArray(ocrData) &&
    !Array.isArray(userData) &&
    ocrData !== null &&
    userData !== null
  ) {
    const merged = { ...ocrData } as Record<string, unknown>;
    
    // Merge each field: user data takes precedence, but fill empty fields with OCR data
    Object.keys(userData as Record<string, unknown>).forEach((key) => {
      const userValue = (userData as Record<string, unknown>)[key];
      const ocrValue = (ocrData as Record<string, unknown>)[key];
      
      // If user value is empty/null/undefined, use OCR value
      if (
        userValue === null ||
        userValue === undefined ||
        userValue === "" ||
        (Array.isArray(userValue) && userValue.length === 0)
      ) {
        if (ocrValue !== undefined) {
          merged[key] = ocrValue;
        }
      } else {
        merged[key] = userValue;
      }
    });
    
    // Add any OCR fields that don't exist in user data
    Object.keys(ocrData as Record<string, unknown>).forEach((key) => {
      if (!(key in merged)) {
        merged[key] = (ocrData as Record<string, unknown>)[key];
      }
    });
    
    return merged as T;
  }

  // For primitives, user data takes precedence
  return userData;
};

export const useApplicationFormDataStore = create<FormDataState>()((set, get) => ({
  stepData: {},
  ocrData: {},
  applicationId: null,

  setApplicationId: (id) => {
    set({ applicationId: id });
  },

  setStepData: <T,>(stepId: number, data: T) => {
    set((state) => ({
      stepData: {
        ...state.stepData,
        [stepId]: data,
      },
    }));
  },

  getStepData: <T,>(stepId: number): T | undefined => {
    const state = get();
    return (state.stepData[stepId] as T) || undefined;
  },

  setOcrData: <T,>(stepId: number, data: T) => {
    set((state) => {
      // Always store OCR data - it will be used as default when merging
      const newOcrData = {
        ...state.ocrData,
        [stepId]: data,
      };

      // If user hasn't filled this step yet, prefill with OCR data
      const existingUserData = state.stepData[stepId];
      if (!existingUserData) {
        return {
          ocrData: newOcrData,
          stepData: {
            ...state.stepData,
            [stepId]: data, // Prefill with OCR data
          },
        };
      }

      // User data exists, just update OCR data
      return {
        ocrData: newOcrData,
      };
    });
  },

  getOcrData: <T,>(stepId: number): T | undefined => {
    const state = get();
    return (state.ocrData[stepId] as T) || undefined;
  },

  getMergedStepData: <T,>(stepId: number): T | undefined => {
    const state = get();
    const ocrData = state.ocrData[stepId] as T | undefined;
    const userData = state.stepData[stepId] as T | undefined;
    return mergeData(ocrData, userData);
  },

  clearStepData: (stepId: number) => {
    set((state) => {
      const newStepData = { ...state.stepData };
      delete newStepData[stepId];
      return { stepData: newStepData };
    });
  },

  clearAllData: () => {
    set({
      stepData: {},
      ocrData: {},
      applicationId: null,
    });
  },

  populateFromApiResponse: (apiResponse: ApplicationDetailResponse) => {
    set((state) => {
      const newStepData = { ...state.stepData };

      // Map API response fields to step IDs
      // Step 2: Personal Details

      console.log("apiResponse.personal_details", apiResponse.personal_details);
      if (apiResponse.personal_details) {
        newStepData[2] = apiResponse.personal_details;
      }

      // Step 3: Emergency Contact
      if (apiResponse.emergency_contacts) {
        newStepData[3] = apiResponse.emergency_contacts;
      }

      // Step 4: Health Cover
      if (apiResponse.health_cover_policy) {
        newStepData[4] = apiResponse.health_cover_policy;
      }

      // Step 5: Language & Culture
      if (apiResponse.language_cultural_data) {
        newStepData[5] = apiResponse.language_cultural;
      }

      // Step 6: Disability Support
      if (apiResponse.disability_support) {
        newStepData[6] = apiResponse.disability_support;
      }

      // Step 7: Schooling History
      if (apiResponse.schooling_history) {
        newStepData[7] = apiResponse.schooling_history;
      }

      // Step 8: Qualifications
      if (apiResponse.qualifications) {
        newStepData[8] = apiResponse.qualifications;
      }

      // Step 9: Employment History
      if (apiResponse.employment_history) {
        newStepData[9] = apiResponse.employment_history;
      }

      // Step 10: USI
      if (apiResponse.usi) {
        newStepData[10] = { usi: apiResponse.usi };
      }

      // Step 11: Additional Services
      if (apiResponse.additional_services) {
        newStepData[11] = apiResponse.additional_services;
      }

      // Step 12: Survey
      if (apiResponse.survey_responses) {
        newStepData[12] = apiResponse.survey_responses;
      }

      return { stepData: newStepData };
    });
  },

  populateFromOcrResult: (ocrResult: OcrResult) => {
    set((state) => {
      const newOcrData = { ...state.ocrData };

      // Map OCR sections to step IDs
      // Step 2: Personal Details
      if (ocrResult.sections.personal_details?.extracted_data) {
        newOcrData[2] = ocrResult.sections.personal_details.extracted_data;
      }

      // Step 3: Emergency Contact
      if (ocrResult.sections.emergency_contacts?.extracted_data) {
        newOcrData[3] = ocrResult.sections.emergency_contacts.extracted_data;
      }

      // Step 4: Health Cover
      if (ocrResult.sections.health_cover?.extracted_data) {
        newOcrData[4] = ocrResult.sections.health_cover.extracted_data;
      }

      // Step 5: Language & Culture
      if (ocrResult.sections.language_cultural?.extracted_data) {
        newOcrData[5] = ocrResult.sections.language_cultural.extracted_data;
      }

      // Step 6: Disability Support
      if (ocrResult.sections.disability_support?.extracted_data) {
        newOcrData[6] = ocrResult.sections.disability_support.extracted_data;
      }

      // Step 7: Schooling History (array)
      if (ocrResult.sections.schooling_history && Array.isArray(ocrResult.sections.schooling_history)) {
        const schoolingData = ocrResult.sections.schooling_history.map(
          (section) => section.extracted_data
        );
        if (schoolingData.length > 0) {
          newOcrData[7] = schoolingData;
        }
      }

      // Step 8: Qualifications (array)
      if (ocrResult.sections.qualifications && Array.isArray(ocrResult.sections.qualifications)) {
        const qualificationsData = ocrResult.sections.qualifications.map(
          (section) => section.extracted_data
        );
        if (qualificationsData.length > 0) {
          newOcrData[8] = qualificationsData;
        }
      }

      // Step 9: Employment History (array)
      if (ocrResult.sections.employment_history && Array.isArray(ocrResult.sections.employment_history)) {
        const employmentData = ocrResult.sections.employment_history.map(
          (section) => section.extracted_data
        );
        if (employmentData.length > 0) {
          newOcrData[9] = employmentData;
        }
      }

      // Step 10: USI
      if (ocrResult.sections.usi?.extracted_data) {
        newOcrData[10] = ocrResult.sections.usi.extracted_data;
      }

      // Step 11: Additional Services
      if (ocrResult.sections.additional_services?.extracted_data) {
        newOcrData[11] = ocrResult.sections.additional_services.extracted_data;
      }

      // Step 12: Survey
      if (ocrResult.sections.survey_responses?.extracted_data) {
        newOcrData[12] = ocrResult.sections.survey_responses.extracted_data;
      }

      // Update OCR data and prefill step data if user hasn't filled it yet
      const newStepData = { ...state.stepData };
      Object.keys(newOcrData).forEach((stepIdStr) => {
        const stepId = parseInt(stepIdStr, 10);
        if (!isNaN(stepId) && !newStepData[stepId]) {
          // User hasn't filled this step, prefill with OCR data
          newStepData[stepId] = newOcrData[stepId];
        }
      });

      return {
        ocrData: newOcrData,
        stepData: newStepData,
      };
    });
  },
}));

