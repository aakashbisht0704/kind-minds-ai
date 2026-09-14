import { z } from "zod";

export const TraumaStateSchema = z.enum([
  "hyperarousal",
  "dissociation",
  "intrusive_distress",
  "acute_crisis",
  "grounded",
  "unknown",
]);
export type TraumaState = z.infer<typeof TraumaStateSchema>;

export const RiskTrajectorySchema = z.enum([
  "escalating",
  "stable",
  "deescalating",
  "unknown",
]);
export type RiskTrajectory = z.infer<typeof RiskTrajectorySchema>;

export const DistressTelemetrySchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  timestamp: z.string(),
  score: z.number().min(0).max(10), // 0 to 10 distress scale
  primaryState: TraumaStateSchema,
  trajectory: RiskTrajectorySchema,
  confidence: z.number().min(0).max(1),
  clinicalMarkers: z.array(z.string()),
  triggerFlags: z.array(z.string()),
});
export type DistressTelemetry = z.infer<typeof DistressTelemetrySchema>;

export const MessageRoleSchema = z.enum([
  "user",
  "assistant",
  "system",
  "tool",
]);
export type MessageRole = z.infer<typeof MessageRoleSchema>;

export const ToolCallLogSchema = z.object({
  id: z.string(),
  name: z.string(),
  arguments: z.record(z.any()),
  result: z.any().optional(),
  status: z.enum(["invoking", "completed", "failed"]),
  timestamp: z.string(),
});
export type ToolCallLog = z.infer<typeof ToolCallLogSchema>;

export const TriageMessageSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  role: MessageRoleSchema,
  content: z.string(),
  timestamp: z.string(),
  telemetry: DistressTelemetrySchema.optional(),
  toolCalls: z.array(ToolCallLogSchema).optional(),
});
export type TriageMessage = z.infer<typeof TriageMessageSchema>;

export const TriageSessionSchema = z.object({
  id: z.string(),
  survivorPseudonym: z.string(),
  status: z.enum(["active", "stabilized", "escalated", "closed"]),
  initialScore: z.number(),
  currentScore: z.number(),
  primaryTraumaCategory: z.enum([
    "conflict_and_war",
    "gender_based_violence",
    "torture_and_detention",
    "displacement_and_exile",
    "hate_crime",
    "general_severe_trauma",
  ]).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type TriageSession = z.infer<typeof TriageSessionSchema>;
