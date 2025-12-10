"use client";

import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { FormInput } from "../../ui/forms/form-input";
import { FormCheckbox } from "../../ui/forms/form-checkbox";
import { FormSelect } from "../../ui/forms/form-select";
import { useSearchParams } from "next/navigation";
import { useApplicationStepMutations } from "@/hooks/useApplicationSteps.hook";
import ApplicationStepHeader from "./application-step-header";
import {
  createEmptyContact,
  emergencyContactsSchema,
  type EmergencyContactsValues,
} from "@/validation/application/emergency-contacts";
import { useFormPersistence } from "@/hooks/useFormPersistence.hook";

export default function EmergencyContactForm() {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("applicationId");
  const stepId = 3; // Emergency Contact is step 3
  const emergencyContactMutation =
    useApplicationStepMutations(applicationId)[stepId];

  const methods = useForm<EmergencyContactsValues>({
    resolver: zodResolver(emergencyContactsSchema),
    defaultValues: {
      contacts: [createEmptyContact()],
    },
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

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "contacts",
  });

  const canAddMore = fields.length < 3;

  return (
    <FormProvider {...methods}>
      <form
        className="space-y-6"
        onSubmit={handleSubmit((values) => {
          // Save to Zustand store before submitting to API
          if (applicationId) {
            saveOnSubmit(values);
          }
          emergencyContactMutation.mutate(values);
        })}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Emergency Contacts</h3>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append(createEmptyContact())}
            disabled={!canAddMore}
          >
            Add Contact
          </Button>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => {
            const contactError = errors.contacts?.[index];

            return (
              <div key={field.id} className="space-y-4 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Contact {index + 1}</p>

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

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormInput
                    name={`contacts.${index}.name`}
                    label="Name"
                    placeholder="Jane Doe"
                  />
                  <FormSelect
                    name={`contacts.${index}.relationship`}
                    label="Relationship"
                    placeholder="Select relationship"
                    options={[
                      { value: "parent", label: "Parent" },
                      { value: "sibling", label: "Sibling" },
                      { value: "spouse", label: "Spouse/Partner" },
                      { value: "relative", label: "Relative" },
                      { value: "friend", label: "Friend" },
                      { value: "other", label: "Other" },
                    ]}
                  />
                  <FormInput
                    name={`contacts.${index}.phone`}
                    label="Phone"
                    placeholder="+61 400 000 000"
                  />
                  <FormInput
                    name={`contacts.${index}.email`}
                    label="Email"
                    placeholder="user@example.com"
                    type="email"
                  />
                </div>

                <FormInput
                  name={`contacts.${index}.address`}
                  label="Address"
                  placeholder="123 Main Street, Suburb"
                />

                <FormCheckbox
                  name={`contacts.${index}.is_primary`}
                  label="Primary contact"
                />

                {contactError?.root?.message && (
                  <p className="text-sm text-red-500">
                    {contactError.root.message}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <ApplicationStepHeader className="mt-4">
          <Button
            type="submit"
            disabled={emergencyContactMutation.isPending}
          >
            {emergencyContactMutation.isPending
              ? "Saving..."
              : "Save & Continue"}
          </Button>
        </ApplicationStepHeader>
      </form>
    </FormProvider>
  );
}
