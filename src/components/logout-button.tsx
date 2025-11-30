"use client";

import { useCallback, type MouseEventHandler } from "react";
import { signOut } from "next-auth/react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { siteRoutes } from "@/constants/site-routes";
import type React from "react";

type ButtonProps = React.ComponentProps<typeof Button>;

export const useLogout = (redirectPath: string = siteRoutes.auth.login) => {
  return useCallback(() => {
    toast.success("Signed out");
    void signOut({ callbackUrl: redirectPath });
  }, [redirectPath]);
};

type LogoutButtonProps = ButtonProps & {
  redirectPath?: string;
};

const LogoutButton = ({
  redirectPath,
  className,
  variant = "outline",
  size = "sm",
  children = "Logout",
  onClick,
  ...buttonProps
}: LogoutButtonProps) => {
  const logout = useLogout(redirectPath);

  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    logout();
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={className}
      {...buttonProps}
    >
      {children}
    </Button>
  );
};

export default LogoutButton;
