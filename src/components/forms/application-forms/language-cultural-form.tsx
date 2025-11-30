"use client";
import { Button } from "@/components/ui/button";
import {
  defaultLanguageAndCultureValues,
  languageAndCultureSchema,
  type LanguageAndCultureValues,
  type LanguageAndCultureFormValues,
} from "@/validation/application/language-cultural";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { FormInput } from "../../ui/forms/form-input";
import { useSearchParams } from "next/navigation";
import { useApplicationStepMutations } from "@/hooks/useApplicationSteps.hook";
import ApplicationStepHeader from "./application-step-header";

export default function LanguageDefaultForm() {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("applicationId");
  const languageMutation = useApplicationStepMutations(applicationId)[4];

  const methods = useForm<LanguageAndCultureFormValues>({
    resolver: zodResolver(languageAndCultureSchema),
    defaultValues: defaultLanguageAndCultureValues,
  });

  const onSubmit = (values: LanguageAndCultureFormValues) => {
    const payload: LanguageAndCultureValues =
      languageAndCultureSchema.parse(values);
    languageMutation.mutate(payload);
  };

  return (
    <FormProvider {...methods}>
      <form className="space-y-6" onSubmit={methods.handleSubmit(onSubmit)}>
        <div className="grid gap-4 md:grid-cols-2">
          <FormInput
            name="first_language"
            label="First language"
            placeholder="e.g. Nepali"
          />
          <FormInput
            name="english_proficiency"
            label="English proficiency"
            placeholder="e.g. Advanced"
          />
          <FormInput name="indigenous_status" label="Indigenous status" />
          <FormInput
            name="country_of_birth"
            label="Country of birth"
            placeholder="e.g. Nepal"
          />
          <FormInput
            name="citizenship_status"
            label="Citizenship status"
            placeholder="e.g. Citizen / PR"
          />
          <FormInput
            name="visa_type"
            label="Visa type"
            placeholder="Student visa"
          />
          <FormInput name="visa_expiry" label="Visa expiry" type="date" />
          <FormInput
            name="english_test_type"
            label="English test type"
            placeholder="IELTS / PTE"
          />
          <FormInput
            name="english_test_score"
            label="English test score"
            placeholder="e.g. 7.0"
          />
          <FormInput
            name="english_test_date"
            type="date"
            label="English test date"
          />
        </div>

        {/* Other languages as comma-separated input */}
        <FormInput
          name="other_languages"
          label="Other languages"
          placeholder="Enter languages separated by commas (e.g., Hindi, English, Newari)"
        />

        <ApplicationStepHeader className="mt-4">
          <Button type="submit" disabled={languageMutation.isPending}>
            {languageMutation.isPending ? "Saving..." : "Save & Continue"}
          </Button>
        </ApplicationStepHeader>
      </form>
    </FormProvider>
  );
}
