import { z } from "zod";

export const serviceSchema = z.object({
  service_id: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  fee: z.number().optional(),
  selected: z.boolean().optional(),
});

export const additionalServicesSchema = z.object({
  request_additional_services: z.enum(["Yes", "No"]),
  services: z.array(serviceSchema).optional(),
}).superRefine((val, ctx) => {
  if (val.request_additional_services === "Yes") {
    // If Yes is selected, we might want to ensure at least one service is in the list
    // OR we just ensure the list exists.
    // The previous validation had min(1).
    if (!val.services || val.services.length === 0) {
      // It's possible to hav an empty list if they haven't added any.
      // We can leave it flexible or enforce adding one.
      // Based on "validate it nicely", enforcing at least one seems appropriate if they said YES.
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["services"],
        message: "Please add at least one service",
      });
    }
  }
});

export type AdditionalServicesValues = z.infer<typeof additionalServicesSchema>;

export const createEmptyAdditionalService =
  (): unknown => ({
    service_id: "",
    name: "",
    description: "",
    fee: 0,
    selected: false,
  });

export const defaultAdditionalServicesValues: AdditionalServicesValues = {
  request_additional_services: "No",
  services: [],
};
