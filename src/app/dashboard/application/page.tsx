"use client";

import { ApplicationTable } from "@/components/dashboard/applications/application-table";
import { Button } from "@/components/ui/button";
import useApplications from "@/hooks/useApplications.hook";

const AgentApplicationPage = () => {
  const {
    applications,
    total,
    page,
    maxPage,
    nextPage,
    prevPage,
    isLoading,
    isFetching,
    error,
  } = useApplications();

  const disableNext = isLoading || isFetching || page >= maxPage;
  const heading =
    isLoading && !applications.length
      ? "Loading applications..."
      : `Applications (${total ?? 0})`;

  return (
    <section className="space-y-6 wrapper w-full max-w-[100vw] overflow-x-hidden">
      <h1 className="text-3xl font-semibold text-foreground">{heading}</h1>

      {error ? (
        <div className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error.message}
        </div>
      ) : null}

      <ApplicationTable
        data={applications}
        isLoading={isLoading}
        isFetching={isFetching}
        isKanban={true}
      />

      <div className="flex flex-col gap-3 rounded-md border px-3 py-2 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p>
          Page {page} of {maxPage || 1} - {total} total application
          {total === 1 ? "" : "s"}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={prevPage}
            disabled={isLoading || isFetching || page <= 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={nextPage}
            disabled={isLoading || isFetching || disableNext}
          >
            Next
          </Button>
        </div>
      </div>
    </section>
  );
};

export default AgentApplicationPage;
