import { z } from "zod";

export const AssessmentQuestionSchema = z.object({
  id: z.string(),
  prompt: z.string(),
  subscale: z.string().optional(),
  options: z.array(
    z.object({
      label: z.string(),
      value: z.number(),
    })
  ),
});
export type AssessmentQuestion = z.infer<typeof AssessmentQuestionSchema>;

export const ClinicalAssessmentRecordSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  screenerType: z.enum(["pcl5_trauma", "phq4_distress", "cssrs_suicide_triage"]),
  answers: z.record(z.number()),
  totalScore: z.number(),
  subscaleScores: z.record(z.number()).optional(),
  severityCategory: z.enum(["minimal", "mild", "moderate", "severe", "crisis"]),
  interpretation: z.string(),
  timestamp: z.string(),
});
export type ClinicalAssessmentRecord = z.infer<typeof ClinicalAssessmentRecordSchema>;
