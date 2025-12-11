import { z } from "zod";

export const personalDetailsSchema = z.object({
  // Basic Information
  student_origin: z.string().optional().refine((val) => val && val.length > 0, "Please select student origin"),
  title: z.string().optional().refine((val) => val && val.length > 0, "Please select a title"),
  given_name: z.string().optional().refine((val) => val && val.length > 0, "First name is required"),
  middle_name: z.string().optional(),
  family_name: z.string().optional().refine((val) => val && val.length > 0, "Last name is required"),
  gender: z.string().optional().refine((val) => val && val.length > 0, "Please select a gender"),
  date_of_birth: z.string().optional().refine((val) => val && val.length > 0, "Date of birth is required"),

  // Contact Details
  email: z.string().optional().refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), "Enter a valid email address").refine((val) => val && val.length > 0, "Email is required"),
  alternate_email: z.string().optional().refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), "Enter a valid email address"),
  phone: z.string().optional().refine((val) => val && val.length > 0, "Phone number is required"),
  home_phone: z.string().optional(),

  // Passport Details
  country_of_birth: z.string().optional().refine((val) => val && val.length > 0, "Country of birth is required"),
  nationality: z.string().optional().refine((val) => val && val.length > 0, "Nationality is required"),
  passport_number: z.string().optional().refine((val) => val && val.length > 0, "Passport number is required"),
  passport_expiry: z.string().optional().refine((val) => val && val.length > 0, "Passport expiry is required"),

  // Visa Details
  visa_type: z.string().optional(),
  visa_number: z.string().optional(),
  visa_expiry: z.string().optional(),

  // Residential Address
  search_address: z.string().optional(),
  country: z.string().optional().refine((val) => val && val.length > 0, "Country is required"),
  building_name: z.string().optional(),
  flat_unit: z.string().optional(),
  street_number: z.string().optional().refine((val) => val && val.length > 0, "Street number is required"),
  street_name: z.string().optional().refine((val) => val && val.length > 0, "Street name is required"),
  suburb: z.string().optional().refine((val) => val && val.length > 0, "City/Town/Suburb is required"),
  state: z.string().optional().refine((val) => val && val.length > 0, "State/Province is required"),
  postcode: z.string().optional().refine((val) => val && val.length > 0, "Post code is required"),

  // Postal Address
  postal_same_as_residential: z.string().optional().refine((val) => val && val.length > 0, "Please select an option"),
  postal_country: z.string().optional(),
  postal_building_name: z.string().optional(),
  postal_flat_unit: z.string().optional(),
  postal_street_number: z.string().optional(),
  postal_street_name: z.string().optional(),
  postal_suburb: z.string().optional(),
  postal_state: z.string().optional(),
  postal_postcode: z.string().optional(),

  // Overseas/Permanent Address
  overseas_country: z.string().optional(),
  overseas_address: z.string().optional(),
});

export type PersonalDetailsValues = z.infer<typeof personalDetailsSchema>;

export const defaultPersonalDetailsValues: PersonalDetailsValues = {
  // Basic Information
  student_origin: "",
  title: "",
  given_name: "",
  middle_name: "",
  family_name: "",
  gender: "",
  date_of_birth: "",

  // Contact Details
  email: "",
  alternate_email: "",
  phone: "",
  home_phone: "",

  // Passport Details
  country_of_birth: "",
  nationality: "",
  passport_number: "",
  passport_expiry: "",

  // Visa Details
  visa_type: "",
  visa_number: "",
  visa_expiry: "",

  // Residential Address
  search_address: "",
  country: "",
  building_name: "",
  flat_unit: "",
  street_number: "",
  street_name: "",
  suburb: "",
  state: "",
  postcode: "",

  // Postal Address
  postal_same_as_residential: "",
  postal_country: "",
  postal_building_name: "",
  postal_flat_unit: "",
  postal_street_number: "",
  postal_street_name: "",
  postal_suburb: "",
  postal_state: "",
  postal_postcode: "",

  // Overseas/Permanent Address
  overseas_country: "",
  overseas_address: "",
};
