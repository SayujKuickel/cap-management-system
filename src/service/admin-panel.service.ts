import { ApiService } from "@/service/base.service";
import { resolveServiceCall } from "@/service/service-helpers";
import type { ServiceResponse } from "@/types/service";

class AdminPanelService extends ApiService {
  private readonly basePath = "admin-panel";

  getLoginPage(): Promise<ServiceResponse<unknown>> {
    return resolveServiceCall<unknown>(
      () => this.get(`${this.basePath}/login`, true),
      "Admin login page fetched.",
      "Failed to load admin login page",
    );
  }

  getDashboard(): Promise<ServiceResponse<unknown>> {
    return resolveServiceCall<unknown>(
      () => this.get(`${this.basePath}/`, true),
      "Admin dashboard fetched.",
      "Failed to load admin dashboard",
    );
  }

  getRtoProfilesPage(): Promise<ServiceResponse<unknown>> {
    return resolveServiceCall<unknown>(
      () => this.get(`${this.basePath}/rto-profiles`, true),
      "Admin RTO profiles page fetched.",
      "Failed to load RTO profiles page",
    );
  }

  getDocumentTypesPage(): Promise<ServiceResponse<unknown>> {
    return resolveServiceCall<unknown>(
      () => this.get(`${this.basePath}/document-types`, true),
      "Admin document types page fetched.",
      "Failed to load document types page",
    );
  }

  getStaffPage(): Promise<ServiceResponse<unknown>> {
    return resolveServiceCall<unknown>(
      () => this.get(`${this.basePath}/staff`, true),
      "Admin staff page fetched.",
      "Failed to load staff page",
    );
  }

  getAgentsPage(): Promise<ServiceResponse<unknown>> {
    return resolveServiceCall<unknown>(
      () => this.get(`${this.basePath}/agents`, true),
      "Admin agents page fetched.",
      "Failed to load agents page",
    );
  }

  getCoursesPage(): Promise<ServiceResponse<unknown>> {
    return resolveServiceCall<unknown>(
      () => this.get(`${this.basePath}/courses`, true),
      "Admin courses page fetched.",
      "Failed to load courses page",
    );
  }

  getCampusesPage(): Promise<ServiceResponse<unknown>> {
    return resolveServiceCall<unknown>(
      () => this.get(`${this.basePath}/campuses`, true),
      "Admin campuses page fetched.",
      "Failed to load campuses page",
    );
  }

  getOfferLetterPreview(): Promise<ServiceResponse<unknown>> {
    return resolveServiceCall<unknown>(
      () => this.get(`${this.basePath}/offer-letter/preview`, true),
      "Offer letter preview fetched.",
      "Failed to load offer letter preview",
    );
  }
}

const adminPanelService = new AdminPanelService();
export default adminPanelService;
