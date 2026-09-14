import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Flame,
  Eye,
  Hand,
  Volume2,
  Wind,
  Coffee,
  RotateCcw,
  ArrowRight,
  Activity,
  HeartHandshake,
} from "lucide-react";

export const Route = createFileRoute("/grounding")({
  component: GroundingPage,
});

type GroundingMode = "54321" | "breathing" | "bilateral";

const SENSES = [
  {
    count: 5,
    title: "5 Things You Can See",
    description: "Look slowly around the space you are in right now. Silently notice five shapes, colors, or objects.",
    icon: Eye,
    cue: "Notice the details: a shadow, a pattern on the wall, the edge of a table.",
  },
  {
    count: 4,
    title: "4 Things You Can Touch",
    description: "Notice four physical textures touching your skin right now.",
    icon: Hand,
    cue: "The fabric of your clothes, the surface under your hands, the solid floor beneath your feet.",
  },
  {
    count: 3,
    title: "3 Things You Can Hear",
    description: "Listen for three distinct sounds around you or far away.",
    icon: Volume2,
    cue: "A distant hum, wind against glass, or your own gentle breath.",
  },
  {
    count: 2,
    title: "2 Things You Can Smell",
    description: "Notice two scents in the air, or imagine a scent that makes you feel peaceful.",
    icon: Wind,
    cue: "Fresh air, fabric, soap, or a memory of rain on earth.",
  },
  {
    count: 1,
    title: "1 Thing You Can Taste",
    description: "Notice any lingering taste, or take a slow sip of water.",
    icon: Coffee,
    cue: "Swallow gently. Feel the cool sensation in your throat.",
  },
];

