import { z } from "zod";

export const usiSchema = z.object({
  usi: z.string().optional().refine((val) => !val || (val.length >= 10 && val.length <= 10), "USI must be exactly 10 characters").refine((val) => val && val.length > 0, "USI is required"),
  consent_to_verify: z.boolean().optional().refine((v) => v === true, {
    message: "You must give permission.",
  }),
});

export type USIValues = z.infer<typeof usiSchema>;

export const defaultUSIValues: USIValues = {
  usi: "",
  consent_to_verify: false,
};
