export type ServiceResponse<T> = {
  success: boolean;
  data: T | null;
  message: string;
};
