"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UserRole } from "@/lib/auth";
import { siteRoutes } from "@/constants/site-routes";
import { publicSignIn } from "@/service/sign-in";
import { signInSchema, type SignInValues } from "@/validation/sign-in";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

type PortalCredentialsFormProps = {
  idPrefix: string;
  submitLabel: string;
  placeholderEmail: string;
  role: Exclude<UserRole, "admin">;
  children?: ReactNode;
};

const PortalCredentialsForm = ({
  idPrefix,
  submitLabel,
  placeholderEmail,
  role,
  children,
}: PortalCredentialsFormProps) => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
  });

  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);

  const handleFormSubmit = async (values: SignInValues) => {
    try {
      const result = await publicSignIn(values, role);
      toast.success(`Signed in as ${roleLabel}`);
      reset();
      const destination =
        result?.role === "staff"
          ? siteRoutes.dashboard.applicationQueue.root
          : siteRoutes.dashboard.application.root;
      router.push(destination);
    } catch {
      toast.error("Unable to sign in. Try again.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-4"
      noValidate
    >
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-email`}>Email</Label>
        <Input
          id={`${idPrefix}-email`}
          type="email"
          placeholder={placeholderEmail}
          autoComplete="email"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-password`}>Password</Label>
        <Input
          id={`${idPrefix}-password`}
          type="password"
          placeholder="********"
          autoComplete="current-password"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full">
        {submitLabel}
      </Button>

      {children}
    </form>
  );
};

export default PortalCredentialsForm;
