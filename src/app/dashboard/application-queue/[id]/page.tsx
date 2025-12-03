
"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Check, X, FileText, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ApplicationStatusBadge } from "@/components/shared/ApplicationStatusBadge";
import { siteRoutes } from "@/constants/site-routes";
import { useApplicationReviewQuery } from "@/hooks/useStaff.hook";
import { useApplicationChangeStageMutation } from "@/hooks/useApplication.hook";

export default function StaffApplicationReview() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [reviewNotes, setReviewNotes] = useState("");

  const { data: response, isLoading, isError } = useApplicationReviewQuery(id);
  const changeStageMutation = useApplicationChangeStageMutation(id);

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
          Back to Queue
        </Button>
      </div>
    );
  }

  const handleApprove = () => {
    changeStageMutation.mutate(
      { stage: "approved", notes: reviewNotes },
      {
        onSuccess: () => {
          toast.success("Application approved successfully");
          router.push(siteRoutes.dashboard.applicationQueue.root);
        },
        onError: (error) => {
          toast.error(`Failed to approve: ${error.message}`);
        },
      }
    );
  };

  const handleReject = () => {
    changeStageMutation.mutate(
      { stage: "rejected", notes: reviewNotes },
      {
        onSuccess: () => {
          toast.error("Application rejected");
          router.push(siteRoutes.dashboard.applicationQueue.root);
        },
        onError: (error) => {
          toast.error(`Failed to reject: ${error.message}`);
        },
      }
    );
  };

  const studentName =
    application.personal_details?.given_name &&
    application.personal_details?.family_name
      ? `${application.personal_details.given_name} ${application.personal_details.family_name}`
      : "N/A";

  return (
    <div className="space-y-6 p-6">
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
            <h1 className="text-3xl font-bold tracking-tight">
              Review Application
            </h1>
            <p className="text-muted-foreground">
              Reference: {application.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
        </div>
        <ApplicationStatusBadge status={application.current_stage} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Student information */}
        <Card>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-4">
              <p className="text-sm text-muted-foreground col-span-1">
                Full Name
              </p>
              <p className="col-span-2 font-medium">{studentName}</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <p className="text-sm text-muted-foreground col-span-1">Email</p>
              <p className="col-span-2">{application.personal_details?.email || "N/A"}</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <p className="text-sm text-muted-foreground col-span-1">Phone</p>
              <p className="col-span-2">{application.personal_details?.phone || "N/A"}</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <p className="text-sm text-muted-foreground col-span-1">
                Passport Number
              </p>
              <p className="col-span-2">
                {application.personal_details?.passport_number || "N/A"}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <p className="text-sm text-muted-foreground col-span-1">USI</p>
              <p className="col-span-2">{application.usi || "N/A"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Course information */}
        <Card>
          <CardHeader>
            <CardTitle>Course Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-4">
              <p className="text-sm text-muted-foreground col-span-1">
                Course Offering ID
              </p>
              <p className="col-span-2 text-sm font-mono">
                {application.course_offering_id || "N/A"}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <p className="text-sm text-muted-foreground col-span-1">
                Agent ID
              </p>
              <p className="col-span-2 text-sm font-mono">
                {application.agent_profile_id || "N/A"}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <p className="text-sm text-muted-foreground col-span-1">
                Submitted At
              </p>
              <p className="col-span-2">
                {application.submitted_at
                  ? new Date(application.submitted_at).toLocaleDateString()
                  : "Not submitted"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {/* Placeholder for documents - assuming they might be in a separate query or part of the details in the future */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <span>Passport Document</span>
              </div>
              <Badge className="bg-green-500 text-white hover:bg-green-600">
                Verified
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <span>English Test Results</span>
              </div>
              <Badge className="bg-green-500 text-white hover:bg-green-600">
                Verified
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Review form */}
      <Card>
        <CardHeader>
          <CardTitle>Review Decision</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="review-notes">Comments / Notes</Label>
            <Textarea
              id="review-notes"
              placeholder="Add your review comments here..."
              rows={4}
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleApprove}
              className="gap-2 bg-green-600 hover:bg-green-700"
              disabled={changeStageMutation.isPending}
            >
              {changeStageMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Approve & Generate Offer
            </Button>
            <Button
              onClick={handleReject}
              variant="destructive"
              className="gap-2"
              disabled={changeStageMutation.isPending}
            >
              {changeStageMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <X className="h-4 w-4" />
              )}
              Reject Application
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
