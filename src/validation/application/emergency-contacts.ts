import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(1, "Please enter a contact name"),
  relationship: z.string().min(1, "Please describe the relationship"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Enter a valid email address"),
  address: z.string().min(1, "Address is required"),
  is_primary: z.boolean(),
});

export const emergencyContactsSchema = z.object({
  contacts: z
    .array(contactSchema)
    .min(1, "Add at least one emergency contact")
    .max(3, "You can add up to 3 contacts"),
});

export type EmergencyContactsValues = z.infer<typeof emergencyContactsSchema>;

export const createEmptyContact =
  (): EmergencyContactsValues["contacts"][number] => ({
    name: "",
    relationship: "",
    phone: "",
    email: "",
    address: "",
    is_primary: false,
  });
