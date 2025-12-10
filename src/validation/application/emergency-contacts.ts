import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().optional().refine((val) => val && val.length > 0, "Please enter a contact name"),
  relationship: z.string().optional().refine((val) => val && val.length > 0, "Please describe the relationship"),
  phone: z.string().optional().refine((val) => val && val.length > 0, "Phone number is required"),
  email: z.string().optional().refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), "Enter a valid email address").refine((val) => val && val.length > 0, "Email is required"),
  address: z.string().optional().refine((val) => val && val.length > 0, "Address is required"),
  is_primary: z.boolean().optional(),
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
