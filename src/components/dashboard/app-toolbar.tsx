"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const formatSegment = (segment: string) =>
  segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const AppToolbar = () => {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const breadcrumbs = segments.reduce<Array<{ label: string; href: string }>>(
    (acc, segment, index) => {
      const href = "/" + segments.slice(0, index + 1).join("/");
      acc.push({
        label: index === 0 ? "Dashboard" : formatSegment(segment),
        href,
      });
      return acc;
    },
    []
  );

  return (
    <div className="flex h-14 items-center justify-between border-b border-border bg-card px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <SidebarTrigger />

        <nav className="text-sm text-muted-foreground">
          <ol className="flex items-center gap-2">
            {breadcrumbs.map((crumb, index) => {
              const isActive = index === breadcrumbs.length - 1;
              return (
                <li key={crumb.href} className="flex items-center gap-2">
                  <Link
                    href={crumb.href}
                    className={cn(
                      "transition-colors",
                      isActive
                        ? "font-semibold text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {crumb.label}
                  </Link>
                  {index < breadcrumbs.length - 1 && (
                    <span className="text-border">/</span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      <Button variant="ghost" size="icon" className="text-muted-foreground">
        <Bell className="h-4 w-4" />
        <span className="sr-only">Notifications</span>
      </Button>
    </div>
  );
};

export default AppToolbar;
