"use client";

import { useForm, FormProvider, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FormRadio } from "../../ui/forms/form-radio";
import { useSearchParams } from "next/navigation";
import { useApplicationStepMutations } from "@/hooks/useApplicationSteps.hook";
import ApplicationStepHeader from "./application-step-header";
import {
  schoolingSchema,
  type SchoolingValues,
  defaultSchoolingValues,
} from "@/validation/application/schooling";
import { useFormPersistence } from "@/hooks/useFormPersistence.hook";

export default function SchoolingForm() {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("applicationId");
  const stepId = 6; // Schooling is step 6
  const schoolingMutation = useApplicationStepMutations(applicationId)[stepId];

  const methods = useForm<SchoolingValues>({
    resolver: zodResolver(schoolingSchema),
    defaultValues: defaultSchoolingValues,
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  // Enable automatic form persistence
  const { saveOnSubmit } = useFormPersistence({
    applicationId,
    stepId,
    form: methods,
    enabled: !!applicationId,
  });

  const stillAttending = useWatch({
    control: methods.control,
    name: "still_attending",
  });

  // Reset secondary school type if not attending
  useEffect(() => {
    if (stillAttending === "No") {
      methods.setValue("secondary_school_type", "");
    }
  }, [stillAttending, methods]);

  const onSubmit = (values: SchoolingValues) => {
    if (applicationId) {
      saveOnSubmit(values);
    }
    schoolingMutation.mutate(values);
  };

  return (
    <FormProvider {...methods}>
      <form className="space-y-8" onSubmit={methods.handleSubmit(onSubmit)}>
        <section className="space-y-6">
          <div className="space-y-8">
            {/* Highest Completed School Level */}
            <div>
              <p className="text-sm mb-1">What is your highest COMPLETED school level?</p>
              <p className="text-xs text-muted-foreground mb-5 leading-relaxed">
                If you are currently enrolled in secondary education, the Highest school level completed refers to the highest school level you have actually completed and not the level you are currently undertaking. For example, if you are currently in Year 10 the Highest school level completed is Year 9
              </p>
              <FormRadio
                name="highest_school_level"
                label=""
                options={[
                  "02 - Did not go to School",
                  "08 - Year 8 or below",
                  "09 - Year 9 or below",
                  "10 - Completed year 10",
                  "11 - Completed year 11",
                  "12 - Completed year 12",
                  "@@ - Not Specified",
                ]}
              />
            </div>

            {/* Currently Attending */}
            <div>
              <p className="text-sm mb-3">Are you still attending secondary school?</p>
              <FormRadio
                name="still_attending"
                label=""
                options={["Yes", "No"]}
              />
            </div>

            {/* Secondary School Type - Conditional */}
            {stillAttending === "Yes" && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-sm mb-3">If Yes, What is your secondary school?</p>
                <div className="pl-1">
                  <FormRadio
                    name="secondary_school_type"
                    label=""
                    options={[
                      "School (Government)",
                      "School (Catholic)",
                      "School (Independent)",
                      "Technical and Further Education institute",
                      "Community based adult education provider",
                      "Privately Operated registered training organisation",
                      "Home school arrangement"
                    ]}
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        <ApplicationStepHeader className="mt-8 pt-6 border-t">
          <Button type="submit" disabled={schoolingMutation.isPending}>
            {schoolingMutation.isPending ? "Saving..." : "Save & Continue"}
          </Button>
        </ApplicationStepHeader>
      </form>
    </FormProvider>
  );
}
