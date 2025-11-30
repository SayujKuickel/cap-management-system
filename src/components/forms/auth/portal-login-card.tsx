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
    <Card>
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>
          Choose your portal and sign in to continue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as PortalTab)}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 gap-2">
            <TabsTrigger className="w-full" value="agent">
              Agent Portal
            </TabsTrigger>
            <TabsTrigger className="w-full" value="staff">
              Staff Portal
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
