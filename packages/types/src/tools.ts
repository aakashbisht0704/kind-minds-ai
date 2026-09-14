import { z } from "zod";
import { TraumaStateSchema, RiskTrajectorySchema } from "./triage";

// Tool 1: Real-time Distress Assessment
export const AssessDistressArgsSchema = z.object({
  score: z.number().min(0).max(10).describe("Distress rating from 0.0 (completely calm) to 10.0 (unbearable acute crisis)"),
  primaryState: TraumaStateSchema.describe("Primary trauma nervous-system state observed"),
  trajectory: RiskTrajectorySchema.describe("Observed emotional and autonomic trajectory"),
  confidence: z.number().min(0).max(1).describe("Model confidence score between 0.0 and 1.0"),
  clinicalMarkers: z.array(z.string()).describe("Clinical markers detected, e.g., hyperventilation, depersonalization, fatalistic despair, intrusive horror"),
  reasoning: z.string().describe("Clinical rationale for score and classification"),
});
export type AssessDistressArgs = z.infer<typeof AssessDistressArgsSchema>;

// Tool 2: Grounding Protocol Trigger
export const GroundingProtocolTypeSchema = z.enum([
  "54321_sensory",
  "physiological_sigh",
  "box_breathing",
  "orienting_and_anchoring",
  "bilateral_butterfly_hug",
]);
export type GroundingProtocolType = z.infer<typeof GroundingProtocolTypeSchema>;

export const InitiateGroundingArgsSchema = z.object({
  protocolType: GroundingProtocolTypeSchema.describe("Type of somatic or sensory grounding method best suited for current trauma state"),
  reason: z.string().describe("Why this grounding protocol was chosen"),
  initialCue: z.string().describe("Compassionate introductory cue to guide survivor into the exercise"),
});
export type InitiateGroundingArgs = z.infer<typeof InitiateGroundingArgsSchema>;

// Tool 3: Safety Escalation
export const TriggerSafetyEscalationArgsSchema = z.object({
  severity: z.enum(["high_risk", "imminent_crisis"]).describe("Severity tier of safety escalation"),
  detectedIndicators: z.array(z.string()).describe("Explicit indicators triggering escalation (e.g. self-harm intent, unsafe location, active threat)"),
  immediateActionTaken: z.string().describe("Immediate de-escalation action recommended"),
  recommendedHotlines: z.array(z.string()).describe("Country/regional helpline codes to present"),
});
export type TriggerSafetyEscalationArgs = z.infer<typeof TriggerSafetyEscalationArgsSchema>;

// Tool 4: Stanley-Brown Safety Plan
export const UpdateSafetyPlanArgsSchema = z.object({
  step: z.enum([
    "warning_signs",
    "internal_coping",
    "social_distractions",
    "trusted_contacts",
    "professional_agencies",
    "environmental_safety",
  ]).describe("Step in the Stanley-Brown Safety Planning model being updated"),
  items: z.array(z.string()).describe("Items or strategies identified with survivor for this step"),
});
export type UpdateSafetyPlanArgs = z.infer<typeof UpdateSafetyPlanArgsSchema>;

// Tool 5: Clinical Screener Logging
export const LogClinicalAssessmentArgsSchema = z.object({
  screenerType: z.enum(["pcl5_trauma", "phq4_distress", "cssrs_suicide_triage"]),
  scores: z.record(z.number()).describe("Score dictionary for individual questions and total"),
  riskLevel: z.enum(["mild", "moderate", "severe", "critical"]),
  clinicalImpression: z.string(),
});
export type LogClinicalAssessmentArgs = z.infer<typeof LogClinicalAssessmentArgsSchema>;

// Tool 6: Lookup Vetted Resources
export const LookupSupportResourcesArgsSchema = z.object({
  countryCode: z.string().describe("ISO country code or region name"),
  traumaSpecialty: z.enum([
    "all",
    "torture_rehabilitation",
    "war_atrocities",
    "gender_based_violence",
    "refugee_legal_aid",
    "crisis_helplines",
  ]),
});
export type LookupSupportResourcesArgs = z.infer<typeof LookupSupportResourcesArgsSchema>;

// Tool 7: Encrypted Case Summary
export const GenerateEncryptedCaseSummaryArgsSchema = z.object({
  recipientType: z.enum(["survivor_record", "clinical_referral", "legal_advocate"]),
  keyThemes: z.array(z.string()),
  stabilizationSummary: z.string(),
  recommendedCarePlan: z.string(),
});
export type GenerateEncryptedCaseSummaryArgs = z.infer<typeof GenerateEncryptedCaseSummaryArgsSchema>;
