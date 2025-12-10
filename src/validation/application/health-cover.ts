import { z } from "zod";

export const healthCoverSchema = z.object({
  provider: z.string().optional().refine((val) => val && val.length > 0, "Provider is required"),
  policy_number: z.string().optional().refine((val) => val && val.length > 0, "Policy number is required"),
  start_date: z.string().optional().refine((val) => val && val.length > 0, "Start date is required"),
  end_date: z.string().optional().refine((val) => val && val.length > 0, "End date is required"),
  coverage_type: z.string().optional().refine((val) => val && val.length > 0, "Coverage type is required"),
  cost: z.number().nonnegative("Cost must be zero or positive").optional(),
}).superRefine((val, ctx) => {
  if (!val.start_date || !val.end_date) {
    return; // Skip validation if dates are not provided
  }

  const start = new Date(val.start_date);
  const end = new Date(val.end_date);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return;
  }

  if (end <= start) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["end_date"],
      message: "End date must be after the start date",
    });
  }
});

export type HealthCoverValues = z.infer<typeof healthCoverSchema>;

export const defaultHealthCoverValues: HealthCoverValues = {
  provider: "",
  policy_number: "",
  start_date: "",
  end_date: "",
  coverage_type: "",
  cost: 0,
};
