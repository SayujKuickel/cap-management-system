export const extractApplicationId = (value: unknown): string | null => {
  if (!value || typeof value !== "object") return null;
  const obj = value as Record<string, unknown>;
  const candidate = obj.id ?? obj.applicationId ?? obj.application_id ?? null;
  return typeof candidate === "string" ? candidate : null;
};
