import { Controller, useFormContext } from "react-hook-form";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface FormRadioProps {
  name: string;
  label: string;
  options: string[];
}

export function FormRadio({ name, label, options }: FormRadioProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext<Record<string, unknown>>();

  const error = (errors[name] as { message?: string } | undefined)?.message;

  return (
    <div className="space-y-1">
      <Label>{label}</Label>

      <Controller
        name={name}
        control={control}
        render={({ field: { value, onChange } }) => (
          <RadioGroup
            value={value as string}
            onValueChange={onChange}
            className="flex gap-4 flex-wrap"
          >
            {options.map((option) => (
              <Label
                key={option}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <RadioGroupItem value={option} />
                <span>{option}</span>
              </Label>
            ))}
          </RadioGroup>
        )}
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
