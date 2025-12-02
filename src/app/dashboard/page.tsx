import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  FileCheck,
  Plus,
  TrendingUp,
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
import {
  mockApplications,
  mockAgentDashboardMetrics,
  mockActivities,
} from "@/data/mock-data";
import Link from "next/link";

export enum ApplicationStatus {
  DRAFT = "draft",
  SUBMITTED = "submitted",
  UNDER_REVIEW = "under_review",
  OFFER_SENT = "offer_sent",
  OFFER_ACCEPTED = "offer_accepted",
  GS_DOCUMENTS_PENDING = "gs_documents_pending",
  GS_INTERVIEW_SCHEDULED = "gs_interview_scheduled",
  GS_APPROVED = "gs_approved",
  FEE_PAYMENT_PENDING = "fee_payment_pending",
  COE_ISSUED = "coe_issued",
  REJECTED = "rejected",
}
const statusColors: Record<ApplicationStatus, string> = {
  [ApplicationStatus.DRAFT]: "bg-gray-500",
  [ApplicationStatus.SUBMITTED]: "bg-blue-500",
  [ApplicationStatus.UNDER_REVIEW]: "bg-yellow-500",
  [ApplicationStatus.OFFER_SENT]: "bg-purple-500",
  [ApplicationStatus.OFFER_ACCEPTED]: "bg-indigo-500",
  [ApplicationStatus.GS_DOCUMENTS_PENDING]: "bg-orange-500",
  [ApplicationStatus.GS_INTERVIEW_SCHEDULED]: "bg-cyan-500",
  [ApplicationStatus.GS_APPROVED]: "bg-teal-500",
  [ApplicationStatus.FEE_PAYMENT_PENDING]: "bg-amber-500",
  [ApplicationStatus.COE_ISSUED]: "bg-green-500",
  [ApplicationStatus.REJECTED]: "bg-red-500",
};

export default function AgentDashboard() {
  const metrics = mockAgentDashboardMetrics;
  const recentApplications = mockApplications.slice(0, 3);
  const recentActivities = mockActivities.slice(0, 5);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your applications.
          </p>
        </div>
        <Link href="/agent/applications/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Application
          </Button>
        </Link>
      </div>

      {/* Metrics cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Total</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{metrics.totalApplications}</div>
            <p className="text-xs text-muted-foreground">Applications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{metrics.pending}</div>
            <p className="text-xs text-muted-foreground">Under review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{metrics.approved}</div>
            <p className="text-xs text-muted-foreground">Success rate 75%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{metrics.rejected}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">GS Stage</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{metrics.gsStage}</div>
            <p className="text-xs text-muted-foreground">In assessment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">COE Issued</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{metrics.coeIssued}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
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
            <div className="space-y-4">
              {recentApplications.map((app) => (
                <Link key={app.id} href={`/agent/applications/${app.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{app.studentName}</p>
                        <Badge variant="outline" className="text-xs">
                          {app.referenceNumber}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {app.course} • {app.destination}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Submitted {formatDate(app.submittedAt)}
                      </p>
                    </div>
                    <Badge className={`${statusColors[app.status]} text-white`}>
                      {app.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
            <Link href="/agent/applications">
              <Button variant="ghost" className="w-full mt-4">
                View All Applications
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates on your applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const app = mockApplications.find(
                  (a) => a.id === activity.applicationId
                );
                return (
                  <div key={activity.id} className="flex gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                    <div className="flex-1">
                      <p className="text-sm">{activity.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {app?.referenceNumber}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(activity.performedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

   
    </div>
  );
}
