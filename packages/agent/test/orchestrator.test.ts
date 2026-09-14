import { describe, it, expect, beforeEach } from "bun:test";
import { TriageRepository } from "@kindminds/db";
import { TriageOrchestrator } from "../src/orchestrator";

describe("TriageOrchestrator & Clinical Agent Suite", () => {
  let repo: TriageRepository;
  let orchestrator: TriageOrchestrator;

  beforeEach(async () => {
    repo = new TriageRepository();
    orchestrator = new TriageOrchestrator(repo);
  });

  it("should process initial trauma intake and trigger assessDistress autonomously", async () => {
    const sessionId = "test-session-1";
    const userMessage = "I keep having horrifying flashbacks of the shelling and I can't breathe or stop shaking.";

    const turn = await orchestrator.processTurn(sessionId, userMessage);

    expect(turn).toBeDefined();
    expect(turn.message.sessionId).toBe(sessionId);
    expect(turn.message.role).toBe("assistant");
    expect(turn.message.content.length).toBeGreaterThan(10);
    expect(turn.message.toolCalls).toBeDefined();
    expect(turn.message.toolCalls!.length).toBeGreaterThanOrEqual(1);

    // Verify assessDistress tool was invoked
    const distressTool = turn.message.toolCalls!.find((t) => t.name === "assessDistress");
    expect(distressTool).toBeDefined();
    expect(distressTool?.status).toBe("completed");
    expect(distressTool?.arguments.score).toBeGreaterThanOrEqual(7); // High acute trauma score
    expect(distressTool?.arguments.primaryState).toBe("hyperarousal");

    // Verify telemetry saved to repository
    const telemetryHistory = await repo.getSessionTelemetry(sessionId);
    expect(telemetryHistory.length).toBe(1);
    expect(telemetryHistory[0].score).toBe(distressTool?.arguments.score);
  });

  it("should trigger somatic grounding protocol for physical panic/flashback symptoms", async () => {
    const sessionId = "test-session-2";
    const userMessage = "I am hyperventilating and feeling trapped in the room, my heart is pounding like crazy.";

    const turn = await orchestrator.processTurn(sessionId, userMessage);

    expect(turn.message.toolCalls).toBeDefined();
    const groundingTool = turn.message.toolCalls!.find((t) => t.name === "initiateGrounding");
    expect(groundingTool).toBeDefined();
    expect(["54321_sensory", "box_breathing", "orienting_and_anchoring"]).toContain(groundingTool?.arguments.protocolType);
    expect(turn.groundingAction).not.toBeNull();
  });

  it("should immediately escalate safety tier when imminent crisis or fatalistic indicators appear", async () => {
    const sessionId = "test-session-3";
    const userMessage = "I cannot endure this pain another day. I want to die and end it all right now.";

    const turn = await orchestrator.processTurn(sessionId, userMessage);

    expect(turn.message.toolCalls).toBeDefined();
    const escalationTool = turn.message.toolCalls!.find((t) => t.name === "triggerSafetyEscalation");
    expect(escalationTool).toBeDefined();
    expect(escalationTool?.arguments.severity).toBe("imminent_crisis");
    expect(turn.safetyEscalation).not.toBeNull();

    const session = await repo.getSession(sessionId);
    expect(session?.status).toBe("escalated");
  });

  it("should query verified global torture and trauma rehabilitation resources", async () => {
    const allResources = await repo.getResources();
    expect(allResources.length).toBeGreaterThanOrEqual(5);

    const ukraineResources = await repo.getResources("UA");
    const localUA = ukraineResources.find((r) => r.countryCode === "UA");
    expect(localUA).toBeDefined();
    expect(localUA?.name).toContain("Voices of Children");

    const usResources = await repo.getResources("US");
    const cvt = usResources.find((r) => r.id === "res-cvt-us-intl");
    expect(cvt).toBeDefined();
    expect(cvt?.specialty).toBe("torture_rehabilitation");
  });

  it("should persist and retrieve Stanley-Brown safety planning steps", async () => {
    const sessionId = "test-session-safety";
    await repo.createSession({
      id: sessionId,
      survivorPseudonym: "Oak",
      status: "active",
      initialScore: 6,
      currentScore: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await repo.upsertSafetyPlan({
      sessionId,
      warningSigns: ["Smell of smoke", "Sudden loud noises"],
      internalCopingStrategies: ["4-7-8 breathing", "Touching textured fabric"],
      socialDistractions: ["Walking in park", "Reading poetry"],
      trustedContacts: [{ name: "Elena", relationship: "Sister" }],
      professionalContacts: [{ name: "Dr. Aris", role: "TIC Specialist" }],
      safeEnvironmentSteps: ["Stay in well-lit room with accessible door"],
      updatedAt: new Date().toISOString(),
    });

    const plan = await repo.getSafetyPlan(sessionId);
    expect(plan).not.toBeNull();
    expect(plan?.warningSigns).toContain("Smell of smoke");
    expect(plan?.trustedContacts[0].name).toBe("Elena");
  });
});
