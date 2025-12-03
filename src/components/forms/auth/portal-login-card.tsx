"use client";

import { useState } from "react";

import AgentSignInForm from "./agent-sign-in-form";
import StaffSignInForm from "./staff-sign-in-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type PortalTab = "agent" | "staff";

const PortalLoginCard = () => {
  const [activeTab, setActiveTab] = useState<PortalTab>("agent");

  return (
    <Card className="p-0">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>
          Choose your portal and sign in to continue
        </CardDescription>
      </CardHeader>
      <CardContent className="">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as PortalTab)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 gap-1 p-1 min-h-12 bg-muted/50">
            <TabsTrigger 
              className="h-auto min-h-full py-2 px-2 text-xs sm:text-sm leading-tight data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:font-semibold font-medium transition-all hover:bg-background/50 whitespace-normal text-center" 
              value="agent"
            >
              Login as  Education Partner
            </TabsTrigger>
            <TabsTrigger 
              className="h-auto min-h-full py-2 px-2 text-xs sm:text-sm leading-tight data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:font-semibold font-medium transition-all hover:bg-background/50 whitespace-normal text-center" 
              value="staff"
            >
              Login as  Staff Member
            </TabsTrigger>
          </TabsList>
          <TabsContent value="agent" className="mt-6">
            <AgentSignInForm />
          </TabsContent>
          <TabsContent value="staff" className="mt-6">
            <StaffSignInForm />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PortalLoginCard;
