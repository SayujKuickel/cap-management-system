import { signIn } from "next-auth/react";

import type { UserRole } from "@/lib/auth";
import type { SignInValues } from "@/validation/sign-in";

export type SignInResult = {
  error?: string;
  ok: boolean;
  url?: string | null;
  role?: UserRole;
};

const handleSignIn = async (
  payload: SignInValues,
  role?: UserRole,
): Promise<SignInResult> => {
  const result = await signIn("credentials", {
    ...payload,
    role,
    redirect: false,
  });

  if (!result) {
    throw new Error("Unable to sign in. Try again.");
  }

  if (result.error) {
    throw new Error(result.error);
  }

  return { ok: true, url: result.url, role };
};

export const adminSignIn = (payload: SignInValues) => handleSignIn(payload, "admin");

export const publicSignIn = (payload: SignInValues, role?: UserRole) =>
  handleSignIn(payload, role);


