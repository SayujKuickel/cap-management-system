"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_REGISTER_ROLE,
  DEFAULT_RTO_PROFILE_ID,
  useRegisterMutation,
} from "@/hooks/useRegister.hook";
import { registerSchema, type RegisterValues } from "@/validation/register";
import { siteRoutes } from "@/constants/site-routes";

const RegisterForm = () => {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const registerMutation = useRegisterMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
    defaultValues: {
      givenName: "",
      familyName: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: RegisterValues) => {
    setFormError(null);
    try {
      const response = await registerMutation.mutateAsync(values);

      toast.success(
        response.message || "Registration successful. You can now sign in."
      );
      reset();
      router.push(siteRoutes.auth.login);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to register. Try again.";
      setFormError(message);
      toast.error(message);
    }
  };

  return (
    <Card className="border border-border">
      <CardHeader className="space-y-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          Join the portal
        </p>
        <CardTitle className="text-3xl">Create your account</CardTitle>
        <CardDescription className="text-base">
          Student access is provisioned automatically. Use your details to get
          started.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
          noValidate
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="givenName">First name</Label>
              <Input
                id="givenName"
                autoComplete="given-name"
                placeholder="Jane"
                {...register("givenName")}
              />
              {errors.givenName && (
                <p className="text-sm text-destructive">
                  {errors.givenName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="familyName">Last name</Label>
              <Input
                id="familyName"
                autoComplete="family-name"
                placeholder="Doe"
                {...register("familyName")}
              />
              {errors.familyName && (
                <p className="text-sm text-destructive">
                  {errors.familyName.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="student@example.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="Create a password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
            <p>
              Role is set to{" "}
              <span className="font-semibold">{DEFAULT_REGISTER_ROLE}</span> by
              default and linked to RTO profile{" "}
              <span className="font-mono text-foreground">
                {DEFAULT_RTO_PROFILE_ID}
              </span>
              .
            </p>
          </div>

          {formError && <p className="text-sm text-destructive">{formError}</p>}

          <Button
            type="submit"
            className="w-full"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending
              ? "Creating account..."
              : "Create account"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already registered?{" "}
            <Link
              href={siteRoutes.auth.login}
              className="text-primary underline-offset-4 hover:underline"
            >
              Sign in instead
            </Link>
            .
          </p>
        </form>
      </CardContent>
    </Card>
  );
};

export default RegisterForm;
