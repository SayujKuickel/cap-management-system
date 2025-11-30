import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import SidebarNav, {
  type SidebarIconName,
} from "@/components/dashboard/sidebar-nav";
import AppToolbar from "@/components/dashboard/app-toolbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { UserRole } from "@/lib/auth";
import { authOptions } from "@/lib/auth-options";
import { siteRoutes } from "@/constants/site-routes";

type NavItem = { label: string; href: string; icon: SidebarIconName };

const NAV_LINKS: Record<UserRole, Array<NavItem>> = {
  admin: [{ label: "Dashboard", href: siteRoutes.dashboard.root, icon: "dashboard" }],
  student: [{ label: "Dashboard", href: siteRoutes.dashboard.root, icon: "dashboard" }],
  agent: [
    { label: "Dashboard", href: siteRoutes.dashboard.root, icon: "dashboard" },
    {
      label: "Applications",
      href: siteRoutes.dashboard.application.root,
      icon: "applications",
    },
  ],
  staff: [
    { label: "Dashboard", href: siteRoutes.dashboard.root, icon: "dashboard" },
    { label: "Agents", href: siteRoutes.dashboard.agents.root, icon: "agents" },
    {
      label: "Application Queue",
      href: siteRoutes.dashboard.applicationQueue.root,
      icon: "queue",
    },
  ],
};

const getDisplayName = (email: string) => email.split("@")[0] ?? email;

const DashboardLayout = async ({ children }: { children: ReactNode }) => {
  const session = await getServerSession(authOptions);
  const role = (session?.user?.role as UserRole | undefined) ?? "admin";

  if (!session?.user?.email || !role) redirect(siteRoutes.auth.login);
  if (role === "student") redirect(siteRoutes.auth.login);

  const navItems = NAV_LINKS[role] ?? NAV_LINKS.admin;

  return (
    <SidebarProvider>
      {/* Do not add a parent here. will break the ui */}
      <SidebarNav
        items={navItems}
        user={{
          email: session.user.email ?? "",
          name: getDisplayName(session.user.email ?? ""),
          role,
        }}
      />

      <SidebarInset className="bg-background">
        <AppToolbar />
        <div className="flex-1 p-3 md:p-6">
          <div className="max-w-380 mx-auto">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardLayout;
