import type { FieldErrors } from "react-hook-form";

export const getFieldError = (
  errors: FieldErrors,
  name: string
): { message?: string } | undefined => {
  const path = name
    // convert bracket notation to dot for paths like items[0].field
    .replace(/\[(\d+)\]/g, ".$1")
    .split(".")
    .filter(Boolean);

  return path.reduce<unknown>((acc, key) => {
    if (!acc || typeof acc !== "object") return undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (acc as any)[key];
  }, errors) as { message?: string } | undefined;
};
