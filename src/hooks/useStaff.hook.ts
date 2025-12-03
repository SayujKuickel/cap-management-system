"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import staffService from "@/service/staff.service";
import type {
  VerifyDocumentPayload,
  AssignApplicationPayload,
  TransitionApplicationPayload,
  AddCommentPayload,
  RequestDocumentsPayload,
  ApproveApplicationPayload,
  RejectApplicationPayload,
  RecordGsAssessmentPayload,
  GenerateOfferLetterPayload,
  DocumentVerificationResponse,
  ApplicationActionResponse,
  CommentResponse,
  OfferLetterResponse,
  StaffMetrics,
} from "@/service/staff.service";
import type { ServiceResponse } from "@/types/service";
import type { ApplicationDetailResponse } from "@/service/application.service";
import type { Application, Document } from "@/constants/types";

// --- Queries ---

export const useStaffMetricsQuery = () => {
  return useQuery<ServiceResponse<StaffMetrics>, Error>({
    queryKey: ["staff", "metrics"],
    queryFn: async () => {
      const response = await staffService.getMetrics();
      if (!response.success) throw new Error(response.message);
      return response;
    },
  });
};

export const useOrganizationMetricsQuery = () => {
  return useQuery<ServiceResponse<StaffMetrics>, Error>({
    queryKey: ["staff", "metrics", "all"],
    queryFn: async () => {
      const response = await staffService.getAllMetrics();
      if (!response.success) throw new Error(response.message);
      return response;
    },
  });
};

export const usePendingApplicationsQuery = () => {
  return useQuery<ServiceResponse<Application[]>, Error>({
    queryKey: ["staff", "applications", "pending"],
    queryFn: async () => {
      const response = await staffService.getPendingApplications();
      if (!response.success) throw new Error(response.message);
      return response;
    },
  });
};

export const useApplicationReviewQuery = (applicationId: string | null) => {
  return useQuery<ServiceResponse<ApplicationDetailResponse>, Error>({
    queryKey: ["staff", "application", applicationId],
    queryFn: async () => {
      if (!applicationId) throw new Error("Missing application ID");
      const response = await staffService.getApplicationForReview(applicationId);
      if (!response.success) throw new Error(response.message);
      return response;
    },
    enabled: !!applicationId,
  });
};

export const usePendingDocumentsQuery = () => {
  return useQuery<ServiceResponse<Document[]>, Error>({
    queryKey: ["staff", "documents", "pending"],
    queryFn: async () => {
      const response = await staffService.getPendingDocuments();
      if (!response.success) throw new Error(response.message);
      return response;
    },
  });
};

// --- Mutations ---

export const useVerifyDocumentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ServiceResponse<DocumentVerificationResponse>,
    Error,
    { documentId: string; payload: VerifyDocumentPayload }
  >({
    mutationFn: async ({ documentId, payload }) => {
      return await staffService.verifyDocument(documentId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["staff", "documents", "pending"],
      });
      // Also invalidate application details if we can infer the app ID, but typically document verification
      // affects the list of pending documents and potentially the application status.
      // Since we don't have the appId here easily without passing it, we might just invalidate the specific app query if needed by the caller
      // or invalidate all app queries. For now, pending documents is the main one.
    },
  });
};

export const useAssignApplicationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ServiceResponse<ApplicationActionResponse>,
    Error,
    { applicationId: string; payload: AssignApplicationPayload }
  >({
    mutationFn: async ({ applicationId, payload }) => {
      return await staffService.assignApplication(applicationId, payload);
    },
    onSuccess: (_, { applicationId }) => {
      queryClient.invalidateQueries({
        queryKey: ["staff", "applications", "pending"],
      });
      queryClient.invalidateQueries({
        queryKey: ["staff", "application", applicationId],
      });
    },
  });
};

export const useTransitionApplicationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ServiceResponse<ApplicationActionResponse>,
    Error,
    { applicationId: string; payload: TransitionApplicationPayload }
  >({
    mutationFn: async ({ applicationId, payload }) => {
      return await staffService.transitionApplication(applicationId, payload);
    },
    onSuccess: (_, { applicationId }) => {
      queryClient.invalidateQueries({
        queryKey: ["staff", "applications", "pending"],
      });
      queryClient.invalidateQueries({
        queryKey: ["staff", "application", applicationId],
      });
    },
  });
};

export const useAddCommentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ServiceResponse<CommentResponse>,
    Error,
    { applicationId: string; payload: AddCommentPayload }
  >({
    mutationFn: async ({ applicationId, payload }) => {
      return await staffService.addComment(applicationId, payload);
    },
    onSuccess: (_, { applicationId }) => {
      queryClient.invalidateQueries({
        queryKey: ["staff", "application", applicationId],
      });
    },
  });
};

export const useRequestDocumentsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ServiceResponse<ApplicationActionResponse>,
    Error,
    { applicationId: string; payload: RequestDocumentsPayload }
  >({
    mutationFn: async ({ applicationId, payload }) => {
      return await staffService.requestDocuments(applicationId, payload);
    },
    onSuccess: (_, { applicationId }) => {
      queryClient.invalidateQueries({
        queryKey: ["staff", "application", applicationId],
      });
    },
  });
};

export const useApproveApplicationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ServiceResponse<ApplicationActionResponse>,
    Error,
    { applicationId: string; payload: ApproveApplicationPayload }
  >({
    mutationFn: async ({ applicationId, payload }) => {
      return await staffService.approveApplication(applicationId, payload);
    },
    onSuccess: (_, { applicationId }) => {
      queryClient.invalidateQueries({
        queryKey: ["staff", "applications", "pending"],
      });
      queryClient.invalidateQueries({
        queryKey: ["staff", "application", applicationId],
      });
    },
  });
};

export const useRejectApplicationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ServiceResponse<ApplicationActionResponse>,
    Error,
    { applicationId: string; payload: RejectApplicationPayload }
  >({
    mutationFn: async ({ applicationId, payload }) => {
      return await staffService.rejectApplication(applicationId, payload);
    },
    onSuccess: (_, { applicationId }) => {
      queryClient.invalidateQueries({
        queryKey: ["staff", "applications", "pending"],
      });
      queryClient.invalidateQueries({
        queryKey: ["staff", "application", applicationId],
      });
    },
  });
};

export const useRecordGsAssessmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ServiceResponse<ApplicationActionResponse>,
    Error,
    { applicationId: string; payload: RecordGsAssessmentPayload }
  >({
    mutationFn: async ({ applicationId, payload }) => {
      return await staffService.recordGsAssessment(applicationId, payload);
    },
    onSuccess: (_, { applicationId }) => {
      queryClient.invalidateQueries({
        queryKey: ["staff", "application", applicationId],
      });
    },
  });
};

export const useGenerateOfferLetterMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ServiceResponse<OfferLetterResponse>,
    Error,
    { applicationId: string; payload: GenerateOfferLetterPayload }
  >({
    mutationFn: async ({ applicationId, payload }) => {
      return await staffService.generateOfferLetter(applicationId, payload);
    },
    onSuccess: (_, { applicationId }) => {
      queryClient.invalidateQueries({
        queryKey: ["staff", "application", applicationId],
      });
    },
  });
};
