import { ApiService } from "@/service/base.service";
import { resolveServiceCall } from "@/service/service-helpers";
import type { ServiceResponse } from "@/types/service";

class SystemService extends ApiService {
  getApiRoot(): Promise<ServiceResponse<unknown>> {
    return resolveServiceCall<unknown>(
      () => this.get("/api/v1/", false),
      "API root fetched.",
      "Failed to reach API root",
    );
  }

  getRoot(): Promise<ServiceResponse<unknown>> {
    return resolveServiceCall<unknown>(
      () => this.get("/", false),
      "Root endpoint fetched.",
      "Failed to reach root endpoint",
    );
  }

  healthCheck(): Promise<ServiceResponse<unknown>> {
    return resolveServiceCall<unknown>(
      () => this.get("/health", false),
      "Health check passed.",
      "Health check failed",
    );
  }
}

const systemService = new SystemService();
export default systemService;
