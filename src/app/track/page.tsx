"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import studentService from "@/service/student.service";
import {
  AlertCircle,
  Check,
  Clock,
  FileCheck,
  Hourglass,
  Mail,
  Phone,
  Search,
  Tag,
  User
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "react-hot-toast";

interface ApplicationProgress {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  icon: React.ReactNode;
}

interface StageProgress {
  stage: string;
  status: "completed" | "pending" | "in_progress";
  completed_at: string | null;
  duration_days: number | null;
}

interface RequiredDocument {
  name: string;
  is_required: boolean;
  is_uploaded: boolean;
  uploaded_at: string | null;
  needs_attention: boolean;
}

interface TrackApplicationResponse {
  id: string;
  course_code: string | null;
  course_name: string | null;
  intake: string | null;
  campus: string | null;
  tuition_fee: number | null;
  application_status: string;
  current_stage: string;
  completion_percentage: number;
  submitted_at: string | null;
  decision_at: string | null;
  stage_progress: StageProgress[];
  required_documents: RequiredDocument[];
  timeline: unknown[];
  agent_name: string | null;
  agent_agency: string | null;
  agent_phone: string | null;
  assigned_staff_name: string | null;
  assigned_staff_email: string | null;
  next_steps: string[];
}

const STAGE_MAPPING: Record<string, { title: string; description: string; icon: React.ReactNode }> = {
  draft: {
    title: "Draft",
    description: "Application is being prepared",
    icon: <FileCheck className="size-4" />,
  },
  submitted: {
    title: "Application Submitted",
    description: "Your application has been received",
    icon: <FileCheck className="size-4" />,
  },
  staff_review: {
    title: "Under Review",
    description: "Application is being reviewed by staff",
    icon: <Clock className="size-4" />,
  },
  awaiting_documents: {
    title: "Awaiting Documents",
    description: "Additional documents may be required",
    icon: <FileCheck className="size-4" />,
  },
  gs_assessment: {
    title: "GS Assessment",
    description: "Genuine Student assessment in progress",
    icon: <FileCheck className="size-4" />,
  },
  offer_generated: {
    title: "Offer Generated",
    description: "Conditional offer letter has been generated",
    icon: <Tag className="size-4" />,
  },
  offer_accepted: {
    title: "Offer Accepted",
    description: "You have accepted the offer",
    icon: <Check className="size-4" />,
  },
  enrolled: {
    title: "Enrolled",
    description: "Confirmation of Enrollment issued",
    icon: <Check className="size-4" />,
  },
};

const formatDate = (dateString: string | null): string => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
};

