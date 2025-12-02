import { siteRoutes } from "@/constants/site-routes";
import type { UserRole } from "@/lib/auth";
import type { SidebarIconName } from "@/components/dashboard/sidebar-nav";

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


export default NAV_LINKS;   