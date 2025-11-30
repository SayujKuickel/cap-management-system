import { ApiService } from "@/service/base.service";
import {
  buildQueryString,
  resolveServiceCall,
  type QueryValue,
} from "@/service/service-helpers";
import type { ServiceResponse } from "@/types/service";

type Payload = Record<string, unknown>;

class StudentService extends ApiService {
  private readonly basePath = "students";

  createStudentProfile(payload: Payload): Promise<ServiceResponse<unknown>> {
    return resolveServiceCall<unknown>(
      () => this.post(this.basePath, payload, true),
      "Student profile created.",
      "Failed to create student profile",
    );
  }

  listStudents(
    params: Record<string, QueryValue> = {},
  ): Promise<ServiceResponse<unknown>> {
    const query = buildQueryString(params);
    return resolveServiceCall<unknown>(
      () => this.get(`${this.basePath}${query}`, true),
      "Students fetched.",
      "Failed to fetch students",
    );
  }

  getMyDashboard(): Promise<ServiceResponse<unknown>> {
    return resolveServiceCall<unknown>(
      () => this.get(`${this.basePath}/me/dashboard`, true),
      "Student dashboard fetched.",
      "Failed to fetch student dashboard",
    );
  }

  trackApplication(applicationId: string): Promise<ServiceResponse<unknown>> {
    if (!applicationId) throw new Error("Application id is required");
    return resolveServiceCall<unknown>(
      () =>
        this.get(
          `${this.basePath}/me/applications/${applicationId}/track`,
          true,
        ),
      "Application tracking fetched.",
      "Failed to fetch application tracking",
    );
  }

  updateMyProfile(payload: Payload): Promise<ServiceResponse<unknown>> {
    return resolveServiceCall<unknown>(
      () => this.patch(`${this.basePath}/me`, payload, true),
      "Profile updated.",
      "Failed to update profile",
    );
  }
}

const studentService = new StudentService();
export default studentService;
