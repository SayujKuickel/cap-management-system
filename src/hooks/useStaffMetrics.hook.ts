"use client";

import { useQuery } from "@tanstack/react-query";
import staffMetricsService, {
  type StaffMetrics,
} from "@/service/staf-metrics.service";
import type { ServiceResponse } from "@/types/service";

type UseStaffMetricsOptions = {
  enabled?: boolean;
  refetchInterval?: number;
};

export const useStaffMetrics = (
  options: UseStaffMetricsOptions = {}
) => {
  const { enabled = true, refetchInterval } = options;

  return useQuery<ServiceResponse<StaffMetrics>, Error>({
    queryKey: ["staff-metrics"],
    queryFn: async () => {
      return await staffMetricsService.getStaffMetrics();
    },
    enabled,
    refetchInterval,
    staleTime: 30000, // 30 seconds
  });
};

export const useAllStaffMetrics = (
  options: UseStaffMetricsOptions = {}
) => {
  const { enabled = true, refetchInterval } = options;

  return useQuery<ServiceResponse<StaffMetrics>, Error>({
    queryKey: ["staff-metrics-all"],
    queryFn: async () => {
      return await staffMetricsService.getAllStaffMetrics();
    },
    enabled,
    refetchInterval,
    staleTime: 30000, // 30 seconds
  });
};

