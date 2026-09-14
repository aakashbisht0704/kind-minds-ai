import { z } from "zod";

export const SupportResourceSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  countryCode: z.string(), // e.g. "US", "UK", "INTL", "UA", "SY", "PS", "GLOBAL"
  region: z.string(),
  hotline: z.string().optional(),
  smsText: z.string().optional(),
  website: z.string(),
  specialty: z.enum([
    "torture_rehabilitation",
    "war_atrocities",
    "gender_based_violence",
    "refugee_legal_aid",
    "crisis_helplines",
  ]),
  languages: z.array(z.string()),
  freeAndConfidential: z.boolean(),
  secureChatUrl: z.string().optional(),
});
export type SupportResource = z.infer<typeof SupportResourceSchema>;
