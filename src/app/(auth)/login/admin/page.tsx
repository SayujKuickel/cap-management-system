import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SignInForm from "@/components/forms/auth/sign-in-form";
import { siteRoutes } from "@/constants/site-routes";

const AdminLoginPage = () => {
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
          <p className="text-sm text-muted-foreground">Administrator Access</p>
        </div>

        <SignInForm
          variant="admin"
          title="Admin Login"
          description="Manage the Churchill portal with your admin credentials."
          placeholderEmail="admin@churchill.com"
        />

        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground">
              Looking for the portal login?
            </CardTitle>
            <CardDescription>
              Switch to the agent or staff experience instead.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="link" className="text-primary">
              <Link href={siteRoutes.auth.login}>Go to Agent &amp; Staff Sign-In -&gt;</Link>
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

export default AdminLoginPage;
