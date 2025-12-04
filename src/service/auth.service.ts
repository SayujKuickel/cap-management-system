import { ApiService } from "@/service/base.service";
import {
  buildQueryString,
  resolveServiceCall,
  type QueryValue,
} from "@/service/service-helpers";
import type { ServiceResponse } from "@/types/service";

type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  role: string;
  rto_profile_id: string;
  given_name: string;
  family_name: string;
};

type Payload = Record<string, unknown>;

export type LoginResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    role: string;
    status: string;
    rto_profile_id: string | null;
  };
};

class AuthService extends ApiService {
  private readonly basePath = "auth";

  register(payload: RegisterPayload): Promise<ServiceResponse<unknown>> {
    return resolveServiceCall<unknown>(
      () => this.post(`${this.basePath}/register`, payload, false),
      "Registration successful.",
      "Failed to register user",
    );
  }

  login(payload: LoginPayload): Promise<ServiceResponse<LoginResponse>> {
    const formData = new URLSearchParams();
    formData.set("username", payload.email);
    formData.set("password", payload.password);

    return resolveServiceCall<LoginResponse>(
      () =>
        this.post(
          `${this.basePath}/login`,
          formData,
          false,
          { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
        ),
      "Logged in successfully.",
      "Failed to log in",
    );
  }

  refreshToken(payload: Payload): Promise<ServiceResponse<unknown>> {
    return resolveServiceCall<unknown>(
      () => this.post(`${this.basePath}/refresh`, payload, false),
      "Token refreshed.",
      "Failed to refresh token",
    );
  }

  setupMfa(payload: Payload): Promise<ServiceResponse<unknown>> {
    return resolveServiceCall<unknown>(
      () => this.post(`${this.basePath}/mfa/setup`, payload, true),
      "MFA setup initiated.",
      "Failed to setup MFA",
    );
  }

  verifyMfa(payload: Payload): Promise<ServiceResponse<unknown>> {
    return resolveServiceCall<unknown>(
      () => this.post(`${this.basePath}/mfa/verify`, payload, true),
      "MFA verified.",
      "Failed to verify MFA",
    );
  }

  disableMfa(payload: Payload): Promise<ServiceResponse<unknown>> {
    return resolveServiceCall<unknown>(
      () => this.post(`${this.basePath}/mfa/disable`, payload, true),
      "MFA disabled.",
      "Failed to disable MFA",
    );
  }

  getCurrentUser(): Promise<ServiceResponse<unknown>> {
    return resolveServiceCall<unknown>(
      () => this.get(`${this.basePath}/me`, true),
      "Fetched current user.",
      "Failed to fetch current user",
    );
  }

  forgotPassword(payload: Payload): Promise<ServiceResponse<unknown>> {
    return resolveServiceCall<unknown>(
      () => this.post(`${this.basePath}/forgot-password`, payload, false),
      "Password reset email sent.",
      "Failed to process forgot password request",
    );
  }

  resetPassword(payload: Payload): Promise<ServiceResponse<unknown>> {
    return resolveServiceCall<unknown>(
      () => this.post(`${this.basePath}/reset-password`, payload, false),
      "Password reset successful.",
      "Failed to reset password",
    );
  }

  microsoftLogin(
    params: Record<string, QueryValue> = {},
  ): Promise<ServiceResponse<unknown>> {
    const query = buildQueryString(params);
    return resolveServiceCall<unknown>(
      () => this.get(`${this.basePath}/microsoft/login${query}`, false),
      "Microsoft login URL fetched.",
      "Failed to start Microsoft login",
    );
  }

  microsoftCallback(
    params: Record<string, QueryValue> = {},
  ): Promise<ServiceResponse<unknown>> {
    const query = buildQueryString(params);
    return resolveServiceCall<unknown>(
      () => this.get(`${this.basePath}/microsoft/callback${query}`, false),
      "Microsoft login callback processed.",
      "Failed to process Microsoft callback",
    );
  }

  microsoftStatus(): Promise<ServiceResponse<unknown>> {
    return resolveServiceCall<unknown>(
      () => this.get(`${this.basePath}/microsoft/status`, true),
      "Microsoft OAuth status fetched.",
      "Failed to fetch Microsoft OAuth status",
    );
  }
}

const authService = new AuthService();
export default authService;
