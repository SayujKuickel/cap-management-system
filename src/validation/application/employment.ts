import { z } from "zod";

export const employmentEntrySchema = z.object({
  employer: z.string().min(1, "Employer name is required"),
  role: z.string().min(1, "Job title/role is required"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  is_current: z.boolean(),
  responsibilities: z.string().min(1, "Responsibilities are required"),
  industry: z.string().min(1, "Industry is required"),
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
