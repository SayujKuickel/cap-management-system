"use client";

/* eslint-disable react-hooks/incompatible-library */

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DataTableToolbar } from "./data-table-toolbar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ApplicationKanban } from "../dashboard/applications/kanban/application-kanban";
import { Application } from "@/constants/types";

export type DataTableFacetedFilterOption = {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
};

export type DataTableFacetedFilter = {
  columnId: string;
  title: string;
  options: DataTableFacetedFilterOption[];
};

const getValueByPath = (item: unknown, path: string) => {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc == null) return undefined;
    if (Array.isArray(acc)) {
      const index = Number(key);
      if (Number.isNaN(index)) return undefined;
      return acc[index];
    }

    if (typeof acc === "object") {
      return (acc as Record<string, unknown>)[key];
    }

    return undefined;
  }, item);
};

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  facetedFilters?: DataTableFacetedFilter[];
  defaultColumnVisibility?: VisibilityState;
  emptyState?: {
    title: string;
    description?: string;
  };
  searchableColumns?: Array<keyof TData | string>;
  searchPlaceholder?: string;
  toolbarActions?: React.ReactNode;
  enableLocalPagination?: boolean;

  isallowMovingInKanban?: boolean;
  view: "table" | "kanban";
}

export function DataTable<TData, TValue>({
  columns,
  data,
  facetedFilters,
  defaultColumnVisibility,
  emptyState,
  searchableColumns,
  searchPlaceholder,
  toolbarActions,

  enableLocalPagination = true,
  isallowMovingInKanban = false,
  view = "table",
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(defaultColumnVisibility ?? {});
  const [rowSelection, setRowSelection] = React.useState({});
  const [searchValue, setSearchValue] = React.useState("");

  const normalizedSearchColumns = React.useMemo(
    () => searchableColumns?.map(String) ?? [],
    [searchableColumns]
  );

  const searchFilteredData = React.useMemo(() => {
    if (!searchValue.trim() || normalizedSearchColumns.length === 0) {
      return data;
    }

    const query = searchValue.toLowerCase();
    return data.filter((item) =>
      normalizedSearchColumns.some((columnKey) => {
        const rawValue = getValueByPath(item, columnKey);
        if (rawValue == null) return false;
        return String(rawValue).toLowerCase().includes(query);
      })
    );
  }, [data, normalizedSearchColumns, searchValue]);

  const table = useReactTable({
    data: searchFilteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    onRowSelectionChange: setRowSelection,
    getPaginationRowModel: enableLocalPagination
      ? getPaginationRowModel()
      : undefined,
    defaultColumn: {
      size: 100,
      minSize: 50,
      maxSize: 200,
    },
  });

  const totalRows = searchFilteredData.length;
  const selectedRows = table.getFilteredSelectedRowModel().rows.length;
  const hasSearch = normalizedSearchColumns.length > 0;

  const session = useSession();

  const isAgent = session.data?.user?.role === "agent";
  const router = useRouter();

  return (
    <div className="space-y-4">
      <DataTableToolbar
        table={table}
        columnVisibility={columnVisibility}
        facetedFilters={facetedFilters}
        searchValue={hasSearch ? searchValue : undefined}
        onSearch={hasSearch ? setSearchValue : undefined}
        placeholder={searchPlaceholder}
        actions={toolbarActions}
      />

      {view === "table" ? (
        <div className="rounded-md border w-full small-sidebar-width ">
          <Table className="table-fixed small-sidebar-width">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const size = header.column.getSize();
                    return (
                      <TableHead
                        key={header.id}
                        style={{
                          width: `${size}px`,
                          minWidth: `${size}px`,
                          maxWidth: `${size}px`,
                        }}
                        className="whitespace-nowrap"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() => {
                      const data = row.original as Record<string, unknown>;

                      if (isAgent) {
                        router.push(
                          `/dashboard/application/${data.referenceNumber}`
                        );
                      } else {
                        router.push(
                          `/dashboard/application-queue/${data.referenceNumber}`
                        );
                      }
                    }}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    {row.getVisibleCells().map((cell) => {
                      const size = cell.column.getSize();
                      return (
                        <TableCell
                          key={cell.id}
                          style={{
                            width: `${size}px`,
                            minWidth: `${size}px`,
                            maxWidth: `${size}px`,
                          }}
                          className="overflow-hidden"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-sm text-muted-foreground"
                  >
                    <div className="space-y-1">
                      <p>{emptyState?.title ?? "No results found"}</p>
                      {emptyState?.description ? (
                        <p className="text-xs">{emptyState.description}</p>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="rounded-md border w-full small-sidebar-width ">
          <ApplicationKanban data={data as Application[]} isallowMovingInKanban={isallowMovingInKanban} />
        </div>
      )}

      <div className="flex flex-col gap-2 px-1 py-1 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <div>
          {selectedRows > 0 ? (
            <span>{selectedRows} row(s) selected</span>
          ) : (
            <span>
              Showing {table.getRowModel().rows.length} of {totalRows} record
              {totalRows === 1 ? "" : "s"}
            </span>
          )}
        </div>
        {enableLocalPagination ? (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
