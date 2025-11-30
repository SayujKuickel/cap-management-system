import { z } from "zod";

export const registerSchema = z.object({
  givenName: z
    .string()
    .min(1, "First name is required.")
    .max(100, "First name is too long."),
  familyName: z
    .string()
    .min(1, "Last name is required.")
    .max(100, "Last name is too long."),
  email: z.string().email("Enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(64, "Password must be less than 64 characters."),
});

export type RegisterValues = z.infer<typeof registerSchema>;
