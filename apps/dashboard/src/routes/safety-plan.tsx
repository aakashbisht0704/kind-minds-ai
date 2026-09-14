import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { saveSafetyPlan } from "~/server/triageServer";
import type { SafetyPlan } from "@kindminds/types";
import {
  ShieldAlert,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

export const Route = createFileRoute("/safety-plan")({
  component: SafetyPlanPage,
});

function SafetyPlanPage() {
  const [sessionId] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("triage_session_id") || "sess_demo";
    }
    return "sess_demo";
  });

  const [warningSigns, setWarningSigns] = useState<string[]>([
    "Feeling tight in my chest and trembling",
    "Belief that the violence is recurring right now",
    "Urge to hide or disappear",
  ]);

  const [internalCoping, setInternalCoping] = useState<string[]>([
    "5-4-3-2-1 sensory grounding room in KindMinds",
    "Putting cold water on my wrists and face",
    "Listening to slow, gentle ambient sound",
  ]);

  const [socialDistractions, setSocialDistractions] = useState<string[]>([
    "Sitting in a public library or peaceful cafe",
    "Calling my supportive cousin to talk about daily topics",
  ]);

  const [safeEnvironmentSteps, setSafeEnvironmentSteps] = useState<string[]>([
    "Keep doors securely locked and curtains closed if feeling exposed",
    "Ask a trusted friend to hold emergency medication",
  ]);

  const [newWarning, setNewWarning] = useState("");
  const [newCoping, setNewCoping] = useState("");
  const [newDistraction, setNewDistraction] = useState("");
  const [newEnvironment, setNewEnvironment] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    setSavedSuccess(false);

    const plan: SafetyPlan = {
      id: `sp_${Date.now()}`,
      sessionId,
      warningSigns,
      internalCopingStrategies: internalCoping,
      socialDistractions,
      trustedContacts: [],
      professionalContacts: [
        { agencyName: "988 Suicide & Crisis Lifeline", phone: "988" },
        { agencyName: "Center for Victims of Torture", phone: "+1-612-436-4800" },
      ],
      safeEnvironmentSteps,
      updatedAt: new Date().toISOString(),
    };

    try {
      await saveSafetyPlan({ data: { plan } });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save safety plan", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#302a24] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f48d16]/10 border border-[#f48d16]/25 text-[#f48d16] text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Stanley-Brown Evidence-Based Model</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#faf9f5] tracking-tight">My Personalized Safety Plan</h1>
          <p className="text-[#a89f91] text-sm mt-1 max-w-xl leading-relaxed">
            A step-by-step roadmap to navigate acute distress and regain emotional sovereignty.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`px-6 py-2.5 rounded-full font-bold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto ${
            savedSuccess
              ? "bg-[#10b981] text-[#100e0c] shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              : "bg-[#f48d16] hover:bg-[#e07d0f] text-[#100e0c] shadow-[0_0_25px_rgba(244,141,22,0.25)]"
          }`}
        >
          {savedSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{isSaving ? "Saving..." : savedSuccess ? "Plan Saved" : "Save Safety Plan"}</span>
        </button>
      </div>

      {/* Step 1: Warning Signs */}
      <div className="parley-bento-card rounded-3xl bg-[#181512] border border-[#302a24] p-6 sm:p-8 space-y-4 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-[#faf9f5] text-base flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-[#26211c] border border-[#483f36] flex items-center justify-center font-mono text-xs font-bold text-[#f48d16]">01</span>
            <span>Warning Signs That a Crisis Is Developing</span>
          </h3>
        </div>
        <p className="text-[#a89f91] text-xs leading-relaxed">
          Thoughts, physical sensations, images, or behaviors that indicate distress is starting to overwhelm you.
        </p>
        <div className="space-y-2">
          {warningSigns.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-[#100e0c] border border-[#302a24] text-xs text-[#faf9f5] hover:border-[#483f36] transition-colors">
              <span>{item}</span>
              <button
                onClick={() => setWarningSigns(warningSigns.filter((_, i) => i !== idx))}
                className="text-[#756d62] hover:text-[#fb3858] p-1 rounded-lg hover:bg-[#fb3858]/10 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 pt-1">
          <input
            type="text"
            value={newWarning}
            onChange={(e) => setNewWarning(e.target.value)}
            placeholder="Add a warning sign..."
            className="flex-1 px-4 py-2.5 bg-[#100e0c] border border-[#302a24] rounded-xl text-xs text-[#faf9f5] placeholder-[#756d62] focus:outline-none focus:border-[#f48d16]"
            onKeyDown={(e) => {
              if (e.key === "Enter" && newWarning.trim()) {
                setWarningSigns([...warningSigns, newWarning.trim()]);
                setNewWarning("");
              }
            }}
          />
          <button
            onClick={() => {
              if (newWarning.trim()) {
                setWarningSigns([...warningSigns, newWarning.trim()]);
                setNewWarning("");
              }
            }}
            className="p-2.5 bg-[#26211c] hover:bg-[#302a24] text-[#f48d16] rounded-xl border border-[#483f36] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Step 2: Internal Coping Strategies */}
      <div className="parley-bento-card rounded-3xl bg-[#181512] border border-[#302a24] p-6 sm:p-8 space-y-4 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-[#faf9f5] text-base flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-[#26211c] border border-[#483f36] flex items-center justify-center font-mono text-xs font-bold text-[#f48d16]">02</span>
            <span>Internal Coping Strategies (Things I can do on my own)</span>
          </h3>
        </div>
        <p className="text-[#a89f91] text-xs leading-relaxed">
          Actions you can take privately without contacting anyone to take your mind off problems.
        </p>
        <div className="space-y-2">
          {internalCoping.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-[#100e0c] border border-[#302a24] text-xs text-[#faf9f5] hover:border-[#483f36] transition-colors">
              <span>{item}</span>
              <button
                onClick={() => setInternalCoping(internalCoping.filter((_, i) => i !== idx))}
                className="text-[#756d62] hover:text-[#fb3858] p-1 rounded-lg hover:bg-[#fb3858]/10 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 pt-1">
          <input
            type="text"
            value={newCoping}
            onChange={(e) => setNewCoping(e.target.value)}
            placeholder="Add an internal coping strategy..."
            className="flex-1 px-4 py-2.5 bg-[#100e0c] border border-[#302a24] rounded-xl text-xs text-[#faf9f5] placeholder-[#756d62] focus:outline-none focus:border-[#f48d16]"
            onKeyDown={(e) => {
              if (e.key === "Enter" && newCoping.trim()) {
                setInternalCoping([...internalCoping, newCoping.trim()]);
                setNewCoping("");
              }
            }}
          />
          <button
            onClick={() => {
              if (newCoping.trim()) {
                setInternalCoping([...internalCoping, newCoping.trim()]);
                setNewCoping("");
              }
            }}
            className="p-2.5 bg-[#26211c] hover:bg-[#302a24] text-[#f48d16] rounded-xl border border-[#483f36] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Step 3: Social Settings & Distractions */}
      <div className="parley-bento-card rounded-3xl bg-[#181512] border border-[#302a24] p-6 sm:p-8 space-y-4 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-[#faf9f5] text-base flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-[#26211c] border border-[#483f36] flex items-center justify-center font-mono text-xs font-bold text-[#f48d16]">03</span>
            <span>People and Social Settings That Provide Healthy Distraction</span>
          </h3>
        </div>
        <p className="text-[#a89f91] text-xs leading-relaxed">
          Places, communities, or individuals that create a feeling of normalcy and security without needing to disclose trauma.
        </p>
        <div className="space-y-2">
          {socialDistractions.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-[#100e0c] border border-[#302a24] text-xs text-[#faf9f5] hover:border-[#483f36] transition-colors">
              <span>{item}</span>
              <button
                onClick={() => setSocialDistractions(socialDistractions.filter((_, i) => i !== idx))}
                className="text-[#756d62] hover:text-[#fb3858] p-1 rounded-lg hover:bg-[#fb3858]/10 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 pt-1">
          <input
            type="text"
            value={newDistraction}
            onChange={(e) => setNewDistraction(e.target.value)}
            placeholder="Add a social place or contact for distraction..."
            className="flex-1 px-4 py-2.5 bg-[#100e0c] border border-[#302a24] rounded-xl text-xs text-[#faf9f5] placeholder-[#756d62] focus:outline-none focus:border-[#f48d16]"
            onKeyDown={(e) => {
              if (e.key === "Enter" && newDistraction.trim()) {
                setSocialDistractions([...socialDistractions, newDistraction.trim()]);
                setNewDistraction("");
              }
            }}
          />
          <button
            onClick={() => {
              if (newDistraction.trim()) {
                setSocialDistractions([...socialDistractions, newDistraction.trim()]);
                setNewDistraction("");
              }
            }}
            className="p-2.5 bg-[#26211c] hover:bg-[#302a24] text-[#f48d16] rounded-xl border border-[#483f36] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Step 4: Environmental Safety */}
      <div className="parley-bento-card rounded-3xl bg-[#181512] border border-[#302a24] p-6 sm:p-8 space-y-4 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-[#faf9f5] text-base flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-[#26211c] border border-[#483f36] flex items-center justify-center font-mono text-xs font-bold text-[#f48d16]">04</span>
            <span>Making My Environment Safe</span>
          </h3>
        </div>
        <p className="text-[#a89f91] text-xs leading-relaxed">
          Tangible steps to secure physical surroundings and eliminate dangerous items or exposure to triggering media.
        </p>
        <div className="space-y-2">
          {safeEnvironmentSteps.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-[#100e0c] border border-[#302a24] text-xs text-[#faf9f5] hover:border-[#483f36] transition-colors">
              <span>{item}</span>
              <button
                onClick={() => setSafeEnvironmentSteps(safeEnvironmentSteps.filter((_, i) => i !== idx))}
                className="text-[#756d62] hover:text-[#fb3858] p-1 rounded-lg hover:bg-[#fb3858]/10 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 pt-1">
          <input
            type="text"
            value={newEnvironment}
            onChange={(e) => setNewEnvironment(e.target.value)}
            placeholder="Add an environmental safety step..."
            className="flex-1 px-4 py-2.5 bg-[#100e0c] border border-[#302a24] rounded-xl text-xs text-[#faf9f5] placeholder-[#756d62] focus:outline-none focus:border-[#f48d16]"
            onKeyDown={(e) => {
              if (e.key === "Enter" && newEnvironment.trim()) {
                setSafeEnvironmentSteps([...safeEnvironmentSteps, newEnvironment.trim()]);
                setNewEnvironment("");
              }
            }}
          />
          <button
            onClick={() => {
              if (newEnvironment.trim()) {
                setSafeEnvironmentSteps([...safeEnvironmentSteps, newEnvironment.trim()]);
                setNewEnvironment("");
              }
            }}
            className="p-2.5 bg-[#26211c] hover:bg-[#302a24] text-[#f48d16] rounded-xl border border-[#483f36] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
