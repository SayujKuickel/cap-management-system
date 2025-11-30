"use client";

import * as React from "react";
import { Filter, X } from "lucide-react";
import { Table, type VisibilityState } from "@tanstack/react-table";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableViewOptions } from "./data-table-view-options";
import type { DataTableFacetedFilter } from "./data-table";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  columnVisibility: VisibilityState;
  facetedFilters?: DataTableFacetedFilter[];
  placeholder?: string;
  searchValue?: string;
  onSearch?: (value: string) => void;
  actions?: React.ReactNode;
}

export function DataTableToolbar<TData>({
  table,
  columnVisibility,
  facetedFilters,
  placeholder,
  searchValue,
  onSearch,
  actions,
}: DataTableToolbarProps<TData>) {
  const isFiltered =
    table.getState().columnFilters.length > 0 || !!searchValue?.length;

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {typeof searchValue === "string" && onSearch ? (
          <Input
            placeholder={placeholder ?? "Search records..."}
            value={searchValue}
            onChange={(event) => onSearch(event.target.value)}
            className="h-9 w-full md:max-w-xs"
          />
        ) : null}

        {facetedFilters?.map((filter) => {
          const column = table.getColumn(filter.columnId);
          if (!column) return null;

          const selectedValues = new Set(
            (column.getFilterValue() as string[]) ?? [],
          );

          return (
            <DropdownMenu key={filter.columnId}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 text-xs font-medium"
                >
                  <Filter className="h-3.5 w-3.5" />
                  {filter.title}
                  {selectedValues.size > 0 ? (
                    <span className="ml-1 rounded-sm bg-primary/10 px-1 text-[10px] font-semibold text-primary">
                      {selectedValues.size}
                    </span>
                  ) : null}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52">
                {filter.options.map((option) => (
                  <DropdownMenuCheckboxItem
                    key={option.value}
                    className="capitalize"
                    checked={selectedValues.has(option.value)}
                    onCheckedChange={(checked) => {
                      const next = new Set(selectedValues);
                      if (checked) {
                        next.add(option.value);
                      } else {
                        next.delete(option.value);
                      }
                      column.setFilterValue(
                        Array.from(next.values()).length ? Array.from(next) : undefined,
                      );
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {option.icon ? (
                        <option.icon className="h-3.5 w-3.5 text-muted-foreground" />
                      ) : null}
                      {option.label}
                    </div>
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        })}

        {isFiltered ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              table.resetColumnFilters();
              onSearch?.("");
            }}
            className="gap-1 text-xs"
          >
            Reset
            <X className="h-3 w-3" />
          </Button>
        ) : null}
      </div>

      <div className="flex items-center justify-end gap-2">
        {actions}
        <DataTableViewOptions
          table={table}
          columnVisibility={columnVisibility}
        />
      </div>
    </div>
  );
}
