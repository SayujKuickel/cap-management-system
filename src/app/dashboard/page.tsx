"use client";

import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  FileCheck,
  Plus,
  TrendingUp,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useStaffMetrics, useAllStaffMetrics } from "@/hooks/useStaffMetrics.hook";
import useApplications from "@/hooks/useApplications.hook";
import { siteRoutes } from "@/constants/site-routes";
import { ApplicationStatus } from "@/constants/types";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  draft: "bg-gray-500",
  submitted: "bg-blue-500",
  under_review: "bg-yellow-500",
  offer_sent: "bg-purple-500",
  offer_accepted: "bg-indigo-500",
  gs_documents_pending: "bg-orange-500",
  gs_interview_scheduled: "bg-cyan-500",
  gs_approved: "bg-teal-500",
  fee_payment_pending: "bg-amber-500",
  coe_issued: "bg-green-500",
  rejected: "bg-red-500",
};

export default function Dashboard() {
  const { data: session } = useSession();
  const role = (session?.user?.role as "staff" | "admin" | "agent" | undefined) ?? "admin";
  
  // Use organization-wide metrics for admin/staff, staff-specific for others
  const useOrgMetrics = role === "admin" || role === "staff";
  const staffMetricsQuery = useOrgMetrics 
    ? useAllStaffMetrics({ refetchInterval: 60000 })
    : useStaffMetrics({ refetchInterval: 60000 });
  
  const { applications, isLoading: isLoadingApps } = useApplications({
    filters: {},
    storeKey: "dashboard-recent",
  });

  const metrics = staffMetricsQuery.data?.data || {
    total_applications: 0,
    submitted_pending_review: 0,
    in_staff_review: 0,
    awaiting_documents: 0,
    in_gs_assessment: 0,
    offers_generated: 0,
    enrolled: 0,
    rejected: 0,
    documents_pending_verification: 0,
  };

  const recentApplications = applications.slice(0, 3);
  const isLoading = staffMetricsQuery.isLoading;
  const error = staffMetricsQuery.error;

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Calculate success rate
  const totalProcessed = metrics.enrolled + metrics.rejected;
  const successRate = totalProcessed > 0 
    ? Math.round((metrics.enrolled / totalProcessed) * 100) 
    : 0;

  if (error) {
    return (
      <div className="space-y-6">
        <div className="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm font-medium">
              Failed to load dashboard data: {error.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your applications.
          </p>
        </div>
        {role === "agent" && (
          <Link href={siteRoutes.dashboard.application.new}>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Application
            </Button>
          </Link>
        )}
      </div>

      {/* Metrics cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">{metrics.total_applications}</div>
                <p className="text-xs text-muted-foreground">Applications</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">{metrics.submitted_pending_review}</div>
                <p className="text-xs text-muted-foreground">Awaiting review</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Review</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">{metrics.in_staff_review}</div>
                <p className="text-xs text-muted-foreground">Under review</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Enrolled</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">{metrics.enrolled}</div>
                <p className="text-xs text-muted-foreground">
                  Success rate {successRate}%
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">{metrics.rejected}</div>
                <p className="text-xs text-muted-foreground">Need attention</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">GS Assessment</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">{metrics.in_gs_assessment}</div>
                <p className="text-xs text-muted-foreground">In assessment</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional metrics row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Awaiting Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">{metrics.awaiting_documents}</div>
                <p className="text-xs text-muted-foreground">Pending documents</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Offers Generated</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">{metrics.offers_generated}</div>
                <p className="text-xs text-muted-foreground">Offers sent</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">COE Issued</CardTitle>
            <FileCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">{metrics.enrolled}</div>
                <p className="text-xs text-muted-foreground">Completed</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Docs Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">{metrics.documents_pending_verification}</div>
                <p className="text-xs text-muted-foreground">Verification needed</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent applications */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
            <CardDescription>Your most recent submissions</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingApps ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : recentApplications.length > 0 ? (
              <>
                <div className="space-y-4">
                  {recentApplications.map((app) => (
                    <Link 
                      key={app.id} 
                      href={`${siteRoutes.dashboard.application.root}/${app.id}`}
                    >
                      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{app.studentName}</p>
                            <Badge variant="outline" className="text-xs">
                              {app.referenceNumber}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {app.course || "—"} • {app.destination || "—"}
                          </p>
                          {app.submittedAt && (
                            <p className="text-xs text-muted-foreground">
                              Submitted {formatDate(app.submittedAt)}
                            </p>
                          )}
                        </div>
                        <Badge 
                          className={cn(
                            statusColors[app.status] || "bg-gray-500",
                            "text-white"
                          )}
                        >
                          {app.status.replace(/_/g, " ")}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link href={siteRoutes.dashboard.application.root}>
                  <Button variant="ghost" className="w-full mt-4">
                    View All Applications
                  </Button>
                </Link>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No applications found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>
              Overview of application statuses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className="text-sm font-medium">Pending Review</span>
                </div>
                <span className="text-sm font-semibold">
                  {metrics.submitted_pending_review}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-yellow-500" />
                  <span className="text-sm font-medium">In Review</span>
                </div>
                <span className="text-sm font-semibold">
                  {metrics.in_staff_review}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm font-medium">Enrolled</span>
                </div>
                <span className="text-sm font-semibold">
                  {metrics.enrolled}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-orange-500" />
                  <span className="text-sm font-medium">Docs Pending</span>
                </div>
                <span className="text-sm font-semibold">
                  {metrics.documents_pending_verification}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
