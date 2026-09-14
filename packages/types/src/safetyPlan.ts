import { z } from "zod";

export const SafetyPlanSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  warningSigns: z.array(z.string()),
  internalCopingStrategies: z.array(z.string()),
  socialDistractions: z.array(z.string()),
  trustedContacts: z.array(
    z.object({
      name: z.string(),
      phone: z.string().optional(),
      relationship: z.string().optional(),
    })
  ),
  professionalContacts: z.array(
    z.object({
      agencyName: z.string(),
      phone: z.string(),
      addressOrWeb: z.string().optional(),
    })
  ),
  safeEnvironmentSteps: z.array(z.string()),
  updatedAt: z.string(),
});
export type SafetyPlan = z.infer<typeof SafetyPlanSchema>;
