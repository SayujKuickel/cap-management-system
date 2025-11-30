import axios from 'axios';

export const handleApiError = <T = null>(
  error: unknown,
  fallbackMessage: string,
  defaultData: T = null as T,
) => {
  let errorMessage = fallbackMessage;
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; detail?: string; success?: boolean }
      | undefined;
    errorMessage =
      data?.detail || data?.message || error.message || fallbackMessage;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }
  return {
    success: false,
    data: defaultData,
    message: errorMessage,
  };
};
