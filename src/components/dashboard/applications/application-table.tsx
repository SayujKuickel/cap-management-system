"use client";
import {
  DataTable,
  type DataTableFacetedFilter,
} from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import type { Application } from "@/constants/types";
import Link from "next/link";
import * as React from "react";
import {
  applicationColumns,
  applicationStatusFilterOptions,
} from "./application-table-columns";
import { siteRoutes } from "@/constants/site-routes";

interface ApplicationTableProps {
  data?: Application[];
  isLoading?: boolean;
  isFetching?: boolean;
}

export const ApplicationTable = ({
  data = [],
  isLoading = false,
  isFetching = false,
}: ApplicationTableProps) => {
  const filters = React.useMemo<DataTableFacetedFilter[]>(
    () => [
      {
        columnId: "status",
        title: "Status",
        options: applicationStatusFilterOptions,
      },
    ],
    []
  );

  if (isLoading) {
    return (
      <div className="rounded-md border p-6 text-sm text-muted-foreground">
        Loading applications...
      </div>
    );
  }

  return (
    <DataTable
      columns={applicationColumns}
      data={data}
      facetedFilters={filters}
      searchableColumns={[
        "referenceNumber",
        "studentName",
        "course",
        "destination",
      ]}
      searchPlaceholder="Search by student, course, destination, or reference..."
      emptyState={{
        title: "No applications found",
        description: "Try a different search term or filter combination.",
      }}
      toolbarActions={
        <div className="flex items-center gap-3">
          {isFetching ? (
            <span className="text-xs text-muted-foreground">Refreshing...</span>
          ) : null}
          <Button asChild size="sm">
            <Link href={siteRoutes.dashboard.application.new}>
              New Application
            </Link>
          </Button>
        </div>
      }
      enableLocalPagination={false}
    />
  );
};
