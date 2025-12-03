"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  useApplicationGetQuery,
  useApplicationSubmitMutation,
} from "@/hooks/useApplication.hook";
import ApplicationStepHeader from "./application-step-header";

export default function ReviewForm() {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("applicationId");

  const { data: response, isLoading, isError } = useApplicationGetQuery(applicationId);
  const submitApplication = useApplicationSubmitMutation(applicationId);

  const application = response?.data;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Review your application</h3>
      </div>

      <div className="rounded-md border bg-muted/30 p-4 text-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <p className="text-destructive">Failed to load application.</p>
        ) : application ? (
          <pre className="whitespace-pre-wrap break-words text-xs">
            {JSON.stringify(application, null, 2)}
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
          disabled={submitApplication.isPending || !applicationId || isLoading}
        >
          {submitApplication.isPending ? "Submitting..." : "Submit Application"}
        </Button>
      </ApplicationStepHeader>
    </div>
  );
}
