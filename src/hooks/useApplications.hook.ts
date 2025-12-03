"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

import {
  ApplicationStage,
  ApplicationStatus,
  type Application,
} from "@/constants/types";
import applicationService, {
  type ApplicationListParams,
} from "@/service/application.service";
import { usePaginationStoreByKey } from "@/store/usePagination.store";

type ApplicationsResult = {
  applications: Application[];
  total?: number;
};

type UseApplicationsOptions = {
  filters?: ApplicationListParams;
  storeKey?: string;
};

const normalizeApplicationList = (raw: unknown): ApplicationsResult => {
  const applications: Application[] = [];

  const pushMapped = (item: Record<string, unknown>, index: number) => {
    const rawStatus = (item.status as string) || (item.current_stage as string);
    const normalizedStatus =
      rawStatus?.toLowerCase() === "draft"
        ? ApplicationStatus.DRAFT
        : (rawStatus as ApplicationStatus) ?? ApplicationStatus.DRAFT;

    const mapped: Application = {
      id: String(item.id ?? index),
      referenceNumber:
        (item.reference_number as string) ??
        String(item.id ?? `APP-${index + 1}`),
      agentId: (item.agent_id as string) ?? "",
      agentName: (item.agent_name as string) ?? "",
      studentName: (item.student_name as string) ?? "Unknown student",
      studentEmail: (item.student_email as string) ?? "",
      studentPhone: (item.student_phone as string) ?? "",
      status: normalizedStatus,
      currentStage:
        (item.current_stage as ApplicationStage) ??
        ApplicationStage.INITIAL_REVIEW,
      assignedStaffId: item.assigned_staff_id as string | undefined,
      assignedStaffName: item.assigned_staff_name as string | undefined,
      destination: (item.destination as string) ?? "—",
      course: (item.course_name as string) ?? (item.course as string) ?? "—",
      intake: (item.intake as string) ?? "—",
      submittedAt: (item.submitted_at as string) ?? "",
      updatedAt:
        (item.updated_at as string) ?? (item.created_at as string) ?? "",
    };

    applications.push(mapped);
  };

  if (Array.isArray(raw)) {
    raw.forEach((item, idx) => {
      if (item && typeof item === "object")
        pushMapped(item as Record<string, unknown>, idx);
    });
  } else if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    if ("id" in obj) {
      pushMapped(obj, 0);
    } else {
      Object.values(obj).forEach((val, idx) => {
        if (val && typeof val === "object") {
          pushMapped(val as Record<string, unknown>, idx);
        }
      });
    }
  }

  return {
    applications,
    total: 0,
  };
};

const resolveFallbackTotal = (
  count: number,
  page: number,
  perPage: number
): number => {
  if (perPage <= 0) return count;
  if (count === 0) return (page - 1) * perPage;
  if (count < perPage) return (page - 1) * perPage + count;
  return (page + 1) * perPage;
};

export const useApplications = ({
  filters = {},
  storeKey = "applications",
}: UseApplicationsOptions = {}) => {
  const paginationStore = usePaginationStoreByKey(storeKey);
  const page = paginationStore((state) => state.page);
  const perPage = paginationStore((state) => state.perPage);
  const maxPage = paginationStore((state) => state.maxPage);
  const query = paginationStore((state) => state.query);
  const setPage = paginationStore((state) => state.setPage);
  const setMaxPage = paginationStore((state) => state.setMaxPage);
  const setQuery = paginationStore((state) => state.setQuery);
  const nextPage = paginationStore((state) => state.nextPage);
  const prevPage = paginationStore((state) => state.prevPage);

  const applicationsQuery = useQuery({
    queryKey: ["applications", { ...filters, search: query, page, perPage }],
    queryFn: async () => {
      const response = await applicationService.listApplications({
        ...filters,
        search: query || undefined,
        limit: 5,
        offset: (page - 1) * perPage,
      });

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch applications");
      }

      return normalizeApplicationList(response.data);
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2,
  });

  const resolvedTotal = (() => {
    const dataTotal = applicationsQuery.data?.total;
    if (typeof dataTotal === "number") return dataTotal;
    return resolveFallbackTotal(
      applicationsQuery.data?.applications.length ?? 0,
      page,
      perPage
    );
  })();

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(resolvedTotal / perPage || 1));
    setMaxPage(totalPages);
    if (page > totalPages) setPage(totalPages);
  }, [page, perPage, resolvedTotal, setMaxPage, setPage]);

  const handleSearch = (value: string) => {
    setPage(1);
    setQuery(value);
  };

  return {
    applications: applicationsQuery.data?.applications ?? [],
    total: resolvedTotal,
    isLoading: applicationsQuery.isLoading,
    isFetching: applicationsQuery.isFetching,
    error: applicationsQuery.error,
    page,
    perPage,
    maxPage,
    nextPage,
    prevPage,
    setPage,
    setQuery: handleSearch,
    refetch: applicationsQuery.refetch,
  };
};

export default useApplications;
