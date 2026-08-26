import { z } from "zod";

export const competitionStatusSchema = z.enum([
  "draft",
  "upcoming",
  "active",
  "closed",
  "completed",
]);

export const competitorStatusSchema = z.enum(["draft", "published", "hidden"]);

export const imageTypeSchema = z.enum([
  "front",
  "back",
  "left",
  "right",
  "profile",
]);

export const competitionFormSchema = z.object({
  name: z.string().trim().min(3, "Name must be at least 3 characters"),
  slug: z
    .string()
    .trim()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and dashes"),
  description: z.string().trim().min(10, "Add a short description"),
  rules: z.string().trim().min(10, "Add competition rules"),
  location: z.string().trim().optional().or(z.literal("")),
  start_date: z.string().optional().or(z.literal("")),
  end_date: z.string().optional().or(z.literal("")),
  status: competitionStatusSchema,
  public_results: z.boolean(),
});

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .refine(
    (value) => !value || /^https?:\/\//i.test(value),
    "URL must start with http:// or https://"
  );

export const competitorFormSchema = z.object({
  competition_id: z.string().uuid(),
  full_name: z.string().trim().min(2, "Full name is required"),
  barber_name: z.string().trim().min(2, "Barber name is required"),
  competition_number: z.number().int().positive(),
  short_bio: z.string().trim().min(5, "Short bio is required"),
  description: z.string().trim().min(10, "Detailed description is required"),
  phone: z.string().trim().optional().or(z.literal("")),
  status: competitorStatusSchema,
  instagram_url: optionalUrl,
  tiktok_url: optionalUrl,
  facebook_url: optionalUrl,
  youtube_url: optionalUrl,
  telegram_url: optionalUrl,
  website_url: optionalUrl,
});

export const voteRequestSchema = z.object({
  competition_id: z.string().uuid(),
  competitor_id: z.string().uuid(),
  voter_name: z.string().trim().min(2, "Please enter your full name"),
  voter_phone: z
    .string()
    .trim()
    .min(8, "Please enter a valid phone number")
    .max(20, "Phone number is too long")
    .regex(/^[+\d][\d\s\-()]*$/, "Please enter a valid phone number"),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6),
});

export type CompetitionFormValues = z.infer<typeof competitionFormSchema>;
export type CompetitorFormValues = z.infer<typeof competitorFormSchema>;
export type VoteRequestValues = z.infer<typeof voteRequestSchema>;
export type LoginValues = z.infer<typeof loginSchema>;
