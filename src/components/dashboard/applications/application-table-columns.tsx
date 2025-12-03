"use client";

import { ColumnDef } from "@tanstack/react-table";

import type { DataTableFacetedFilterOption } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import {
  Application,
  ApplicationStage,
  ApplicationStatus,
} from "@/constants/types";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; className: string }
> = {
  [ApplicationStatus.DRAFT]: {
    label: "Draft",
    className:
      "bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-100",
  },
  [ApplicationStatus.SUBMITTED]: {
    label: "Submitted",
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200",
  },
  [ApplicationStatus.UNDER_REVIEW]: {
    label: "Under Review",
    className:
      "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200",
  },
  [ApplicationStatus.OFFER_SENT]: {
    label: "Offer Sent",
    className:
      "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-200",
  },
  [ApplicationStatus.OFFER_ACCEPTED]: {
    label: "Offer Accepted",
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200",
  },
  [ApplicationStatus.GS_DOCUMENTS_PENDING]: {
    label: "GS Docs Pending",
    className:
      "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-200",
  },
  [ApplicationStatus.GS_INTERVIEW_SCHEDULED]: {
    label: "GS Interview",
    className:
      "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-200",
  },
  [ApplicationStatus.GS_APPROVED]: {
    label: "GS Approved",
    className:
      "bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-200",
  },
  [ApplicationStatus.FEE_PAYMENT_PENDING]: {
    label: "Fee Pending",
    className:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-100",
  },
  [ApplicationStatus.COE_ISSUED]: {
    label: "COE Issued",
    className:
      "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-200",
  },
  [ApplicationStatus.REJECTED]: {
    label: "Rejected",
    className: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-200",
  },
};

const stageLabelMap: Record<ApplicationStage | string, string> = {
  [ApplicationStage.INITIAL_REVIEW]: "Initial Review",
  [ApplicationStage.DOCUMENT_VERIFICATION]: "Document Verification",
  [ApplicationStage.OFFER_GENERATION]: "Offer Generation",
  [ApplicationStage.OFFER_ACCEPTANCE]: "Offer Acceptance",
  [ApplicationStage.GS_ASSESSMENT]: "GS Assessment",
  [ApplicationStage.FEE_PAYMENT]: "Fee Payment",
  [ApplicationStage.COE_GENERATION]: "COE Generation",
  [ApplicationStage.COMPLETED]: "Completed",
  draft: "Draft",
};

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};

export const applicationStatusFilterOptions: DataTableFacetedFilterOption[] =
  Object.entries(STATUS_CONFIG).map(([status, config]) => ({
    value: status,
    label: config.label,
  }));

const StatusPill = ({ status }: { status: ApplicationStatus }) => {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        config?.className
      )}
    >
      {config?.label ?? status}
    </span>
  );
};

export const applicationColumns: ColumnDef<Application>[] = [
  {
    accessorKey: "referenceNumber",
    meta: { columnTitle: "Reference" },
    size: 180,
    minSize: 150,
    maxSize: 200,
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Reference"
        className="text-center"
      />
    ),
    cell: ({ row }) => (
      <div
        className="font-semibold text-foreground  truncate"
        title={row.getValue("referenceNumber") || "—"}
      >
        {row.getValue("referenceNumber") || "—"}
      </div>
    ),
  },
  {
    accessorKey: "studentName",
    meta: { columnTitle: "Student" },
    size: 150,
    minSize: 120,
    maxSize: 180,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Student" />
    ),
    cell: ({ row }) => (
      <div
        className="text-sm font-medium text-center truncate"
        title={row.getValue("studentName") || "Unknown student"}
      >
        {row.getValue("studentName") || "Unknown student"}
      </div>
    ),
  },
  // {
  //   accessorKey: "studentEmail",
  //   meta: { columnTitle: "Student Email" },
  //   size: 200,
  //   minSize: 180,
  //   maxSize: 250,
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Student Email" />
  //   ),
  //   cell: ({ row }) => (
  //     <div
  //       className="text-sm text-muted-foreground text-center truncate"
  //       title={row.getValue("studentEmail") || "—"}
  //     >
  //       {row.getValue("studentEmail") || "—"}
  //     </div>
  //   ),
  // },

  // {
  //   accessorKey: "agentName",
  //   meta: { columnTitle: "Agent" },
  //   size: 120,
  //   minSize: 100,
  //   maxSize: 150,
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Agent" />
  //   ),
  //   cell: ({ row }) => (
  //     <div
  //       className="text-sm text-start truncate whitespace-normal"
  //       title={row.getValue("agentName") || "—"}
  //     >
  //       {row.getValue("agentName") || "—"}
  //     </div>
  //   ),
  // },

  {
    accessorKey: "destination",
    meta: { columnTitle: "Destination" },
    size: 120,
    minSize: 100,
    maxSize: 150,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Destination" />
    ),
    cell: ({ row }) => (
      <div
        className="text-sm text-start truncate whitespace-normal"
        title={row.getValue("destination") || "—"}
      >
        {row.getValue("destination") || "—"}
      </div>
    ),
  },
  {
    accessorKey: "course",
    meta: { columnTitle: "Course" },
    size: 200,
    minSize: 180,
    maxSize: 250,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Course" />
    ),
    cell: ({ row }) => (
      <div
        className="text-sm text-muted-foreground text-start truncate whitespace-normal"
        title={row.getValue("course") || "—"}
      >
        {row.getValue("course") || "—"}
      </div>
    ),
  },
  {
    accessorKey: "status",
    meta: { columnTitle: "Status" },
    size: 130,
    minSize: 120,
    maxSize: 150,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => <StatusPill status={row.original.status} />,
    filterFn: (row, columnId, filterValues) => {
      if (
        !filterValues ||
        (Array.isArray(filterValues) && filterValues.length === 0)
      ) {
        return true;
      }
      const value = row.getValue(columnId);
      return (filterValues as string[]).includes(String(value));
    },
  },
  {
    accessorKey: "currentStage",
    meta: { columnTitle: "Current Stage" },
    size: 160,
    minSize: 140,
    maxSize: 200,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Current Stage" />
    ),
    cell: ({ row }) => {
      const stage = row.original.currentStage;
      if (!stage) return <div className="text-sm text-muted-foreground">—</div>;
      const label =
        stageLabelMap[stage] ||
        stage.charAt(0).toUpperCase() + stage.slice(1).replace(/_/g, " ");
      return (
        <div className="text-sm text-muted-foreground text-start truncate whitespace-normal" title={label}>
          {label}
        </div>
      );
    },
  },
  {
    accessorKey: "intake",
    meta: { columnTitle: "Intake" },
    size: 100,
    minSize: 80,
    maxSize: 120,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Intake" />
    ),
    cell: ({ row }) => (
      <div
        className="text-sm text-muted-foreground text-start truncate whitespace-normal      "
        title={row.getValue("intake") || "—"}
      >
        {row.getValue("intake") || "—"}
      </div>
    ),
  },

  // {
  //   id: "updatedAt",
  //   accessorKey: "updatedAt",
  //   meta: { columnTitle: "Updated" },
  //   size: 120,
  //   minSize: 100,
  //   maxSize: 140,
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Updated" />
  //   ),
  //   cell: ({ row }) => (
  //     <div className="text-sm text-muted-foreground">
  //       {formatDate(row.original.updatedAt)}
  //     </div>
  //   ),
  // },
];
