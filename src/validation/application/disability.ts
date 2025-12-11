import { z } from "zod";

export const disabilitySchema = z.object({
  // Main question: "Yes" or "No"
  has_disability: z.enum(["Yes", "No"]),

  // Specific disabilities (Checkboxes)
  disability_hearing: z.boolean().default(false),
  disability_physical: z.boolean().default(false),
  disability_intellectual: z.boolean().default(false),
  disability_learning: z.boolean().default(false),
  disability_mental_illness: z.boolean().default(false),
  disability_acquired_brain: z.boolean().default(false),
  disability_vision: z.boolean().default(false),
  disability_medical_condition: z.boolean().default(false),
  disability_other: z.boolean().default(false),

  // Keep legacy fields optional to avoid breaking existing data structure if needed
  disability_type: z.string().optional(),
  disability_details: z.string().optional(),
  support_required: z.string().optional(),
  has_documentation: z.boolean().optional(),
  documentation_status: z.string().optional(),
  adjustments_needed: z.any().optional(), // permissive for now
});

export type DisabilityValues = z.output<typeof disabilitySchema>;
export type DisabilityFormValues = z.input<typeof disabilitySchema>;

export const defaultDisabilityValues: DisabilityFormValues = {
  has_disability: "No",
  disability_hearing: false,
  disability_physical: false,
  disability_intellectual: false,
  disability_learning: false,
  disability_mental_illness: false,
  disability_acquired_brain: false,
  disability_vision: false,
  disability_medical_condition: false,
  disability_other: false,
};
