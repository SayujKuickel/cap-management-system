import { z } from "zod";

export const qualificationSchema = z.object({
  qualification_name: z.string().optional().refine((val) => val && val.length > 0, "Qualification name is required"),
  institution: z.string().optional().refine((val) => val && val.length > 0, "Institution name is required"),
  completion_date: z.string().optional().refine((val) => val && val.length > 0, "Completion date is required"),
  certificate_number: z.string().optional().refine((val) => val && val.length > 0, "Certificate number is required"),
  field_of_study: z.string().optional().refine((val) => val && val.length > 0, "Field of study is required"),
  grade: z.string().optional().refine((val) => val && val.length > 0, "Grade/score is required"),
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
