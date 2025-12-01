"use client";

import { Separator } from "@/components/ui/separator";
import { FormInput } from "@/components/ui/forms/form-input";
import { FormRadio } from "@/components/ui/forms/form-radio";
import { FormStepWrapper } from "../FormStepWrapper";
import {
  personalDetailsSchema,
  defaultPersonalDetailsValues,
  type PersonalDetailsValues,
} from "@/validation/application/personal-details";

/**
 * Simplified Personal Details Form
 * Uses FormStepWrapper for all common logic
 */
export default function PersonalDetailsFormSimplified() {
  return (
    <FormStepWrapper
      stepId={2}
      schema={personalDetailsSchema}
      defaultValues={defaultPersonalDetailsValues}
    >
      {() => (
        <>
          {/* Personal Information */}
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

          {/* Passport & Nationality */}
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

          {/* Address */}
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
        </>
      )}
    </FormStepWrapper>
  );
}

