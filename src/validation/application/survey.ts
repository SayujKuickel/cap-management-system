import { z } from "zod";



export const surveySchema = z.object({

  availability_status: z.string().optional().refine((val) => val && val.length > 0, "Please select an availability status"),
});

export type SurveyValues = z.infer<typeof surveySchema>;

export const createEmptySurveyResponse =
  (): SurveyValues => ({
    availability_status: "",
  });
