import { Suspense } from "react";
import NewApplicationForm from "@/components/forms/application-forms/new-application-form";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

const LoadingFallback = () => {
  return (
    <div className="mx-auto w-full">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="px-2 py-3">
              <Skeleton className="h-1 w-full mb-2" />
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="pt-6">
              <Skeleton className="h-8 w-48 mb-6" />
              <Skeleton className="h-96 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const NewApplicationPage = () => {
  return (
    <section className="space-y-6" style={{ overflow: 'visible', position: 'relative' }}>
      <div>
        <h1 className="text-3xl font-semibold text-foreground">
          New Application
        </h1>
        <p className="text-muted-foreground">
          Complete each step to submit a new student application.
        </p>
      </div>

      <Suspense fallback={<LoadingFallback />}>
        <NewApplicationForm />
      </Suspense>
    </section>
  );
};

export default NewApplicationPage;
