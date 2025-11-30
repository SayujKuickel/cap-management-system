"use client";

import * as React from "react";
import { Table, type VisibilityState } from "@tanstack/react-table";
import { Check, Settings2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ColumnMeta = {
  columnTitle?: string;
};

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
  columnVisibility: VisibilityState;
}

const formatColumnLabel = (id: string) =>
  id
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export function DataTableViewOptions<TData>({
  table,
  columnVisibility,
}: DataTableViewOptionsProps<TData>) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const panelRef = React.useRef<HTMLDivElement | null>(null);

  const columns = table
    .getAllLeafColumns()
    .filter((column) => column.getCanHide());

  React.useEffect(() => {
    if (!open) return;

    const handlePointer = (event: MouseEvent | TouchEvent) => {
      if (
        !panelRef.current ||
        panelRef.current.contains(event.target as Node) ||
        triggerRef.current?.contains(event.target as Node)
      ) {
        return;
      }
      setOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("touchstart", handlePointer);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("touchstart", handlePointer);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (!columns.length) return null;

  const handleToggleColumn = (columnId: string) => {
    const column = table.getColumn(columnId);
    if (!column) return;
    column.toggleVisibility(!column.getIsVisible());
  };

  return (
    <div className="relative">
      <Button
        ref={triggerRef}
        type="button"
        variant="outline"
        size="sm"
        className="gap-2 text-xs font-medium"
        onClick={() => setOpen((prev) => !prev)}
      >
        <Settings2 className="h-4 w-4" />
        View
      </Button>

      {open ? (
        <div
          ref={panelRef}
          className="absolute right-0 z-50 mt-2 w-64 rounded-md border bg-popover text-popover-foreground shadow-md"
        >
          <div className="flex items-center justify-between border-b px-3 py-2">
            <div className="text-xs font-semibold text-muted-foreground">
              Columns
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <button
                type="button"
                className="transition hover:text-foreground"
                onClick={() => table.resetColumnVisibility()}
              >
                Reset
              </button>
              <span className="text-muted-foreground">/</span>
              <button
                type="button"
                className="transition hover:text-foreground"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto py-1 text-sm">
            {columns.map((column) => {
              const metaTitle = (column.columnDef.meta as ColumnMeta | undefined)
                ?.columnTitle;
              const label = metaTitle ?? formatColumnLabel(column.id);
              const isVisible =
                columnVisibility[column.id as keyof VisibilityState] ??
                column.getIsVisible();

              return (
                <button
                  type="button"
                  key={column.id}
                  className={cn(
                    "flex w-full items-center justify-between px-3 py-2 text-left transition hover:bg-muted/60",
                    !isVisible && "text-muted-foreground",
                  )}
                  onClick={() => handleToggleColumn(column.id)}
                >
                  <span className="text-sm font-medium">
                    {label}
                  </span>
                  <span
                    className={cn(
                      "flex size-4 items-center justify-center rounded-sm border border-input text-muted-foreground",
                      isVisible && "border-primary text-primary",
                    )}
                  >
                    {isVisible ? <Check className="h-3 w-3" /> : <X className="h-3 w-3 opacity-40" />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
