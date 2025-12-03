import { ApiService } from "@/service/base.service";
import { handleApiError } from "@/utils/handle-api-error";
import type { ServiceResponse } from "@/types/service";

export interface StaffMetrics {
  total_applications: number;
  submitted_pending_review: number;
  in_staff_review: number;
  awaiting_documents: number;
  in_gs_assessment: number;
  offers_generated: number;
  enrolled: number;
  rejected: number;
  documents_pending_verification: number;
}

class StaffMetricsService extends ApiService {
  private readonly basePath = "staff/metrics";

  getStaffMetrics = async (): Promise<ServiceResponse<StaffMetrics>> => {
    try {
      const data = await this.get<StaffMetrics>(this.basePath, true);
      return {
        success: true,
        message: "Staff metrics fetched successfully.",
        data,
      };
    } catch (error) {
      return handleApiError<StaffMetrics>(
        error,
        "Failed to fetch staff metrics",
        {
          total_applications: 0,
          submitted_pending_review: 0,
          in_staff_review: 0,
          awaiting_documents: 0,
          in_gs_assessment: 0,
          offers_generated: 0,
          enrolled: 0,
          rejected: 0,
          documents_pending_verification: 0,
        }
      );
    }
  };

  getAllStaffMetrics = async (): Promise<ServiceResponse<StaffMetrics>> => {
    try {
      const data = await this.get<StaffMetrics>(`${this.basePath}/all`, true);
      return {
        success: true,
        message: "Organization metrics fetched successfully.",
        data,
      };
    } catch (error) {
      return handleApiError<StaffMetrics>(
        error,
        "Failed to fetch organization metrics",
        {
          total_applications: 0,
          submitted_pending_review: 0,
          in_staff_review: 0,
          awaiting_documents: 0,
          in_gs_assessment: 0,
          offers_generated: 0,
          enrolled: 0,
          rejected: 0,
          documents_pending_verification: 0,
        }
      );
    }
  };
}

const staffMetricsService = new StaffMetricsService();
export default staffMetricsService;
