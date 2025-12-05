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
    async (error) => {
      const originalRequest = error.config;
      // Check if the error is due to an expired token and it's not a refresh token request
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        const session = await getSession(); // This will trigger the jwt callback if token is expired
        if (session?.accessToken) {
          originalRequest.headers.Authorization = `Bearer ${session.accessToken}`;
          return client(originalRequest);
        }
        // If refresh failed or no new token, reject the error
        return Promise.reject(error);
      }
      return Promise.reject(error);
    }
  );
};

attachAuthInterceptors(axiosDataPrivate);