function GroundingPage() {
  const [mode, setMode] = useState<GroundingMode>("54321");
  const [currentStep, setCurrentStep] = useState(0);

  // Breathing state
  const [breathPhase, setBreathPhase] = useState<"Inhale" | "Hold" | "Exhale">("Inhale");
  const [breathTimer, setBreathTimer] = useState(4);

  // Breathing loop
  useEffect(() => {
    if (mode !== "breathing") return;

    let timer = 4;
    let phase: "Inhale" | "Hold" | "Exhale" = "Inhale";
    setBreathPhase("Inhale");
    setBreathTimer(4);

    const interval = setInterval(() => {
      timer -= 1;
      if (timer <= 0) {
        if (phase === "Inhale") {
          phase = "Hold";
          timer = 7;
        } else if (phase === "Hold") {
          phase = "Exhale";
          timer = 8;
        } else {
          phase = "Inhale";
          timer = 4;
        }
        setBreathPhase(phase);
      }
      setBreathTimer(timer);
    }, 1000);

    return () => clearInterval(interval);
  }, [mode]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#302a24] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f48d16]/10 border border-[#f48d16]/25 text-[#f48d16] text-xs font-semibold uppercase tracking-wider mb-2">
            <Flame className="w-3.5 h-3.5" />
            <span>Somatic Down-Regulation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#faf9f5] tracking-tight">Grounding & Stabilization Room</h1>
          <p className="text-[#a89f91] text-sm mt-1 max-w-xl leading-relaxed">
            Re-anchor your autonomic nervous system to the present moment when trauma symptoms surface.
          </p>
        </div>

        <div className="bg-[#181512] border border-[#302a24] rounded-full p-1 flex gap-1 shadow-inner self-start sm:self-auto">
          <button
            onClick={() => setMode("54321")}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              mode === "54321"
                ? "bg-[#26211c] text-[#faf9f5] border border-[#483f36] shadow-sm"
                : "text-[#a89f91] hover:text-[#faf9f5]"
            }`}
          >
            5-4-3-2-1 Sensory
          </button>
          <button
            onClick={() => setMode("breathing")}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              mode === "breathing"
                ? "bg-[#26211c] text-[#faf9f5] border border-[#483f36] shadow-sm"
                : "text-[#a89f91] hover:text-[#faf9f5]"
            }`}
          >
            4-7-8 Breathing
          </button>
        </div>
      </div>

      {/* Mode 1: 5-4-3-2-1 Sensory Protocol */}
      {mode === "54321" && (
        <div className="space-y-6">
          <div className="parley-bento-card rounded-3xl bg-[#181512] border border-[#302a24] p-8 sm:p-12 shadow-2xl relative overflow-hidden flex flex-col items-center text-center space-y-6">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-[#f48d16]/5 rounded-full blur-3xl pointer-events-none" />

            {/* Step Indicator */}
            <div className="flex items-center gap-2 relative z-10">
              {SENSES.map((s, idx) => (
                <button
                  key={s.count}
                  onClick={() => setCurrentStep(idx)}
                  className={`w-9 h-9 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    currentStep === idx
                      ? "bg-[#f48d16] text-[#100e0c] scale-110 shadow-[0_0_15px_rgba(244,141,22,0.4)]"
                      : idx < currentStep
                      ? "bg-[#26211c] text-[#f48d16] border border-[#f48d16]/40"
                      : "bg-[#100e0c] text-[#756d62] border border-[#302a24]"
                  }`}
                >
                  {s.count}
                </button>
              ))}
            </div>

            {/* Active Step Card */}
            <div className="max-w-md space-y-4 pt-4 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-[#f48d16]/10 border border-[#f48d16]/20 text-[#f48d16] flex items-center justify-center mx-auto shadow-inner">
                {(() => {
                  const Icon = SENSES[currentStep]!.icon;
                  return <Icon className="w-8 h-8" />;
                })()}
              </div>

              <h2 className="text-2xl font-bold text-[#faf9f5] tracking-tight">
                {SENSES[currentStep]!.title}
              </h2>

              <p className="text-[#a89f91] text-sm leading-relaxed">
                {SENSES[currentStep]!.description}
              </p>

              <div className="p-4 rounded-2xl bg-[#100e0c] border border-[#302a24] text-[#a89f91] text-xs italic">
                "{SENSES[currentStep]!.cue}"
              </div>
            </div>

            {/* Nav buttons */}
            <div className="flex items-center gap-4 pt-4 relative z-10">
              <button
                onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
                disabled={currentStep === 0}
                className="px-5 py-2.5 rounded-full bg-[#201c18] hover:bg-[#26211c] text-[#a89f91] text-xs font-semibold border border-[#302a24] disabled:opacity-30 transition-all cursor-pointer"
              >
                Previous
              </button>

              {currentStep < SENSES.length - 1 ? (
                <button
                  onClick={() => setCurrentStep((prev) => prev + 1)}
                  className="px-6 py-2.5 rounded-full bg-[#f48d16] hover:bg-[#e07d0f] text-[#100e0c] text-xs font-bold shadow-[0_0_20px_rgba(244,141,22,0.25)] transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Next Sense</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => setCurrentStep(0)}
                  className="px-6 py-2.5 rounded-full bg-[#10b981] hover:bg-[#059669] text-[#100e0c] text-xs font-bold shadow-[0_0_20px_rgba(16,185,129,0.25)] transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restart Grounding</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: 4-7-8 Physiological Sigh Breathing */}
      {mode === "breathing" && (
        <div className="parley-bento-card rounded-3xl bg-[#181512] border border-[#302a24] p-12 sm:p-20 shadow-2xl flex flex-col items-center justify-center text-center space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-[#f48d16]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex items-center justify-center w-64 h-64 z-10">
            {/* Pulsing Circle */}
            <div
              className={`absolute rounded-full transition-all duration-1000 ${
                breathPhase === "Inhale"
                  ? "w-56 h-56 bg-[#f48d16]/15 border-2 border-[#f48d16] scale-110 shadow-[0_0_40px_rgba(244,141,22,0.3)]"
                  : breathPhase === "Hold"
                  ? "w-56 h-56 bg-[#eab308]/15 border-2 border-[#eab308] scale-105 shadow-[0_0_40px_rgba(234,179,8,0.3)]"
                  : "w-36 h-36 bg-[#10b981]/15 border-2 border-[#10b981] scale-90 shadow-[0_0_40px_rgba(16,185,129,0.3)]"
              }`}
            ></div>

            <div className="relative z-10 flex flex-col items-center">
              <span className="text-3xl font-black text-[#faf9f5] tracking-wide">{breathPhase}</span>
              <span className="text-5xl font-extrabold text-[#f48d16] font-mono mt-2">{breathTimer}s</span>
            </div>
          </div>

          <div className="max-w-sm text-xs text-[#a89f91] leading-relaxed relative z-10">
            {breathPhase === "Inhale" && "Inhale slowly and deeply through your nose into your belly (4 seconds)..."}
            {breathPhase === "Hold" && "Gently hold the breath, letting your chest soften (7 seconds)..."}
            {breathPhase === "Exhale" && "Release the air slowly through your mouth with a soft sigh (8 seconds)..."}
          </div>

          <div className="pt-2 relative z-10">
            <Link
              to="/triage"
              className="px-6 py-2.5 rounded-full bg-[#201c18] hover:bg-[#26211c] text-[#faf9f5] text-xs font-semibold border border-[#302a24] transition-all flex items-center gap-2 shadow-sm"
            >
              <Activity className="w-4 h-4 text-[#f48d16]" />
              <span>Return to Triage Conversation</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
