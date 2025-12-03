import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { siteRoutes } from "@/constants/site-routes";
import { Application } from "@/constants/types";
import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Eye, GripVertical } from "lucide-react";
import Link from "next/link";
export function ApplicationCard({
  app,
  isallowMovingInKanban,
}: {
  app: Application;
  isallowMovingInKanban: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: app.id,
    disabled: !isallowMovingInKanban,
    data: {
      type: "Application",
      application: app,
      status: app.status,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="w-full">
      <Card
        className={cn(
          "hover:shadow-md transition-shadow cursor-pointer border-border/40 w-full",
          isDragging && "ring-2 ring-primary"
        )}
      >
        <CardContent className="p-2.5 sm:p-3">
          <div className="space-y-2">
            <div className="min-w-0">
              <p className="font-medium text-xs sm:text-sm mb-0.5 truncate" title={app.studentName}>
                {app.studentName}
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate" title={app.course}>
                {app.course}
              </p>
            </div>

            <div className="flex items-center justify-between gap-1.5 sm:gap-2 text-[10px] sm:text-xs min-w-0">
              <span className="text-muted-foreground truncate flex-1 min-w-0" title={app.destination}>
                {app.destination}
              </span>
              
            </div>

            {app.assignedStaffName && (
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate" title={app.assignedStaffName}>
                👤 {app.assignedStaffName}
              </p>
            )}

            <div className="flex items-center gap-1.5 sm:gap-2 pt-0.5">
              {isallowMovingInKanban && (
                <div
                  {...attributes}
                  {...listeners}
                  className="cursor-grab active:cursor-grabbing touch-manipulation p-0.5 sm:p-1 hover:bg-muted rounded shrink-0"
                  aria-label="Drag to move application"
                >
                  <GripVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                </div>
              )}
              <Link
                href={`${siteRoutes.dashboard.application.root}/${app.id}`}
                className="flex-1 min-w-0"
              >
                <Button variant="ghost" size="sm" className="w-full gap-1.5 sm:gap-2 h-7 sm:h-8 text-[10px] sm:text-xs px-2">
                  <Eye className="h-3 w-3 shrink-0" />
                  <span className="truncate">View</span>
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
