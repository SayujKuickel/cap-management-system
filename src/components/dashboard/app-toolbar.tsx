"use client";

import { AlertCircle, Bell, CheckCircle2, Info } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ThemeToggle } from "../shared/toggle-theme";

const formatSegment = (segment: string) =>
  segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

type NotificationType = "info" | "success" | "warning" | "error";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "success",
    title: "Application Approved",
    message: "Application #12345 has been approved and is ready for processing.",
    timestamp: "2 minutes ago",
    read: false,
  },
  {
    id: "2",
    type: "info",
    title: "New Application Submitted",
    message: "A new application has been submitted and requires your review.",
    timestamp: "1 hour ago",
    read: false,
  },
  {
    id: "3",
    type: "warning",
    title: "Document Missing",
    message: "Application #12340 is missing required documents. Please follow up.",
    timestamp: "3 hours ago",
    read: true,
  },
  {
    id: "4",
    type: "error",
    title: "Payment Failed",
    message: "Payment processing failed for Application #12338. Action required.",
    timestamp: "1 day ago",
    read: true,
  },
];

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case "success":
      return CheckCircle2;
    case "warning":
      return AlertCircle;
    case "error":
      return AlertCircle;
    default:
      return Info;
  }
};

const getNotificationColor = (type: NotificationType) => {
  switch (type) {
    case "success":
      return "text-green-600 dark:text-green-400";
    case "warning":
      return "text-yellow-600 dark:text-yellow-400";
    case "error":
      return "text-red-600 dark:text-red-400";
    default:
      return "text-blue-600 dark:text-blue-400";
  }
};

const AppToolbar = () => {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  
  const unreadCount = notifications.filter((n) => !n.read).length;
  
  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };
  
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

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

      <div>
        <ThemeToggle />

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="text-muted-foreground relative">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96 p-0" align="end">
            <div className="flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm">Notifications</h3>
                  {unreadCount > 0 && (
                    <Badge variant="default" className="h-5 px-1.5 text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </div>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground hover:text-foreground"
                    onClick={markAllAsRead}
                  >
                    Mark all as read
                  </Button>
                )}
              </div>

              {/* Notifications List */}
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 px-4">
                    <Bell className="h-8 w-8 text-muted-foreground/50 mb-2" />
                    <p className="text-sm text-muted-foreground">No notifications</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {notifications.map((notification, index) => {
                      const Icon = getNotificationIcon(notification.type);
                      const iconColor = getNotificationColor(notification.type);
                      
                      return (
                        <div
                          key={notification.id}
                          className={cn(
                            "px-4 py-3 hover:bg-accent transition-colors cursor-pointer group",
                            !notification.read && "bg-accent/50"
                          )}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex gap-3">
                            <div className={cn("shrink-0 mt-0.5", iconColor)}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className={cn(
                                  "text-sm font-medium",
                                  !notification.read && "font-semibold"
                                )}>
                                  {notification.title}
                                </p>
                                {!notification.read && (
                                  <div className="shrink-0 h-2 w-2 rounded-full bg-primary mt-1.5" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1.5">
                                {notification.timestamp}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="border-t px-4 py-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs text-muted-foreground hover:text-foreground"
                  >
                    View all notifications
                  </Button>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default AppToolbar;
