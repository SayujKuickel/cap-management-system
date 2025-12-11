import { z } from "zod";

export const employmentEntrySchema = z.object({
  employer: z.string().optional(),
  role: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  is_current: z.boolean().optional(),
  responsibilities: z.string().optional(),
  industry: z.string().optional(),
});

export const employmentSchema = z.object({
  employment_status: z.string().optional(),
  entries: z.array(employmentEntrySchema).optional(),
});

export type EmploymentFormValues = z.infer<typeof employmentSchema>;

export const createEmptyEmploymentEntry =
  (): z.infer<typeof employmentEntrySchema> => ({
    employer: "",
    role: "",
    start_date: "",
    end_date: "",
    is_current: false,
    responsibilities: "",
    industry: "",
  });

export const defaultEmploymentValues: EmploymentFormValues = {
  employment_status: "",
  entries: [createEmptyEmploymentEntry()],
};