const ApplicationTrack = () => {
  const [applicationId, setApplicationId] = useState("");
  const [trackedApplication, setTrackedApplication] = useState<TrackApplicationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTrack = async () => {
    if (!applicationId.trim()) {
      toast.error("Please enter an application ID");
      return;
    }

    setIsLoading(true);
    setError(null);
    setTrackedApplication(null);

    try {
      const response = await studentService.trackApplication(applicationId.trim());
      
      if (response.success && response.data) {
        setTrackedApplication(response.data as TrackApplicationResponse);
        toast.success("Application found");
      } else {
        throw new Error(response.message || "Failed to fetch application");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to track application";
      setError(errorMessage);
      toast.error(errorMessage);
      setTrackedApplication(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getProgressSteps = (): ApplicationProgress[] => {
    if (!trackedApplication) return [];

    return trackedApplication.stage_progress.map((stage) => {
      const stageInfo = STAGE_MAPPING[stage.stage] || {
        title: stage.stage.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        description: `Stage: ${stage.stage}`,
        icon: <Clock className="size-4" />,
      };

      return {
        id: stage.stage,
        title: stageInfo.title,
        description: stageInfo.description,
        completed: stage.status === "completed",
        icon: stageInfo.icon,
      };
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isLoading) {
      handleTrack();
    }
  };

  const progressSteps = getProgressSteps();

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-start justify-center py-4 sm:py-6 lg:py-8">
      <div className="w-full max-w-4xl space-y-6 px-4 sm:space-y-8 sm:px-6">
        {/* Header Section - Centered */}
        <section className="mx-auto max-w-2xl space-y-4 text-center sm:space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-foreground sm:text-4xl lg:text-5xl">
              Track Your Application
            </h1>
            <p className="mx-auto max-w-lg text-sm text-muted-foreground sm:text-base">
              Enter your application ID to check your application status.
            </p>
          </div>

          {/* Search Input - Centered */}
          <div className="mx-auto flex max-w-xl flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <Input
                value={applicationId}
                onChange={(e) => setApplicationId(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Enter application ID (e.g., ae2b2118-e38a-49e4-8b8c-07477792817b)"
                className="w-full"
                disabled={isLoading}
              />
            </div>
            <Button 
              onClick={handleTrack} 
              disabled={isLoading || !applicationId.trim()}
              className="w-full sm:w-auto sm:min-w-[120px]"
              size="lg"
            >
              <Search className="size-4" />
              <span>{isLoading ? "Tracking..." : "Track"}</span>
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground sm:text-sm">
            Your application ID was sent to your email when the application was
            submitted.
          </p>

          {error && (
            <div className="mx-auto max-w-xl rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="size-4" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            </div>
          )}
        </section>

        {/* Results - Centered */}
        {trackedApplication && (
          <div className="mx-auto max-w-4xl space-y-6 sm:space-y-8">
            {/* Application Details Card */}
            <Card className="overflow-hidden shadow-lg transition-shadow hover:shadow-xl">
              <CardHeader className="relative space-y-4 bg-muted/30 pb-4 sm:pb-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl sm:text-2xl">
                      Application Details
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                      Application ID: <span className="font-mono font-semibold">{trackedApplication.id}</span>
                    </CardDescription>
                    {trackedApplication.completion_percentage !== undefined && (
                      <CardDescription className="text-xs">
                        Completion: {trackedApplication.completion_percentage}%
                      </CardDescription>
                    )}
                  </div>
                  <Badge
                    variant="default"
                    className="w-fit bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 dark:bg-blue-500 sm:text-base sm:px-4 sm:py-2"
                  >
                    {trackedApplication.application_status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
                  <div className="space-y-5">
                    {trackedApplication.agent_name && (
                      <div className="space-y-2 rounded-lg border border-border/50 bg-muted/20 p-4 transition-colors hover:bg-muted/40">
                        <div className="flex items-center gap-2">
                          <User className="size-4 text-muted-foreground" />
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground sm:text-sm">
                            Agent
                          </p>
                        </div>
                        <p className="text-base font-semibold text-foreground sm:text-lg">
                          {trackedApplication.agent_name}
                        </p>
                        {trackedApplication.agent_agency && (
                          <p className="text-sm text-muted-foreground">
                            {trackedApplication.agent_agency}
                          </p>
                        )}
                        {trackedApplication.agent_phone && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="size-3" />
                            {trackedApplication.agent_phone}
                          </div>
                        )}
                      </div>
                    )}
                    {trackedApplication.assigned_staff_name && (
                      <div className="space-y-2 rounded-lg border border-border/50 bg-muted/20 p-4 transition-colors hover:bg-muted/40">
                        <div className="flex items-center gap-2">
                          <User className="size-4 text-muted-foreground" />
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground sm:text-sm">
                            Assigned Staff
                          </p>
                        </div>
                        <p className="text-base font-semibold text-foreground sm:text-lg">
                          {trackedApplication.assigned_staff_name}
                        </p>
                        {trackedApplication.assigned_staff_email && (
                          <a
                            href={`mailto:${trackedApplication.assigned_staff_email}`}
                            className="text-sm text-primary hover:underline"
                          >
                            {trackedApplication.assigned_staff_email}
                          </a>
                        )}
                      </div>
                    )}
                    <div className="space-y-2 rounded-lg border border-border/50 bg-muted/20 p-4 transition-colors hover:bg-muted/40">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground sm:text-sm">
                        Current Stage
                      </p>
                      <p className="text-base font-semibold text-foreground sm:text-lg capitalize">
                        {trackedApplication.current_stage.replace(/_/g, " ")}
                      </p>
                    </div>
                    <div className="space-y-2 rounded-lg border border-border/50 bg-muted/20 p-4 transition-colors hover:bg-muted/40">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground sm:text-sm">
                        Submitted On
                      </p>
                      <p className="text-base font-semibold text-foreground sm:text-lg">
                        {formatDate(trackedApplication.submitted_at)}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-5">
                    {trackedApplication.course_name && (
                      <div className="space-y-2 rounded-lg border border-border/50 bg-muted/20 p-4 transition-colors hover:bg-muted/40">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground sm:text-sm">
                          Course
                        </p>
                        <p className="text-base font-semibold text-foreground sm:text-lg">
                          {trackedApplication.course_name}
                        </p>
                        {trackedApplication.course_code && (
                          <p className="text-sm text-muted-foreground">
                            Code: {trackedApplication.course_code}
                          </p>
                        )}
                      </div>
                    )}
                    {trackedApplication.intake && (
                      <div className="space-y-2 rounded-lg border border-border/50 bg-muted/20 p-4 transition-colors hover:bg-muted/40">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground sm:text-sm">
                          Intake
                        </p>
                        <p className="text-base font-semibold text-foreground sm:text-lg">
                          {trackedApplication.intake}
                        </p>
                      </div>
                    )}
                    {trackedApplication.campus && (
                      <div className="space-y-2 rounded-lg border border-border/50 bg-muted/20 p-4 transition-colors hover:bg-muted/40">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground sm:text-sm">
                          Campus
                        </p>
                        <p className="text-base font-semibold text-foreground sm:text-lg">
                          {trackedApplication.campus}
                        </p>
                      </div>
                    )}
                    {trackedApplication.tuition_fee !== null && (
                      <div className="space-y-2 rounded-lg border border-border/50 bg-muted/20 p-4 transition-colors hover:bg-muted/40">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground sm:text-sm">
                          Tuition Fee
                        </p>
                        <p className="text-base font-semibold text-foreground sm:text-lg">
                          ${trackedApplication.tuition_fee.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Required Documents Card */}
            {trackedApplication.required_documents && trackedApplication.required_documents.length > 0 && (
              <Card className="shadow-lg transition-shadow hover:shadow-xl">
                <CardHeader className="space-y-2">
                  <CardTitle className="text-xl sm:text-2xl">
                     Documents
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Status of your application documents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {trackedApplication.required_documents.map((doc, index) => (
                      <div
                        key={index}
                        className={cn(
                          "flex items-center justify-between rounded-lg border p-4 transition-colors",
                          doc.is_uploaded
                            ? "border-green-500/30 bg-green-50/50"
                            : doc.is_required
                            ? "border-destructive/30 bg-destructive/5"
                            : "border-border/50 bg-muted/20"
                        )}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{doc.name}</p>
                            {doc.is_required && (
                              <Badge variant="destructive" className="text-xs">
                                Required
                              </Badge>
                            )}
                            {!doc.is_required && (
                              <Badge variant="secondary" className="text-xs">
                                Optional
                              </Badge>
                            )}
                          </div>
                          {doc.uploaded_at && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              Uploaded: {formatDate(doc.uploaded_at)}
                            </p>
                          )}
                        </div>
                        <div className="ml-4">
                          {doc.is_uploaded ? (
                            <Check className="size-5 text-green-600" />
                          ) : (
                            <AlertCircle className="size-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Application Progress Card */}
            <Card className="shadow-lg transition-shadow hover:shadow-xl">
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl sm:text-2xl">
                  Application Progress
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Track your application through each stage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative py-2">
                  {progressSteps.length > 0 ? (
                    progressSteps.map((step, index) => {
                      const isLast = index === progressSteps.length - 1;
                      const isCompleted = step.completed;
                      const isPreviousCompleted =
                        index > 0 && progressSteps[index - 1].completed;

                    return (
                      <div
                        key={step.id}
                        className="relative flex gap-4 transition-opacity sm:gap-6"
                      >
                        {/* Vertical Line */}
                        {!isLast && (
                          <div
                            className={cn(
                              "absolute left-[19px] top-12 h-[calc(100%-1.5rem)] w-0.5 transition-colors sm:left-5 sm:top-14",
                              isCompleted || isPreviousCompleted
                                ? "bg-primary/60"
                                : "bg-muted"
                            )}
                          />
                        )}

                        {/* Icon Circle */}
                        <div
                          className={cn(
                            "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all sm:h-12 sm:w-12",
                            isCompleted
                              ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/30"
                              : "border-muted bg-background text-muted-foreground"
                          )}
                        >
                          <div className={cn(isCompleted ? "" : "opacity-50")}>
                            {step.icon}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 space-y-2 pb-8 sm:pb-10">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4
                              className={cn(
                                "text-base font-semibold sm:text-lg",
                                isCompleted
                                  ? "text-foreground"
                                  : "text-foreground/70"
                              )}
                            >
                              {step.title}
                            </h4>
                            {isCompleted && (
                              <Check className="size-5 shrink-0 text-primary" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground sm:text-base">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    );
                    })
                  ) : (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      No progress information available
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Next Steps & Contact - Responsive Grid */}
            <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
              <Card className="shadow-lg transition-shadow hover:shadow-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Hourglass className="size-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg sm:text-xl">Next Steps</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {trackedApplication.next_steps && trackedApplication.next_steps.length > 0 ? (
                      <ul className="space-y-2">
                        {trackedApplication.next_steps.map((step, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                              {index + 1}
                            </span>
                            <p className="text-sm leading-relaxed text-foreground sm:text-base">
                              {step}
                            </p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <>
                        <p className="text-base font-semibold text-foreground sm:text-lg">
                          Your application is under review.
                        </p>
                        <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                          Our team is reviewing your documents. You will be notified
                          of any updates via email.
                        </p>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg transition-shadow hover:shadow-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Mail className="size-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg sm:text-xl">Need Help?</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {trackedApplication.agent_name ? (
                      <>
                        <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                          Have questions about your application?{" "}
                          <span className="font-semibold text-foreground">
                            Contact your agent
                          </span>
                          {trackedApplication.agent_name && (
                            <span className="block mt-1">
                              {trackedApplication.agent_name}
                              {trackedApplication.agent_agency && ` - ${trackedApplication.agent_agency}`}
                            </span>
                          )}
                          {trackedApplication.agent_phone && (
                            <a
                              href={`tel:${trackedApplication.agent_phone}`}
                              className="mt-1 inline-flex items-center gap-2 text-sm text-primary hover:underline"
                            >
                              <Phone className="size-3" />
                              {trackedApplication.agent_phone}
                            </a>
                          )}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                        Have questions about your application? Email us at:
                      </p>
                    )}
                    <a
                      href="mailto:admissions@churchill.edu"
                      className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-all hover:bg-primary/20 hover:underline sm:text-base"
                    >
                      <Mail className="size-4" />
                      admissions@churchill.edu
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationTrack;