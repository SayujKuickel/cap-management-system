"use client";

import { useState, type ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import AppToaster from "@/components/ui/toaster";

const Providers = ({ children }: { children: ReactNode }) => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <AppToaster />
      </QueryClientProvider>
    </SessionProvider>
  );
};

export default Providers;
