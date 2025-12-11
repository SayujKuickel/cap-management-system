import { Controller, useFormContext, useFormState } from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { getFieldError } from "./form-errors";

interface FormCheckboxProps {
  name: string;
  label: string;
}

export function FormCheckbox({ name, label }: FormCheckboxProps) {
  const { control } = useFormContext<Record<string, unknown>>();

  const { errors } = useFormState({ control, name });
  const error = getFieldError(errors, name)?.message;

  return (
    <div className="flex items-center gap-2">
      <Controller
        name={name}
        control={control}
        render={({ field: { value, onChange, ref } }) => (
          <Checkbox
            id={name}
            ref={ref}
            checked={Boolean(value)}
            onCheckedChange={(checked) => onChange(checked === true)}
          />
        )}
      />

      <Label className="cursor-pointer select-none font-normal" htmlFor={name}>
        {label}
      </Label>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
