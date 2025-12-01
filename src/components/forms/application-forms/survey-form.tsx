"use client";

import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/forms/form-input";
import { useSearchParams } from "next/navigation";
import { useApplicationStepMutations } from "@/hooks/useApplicationSteps.hook";
import ApplicationStepHeader from "./application-step-header";
import {
  createEmptySurveyResponse,
  surveySchema,
  type SurveyValues,
} from "@/validation/application/survey";
import { useFormPersistence } from "@/hooks/useFormPersistence.hook";

export default function SurveyForm() {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("applicationId");
  const stepId = 12; // Survey is step 12
  const surveyMutation = useApplicationStepMutations(applicationId)[stepId];

  const methods = useForm<SurveyValues>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      responses: [createEmptySurveyResponse()],
      how_did_you_hear: "",
      referral_source: "",
    },
  });

  // Enable automatic form persistence
  const { saveOnSubmit } = useFormPersistence({
    applicationId,
    stepId,
    form: methods,
    enabled: !!applicationId,
  });

  const { control, handleSubmit } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "responses",
  });

  const canAddMore = fields.length < 10;

  const onSubmit = (values: SurveyValues) => {
    // Save to localStorage before submitting to API
    if (applicationId) {
      saveOnSubmit(values);
    }
    surveyMutation.mutate(values);
  };

  return (
    <FormProvider {...methods}>
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Survey Responses</h3>

          {fields.map((field, index) => (
            <div key={field.id} className="space-y-4 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Question {index + 1}</p>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                  >
                    Remove
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  name={`responses.${index}.question_id`}
                  label="Question ID"
                  placeholder="Q1"
                />

                <FormInput
                  name={`responses.${index}.answer_type`}
                  label="Answer Type"
                  placeholder="e.g. text, single_choice"
                />

                <FormInput
                  name={`responses.${index}.question_text`}
                  label="Question Text"
                  placeholder="How did you hear about us?"
                />

                <FormInput
                  name={`responses.${index}.answer`}
                  label="Answer"
                  placeholder="Your answer"
                />
              </div>
            </div>
          ))}

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!canAddMore}
              onClick={() => append(createEmptySurveyResponse())}
            >
              Add Question
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            name="how_did_you_hear"
            label="How did you hear about us?"
            placeholder="Friend, social media, agent, etc."
          />

          <FormInput
            name="referral_source"
            label="Referral Source"
            placeholder="Name of agent / website / organisation"
          />
        </div>

        <ApplicationStepHeader className="mt-4">
          <Button type="submit" disabled={surveyMutation.isPending}>
            {surveyMutation.isPending ? "Saving..." : "Save & Continue"}
          </Button>
        </ApplicationStepHeader>
      </form>
    </FormProvider>
  );
}
