"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { FormInput } from "../../ui/forms/form-input";
import { FormRadio } from "../../ui/forms/form-radio";
import { useSearchParams } from "next/navigation";
import { useApplicationStepMutations } from "@/hooks/useApplicationSteps.hook";
import {
  defaultPersonalDetailsValues,
  personalDetailsSchema,
  type PersonalDetailsValues,
} from "@/validation/application/personal-details";
import ApplicationStepHeader from "./application-step-header";

export default function PersonalDetailsForm() {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("applicationId");
  const personalDetailsMutation = useApplicationStepMutations(applicationId)[1];

  const methods = useForm<PersonalDetailsValues>({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: defaultPersonalDetailsValues,
  });

  const onSubmit = (values: PersonalDetailsValues) => {
    personalDetailsMutation.mutate(values);
  };

  return (
    <FormProvider {...methods}>
      <form className="space-y-8" onSubmit={methods.handleSubmit(onSubmit)}>
        <section className="space-y-4">
          <div>
            <h3 className="mb-1 font-medium">Personal Information</h3>
            <Separator />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              name="given_name"
              label="Given Name"
              placeholder="John"
            />
            <FormInput
              name="middle_name"
              label="Middle Name"
              placeholder="Michael"
            />
            <FormInput
              name="family_name"
              label="Family Name"
              placeholder="Doe"
            />

            <FormRadio
              name="gender"
              label="Gender"
              options={["Male", "Female", "Other"]}
            />

            <FormInput name="date_of_birth" label="Date of Birth" type="date" />
            <FormInput
              name="phone"
              label="Phone"
              placeholder="+61 400 123 456"
            />
            <FormInput
              name="email"
              label="Email"
              type="email"
              placeholder="john.doe@example.com"
            />
          </div>
        </section>

        {/* PASSPORT & NATIONALITY */}
        <section className="space-y-4">
          <div>
            <h3 className="mb-1 font-medium">Passport & Nationality</h3>
            <Separator />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              name="country"
              label="Country of Residence"
              placeholder="Australia"
            />
            <FormInput
              name="country_of_birth"
              label="Country of Birth"
              placeholder="Nepal"
            />
            <FormInput
              name="nationality"
              label="Nationality"
              placeholder="Nepalese"
            />
            <FormInput
              name="passport_number"
              label="Passport Number"
              placeholder="AB1234567"
            />
            <FormInput
              name="passport_expiry"
              label="Passport Expiry"
              type="date"
            />
          </div>
        </section>

        {/* ADDRESS */}
        <section className="space-y-4">
          <div>
            <h3 className="mb-1 font-medium">Address</h3>
            <Separator />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              name="street_address"
              label="Street Address"
              placeholder="123 Main Street"
            />
            <FormInput name="suburb" label="Suburb" placeholder="Sydney" />
            <FormInput name="state" label="State" placeholder="NSW" />
            <FormInput name="postcode" label="Postcode" placeholder="2000" />
          </div>
        </section>

        <ApplicationStepHeader className="mt-4">
          <Button type="submit" disabled={personalDetailsMutation.isPending}>
            {personalDetailsMutation.isPending
              ? "Saving..."
              : "Save & Continue"}
          </Button>
        </ApplicationStepHeader>
      </form>
    </FormProvider>
  );
}
