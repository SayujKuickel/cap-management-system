"use client";
import type { ReactNode } from "react";

import AppToolbar from "@/components/dashboard/app-toolbar";
import SidebarNav from "@/components/dashboard/sidebar-nav";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import NAV_LINKS from "@/data/navlink.data";
import type { UserRole } from "@/lib/auth";
import { useSession } from "next-auth/react";

const getDisplayName = (email: string) => email.split("@")[0] ?? email;

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const { data: session } = useSession();

  // Safely extract the role with type guard and default fallback
  const userRole = session?.user?.role as UserRole;
  const userEmail = session?.user?.email ?? "";

  // Use the role to get the appropriate nav items
  const navItems = NAV_LINKS[userRole] ?? NAV_LINKS.agent;

  return (
    <SidebarProvider suppressHydrationWarning>
      {/* Do not add a parent here. will break the ui */}
      <SidebarNav
        items={navItems}
        user={{
          email: userEmail,
          name: getDisplayName(userEmail),
          role: userRole,
        }}
      />

      <SidebarInset className="bg-background" style={{ overflow: 'visible' }}>
        <AppToolbar />
        <div className="flex-1 p-3 md:p-6" style={{ overflow: 'visible' }}>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardLayout;
