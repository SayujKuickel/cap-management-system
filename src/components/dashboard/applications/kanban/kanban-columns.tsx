import { Application, ApplicationStatus } from "@/constants/types";
import { useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { ApplicationCard } from "./application-card";

export function KanbanColumns({
  status,
  applications,
  statusLabel,
  statusColor,
  statusBackground,
  isallowMovingInKanban,
}: {
  status: ApplicationStatus;
  applications: Application[];
  statusLabel: string;
  statusColor: string;
  statusBackground: string;
  isallowMovingInKanban: boolean;
}) {
  const applicationIds = useMemo(
    () => applications.map((app) => app.id),
    [applications]
  );

  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: {
      type: "StatusColumn",
      status,
    },
    disabled: !isallowMovingInKanban,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "shrink-0 w-[320px] rounded-lg p-3",
        statusBackground,
        isOver && isallowMovingInKanban && "ring-2 ring-primary ring-offset-2"
      )}
      data-status={status}
    >
      <div className="bg-background/50 rounded-lg p-3 mb-3 border">
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full", statusColor)} />
          <h3 className="font-medium text-sm">{statusLabel}</h3>
          <Badge variant="secondary" className="ml-auto text-xs h-5">
            {applications.length}
          </Badge>
        </div>
      </div>
      <SortableContext
        items={applicationIds}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2.5 max-h-[calc(100vh-300px)] overflow-y-auto pr-1">
          {applications.map((app) => (
            <ApplicationCard
              key={app.id}
              app={app}
              isallowMovingInKanban={isallowMovingInKanban}
            />
          ))}
          {applications.length === 0 && (
            <div className="rounded-lg bg-background/30 p-8 text-center border border-dashed">
              <p className="text-xs text-muted-foreground">No applications</p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
