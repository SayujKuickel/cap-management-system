import { z } from "zod";

export const languageAndCultureSchema = z.object({
  first_language: z.string().min(1, "Please enter your first language"),
  english_proficiency: z
    .string()
    .min(1, "Please tell us your English proficiency"),
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
  indigenous_status: z.string().min(1, "Indigenous status is required"),
  country_of_birth: z.string().min(1, "Country of birth is required"),
  citizenship_status: z.string().min(1, "Citizenship status is required"),
  visa_type: z.string().min(1, "Visa type is required"),
  visa_expiry: z.string().min(1, "Visa expiry is required"),
  english_test_type: z.string().min(1, "English test type is required"),
  english_test_score: z.string().min(1, "English test score is required"),
  english_test_date: z.string().min(1, "English test date is required"),
});

export type LanguageAndCultureValues = z.output<
  typeof languageAndCultureSchema
>;
export type LanguageAndCultureFormValues = z.input<
  typeof languageAndCultureSchema
>;

export const defaultLanguageAndCultureValues: LanguageAndCultureFormValues = {
  first_language: "",
  english_proficiency: "",
  other_languages: "",
  indigenous_status: "",
  country_of_birth: "",
  citizenship_status: "",
  visa_type: "",
  visa_expiry: "",
  english_test_type: "",
  english_test_score: "",
  english_test_date: "",
};
