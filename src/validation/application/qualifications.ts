import { z } from "zod";

export const qualificationSchema = z.object({
  qualification_name: z.string().min(1, "Qualification name is required"),
  institution: z.string().min(1, "Institution name is required"),
  completion_date: z.string().min(1, "Completion date is required"),
  certificate_number: z
    .string()
    .min(1, "Certificate number is required"),
  field_of_study: z.string().min(1, "Field of study is required"),
  grade: z.string().min(1, "Grade/score is required"),
});

export const qualificationsSchema = z.object({
  qualifications: z
    .array(qualificationSchema)
    .min(1, "Add at least one qualification"),
});

export type QualificationsFormValues = z.infer<typeof qualificationsSchema>;

export const createEmptyQualification =
  (): QualificationsFormValues["qualifications"][number] => ({
    qualification_name: "",
    institution: "",
    completion_date: "",
    certificate_number: "",
    field_of_study: "",
    grade: "",
  });
