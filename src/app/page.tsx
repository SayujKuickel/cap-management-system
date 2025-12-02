"use client";
import { Button } from "@/components/ui/button";
import { siteRoutes } from "@/constants/site-routes";
import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
const Index = () => {
  const session = useSession();

  console.log(session, "klahsldjflkas");
  return (
    <div className="w-screen h-screen overflow-hidden grid md:grid-cols-10">
      {/* Left side - Hero Image */}
      <div className="hidden md:block md:col-span-5 lg:col-span-7 border-r border-border/20 relative">
        <Image
          alt="Students studying together"
          loading="lazy"
          width={1000}
          height={1000}
          className="w-full h-full object-cover"
          src={"/images/hero-image.webp"}
        />
        <div className="absolute top-0 left-0 w-full h-full bg-primary/15" />
      </div>

      <div className="md:col-span-5 lg:col-span-3 grid  place-items-center w-full">
        <div className="w-full p-8 ">
          <div className="flex flex-col items-center justify-center">
            <Image
              src="/images/logo.svg"
              alt="Churchill Institute of Higher Education"
              width={192}
              height={192}
              className="text-center mx-auto w-48 mb-8"
            />
          </div>

          <div className="flex flex-col gap-3  mx-auto">
            <Button asChild size="lg" className="w-full">
              <Link href={siteRoutes.auth.login}>Go to Sign In</Link>
            </Button>

            {!session.data?.user && (
              <Button
                size="lg"
                variant="outline"
                className="w-full border-dashed"
                onClick={() => signOut()}
              >
                Logout
              </Button>
            )}

            <Button
              size="lg"
              variant="outline"
              className="w-full border-dashed"
            >
              <Link href={siteRoutes.track}>Track your application</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
