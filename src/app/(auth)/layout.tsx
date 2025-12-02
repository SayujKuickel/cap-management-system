import Image from "next/image";
import React from "react";
const layout = async ({ children }: { children: React.ReactNode }) => {
 
  return (
    <div className=" min-h-screen overflow-hidden grid md:grid-cols-10">
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
        <div className="w-full py-2 px-4 ">
          {children}
        </div>
      </div>
    </div>
  );
};

export default layout;
