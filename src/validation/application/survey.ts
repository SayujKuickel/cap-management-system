import { z } from "zod";

export const responseSchema = z.object({
  question_id: z.string().min(1, "Question ID is required"),
  question_text: z.string().min(1, "Question text is required"),
  answer: z.string().min(1, "Please provide an answer"),
  answer_type: z.string().min(1, "Answer type is required"),
});

export const surveySchema = z.object({
  responses: z.array(responseSchema).min(1, "Add at least one response"),
  how_did_you_hear: z.string().min(1, "Tell us how you heard about us"),
  referral_source: z.string().min(1, "Referral source is required"),
});

export type SurveyValues = z.infer<typeof surveySchema>;

export const createEmptySurveyResponse =
  (): SurveyValues["responses"][number] => ({
    question_id: "",
    question_text: "",
    answer: "",
    answer_type: "",
  });
