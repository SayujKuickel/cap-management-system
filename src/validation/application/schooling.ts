import { z } from "zod";

export const schoolingEntrySchema = z.object({
  institution: z.string().optional().refine((val) => val && val.length > 0, "Institution is required"),
  country: z.string().optional().refine((val) => val && val.length > 0, "Country is required"),
  qualification_level: z.string().optional().refine((val) => val && val.length > 0, "Qualification level is required"),
  start_year: z.number().int().nonnegative("Start year must be 0 or positive").optional(),
  end_year: z.number().int().nonnegative("End year must be 0 or positive").optional(),
  currently_attending: z.boolean().optional(),
  result: z.string().optional().refine((val) => val && val.length > 0, "Result is required"),
  field_of_study: z.string().optional().refine((val) => val && val.length > 0, "Field of study is required"),
});

export const schoolingSchema = z.object({
  entries: z
    .array(schoolingEntrySchema)
    .min(1, "Add at least one schooling entry"),
});

export type SchoolingValues = z.infer<typeof schoolingSchema>;

export const createEmptySchoolingEntry =
  (): SchoolingValues["entries"][number] => ({
    institution: "",
    country: "",
    qualification_level: "",
    start_year: 0,
    end_year: 0,
    currently_attending: false,
    result: "",
    field_of_study: "",
  });
