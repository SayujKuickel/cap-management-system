"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Application, ApplicationStatus } from "@/constants/types";
import applicationService from "@/service/application.service";
import {
  closestCorners,
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import {
  arrayMove
} from "@dnd-kit/sortable";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { KanbanColumns } from "./kanban-columns";

interface ApplicationKanbanProps {
  data: Application[];
  isallowMovingInKanban: boolean;
}

function isTouchDevice() {
  if (typeof window === "undefined") return false;
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

// Droppable Status Column Component

export function ApplicationKanban({
  data,
  isallowMovingInKanban,
}: ApplicationKanbanProps) {
  const [applications, setApplications] = useState<Application[]>(data);
  const [activeApplication, setActiveApplication] =
    useState<Application | null>(null);
  const queryClient = useQueryClient();

  // Update local state when data prop changes
  useEffect(() => {
    setApplications(data);
  }, [data]);

  const statuses = [
    ApplicationStatus.DRAFT,
    ApplicationStatus.SUBMITTED,
    ApplicationStatus.UNDER_REVIEW,
    ApplicationStatus.OFFER_SENT,
    ApplicationStatus.OFFER_ACCEPTED,
    ApplicationStatus.GS_INTERVIEW_SCHEDULED,
    ApplicationStatus.COE_ISSUED,
  ];

  const statusLabels: Record<string, string> = {
    [ApplicationStatus.SUBMITTED]: "Submitted",
    [ApplicationStatus.DRAFT]: "Draft",
    [ApplicationStatus.UNDER_REVIEW]: "Under Review",
    [ApplicationStatus.OFFER_SENT]: "Offer Sent",
    [ApplicationStatus.OFFER_ACCEPTED]: "Offer Accepted",
    [ApplicationStatus.GS_INTERVIEW_SCHEDULED]: "GS Interview",
    [ApplicationStatus.COE_ISSUED]: "COE Issued",
  };

  const statusColors: Record<string, string> = {
    [ApplicationStatus.SUBMITTED]: "bg-blue-500",
    [ApplicationStatus.UNDER_REVIEW]: "bg-yellow-500",
    [ApplicationStatus.DRAFT]: "bg-gray-500",
    [ApplicationStatus.OFFER_SENT]: "bg-purple-500",
    [ApplicationStatus.OFFER_ACCEPTED]: "bg-green-500",
    [ApplicationStatus.GS_INTERVIEW_SCHEDULED]: "bg-orange-500",
    [ApplicationStatus.COE_ISSUED]: "bg-emerald-500",
  };

  const statusBackgrounds: Record<string, string> = {
    [ApplicationStatus.SUBMITTED]: "bg-blue-500/5",
    [ApplicationStatus.UNDER_REVIEW]: "bg-yellow-500/5",
    [ApplicationStatus.DRAFT]: "bg-gray-500/5",
    [ApplicationStatus.OFFER_SENT]: "bg-purple-500/5",
    [ApplicationStatus.OFFER_ACCEPTED]: "bg-green-500/5",
    [ApplicationStatus.GS_INTERVIEW_SCHEDULED]: "bg-orange-500/5",
    [ApplicationStatus.COE_ISSUED]: "bg-emerald-500/5",
  };

  // Optimize sensor to reduce unnecessary drag events
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: isTouchDevice() ? 10 : 5,
        delay: isTouchDevice() ? 100 : 0,
        tolerance: 5,
      },
    })
  );

  const onDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const activeId = active.id as string;

      if (active.data.current?.type === "Application") {
        const application = applications.find((app) => app.id === activeId);
        if (application) {
          setActiveApplication(application);
          document.body.classList.add("dragging-application");
        }
      }
    },
    [applications]
  );

  const onDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over || !isallowMovingInKanban) return;

      const activeId = active.id as string;
      if (active.data.current?.type !== "Application") return;

      // Find the source application
      const activeApplication = applications.find((app) => app.id === activeId);
      if (!activeApplication) return;

      // Find the destination status
      const isOverColumn = over.data.current?.type === "StatusColumn";
      const overStatus = isOverColumn
        ? (over.id as ApplicationStatus)
        : over.data.current?.status;

      if (!overStatus || activeApplication.status === overStatus) return;

      // Update local state optimistically
      setApplications((prev) =>
        prev.map((app) =>
          app.id === activeId ? { ...app, status: overStatus } : app
        )
      );
    },
    [applications, isallowMovingInKanban]
  );

  const onDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      document.body.classList.remove("dragging-application");

      if (!over || !isallowMovingInKanban) {
        setActiveApplication(null);
        // Revert to original data if drag was cancelled
        setApplications(data);
        return;
      }

      const activeId = active.id as string;
      const activeApp = applications.find((app) => app.id === activeId);

      if (!activeApp || active.data.current?.type !== "Application") {
        setActiveApplication(null);
        return;
      }

      // Find the destination status
      const isOverColumn = over.data.current?.type === "StatusColumn";
      const overStatus = isOverColumn
        ? (over.id as ApplicationStatus)
        : over.data.current?.status;

      if (!overStatus || activeApp.status === overStatus) {
        setActiveApplication(null);
        return;
      }

      // Handle reordering within the same column
      if (activeApp.status === overStatus) {
        const sourceColumn = applications.filter(
          (app) => app.status === overStatus
        );
        const activeIndex = sourceColumn.findIndex(
          (app) => app.id === activeId
        );
        const overIndex = sourceColumn.findIndex(
          (app) => app.id === (over.id as string)
        );

        if (activeIndex !== overIndex && overIndex !== -1) {
          const reordered = arrayMove(sourceColumn, activeIndex, overIndex);
          setApplications((prev) => {
            const otherApps = prev.filter((app) => app.status !== overStatus);
            return [...otherApps, ...reordered];
          });
        }
        setActiveApplication(null);
        return;
      }

      // Update status via API
      try {
        const response = await applicationService.updateApplication(activeId, {
          status: overStatus,
        });

        if (response.success) {
          // Update local state
          setApplications((prev) =>
            prev.map((app) =>
              app.id === activeId ? { ...app, status: overStatus } : app
            )
          );

          // Invalidate queries to refresh data
          queryClient.invalidateQueries({
            queryKey: ["application-list"],
          });
          queryClient.invalidateQueries({
            queryKey: ["application-get", activeId],
          });

          toast.success(`Application moved to "${statusLabels[overStatus]}"`, {
            icon: "✅",
          });
        } else {
          throw new Error(response.message || "Failed to update application");
        }
      } catch (error) {
        // Revert on error
        setApplications(data);
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to update application status"
        );
      }

      setActiveApplication(null);
    },
    [applications, isallowMovingInKanban, statusLabels, data]
  );

  // Group applications by status
  const applicationsByStatus = useMemo(() => {
    const grouped: Record<ApplicationStatus, Application[]> = {} as Record<
      ApplicationStatus,
      Application[]
    >;
    statuses.forEach((status) => {
      grouped[status] = applications.filter((app) => app.status === status);
    });
    return grouped;
  }, [applications, statuses]);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      collisionDetection={closestCorners}
      modifiers={[restrictToWindowEdges]}
    >
      <div className="w-full overflow-x-auto small-sidebar-width pb-4">
        <div className="inline-flex gap-4 min-w-full">
          {statuses.map((status) => (
            <KanbanColumns
              key={status}
              status={status}
              applications={applicationsByStatus[status] || []}
              statusLabel={statusLabels[status]}
              statusColor={statusColors[status]}
              statusBackground={statusBackgrounds[status] || ""}
              isallowMovingInKanban={isallowMovingInKanban}
            />
          ))}
        </div>
      </div>

      <DragOverlay>
        {activeApplication ? (
          <Card className="opacity-90 rotate-3 shadow-lg border-primary">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-sm mb-1">
                    {activeApplication.studentName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {activeApplication.course}
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {activeApplication.destination}
                  </span>
                  <Badge variant="outline" className="text-xs h-5">
                    {activeApplication.referenceNumber}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
