import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z
    .string()
    .min(6, "Password must be at least 8 characters.")
    .max(32, "Password must be less than 64 characters."),
});

export type SignInValues = z.infer<typeof signInSchema>;
