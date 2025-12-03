"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Column } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  const sortDirection = column.getIsSorted();

  return (
    <div className={cn("flex items-center  gap-1", className)}>
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 data-[state=open]:bg-accent  "
        onClick={() => column.toggleSorting(sortDirection === "asc")}
      >
        <span>{title}</span>
        {sortDirection === "asc" ? (
          <ArrowUp className="ml-2 h-3.5 w-3.5" />
        ) : sortDirection === "desc" ? (
          <ArrowDown className="ml-2 h-3.5 w-3.5" />
        ) : (
          <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
        )}
      </Button>
    </div>
  );
}
