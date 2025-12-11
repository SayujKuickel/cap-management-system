import { z } from "zod";

export const schoolingSchema = z.object({
  // Highest Completed School Level
  highest_school_level: z.string().optional(),

  // Currently Attending
  still_attending: z.enum(["Yes", "No"]).optional(),

  // Secondary School Type (Conditional)
  secondary_school_type: z.string().optional(),
});

export type SchoolingValues = z.output<typeof schoolingSchema>;

export const defaultSchoolingValues: SchoolingValues = {
  highest_school_level: "",
  still_attending: "No",
  secondary_school_type: "",
};
