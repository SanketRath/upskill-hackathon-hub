import { z } from "zod";

// Common validation patterns
const emailSchema = z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters");
const phoneSchema = z.string().trim().regex(/^[0-9]{10}$/, "Phone number must be exactly 10 digits");
const nameSchema = z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters");
const urlSchema = z.string().trim().url("Invalid URL").max(500, "URL must be less than 500 characters").optional().or(z.literal(""));
const textSchema = (maxLength: number) => z.string().trim().max(maxLength, `Text must be less than ${maxLength} characters`);

// Team member validation schema
export const teamMemberSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  college_name: z.string().trim().min(1, "College name is required").max(200, "College name must be less than 200 characters"),
  photo_url: urlSchema,
  is_leader: z.boolean(),
});

// Registration validation schema
export const registrationSchema = z.object({
  teamMembers: z.array(teamMemberSchema).min(1, "At least one team member is required"),
});

// Event creation validation schema
export const createEventSchema = z.object({
  title: z.string().trim().min(1, "Event title is required").max(200, "Event title must be less than 200 characters"),
  organizer: nameSchema,
  location: z.string().trim().min(1, "Location is required").max(300, "Location must be less than 300 characters"),
  eventType: z.string().trim().max(100, "Event type must be less than 100 characters").optional().or(z.literal("")),
  eventDate: z.string().min(1, "Event date is required"),
  registrationDeadline: z.string().min(1, "Registration deadline is required"),
  teamSizeMin: z.number().int().min(1, "Minimum team size must be at least 1"),
  teamSizeMax: z.number().int().min(1, "Maximum team size must be at least 1"),
  totalSlots: z.number().int().min(1, "Total slots must be at least 1"),
  registrationFee: z.number().int().min(0, "Registration fee cannot be negative"),
  prizeMoney: z.string().optional(),
  posterUrl: urlSchema,
  description: textSchema(2000).min(1, "Description is required"),
  eligibility: textSchema(1000),
  stages: textSchema(1000),
  details: textSchema(2000),
  datesDeadlines: textSchema(1000),
  prizes: textSchema(1000),
  submissionType: z.enum(["none", "github_link", "zip_file", "both"]).default("none"),
});

// User profile validation schema
export const userProfileSchema = z.object({
  fullName: nameSchema,
  collegeName: z.string().trim().min(1, "College name is required").max(200, "College name must be less than 200 characters"),
  degree: z.string().trim().min(1, "Degree is required").max(100, "Degree must be less than 100 characters"),
  passoutYear: z.number().int().min(2020, "Year must be 2020 or later").max(2040, "Year must be 2040 or earlier"),
  heardFrom: z.string().min(1, "This field is required"),
});

// Organizer profile validation schema
export const organizerProfileSchema = z.object({
  organizationName: z.string().trim().min(1, "Organization name is required").max(200, "Organization name must be less than 200 characters"),
  contactEmail: emailSchema,
  contactPhone: phoneSchema.optional().or(z.literal("")),
  website: urlSchema,
  description: textSchema(1000),
});

// Auth validation schemas
export const loginSchema = z.object({
  username: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z.object({
  name: nameSchema,
  username: emailSchema,
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
