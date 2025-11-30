import { z } from "zod";

export const schoolingEntrySchema = z.object({
  institution: z.string().min(1, "Institution is required"),
  country: z.string().min(1, "Country is required"),
  qualification_level: z
    .string()
    .min(1, "Qualification level is required"),
  start_year: z.number().int().nonnegative("Start year must be 0 or positive"),
  end_year: z.number().int().nonnegative("End year must be 0 or positive"),
  currently_attending: z.boolean(),
  result: z.string().min(1, "Result is required"),
  field_of_study: z.string().min(1, "Field of study is required"),
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
