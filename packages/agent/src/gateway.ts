import { AGENT_TOOL_DEFINITIONS, ToolDefinition } from "./tools/definitions";

declare const process: any;

export interface GatewayMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  name?: string;
  tool_call_id?: string;
  tool_calls?: Array<{
    id: string;
    type: "function";
    function: {
      name: string;
      arguments: string;
    };
  }>;
}

export interface GatewayConfig {
  gatewayUrl?: string; // Cloudflare AI Gateway URL
  geminiApiKey?: string;
  groqApiKey?: string;
  cloudflareAccountId?: string;
  cloudflareApiToken?: string;
  model?: string;
}

export interface GatewayResponse {
  content: string;
  toolCalls?: Array<{
    id: string;
    name: string;
    arguments: Record<string, unknown>;
  }>;
}

export async function callAIGateway(
  messages: GatewayMessage[],
  config: GatewayConfig,
  tools: ToolDefinition[] = AGENT_TOOL_DEFINITIONS
): Promise<GatewayResponse> {
  const geminiKey = config.geminiApiKey || (typeof process !== "undefined" ? process.env?.GEMINI_API_KEY : undefined);
  const groqKey = config.groqApiKey || (typeof process !== "undefined" ? process.env?.GROQ_API_KEY : undefined);
  const gatewayUrl = config.gatewayUrl || (typeof process !== "undefined" ? process.env?.CLOUDFLARE_AI_GATEWAY_URL : undefined);

  let endpoint = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  let primaryModel = config.model || "gemini-3.1-pro-preview";

  if (geminiKey) {
    endpoint = gatewayUrl || "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
    headers["Authorization"] = `Bearer ${geminiKey}`;
  } else if (groqKey) {
    endpoint = gatewayUrl || "https://api.groq.com/openai/v1/chat/completions";
    headers["Authorization"] = `Bearer ${groqKey}`;
    primaryModel = config.model || "llama-3.3-70b-versatile";
  } else if (gatewayUrl) {
    endpoint = gatewayUrl;
  } else {
    // Graceful simulated trauma-informed agent response for local development without API keys
    return generateLocalFallbackResponse(messages);
  }

  const tryCall = async (modelToUse: string): Promise<Response> => {
    const payload = {
      model: modelToUse,
      messages,
      tools,
      tool_choice: "auto",
      temperature: 0.3,
      max_tokens: 1024,
    };
    return fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
  };

  try {
    let res = await tryCall(primaryModel);

    // If quota or rate limited on 3.1-pro, seamlessly fall back to 3.1-flash-lite
    if (res.status === 429 && primaryModel.includes("pro")) {
      console.warn("[AIGateway] Quota limit on Gemini 3.1 Pro. Falling back to Gemini 3.1 Flash Lite.");
      res = await tryCall("gemini-3.1-flash-lite");
    }

    if (!res.ok) {
      const errorText = await res.text();
      console.warn(`[AIGateway] API responded with ${res.status}: ${errorText}. Using fallback responder.`);
      return generateLocalFallbackResponse(messages);
    }

    const data: any = await res.json();
    const choice = data.choices?.[0];
    const message = choice?.message;

    if (!message) {
      return generateLocalFallbackResponse(messages);
    }

    const toolCalls: Array<{ id: string; name: string; arguments: Record<string, unknown> }> = [];
    if (message.tool_calls && Array.isArray(message.tool_calls)) {
      for (const tc of message.tool_calls) {
        try {
          const parsedArgs = JSON.parse(tc.function.arguments);
          toolCalls.push({
            id: tc.id,
            name: tc.function.name,
            arguments: parsedArgs,
          });
        } catch (err) {
          console.error(`[AIGateway] Failed to parse tool arguments for ${tc.function.name}`, err);
        }
      }
    }

    return {
      content: message.content || "",
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
    };
  } catch (error) {
    console.error("[AIGateway] Network/Execution error:", error);
    return generateLocalFallbackResponse(messages);
  }
}

/**
 * Robust, trauma-informed offline responder providing deterministic assessment
 * and gentle stabilization if keys are unavailable or API is temporarily down.
 */
