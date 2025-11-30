import { useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface FormArrayInputProps {
  name: string;
  index: number;
  placeholder?: string;
  onRemove: () => void;
}

export function FormArrayInput({
  name,
  index,
  placeholder,
  onRemove,
}: FormArrayInputProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<Record<string, unknown[]>>();

  const fieldName = `${name}.${index}` as const;
  const fieldError =
    (errors[name]?.[index] as { message?: string } | undefined)?.message;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Input
          placeholder={placeholder}
          {...register(fieldName)}
          className="flex-1"
        />

        <Button type="button" variant="ghost" size="icon" onClick={onRemove}>
          Remove
        </Button>
      </div>

      {fieldError && <p className="text-sm text-red-500">{fieldError}</p>}
    </div>
  );
}
