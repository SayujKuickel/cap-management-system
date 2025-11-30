import { z } from "zod";

export const personalDetailsSchema = z.object({
  country: z.string().min(1, "Country of residence is required"),
  country_of_birth: z.string().min(1, "Country of birth is required"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  email: z.string().email("Enter a valid email address"),
  family_name: z.string().min(1, "Family name is required"),
  gender: z.string().min(1, "Please select a gender"),
  given_name: z.string().min(1, "Given name is required"),
  middle_name: z.string().optional(),
  nationality: z.string().min(1, "Nationality is required"),
  passport_expiry: z.string().min(1, "Passport expiry is required"),
  passport_number: z.string().min(1, "Passport number is required"),
  phone: z.string().min(1, "Phone number is required"),
  postcode: z.string().min(1, "Postcode is required"),
  state: z.string().min(1, "State is required"),
  street_address: z.string().min(1, "Street address is required"),
  suburb: z.string().min(1, "Suburb is required"),
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