function generateLocalFallbackResponse(messages: GatewayMessage[]): GatewayResponse {
  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user")?.content || "";
  const lower = lastUserMsg.toLowerCase();

  // Crisis detection heuristic
  const isCrisis =
    lower.includes("kill") ||
    lower.includes("die") ||
    lower.includes("suicide") ||
    lower.includes("end it all") ||
    lower.includes("harm myself");

  // Panic / Hyperarousal detection heuristic
  const isPanic =
    lower.includes("can't breathe") ||
    lower.includes("panic") ||
    lower.includes("shaking") ||
    lower.includes("hyperventilat") ||
    lower.includes("pounding") ||
    lower.includes("heart is racing") ||
    lower.includes("heart is pounding") ||
    lower.includes("flashback") ||
    lower.includes("trapped") ||
    lower.includes("terrified");

  // Dissociation detection heuristic
  const isDissociated =
    lower.includes("numb") ||
    lower.includes("not real") ||
    lower.includes("floating") ||
    lower.includes("detached") ||
    lower.includes("fog");

  const toolCalls: Array<{ id: string; name: string; arguments: Record<string, unknown> }> = [];

  let distressScore = 5.0;
  let primaryState = "grounded";
  let trajectory = "stable";
  let markers: string[] = [];

  if (isCrisis) {
    distressScore = 9.5;
    primaryState = "acute_crisis";
    trajectory = "escalating";
    markers = ["acute suicidal ideation", "severe existential despair"];
    toolCalls.push({
      id: `tc_${Date.now()}_1`,
      name: "assessDistress",
      arguments: {
        score: distressScore,
        primaryState,
        trajectory,
        confidence: 0.95,
        clinicalMarkers: markers,
        reasoning: "Explicit crisis indicators detected requiring immediate safety intervention.",
      },
    });
    toolCalls.push({
      id: `tc_${Date.now()}_2`,
      name: "triggerSafetyEscalation",
      arguments: {
        severity: "imminent_crisis",
        detectedIndicators: ["severe crisis / distress statement"],
        immediateActionTaken: "Prioritize physical safety and connect to crisis lifeline.",
        recommendedHotlines: ["988", "GLOBAL"],
      },
    });
    return {
      content:
        "I hear how much pain you are carrying right now, and I want you to know that you are not alone in this moment. Your life and your safety matter deeply. Please stay with me. If you are in immediate danger or need someone to hold this space with you right now, free and confidential support is ready for you.",
      toolCalls,
    };
  }

  if (isPanic) {
    distressScore = 8.0;
    primaryState = "hyperarousal";
    trajectory = "escalating";
    markers = ["hyperventilation", "autonomic panic", "intrusive terror"];
    toolCalls.push({
      id: `tc_${Date.now()}_1`,
      name: "assessDistress",
      arguments: {
        score: distressScore,
        primaryState,
        trajectory,
        confidence: 0.9,
        clinicalMarkers: markers,
        reasoning: "Somatic panic and racing anxiety observed.",
      },
    });
    toolCalls.push({
      id: `tc_${Date.now()}_2`,
      name: "initiateGrounding",
      arguments: {
        protocolType: "54321_sensory",
        reason: "Acute hyperarousal requires sensory anchoring to the physical room.",
        initialCue: "Notice your feet on the ground. Let's look around and name 5 things you can see.",
      },
    });
    return {
      content:
        "I am right here with you. Take a slow, gentle moment. You are safe in this physical room right now, and what you are feeling is an understandable reaction of your nervous system. Would you like to do a quick 5-4-3-2-1 sensory grounding exercise with me to help bring your body back to calm?",
      toolCalls,
    };
  }

  if (isDissociated) {
    distressScore = 6.8;
    primaryState = "dissociation";
    trajectory = "stable";
    markers = ["emotional numbing", "derealization", "depersonalization"];
    toolCalls.push({
      id: `tc_${Date.now()}_1`,
      name: "assessDistress",
      arguments: {
        score: distressScore,
        primaryState,
        trajectory,
        confidence: 0.85,
        clinicalMarkers: markers,
        reasoning: "Signs of cognitive fog and emotional disconnection.",
      },
    });
    toolCalls.push({
      id: `tc_${Date.now()}_2`,
      name: "initiateGrounding",
      arguments: {
        protocolType: "orienting_and_anchoring",
        reason: "Dissociation responds well to gentle orienting in physical space.",
        initialCue: "Feel the surface beneath you. Press your hands gently against your knees.",
      },
    });
    return {
      content:
        "It is completely normal to feel numb or disconnected when your mind has had to protect you from overwhelming experiences. You don't have to force anything right now. Feel the chair supporting your back. You are here, and you are real.",
      toolCalls,
    };
  }

  // Default calm, regulated state
  toolCalls.push({
    id: `tc_${Date.now()}_1`,
    name: "assessDistress",
    arguments: {
      score: 3.5,
      primaryState: "grounded",
      trajectory: "deescalating",
      confidence: 0.8,
      clinicalMarkers: ["regulated breathing", "reflective coherence"],
      reasoning: "Survivor is communicative and reflective with moderate baseline tension.",
    },
  });

  return {
    content:
      "Thank you for sharing that with me. We can take this at whatever pace feels safe and comfortable for you. Would you like to explore what has been feeling heaviest lately, or would you prefer we look at your safety and coping plan?",
    toolCalls,
  };
}
