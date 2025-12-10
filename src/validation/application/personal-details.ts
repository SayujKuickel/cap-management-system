import { z } from "zod";

export const personalDetailsSchema = z.object({
  country: z.string().optional().refine((val) => val && val.length > 0, "Country of residence is required"),
  country_of_birth: z.string().optional().refine((val) => val && val.length > 0, "Country of birth is required"),
  date_of_birth: z.string().optional().refine((val) => val && val.length > 0, "Date of birth is required"),
  email: z.string().optional().refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), "Enter a valid email address").refine((val) => val && val.length > 0, "Email is required"),
  family_name: z.string().optional().refine((val) => val && val.length > 0, "Family name is required"),
  gender: z.string().optional().refine((val) => val && val.length > 0, "Please select a gender"),
  given_name: z.string().optional().refine((val) => val && val.length > 0, "Given name is required"),
  middle_name: z.string().optional(),
  nationality: z.string().optional().refine((val) => val && val.length > 0, "Nationality is required"),
  passport_expiry: z.string().optional().refine((val) => val && val.length > 0, "Passport expiry is required"),
  passport_number: z.string().optional().refine((val) => val && val.length > 0, "Passport number is required"),
  phone: z.string().optional().refine((val) => val && val.length > 0, "Phone number is required"),
  postcode: z.string().optional().refine((val) => val && val.length > 0, "Postcode is required"),
  state: z.string().optional().refine((val) => val && val.length > 0, "State is required"),
  street_address: z.string().optional().refine((val) => val && val.length > 0, "Street address is required"),
  suburb: z.string().optional().refine((val) => val && val.length > 0, "Suburb is required"),
});

export type PersonalDetailsValues = z.infer<typeof personalDetailsSchema>;

export const defaultPersonalDetailsValues: PersonalDetailsValues = {
  country: "",
  country_of_birth: "",
  date_of_birth: "",
  email: "",
  family_name: "",
  gender: "",
  given_name: "",
  middle_name: "",
  nationality: "",
  passport_expiry: "",
  passport_number: "",
  phone: "",
  postcode: "",
  state: "",
  street_address: "",
  suburb: "",
};
