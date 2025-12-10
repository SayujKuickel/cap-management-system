import { z } from "zod";

export const employmentEntrySchema = z.object({
  employer: z.string().optional().refine((val) => val && val.length > 0, "Employer name is required"),
  role: z.string().optional().refine((val) => val && val.length > 0, "Job title/role is required"),
  start_date: z.string().optional().refine((val) => val && val.length > 0, "Start date is required"),
  end_date: z.string().optional().refine((val) => val && val.length > 0, "End date is required"),
  is_current: z.boolean().optional(),
  responsibilities: z.string().optional().refine((val) => val && val.length > 0, "Responsibilities are required"),
  industry: z.string().optional().refine((val) => val && val.length > 0, "Industry is required"),
});

export const employmentSchema = z.object({
  entries: z.array(employmentEntrySchema).min(1, "Add at least one entry"),
});

export type EmploymentFormValues = z.infer<typeof employmentSchema>;

export const createEmptyEmploymentEntry =
  (): EmploymentFormValues["entries"][number] => ({
    employer: "",
    role: "",
    start_date: "",
    end_date: "",
    is_current: false,
    responsibilities: "",
    industry: "",
  });
