"use client";

import { useMutation } from "@tanstack/react-query";

import type { UserRole } from "@/lib/auth";
import authService, { type RegisterPayload } from "@/service/auth.service";
import type { ServiceResponse } from "@/types/service";
import type { RegisterValues } from "@/validation/register";

export const DEFAULT_REGISTER_ROLE: UserRole = "agent";
export const DEFAULT_RTO_PROFILE_ID = "00000000-0000-0000-0000-000000000001";

const buildRegisterPayload = (values: RegisterValues): RegisterPayload => ({
  email: values.email,
  password: values.password,
  role: DEFAULT_REGISTER_ROLE,
  rto_profile_id: DEFAULT_RTO_PROFILE_ID,
  given_name: values.givenName,
  family_name: values.familyName,
});

export const useRegisterMutation = () =>
  useMutation<ServiceResponse<unknown>, Error, RegisterValues>({
    mutationKey: ["register"],
    mutationFn: async (values) => {
      const response = await authService.register(buildRegisterPayload(values));
      if (!response.success) {
        throw new Error(response.message);
      }
      return response;
    },
  });
