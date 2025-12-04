"use client";
import { useLogout } from "@/components/logout-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import type { UserRole } from "@/lib/auth";
import { siteRoutes } from "@/constants/site-routes";
import {
  FileText,
  Inbox,
  LayoutDashboard,
  LogOut,
  UserRound,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ICONS = {
  dashboard: LayoutDashboard,
  applications: FileText,
  agents: Users,
  queue: Inbox,
};

export type SidebarIconName = keyof typeof ICONS;

type SidebarNavItem = {
  href: string;
  label: string;
  icon: SidebarIconName;
};

type SidebarNavProps = {
  items: SidebarNavItem[];
  user: {
    email: string;
    name: string;
    role: UserRole;
  };
};

const SidebarNav = ({ items, user }: SidebarNavProps) => {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const logout = useLogout(siteRoutes.auth.login);

  console.log(items);

  console.log(user,"hello world")

  const initials =
    user.name?.[0]?.toUpperCase() ?? user.email[0]?.toUpperCase() ?? "?";

  const handleNavigate = () => {
    if (isMobile) setOpenMobile(false);
  };

  // if (!isMobile && !open) return null;

  return (
    <Sidebar collapsible="offcanvas" variant="sidebar">
      <SidebarHeader className="p-3">
        <Link
          href={siteRoutes.dashboard.root}
          onClick={handleNavigate}
          className=" flex items-start justify-start transition-opacity hover:opacity-80"
        >
          <div className="relative w-44 h-full">
            <Image
              src="/images/logo.svg"
              alt="Churchill Institute of Higher Education"
              width={48}
              height={48}
              className="object-contain w-full h-full"
              priority
            />
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isExactMatch =
                  pathname === item.href ||
                  (item.href !== siteRoutes.dashboard.root &&
                    pathname.startsWith(`${item.href}/`));
                const Icon = ICONS[item.icon] ?? LayoutDashboard;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isExactMatch}
                      tooltip={item.label}
                      onClick={handleNavigate}
                    >
                      <Link href={item.href}>
                        <Icon className="text-muted-foreground" />
                        <>{item.label}</>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-1 py-3 hover:bg-secondary rounded-lg">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {initials}
              </span>
              <span className="flex flex-col text-left group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-semibold text-foreground">
                  {user.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {user.email}
                </span>
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            align="start"
            className="w-60 rounded-2xl border bg-card p-2"
          >
            <DropdownMenuItem className="flex items-center gap-2 text-muted-foreground focus:text-foreground">
              <UserRound className="h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center gap-2 text-muted-foreground focus:text-foreground"
              onSelect={(event) => {
                event.preventDefault();
                logout();
              }}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default SidebarNav;
