"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  useApplicationGetMutation,
  useApplicationSubmitMutation,
} from "@/hooks/useApplication.hook";
import ApplicationStepHeader from "./application-step-header";

export default function ReviewForm() {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("applicationId");

  const {
    mutate: fetchApplication,
    data,
    isPending,
    isError,
  } = useApplicationGetMutation(applicationId);
  const submitApplication = useApplicationSubmitMutation(applicationId);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // Avoid repeated fetches that can lead to aborted requests
    if (applicationId && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchApplication();
    }
  }, [applicationId, fetchApplication]);

  useEffect(() => {
    // Reset guard if application id changes
    hasFetchedRef.current = false;
  }, [applicationId]);

  const applicationData = data?.data;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Review your application</h3>
      </div>

      <div className="rounded-md border bg-muted/30 p-4 text-sm">
        {isPending ? (
          <p>Loading application...</p>
        ) : isError ? (
          <p className="text-destructive">Failed to load application.</p>
        ) : applicationData ? (
          <pre className="whitespace-pre-wrap break-words text-xs">
            {JSON.stringify(applicationData, null, 2)}
          </pre>
        ) : (
          <p className="text-muted-foreground">
            No application data available.
          </p>
        )}
      </div>

      <ApplicationStepHeader className="mt-4">
        <Button
          onClick={() => {
            if (applicationId) {
              submitApplication.mutate();
            }
          }}
          disabled={submitApplication.isPending || !applicationId}
        >
          {submitApplication.isPending ? "Submitting..." : "Submit Application"}
        </Button>
      </ApplicationStepHeader>
    </div>
  );
}
