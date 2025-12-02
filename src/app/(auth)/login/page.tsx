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
import Image from "next/image";

const LoginPage = () => {
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

          <p className="text-sm text-muted-foreground">
            Application Management System
          </p>
        </div>

        <PortalLoginCard />

        <Card className="text-center p-2">
          <CardHeader className="p-0">
            <CardTitle className="text-base font-semibold text-foreground">
              Track your application as a student?
            </CardTitle>
           
          </CardHeader>
          <CardContent className="p-0">
            <Button asChild variant="link" className="text-primary">
              <Link href={siteRoutes.track}>
                Go to Application Tracking -&gt;
              </Link>
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Churchill Institute of Higher
          Education. All rights reserved.
        </p>
      </div>
    </main>
  );
};

export default LoginPage;
