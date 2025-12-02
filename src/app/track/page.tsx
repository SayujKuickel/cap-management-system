"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Check,
  Clock,
  Tag,
  FileCheck,
  DollarSign,
  Hourglass,
  Mail,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ApplicationProgress {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  icon: React.ReactNode;
}

const ApplicationTrack = () => {
  const [referenceNumber, setReferenceNumber] = useState("CHU-2024-00001");
  const [trackedApplication, setTrackedApplication] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Dummy data - in real app, this would come from an API
  const applicationData = {
    reference: "CHU-2024-00001",
    status: "UNDER REVIEW",
    studentName: "Rajesh Kumar Sharma",
    destination: "Australia",
    submittedOn: "11/1/2024",
    course: "Master of Business Administration",
    intake: "February 2025",
    lastUpdated: "11/5/2024",
  };

  const handleTrack = async () => {
    if (!referenceNumber.trim()) return;

    setIsLoading(true);
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Simulate tracking - in real app, this would call an API
    if (referenceNumber === "CHU-2024-00001" || referenceNumber.trim() !== "") {
      setTrackedApplication(applicationData);
    }
    setIsLoading(false);
  };

  // Auto-load application on mount
  useEffect(() => {
    if (referenceNumber) {
      handleTrack();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const progressSteps: ApplicationProgress[] = [
    {
      id: "submitted",
      title: "Application Submitted",
      description: "Your application has been received",
      completed: true,
      icon: <FileCheck className="size-4" />,
    },
    {
      id: "review",
      title: "Under Review",
      description: "Application is being reviewed by staff",
      completed: true,
      icon: <Clock className="size-4" />,
    },
    {
      id: "offer",
      title: "Offer Sent",
      description: "Conditional offer letter has been sent",
      completed: false,
      icon: <Tag className="size-4" />,
    },
    {
      id: "gs-assessment",
      title: "GS Assessment",
      description: "Genuine Student assessment in progress",
      completed: false,
      icon: <FileCheck className="size-4" />,
    },
    {
      id: "fee-payment",
      title: "Fee Payment",
      description: "Awaiting tuition fee payment",
      completed: false,
      icon: <DollarSign className="size-4" />,
    },
    {
      id: "coe-issued",
      title: "COE Issued",
      description: "Confirmation of Enrollment issued",
      completed: false,
      icon: <Check className="size-4" />,
    },
  ];

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isLoading) {
      handleTrack();
    }
  };

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
              Enter your reference number to check your application status.
            </p>
          </div>

          {/* Search Input - Centered */}
          <div className="mx-auto flex max-w-xl flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <Input
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="CHU-2024-00001"
                className="w-full"
                disabled={isLoading}
              />
            </div>
            <Button 
              onClick={handleTrack} 
              disabled={isLoading}
              className="w-full sm:w-auto sm:min-w-[120px]"
              size="lg"
            >
              <Search className="size-4" />
              <span>{isLoading ? "Tracking..." : "Track"}</span>
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground sm:text-sm">
            Your tracking ID was sent to your email when the application was
            submitted.
          </p>
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
                      Reference: <span className="font-mono font-semibold">{trackedApplication.reference}</span>
                    </CardDescription>
                  </div>
                  <Badge
                    variant="default"
                    className="w-fit bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 dark:bg-blue-500 sm:text-base sm:px-4 sm:py-2"
                  >
                    {trackedApplication.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
                  <div className="space-y-5">
                    <div className="space-y-2 rounded-lg border border-border/50 bg-muted/20 p-4 transition-colors hover:bg-muted/40">
                      <div className="flex items-center gap-2">
                        <User className="size-4 text-muted-foreground" />
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground sm:text-sm">
                          Student Name
                        </p>
                      </div>
                      <p className="text-base font-semibold text-foreground sm:text-lg">
                        {trackedApplication.studentName}
                      </p>
                    </div>
                    <div className="space-y-2 rounded-lg border border-border/50 bg-muted/20 p-4 transition-colors hover:bg-muted/40">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground sm:text-sm">
                        Destination
                      </p>
                      <p className="text-base font-semibold text-foreground sm:text-lg">
                        {trackedApplication.destination}
                      </p>
                    </div>
                    <div className="space-y-2 rounded-lg border border-border/50 bg-muted/20 p-4 transition-colors hover:bg-muted/40">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground sm:text-sm">
                        Submitted On
                      </p>
                      <p className="text-base font-semibold text-foreground sm:text-lg">
                        {trackedApplication.submittedOn}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-5">
                    <div className="space-y-2 rounded-lg border border-border/50 bg-muted/20 p-4 transition-colors hover:bg-muted/40">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground sm:text-sm">
                        Course
                      </p>
                      <p className="text-base font-semibold text-foreground sm:text-lg">
                        {trackedApplication.course}
                      </p>
                    </div>
                    <div className="space-y-2 rounded-lg border border-border/50 bg-muted/20 p-4 transition-colors hover:bg-muted/40">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground sm:text-sm">
                        Intake
                      </p>
                      <p className="text-base font-semibold text-foreground sm:text-lg">
                        {trackedApplication.intake}
                      </p>
                    </div>
                    <div className="space-y-2 rounded-lg border border-border/50 bg-muted/20 p-4 transition-colors hover:bg-muted/40">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground sm:text-sm">
                        Last Updated
                      </p>
                      <p className="text-base font-semibold text-foreground sm:text-lg">
                        {trackedApplication.lastUpdated}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

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
                  {progressSteps.map((step, index) => {
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
                  })}
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
                    <p className="text-base font-semibold text-foreground sm:text-lg">
                      Your application is under review.
                    </p>
                    <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                      Our team is reviewing your documents. You will be notified
                      of any updates via email.
                    </p>
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
                    <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                      Have questions about your application?{" "}
                      <span className="font-semibold text-foreground">
                        Contact your agent
                      </span>{" "}
                      or email us at:
                    </p>
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