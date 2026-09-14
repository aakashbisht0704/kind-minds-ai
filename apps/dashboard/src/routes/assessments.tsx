import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { saveAssessment } from "~/server/triageServer";
import type { ClinicalAssessmentRecord } from "@kindminds/types";
import {
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/assessments")({
  component: AssessmentsPage,
});

const PCL5_QUESTIONS = [
  { id: "q1", prompt: "Repeated, disturbing, and unwanted memories of the stressful experience?", subscale: "Intrusion" },
  { id: "q2", prompt: "Repeated, disturbing dreams of the stressful experience?", subscale: "Intrusion" },
  { id: "q3", prompt: "Suddenly feeling or acting as if the stressful experience were actually happening again (flashbacks)?", subscale: "Intrusion" },
  { id: "q4", prompt: "Avoiding memories, thoughts, or feelings related to the stressful experience?", subscale: "Avoidance" },
  { id: "q5", prompt: "Avoiding external reminders (people, places, conversations, objects) of the experience?", subscale: "Avoidance" },
  { id: "q6", prompt: "Having strong negative beliefs about yourself, other people, or the world?", subscale: "Cognition/Mood" },
  { id: "q7", prompt: "Trouble falling or staying asleep?", subscale: "Arousal" },
  { id: "q8", prompt: "Being 'superalert', watchful, or on guard?", subscale: "Arousal" },
];

const LIKERT_OPTIONS = [
  { label: "Not at all", value: 0 },
  { label: "A little bit", value: 1 },
  { label: "Moderately", value: 2 },
  { label: "Quite a bit", value: 3 },
  { label: "Extremely", value: 4 },
];

function AssessmentsPage() {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const totalScore = Object.values(answers).reduce((a, b) => a + b, 0);
  const maxScore = PCL5_QUESTIONS.length * 4;

  const getSeverity = (score: number): "minimal" | "mild" | "moderate" | "severe" | "crisis" => {
    if (score >= 24) return "severe";
    if (score >= 16) return "moderate";
    if (score >= 8) return "mild";
    return "minimal";
  };

  const severity = getSeverity(totalScore);

  const handleSubmit = async () => {
    setIsSaving(true);
    const sessionId = (typeof window !== "undefined" && sessionStorage.getItem("triage_session_id")) || "sess_demo";

    const record: ClinicalAssessmentRecord = {
      id: `pcl5_${Date.now()}`,
      sessionId,
      screenerType: "pcl5_trauma",
      answers,
      totalScore,
      severityCategory: severity,
      interpretation:
        severity === "severe"
          ? "Indicates significant post-traumatic stress burden. Prioritizing autonomic grounding and safety stabilization is highly recommended."
          : severity === "moderate"
          ? "Moderate trauma-related reactivity observed. Evidence-based grounding and supportive dialogue are beneficial."
          : "Mild or regulated baseline trauma impact.",
      timestamp: new Date().toISOString(),
    };

    try {
      await saveAssessment({ data: { assessment: record } });
    } catch (err) {
      console.error("Failed to save assessment", err);
    } finally {
      setIsSaving(false);
      setSubmitted(true);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="border-b border-[#302a24] pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f48d16]/10 border border-[#f48d16]/25 text-[#f48d16] text-xs font-semibold uppercase tracking-wider mb-2">
          <FileCheck2 className="w-3.5 h-3.5" />
          <span>Evidence-Based Screening</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#faf9f5] tracking-tight">Adapted PCL-5 Trauma Screener</h1>
        <p className="text-[#a89f91] text-sm mt-1 leading-relaxed">
          In the past month, how much have you been bothered by the following problems regarding your stressful or traumatic experiences?
        </p>
      </div>

      {!submitted ? (
        <div className="space-y-6">
          {PCL5_QUESTIONS.map((q, idx) => (
            <div key={q.id} className="parley-bento-card rounded-3xl bg-[#181512] border border-[#302a24] p-6 sm:p-8 space-y-4 shadow-xl relative overflow-hidden">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-xl bg-[#26211c] border border-[#483f36] flex items-center justify-center font-mono text-xs font-bold text-[#f48d16] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-[#faf9f5] text-sm leading-snug">
                    {q.prompt}
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#26211c] text-[#a89f91] border border-[#302a24] whitespace-nowrap shrink-0">
                  {q.subscale}
                </span>
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
                {LIKERT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setAnswers({ ...answers, [q.id]: opt.value })}
                    className={`p-3 rounded-2xl text-xs font-medium border transition-all text-center cursor-pointer ${
                      answers[q.id] === opt.value
                        ? "bg-[#f48d16] text-[#100e0c] border-[#f48d16] font-bold shadow-[0_0_15px_rgba(244,141,22,0.3)]"
                        : "bg-[#100e0c] hover:bg-[#201c18] text-[#a89f91] hover:text-[#faf9f5] border-[#302a24]"
                    }`}
                  >
                    <div>{opt.label}</div>
                    <div className="text-[10px] font-mono opacity-60 mt-0.5">({opt.value})</div>
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-[#756d62] font-mono">
              Completed {Object.keys(answers).length} of {PCL5_QUESTIONS.length} assessment prompts
            </div>
            <button
              onClick={handleSubmit}
              disabled={Object.keys(answers).length < PCL5_QUESTIONS.length || isSaving}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#f48d16] hover:bg-[#e07d0f] text-[#100e0c] font-bold text-xs shadow-[0_0_25px_rgba(244,141,22,0.25)] hover:shadow-[0_0_35px_rgba(244,141,22,0.35)] disabled:opacity-40 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSaving ? "Calculating Trauma Load..." : "Complete & View Clinical Interpretation"}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="parley-bento-card rounded-3xl bg-[#181512] border border-[#302a24] p-8 sm:p-12 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-[#f48d16]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center space-y-2 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/25 text-xs font-semibold uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Assessment Completed
            </div>
            <h2 className="text-2xl font-bold text-[#faf9f5] tracking-tight">Trauma Reactivity Profile</h2>
          </div>

          <div className="flex items-center justify-center gap-8 py-6 border-y border-[#302a24] relative z-10">
            <div className="text-center">
              <div className="text-xs text-[#756d62] uppercase font-semibold tracking-wider">Total Score</div>
              <div className="text-4xl font-black text-[#faf9f5] mt-1 font-mono">
                {totalScore} <span className="text-sm font-normal text-[#756d62]">/ {maxScore}</span>
              </div>
            </div>
            <div className="w-px h-12 bg-[#302a24]"></div>
            <div className="text-center">
              <div className="text-xs text-[#756d62] uppercase font-semibold tracking-wider">Severity Category</div>
              <div className={`text-2xl font-bold capitalize mt-1 ${
                severity === "severe" ? "text-[#fb3858]" : severity === "moderate" ? "text-[#f48d16]" : "text-[#10b981]"
              }`}>
                {severity}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#100e0c] border border-[#302a24] text-xs text-[#a89f91] leading-relaxed relative z-10">
            <strong className="text-[#faf9f5]">Clinical Note:</strong> Your responses reflect an understandable, physiological reaction to extreme events. High scores are not a sign of personal weakness; they indicate that your nervous system is working overtime to protect you.
          </div>

          <div className="flex items-center justify-center gap-4 pt-4 relative z-10">
            <button
              onClick={() => {
                setAnswers({});
                setSubmitted(false);
              }}
              className="px-6 py-2.5 rounded-full bg-[#26211c] hover:bg-[#302a24] text-[#faf9f5] font-semibold text-xs border border-[#483f36] transition-all flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-[#f48d16]" />
              <span>Retake Screener</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
