import { z } from "zod";

export const languageAndCultureSchema = z.object({
  // Aboriginal/Torres Strait Islander origin
  aboriginal_torres_strait: z.string().optional(),

  // Main Language
  is_english_main_language: z.string().optional(),
  main_language: z.string().optional(),

  // English Proficiency
  english_speaking_proficiency: z.string().optional(),

  // Previous studies
  english_instruction_previous_studies: z.string().optional(),

  // English Test
  completed_english_test: z.string().optional(),
  english_test_type: z.string().optional(),
  english_test_date: z.string().optional(),
  english_test_listening: z.string().optional(),
  english_test_writing: z.string().optional(),
  english_test_reading: z.string().optional(),
  english_test_speaking: z.string().optional(),
  english_test_overall: z.string().optional(),

  // Kept for backward compatibility
  first_language: z.string().optional(),
  english_proficiency: z.string().optional(),
  other_languages: z.preprocess((val) => {
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
  }, z.array(z.string().min(1, "Other languages cannot be empty")).default([])),
  indigenous_status: z.string().optional(),
  country_of_birth: z.string().optional(),
  citizenship_status: z.string().optional(),
  visa_type: z.string().optional(),
  visa_expiry: z.string().optional(),
  english_test_score: z.string().optional(),
});

export type LanguageAndCultureValues = z.output<
  typeof languageAndCultureSchema
>;
export type LanguageAndCultureFormValues = z.input<
  typeof languageAndCultureSchema
>;

export const defaultLanguageAndCultureValues: LanguageAndCultureFormValues = {
  // New fields
  aboriginal_torres_strait: "",
  is_english_main_language: "",
  main_language: "",
  english_speaking_proficiency: "",
  english_instruction_previous_studies: "",
  completed_english_test: "",
  english_test_type: "",
  english_test_date: "",
  english_test_listening: "",
  english_test_writing: "",
  english_test_reading: "",
  english_test_speaking: "",
  english_test_overall: "",

  // Legacy fields
  first_language: "",
  english_proficiency: "",
  other_languages: "",
  indigenous_status: "",
  country_of_birth: "",
  citizenship_status: "",
  visa_type: "",
  visa_expiry: "",
  english_test_score: "",
};
