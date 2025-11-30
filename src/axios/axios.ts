import axios, {
  AxiosHeaders,
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { getSession, signOut } from "next-auth/react";
import type { Session } from "next-auth";

const resolveBaseUrl = () => {
  const raw =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_PATH ||
    "";
  const normalized = raw.replace(/\/+$/, "");
  if (!normalized) {
    console.error(
      "[API] Missing NEXT_PUBLIC_API_BASE_URL; API calls will fail (baseURL undefined)."
    );
    return undefined;
  }
  if (!/^https?:\/\//i.test(normalized)) {
    console.warn(
      "[API] API base URL should be absolute (including protocol); current value:",
      normalized
    );
  }
  return normalized;
};

const baseURL = resolveBaseUrl();

const createAxiosInstance = () =>
  axios.create({
    baseURL,
    timeout: 20000,
  });

export const axiosDataPublic = createAxiosInstance();
export const axiosDataPrivate = createAxiosInstance();

type RetryableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

const applyAuthHeader = (
  headers: InternalAxiosRequestConfig["headers"],
  value: string
) => {
  const merged =
    headers instanceof AxiosHeaders ? headers : new AxiosHeaders(headers);
  merged.set("Authorization", value);
  return merged;
};

type SessionWithTokens = Session & {
  accessToken?: string;
  access_token?: string;
  tokenType?: string;
};

const extractTokens = (session: Session | null): SessionWithTokens | null => {
  if (!session) return null;
  return session as SessionWithTokens;
};

const attachAuthInterceptors = (client: AxiosInstance) => {
  client.interceptors.request.use(
    async (config) => {
      const session = extractTokens(await getSession());
      const accessToken = session?.accessToken ?? session?.access_token;
      const tokenType = session?.tokenType || "Bearer";

      if (accessToken) {
        config.headers = applyAuthHeader(
          config.headers,
          `${tokenType} ${accessToken}`
        );
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as RetryableRequest;

      if (error.response?.status === 401 && !originalRequest?._retry) {
        originalRequest._retry = true;

        try {
          await fetch("/api/auth/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ update: true }),
          });

          const updatedSession = extractTokens(await getSession());
          const refreshedToken =
            updatedSession?.accessToken ?? updatedSession?.access_token;
          const tokenType = updatedSession?.tokenType || "Bearer";

          if (!refreshedToken)
            throw new Error("Unable to refresh access token");

          originalRequest.headers = applyAuthHeader(
            originalRequest.headers,
            `${tokenType} ${refreshedToken}`
          );

          return client(originalRequest);
        } catch (refreshError) {
          await signOut({ redirect: false, callbackUrl: "/login" });
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
};

attachAuthInterceptors(axiosDataPrivate);
