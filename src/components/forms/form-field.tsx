"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  description?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}

const FormField = ({
  label,
  htmlFor,
  required,
  description,
  error,
  children,
  className,
}: FormFieldProps) => {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-col gap-1">
        <Label
          htmlFor={htmlFor}
          className={cn(
            "text-sm font-medium text-foreground",
            required && "after:ml-1 after:text-destructive after:content-['*']",
          )}
        >
          {label}
        </Label>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
};

export default FormField;
