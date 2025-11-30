import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PortalLoginCard from "@/components/forms/auth/portal-login-card";
import { siteRoutes } from "@/constants/site-routes";

const LoginPage = () => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-lg bg-primary text-3xl font-semibold text-primary-foreground">
            C
          </div>
          <h1 className="text-2xl font-semibold text-foreground">
            Churchill University
          </h1>
          <p className="text-sm text-muted-foreground">
            Application Management System
          </p>
        </div>

        <PortalLoginCard />

        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground">
              Track your application as a student?
            </CardTitle>
            <CardDescription>
              Follow your application status inside the tracking portal.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="link" className="text-primary">
              <Link href={siteRoutes.track}>
                Go to Application Tracking -&gt;
              </Link>
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Churchill University. All rights
          reserved.
        </p>
      </div>
    </main>
  );
};

export default LoginPage;
