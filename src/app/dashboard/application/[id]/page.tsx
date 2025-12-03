
"use client";

import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  FileText,
  Clock,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApplicationStatusBadge } from "@/components/shared/ApplicationStatusBadge";
import { useApplicationGetQuery } from "@/hooks/useApplication.hook";
import { siteRoutes } from "@/constants/site-routes";

export default function AgentApplicationDetail() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const { data: response, isLoading, isError } = useApplicationGetQuery(id);
  const application = response?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !application) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Application not found</p>
        <Button
          onClick={() => router.push(siteRoutes.dashboard.applicationQueue.root)}
          className="mt-4"
        >
          Back to Applications
        </Button>
      </div>
    );
  }

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const studentName =
    application.personal_details?.given_name &&
      application.personal_details?.family_name
      ? `${application.personal_details.given_name} ${application.personal_details.family_name}`
      : "N/A";

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              router.push(siteRoutes.dashboard.applicationQueue.root)
            }
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{studentName}</h1>
            <p className="text-muted-foreground">
              Reference: {application.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ApplicationStatusBadge status={application.current_stage} />
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Application overview */}
      <Card>
        <CardHeader>
          <CardTitle>Application Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Student Email</p>
              <p>{application.personal_details?.email || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p>{application.personal_details?.phone || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Course</p>
              <p className="truncate" title={application.course_offering_id || ""}>
                {application.course_offering_id || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Destination</p>
              <p>
                {application.personal_details?.country || "Australia"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Intake</p>
              <p>N/A</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Assigned Staff</p>
              <p className="truncate" title={application.assigned_staff_id || ""}>
                {application.assigned_staff_id || "Not assigned"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Submitted</p>
              <p>{formatDate(application.submitted_at)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p>{formatDate(application.updated_at)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Stage</p>
              <p className="capitalize">
                {application.current_stage.replace(/_/g, " ")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different sections */}
      <Tabs defaultValue="documents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="gs-documents">GS Documents</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Application Documents</CardTitle>
              <CardDescription>
                All documents submitted with this application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Passport</p>
                      <p className="text-sm text-muted-foreground">
                        {application.personal_details?.passport_number || "N/A"}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium">IELTS Certificate</p>
                      <p className="text-sm text-muted-foreground">
                        Overall:{" "}
                        {application.language_cultural_data?.english_test_score ||
                          "N/A"}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Application Timeline</CardTitle>
              <CardDescription>
                Activity history for this application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Placeholder for timeline as data is not available in current API response */}
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="font-medium">Application Created</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Application was created in the system.
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(application.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
                {application.submitted_at && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Clock className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="font-medium">Application Submitted</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Application was submitted for review.
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(application.submitted_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gs-documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>GS Documents</CardTitle>
              <CardDescription>
                Genuine Student assessment documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                No GS documents uploaded yet
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communication" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Communication History</CardTitle>
              <CardDescription>Messages and correspondence</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                No messages yet
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
