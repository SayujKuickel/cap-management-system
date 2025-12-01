"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FormInput } from "@/components/ui/forms/form-input";
import { FormCheckbox } from "@/components/ui/forms/form-checkbox";
import { FormStepWrapper } from "../FormStepWrapper";
import {
  emergencyContactsSchema,
  createEmptyContact,
  type EmergencyContactsValues,
} from "@/validation/application/emergency-contacts";
import { Trash2 } from "lucide-react";

/**
 * Simplified Emergency Contact Form
 */
function ContactFields() {
  const { control } = useFormContext<EmergencyContactsValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "contacts",
  });

  const canAddMore = fields.length < 3;

  return (
    <div className="space-y-6">
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

      {fields.map((field, index) => (
        <div key={field.id} className="border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Contact {index + 1}</h4>
            {fields.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              name={`contacts.${index}.name`}
              label="Full Name"
              placeholder="Jane Doe"
            />
            <FormInput
              name={`contacts.${index}.relationship`}
              label="Relationship"
              placeholder="Mother"
            />
            <FormInput
              name={`contacts.${index}.phone`}
              label="Phone"
              placeholder="+61 400 123 456"
            />
            <FormInput
              name={`contacts.${index}.email`}
              label="Email"
              type="email"
              placeholder="jane.doe@example.com"
            />
            <FormInput
              name={`contacts.${index}.address`}
              label="Address"
              placeholder="123 Main St, City"
            />
            <FormCheckbox
              name={`contacts.${index}.is_primary`}
              label="Primary Contact"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function EmergencyContactFormSimplified() {
  return (
    <FormStepWrapper
      stepId={3}
      schema={emergencyContactsSchema}
      defaultValues={{
        contacts: [createEmptyContact()],
      }}
    >
      {() => <ContactFields />}
    </FormStepWrapper>
  );
}
