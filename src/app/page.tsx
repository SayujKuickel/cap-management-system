"use client";

import Link from "next/link";

import { useLogout } from "@/components/logout-button";
import { Button } from "@/components/ui/button";
import { siteRoutes } from "@/constants/site-routes";

const Page = () => {
  const logout = useLogout();

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/20 px-4 py-10">
      <div className="w-full max-w-3xl">
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-primary/10">
          <div className="grid gap-8 p-8 md:grid-cols-2 md:p-10">
            <div className="space-y-3">
              <p className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-xl font-semibold text-primary-foreground shadow-md">
                C
              </p>
              <h1 className="text-3xl font-semibold text-foreground">
                Churchill University Portal
              </h1>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Access the student, agent, staff, or admin experiences. Sign in
                to continue or sign out if you are already authenticated.
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded-full bg-primary/10 px-2 py-1 text-primary">
                  Secure access
                </span>
                <span className="rounded-full bg-secondary/30 px-2 py-1">
                  Next.js 16
                </span>
                <span className="rounded-full bg-muted px-2 py-1">
                  React Query
                </span>
              </div>
            </div>

            <div className="space-y-4 rounded-xl border border-border bg-background/60 p-6 shadow-inner">
              <div className="space-y-2 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                  Quick actions
                </p>
                <h2 className="text-2xl font-semibold text-foreground">
                  Choose your path
                </h2>
              </div>
              <div className="flex flex-col gap-3">
                <Button asChild size="lg" className="w-full">
                  <Link href={siteRoutes.auth.login}>Go to Sign In</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-dashed"
                  onClick={() => logout()}
                >
                  Logout
                </Button>
              </div>
              <p className="text-center text-xs text-muted-foreground">
                Need an account? Register through the student onboarding flow or
                contact admin for role updates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Page;
