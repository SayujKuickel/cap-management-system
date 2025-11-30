import { z } from "zod";

export const serviceSchema = z.object({
  service_id: z.string().min(1, "Service ID is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  fee: z.number().nonnegative("Fee must be zero or positive"),
  selected: z.boolean(),
});

export const additionalServicesSchema = z.object({
  services: z.array(serviceSchema).min(1, "Add at least one service"),
});

export type AdditionalServicesValues = z.infer<typeof additionalServicesSchema>;

export const createEmptyAdditionalService =
  (): AdditionalServicesValues["services"][number] => ({
    service_id: "",
    name: "",
    description: "",
    fee: 0,
    selected: false,
  });
