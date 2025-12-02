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
import Image from "next/image";

const AdminLoginPage = () => {
  return (
    <main className="flex min-h-screen items-center justify-center  ">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
        <div className="relative    w-52 mx-auto flex items-center justify-center">
              <Image
                src="/images/logo.svg"
                alt="Churchill Institute of Higher Education"
                width={48}
                height={48}
                className="object-contain w-full h-full"
                priority
              />
            </div>
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
          &copy; {new Date().getFullYear()} Churchill Institute of Higher Education. All rights
          reserved.
        </p>
      </div>
    </main>
  );
};

export default AdminLoginPage;
