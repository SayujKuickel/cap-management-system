// components/form/form-textarea.tsx
import { useFormContext, useFormState } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getFieldError } from "./form-errors";

interface FormTextareaProps {
    name: string;
    label: string;
    placeholder?: string;
    description?: string;
    rows?: number;
}

export function FormTextarea({
    name,
    label,
    placeholder,
    description,
    rows = 4,
}: FormTextareaProps) {
    const { register, control } = useFormContext();

    const { errors } = useFormState({ control, name });

    const error = getFieldError(errors, name)?.message as string | undefined;

    return (
        <div className="space-y-1">
            <Label htmlFor={name}>{label}</Label>

            <Textarea
                id={name}
                placeholder={placeholder}
                rows={rows}
                {...register(name)}
            />

            {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
            )}

            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
}
