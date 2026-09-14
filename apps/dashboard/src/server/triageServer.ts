import { createServerFn } from "@tanstack/react-start";
import { TriageRepository } from "@kindminds/db";
import { TriageOrchestrator } from "@kindminds/agent";
import type { SafetyPlan, ClinicalAssessmentRecord } from "@kindminds/types";

let cachedRepo: TriageRepository | null = null;
function getRepo(): TriageRepository {
  if (!cachedRepo) {
    const d1 = (globalThis as any).DB || (globalThis as any).kindminds_db || (process.env as any)?.DB;
    cachedRepo = new TriageRepository(d1);
  }
  return cachedRepo;
}

export const sendTriageMessage = createServerFn({ method: "POST" })
  .validator((data: { sessionId: string; text: string }) => data)
  .handler(async ({ data }) => {
    const repo = getRepo();
    const geminiKey = typeof process !== "undefined" ? process.env?.GEMINI_API_KEY : undefined;
    const groqKey = typeof process !== "undefined" ? process.env?.GROQ_API_KEY : undefined;
    const gatewayUrl = typeof process !== "undefined" ? process.env?.CLOUDFLARE_AI_GATEWAY_URL : undefined;

    const orchestrator = new TriageOrchestrator(repo, {
      geminiApiKey: geminiKey,
      groqApiKey: groqKey,
      gatewayUrl,
      model: "gemini-3.1-pro-preview",
    });

    const result = await orchestrator.processTurn(data.sessionId, data.text);
    return result;
  });

export const fetchSessionHistory = createServerFn({ method: "GET" })
  .validator((data: { sessionId: string }) => data)
  .handler(async ({ data }) => {
    const repo = getRepo();
    const session = await repo.getSession(data.sessionId);
    const messages = await repo.getSessionMessages(data.sessionId);
    const telemetry = await repo.getSessionTelemetry(data.sessionId);
    const safetyPlan = await repo.getSafetyPlan(data.sessionId);
    return { session, messages, telemetry, safetyPlan };
  });

export const saveSafetyPlan = createServerFn({ method: "POST" })
  .validator((data: { plan: SafetyPlan }) => data)
  .handler(async ({ data }) => {
    const repo = getRepo();
    await repo.upsertSafetyPlan(data.plan);
    return { success: true };
  });

export const saveAssessment = createServerFn({ method: "POST" })
  .validator((data: { assessment: ClinicalAssessmentRecord }) => data)
  .handler(async ({ data }) => {
    const repo = getRepo();
    await repo.saveClinicalAssessment(data.assessment);
    return { success: true };
  });

export const getVerifiedResources = createServerFn({ method: "GET" })
  .validator((data: { countryCode?: string; specialty?: string }) => data)
  .handler(async ({ data }) => {
    const repo = getRepo();
    const resources = await repo.getResources(data.countryCode, data.specialty);
    return resources;
  });
