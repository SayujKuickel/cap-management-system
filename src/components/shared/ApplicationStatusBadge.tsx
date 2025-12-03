import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ApplicationStatusBadgeProps {
  status: string;
  className?: string;
}

export function ApplicationStatusBadge({ status, className }: ApplicationStatusBadgeProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
      case "accepted":
        return "bg-green-500 hover:bg-green-600";
      case "rejected":
      case "declined":
        return "bg-red-500 hover:bg-red-600";
      case "pending":
      case "submitted":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "draft":
        return "bg-gray-500 hover:bg-gray-600";
      default:
        return "bg-blue-500 hover:bg-blue-600";
    }
  };

  return (
    <Badge className={cn(getStatusColor(status), className)}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
