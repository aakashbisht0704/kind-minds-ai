export interface ToolDefinition {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export const AGENT_TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    type: "function",
    function: {
      name: "assessDistress",
      description: "Mandatory assessment tool called on every user interaction to evaluate the survivor's distress level, autonomic trauma state, and trajectory.",
      parameters: {
        type: "object",
        properties: {
          score: {
            type: "number",
            description: "Distress level on a scale from 0.0 (peaceful/regulated) to 10.0 (extreme acute terror or crisis)",
          },
          primaryState: {
            type: "string",
            enum: ["hyperarousal", "dissociation", "intrusive_distress", "acute_crisis", "grounded"],
            description: "Primary trauma nervous-system state observed in the survivor",
          },
          trajectory: {
            type: "string",
            enum: ["escalating", "stable", "deescalating"],
            description: "Risk trajectory across recent interactions",
          },
          confidence: {
            type: "number",
            description: "Confidence rating of the assessment from 0.0 to 1.0",
          },
          clinicalMarkers: {
            type: "array",
            items: { type: "string" },
            description: "Clinical indicators detected (e.g. tremors, racing pulse, emotional detachment, numbness, intrusive flashback)",
          },
          reasoning: {
            type: "string",
            description: "Concise clinical reasoning for this score",
          },
        },
        required: ["score", "primaryState", "trajectory", "confidence", "clinicalMarkers", "reasoning"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "initiateGrounding",
      description: "Triggers real-time somatic or sensory grounding intervention on the survivor's dashboard.",
      parameters: {
        type: "object",
        properties: {
          protocolType: {
            type: "string",
            enum: ["54321_sensory", "physiological_sigh", "box_breathing", "orienting_and_anchoring", "bilateral_butterfly_hug"],
            description: "Grounding method appropriate for the survivor's state",
          },
          reason: {
            type: "string",
            description: "Why this specific protocol was selected",
          },
          initialCue: {
            type: "string",
            description: "Gentle introductory spoken or displayed cue for the survivor",
          },
        },
        required: ["protocolType", "reason", "initialCue"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "triggerSafetyEscalation",
      description: "Immediately escalates high-risk crisis or imminent harm indicators, opening emergency helplines and safety routing.",
      parameters: {
        type: "object",
        properties: {
          severity: {
            type: "string",
            enum: ["high_risk", "imminent_crisis"],
            description: "Severity tier of the safety escalation",
          },
          detectedIndicators: {
            type: "array",
            items: { type: "string" },
            description: "Specific triggers or statements indicating acute danger",
          },
          immediateActionTaken: {
            type: "string",
            description: "De-escalation action recommended to the survivor right now",
          },
          recommendedHotlines: {
            type: "array",
            items: { type: "string" },
            description: "Recommended helpline identifiers or countries",
          },
        },
        required: ["severity", "detectedIndicators", "immediateActionTaken"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "updateSafetyPlan",
      description: "Adds or updates items in the survivor's personalized Stanley-Brown Safety Plan.",
      parameters: {
        type: "object",
        properties: {
          step: {
            type: "string",
            enum: [
              "warning_signs",
              "internal_coping",
              "social_distractions",
              "trusted_contacts",
              "professional_agencies",
              "environmental_safety",
            ],
            description: "Safety plan component being populated",
          },
          items: {
            type: "array",
            items: { type: "string" },
            description: "Specific strategies or contacts agreed upon with the survivor",
          },
        },
        required: ["step", "items"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "lookupSupportResources",
      description: "Searches verified international and local organizations specialized in torture rehabilitation, war trauma, and legal aid.",
      parameters: {
        type: "object",
        properties: {
          countryCode: {
            type: "string",
            description: "Country code (e.g. US, UK, UA, SY, PS, GLOBAL)",
          },
          traumaSpecialty: {
            type: "string",
            enum: [
              "all",
              "torture_rehabilitation",
              "war_atrocities",
              "gender_based_violence",
              "refugee_legal_aid",
              "crisis_helplines",
            ],
            description: "Type of specialized support needed",
          },
        },
        required: ["traumaSpecialty"],
      },
    },
  },
];
