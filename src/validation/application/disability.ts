import { z } from "zod";

export const disabilitySchema = z
  .object({
    has_disability: z.boolean(),
    disability_type: z.string().optional(),
    disability_details: z.string().optional(),
    support_required: z.string().optional(),
    has_documentation: z.boolean(),
    documentation_status: z.string().optional(),
    adjustments_needed: z.preprocess(
      (val) => {
        if (typeof val === "string") {
          return val
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item !== "");
        }
        if (Array.isArray(val)) {
          return (val as unknown[])
            .filter((item): item is string => typeof item === "string")
            .map((item) => item.trim())
            .filter((item) => item !== "");
        }
        return [];
      },
      z.array(z.string().min(1, "Adjustment cannot be empty")).default([]),
    ),
  })
  .superRefine((val, ctx) => {
    if (val.has_disability) {
      if (!val.disability_type?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["disability_type"],
          message: "Disability type is required",
        });
      }
      if (!val.disability_details?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["disability_details"],
          message: "Disability details are required",
        });
      }
      if (!val.support_required?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["support_required"],
          message: "Support required is required",
        });
      }
    }

    if (val.has_documentation) {
      if (!val.documentation_status?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["documentation_status"],
          message: "Documentation status is required",
        });
      }
      if (!val.adjustments_needed || val.adjustments_needed.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["adjustments_needed"],
          message: "Please provide any adjustments needed",
        });
      }
    }
  });

export type DisabilityValues = z.output<typeof disabilitySchema>;
export type DisabilityFormValues = z.input<typeof disabilitySchema>;

export const defaultDisabilityValues: DisabilityFormValues = {
  has_disability: false,
  disability_type: "",
  disability_details: "",
  support_required: "",
  has_documentation: false,
  documentation_status: "",
  adjustments_needed: "",
};
