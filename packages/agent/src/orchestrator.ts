import type {
  TriageMessage,
  DistressTelemetry,
  ToolCallLog,
  AssessDistressArgs,
  InitiateGroundingArgs,
  TriggerSafetyEscalationArgs,
  UpdateSafetyPlanArgs,
  LookupSupportResourcesArgs,
} from "@kindminds/types";
import { TriageRepository } from "@kindminds/db";
import { TRAUMA_INFORMED_SYSTEM_PROMPT } from "./prompts/traumaInformedPrompt";
import { callAIGateway, GatewayConfig, GatewayMessage } from "./gateway";

export interface OrchestratorResult {
  message: TriageMessage;
  distressScore: number;
  primaryState: string;
  groundingAction: InitiateGroundingArgs | null;
  safetyEscalation: TriggerSafetyEscalationArgs | null;
  safetyPlanUpdated: boolean;
  resourcesFound?: any[];
}

export class TriageOrchestrator {
  private repo: TriageRepository;
  private config: GatewayConfig;

  constructor(repo: TriageRepository, config: GatewayConfig = {}) {
    this.repo = repo;
    this.config = config;
  }

  async processTurn(sessionId: string, userText: string): Promise<OrchestratorResult> {
    const now = new Date().toISOString();

    // 1. Ensure session exists
    let session = await this.repo.getSession(sessionId);
    if (!session) {
      session = await this.repo.createSession({
        id: sessionId,
        pseudonym: "Survivor",
        initialScore: 5.0,
      });
    }

    // 2. Persist User Message
    const userMsg: TriageMessage = {
      id: `msg_${Date.now()}_user`,
      sessionId,
      role: "user",
      content: userText,
      timestamp: now,
    };
    await this.repo.saveMessage(userMsg);

    // 3. Load historical messages for context
    const history = await this.repo.getSessionMessages(sessionId);
    const recentHistory = history.slice(-10); // Keep last 10 messages for edge token budget

    // 4. Construct messages payload
    const gatewayMessages: GatewayMessage[] = [
      {
        role: "system",
        content: `${TRAUMA_INFORMED_SYSTEM_PROMPT}\n\nCURRENT SESSION STATE:\nSurvivor: ${session.survivorPseudonym}\nCurrent Distress Score: ${session.currentScore}/10\nStatus: ${session.status}`,
      },
      ...recentHistory.map((m) => ({
        role: m.role as any,
        content: m.content,
      })),
    ];

    // 5. Call AI Gateway with Tool Calling
    const response = await callAIGateway(gatewayMessages, this.config);

    // 6. Autonomous Tool Execution Loop
    let distressScore = session.currentScore;
    let primaryState = "grounded";
    let groundingAction: InitiateGroundingArgs | null = null;
    let safetyEscalation: TriggerSafetyEscalationArgs | null = null;
    let safetyPlanUpdated = false;
    let resourcesFound: any[] | undefined = undefined;

    const toolExecutionLogs: ToolCallLog[] = [];

    if (response.toolCalls && response.toolCalls.length > 0) {
      for (const tc of response.toolCalls) {
        const logEntry: ToolCallLog = {
          id: tc.id,
          name: tc.name,
          arguments: tc.arguments,
          status: "completed",
          timestamp: new Date().toISOString(),
        };

        try {
          if (tc.name === "assessDistress") {
            const args = tc.arguments as unknown as AssessDistressArgs;
            distressScore = args.score;
            primaryState = args.primaryState;

            const telemetry: DistressTelemetry = {
              id: `tel_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              sessionId,
              timestamp: new Date().toISOString(),
              score: args.score,
              primaryState: args.primaryState,
              trajectory: args.trajectory,
              confidence: args.confidence,
              clinicalMarkers: args.clinicalMarkers || [],
              triggerFlags: args.score >= 8 ? ["high_distress"] : [],
            };

            await this.repo.saveTelemetry(telemetry);
            await this.repo.updateSessionScore(sessionId, args.score);
            logEntry.result = { score: args.score, state: args.primaryState };
          } else if (tc.name === "initiateGrounding") {
            const args = tc.arguments as unknown as InitiateGroundingArgs;
            groundingAction = args;
            logEntry.result = { protocol: args.protocolType, triggered: true };
          } else if (tc.name === "triggerSafetyEscalation") {
            const args = tc.arguments as unknown as TriggerSafetyEscalationArgs;
            safetyEscalation = args;
            await this.repo.updateSessionScore(sessionId, Math.max(distressScore, 9.0), "escalated");
            logEntry.result = { escalated: true, severity: args.severity };
          } else if (tc.name === "updateSafetyPlan") {
            const args = tc.arguments as unknown as UpdateSafetyPlanArgs;
            let plan = await this.repo.getSafetyPlan(sessionId);
            if (!plan) {
              plan = {
                id: `sp_${Date.now()}`,
                sessionId,
                warningSigns: [],
                internalCopingStrategies: [],
                socialDistractions: [],
                trustedContacts: [],
                professionalContacts: [],
                safeEnvironmentSteps: [],
                updatedAt: new Date().toISOString(),
              };
            }

            if (args.step === "warning_signs") {
              plan.warningSigns = Array.from(new Set([...plan.warningSigns, ...args.items]));
            } else if (args.step === "internal_coping") {
              plan.internalCopingStrategies = Array.from(new Set([...plan.internalCopingStrategies, ...args.items]));
            } else if (args.step === "social_distractions") {
              plan.socialDistractions = Array.from(new Set([...plan.socialDistractions, ...args.items]));
            } else if (args.step === "environmental_safety") {
              plan.safeEnvironmentSteps = Array.from(new Set([...plan.safeEnvironmentSteps, ...args.items]));
            }
            plan.updatedAt = new Date().toISOString();
            await this.repo.upsertSafetyPlan(plan);
            safetyPlanUpdated = true;
            logEntry.result = { stepUpdated: args.step, itemsAdded: args.items.length };
          } else if (tc.name === "lookupSupportResources") {
            const args = tc.arguments as unknown as LookupSupportResourcesArgs;
            resourcesFound = await this.repo.getResources(args.countryCode, args.traumaSpecialty);
            logEntry.result = { matchCount: resourcesFound.length };
          }
        } catch (toolErr: any) {
          console.error(`[Orchestrator] Error executing tool ${tc.name}:`, toolErr);
          logEntry.status = "failed";
          logEntry.result = { error: toolErr.message };
        }

        toolExecutionLogs.push(logEntry);
      }
    }

    // 7. Persist Assistant Response with Tool Logs
    const assistantMsg: TriageMessage = {
      id: `msg_${Date.now()}_asst`,
      sessionId,
      role: "assistant",
      content: response.content,
      timestamp: new Date().toISOString(),
      toolCalls: toolExecutionLogs.length > 0 ? toolExecutionLogs : undefined,
    };
    await this.repo.saveMessage(assistantMsg);

    return {
      message: assistantMsg,
      distressScore,
      primaryState,
      groundingAction,
      safetyEscalation,
      safetyPlanUpdated,
      resourcesFound,
    };
  }
}
