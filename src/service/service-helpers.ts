import { handleApiError } from "@/utils/handle-api-error";
import type { ServiceResponse } from "@/types/service";

export type QueryValue = string | number | boolean | null | undefined;

export const buildQueryString = (
  params: Record<string, QueryValue> = {},
): string => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    searchParams.set(key, String(value));
  });
  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

export const resolveServiceCall = async <T>(
  action: () => Promise<T>,
  successMessage: string,
  errorMessage: string,
  defaultData?: T,
): Promise<ServiceResponse<T>> => {
  try {
    const data = await action();
    return { success: true, data, message: successMessage };
  } catch (error) {
    return handleApiError<T>(
      error,
      errorMessage,
      (defaultData ?? null) as T,
    );
  }
};
