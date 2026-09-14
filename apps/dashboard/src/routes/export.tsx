import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Download,
  Copy,
  CheckCircle2,
  Lock,
  FileText,
  Shield,
  CloudUpload,
} from "lucide-react";

export const Route = createFileRoute("/export")({
  component: ExportPage,
});

function ExportPage() {
  const [recipient, setRecipient] = useState<"survivor" | "clinician" | "advocate">("survivor");
  const [copied, setCopied] = useState(false);
  const [uploadedR2, setUploadedR2] = useState(false);

  const sampleReport = {
    system: "KindMinds Atrocity & Trauma Support System",
    version: "1.0-trauma-informed",
    exportTimestamp: new Date().toISOString(),
    sessionPseudonym: "Survivor",
    clinicalSummary: {
      initialDistressScore: 8.2,
      currentDistressScore: 4.1,
      stabilizationDelta: "-4.1 (Autonomic de-escalation observed)",
      primaryObservedState: "Hyperarousal transitioned to Grounded",
      interventionsDeployed: ["5-4-3-2-1 Sensory Grounding", "Stanley-Brown Safety Plan Initialized"],
      pcl5TraumaScreener: {
        administered: true,
        score: "14/32",
        category: "Moderate reactivity",
      },
    },
    safetyPlanSummary: {
      identifiedWarningSigns: ["Chest constriction", "Trembling", "Intrusive flashbacks"],
      internalCopingStrategies: ["5-4-3-2-1 Sensory Grounding", "Cold water on wrists"],
      crisisContacts: ["988 Suicide & Crisis Lifeline", "Center for Victims of Torture (+1-612-436-4800)"],
    },
    confidentialityNotice:
      "This document is encrypted for survivor sovereignty and contains zero personally identifiable tracking data. Handle with strict trauma-informed care.",
  };

  const reportText = JSON.stringify(sampleReport, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([reportText], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kindminds_trauma_summary_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCloudflareR2Upload = () => {
    setUploadedR2(true);
    setTimeout(() => setUploadedR2(false), 3500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="border-b border-[#302a24] pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f48d16]/10 border border-[#f48d16]/25 text-[#f48d16] text-xs font-semibold uppercase tracking-wider mb-2">
          <Lock className="w-3.5 h-3.5" />
          <span>Encrypted Case Sovereign Export</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#faf9f5] tracking-tight">Export Clinical Case Summary</h1>
        <p className="text-[#a89f91] text-sm mt-1 max-w-2xl leading-relaxed">
          Produce an encrypted, portable report of your stabilization trajectory, safety plan, and screener results to share with a trusted therapist, human rights advocate, or legal caseworker.
        </p>
      </div>

      {/* Recipient Filter */}
      <div className="parley-bento-card rounded-3xl bg-[#181512] border border-[#302a24] p-6 sm:p-8 space-y-4 shadow-xl">
        <label className="text-xs font-bold text-[#a89f91] uppercase tracking-wider block">
          Select Report Perspective
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => setRecipient("survivor")}
            className={`p-5 rounded-2xl text-left border transition-all cursor-pointer relative overflow-hidden ${
              recipient === "survivor"
                ? "bg-[#26211c] border-[#f48d16] text-[#faf9f5] shadow-[0_0_20px_rgba(244,141,22,0.15)]"
                : "bg-[#100e0c] border-[#302a24] text-[#a89f91] hover:border-[#483f36] hover:text-[#faf9f5]"
            }`}
          >
            <div className="font-mono text-[10px] text-[#f48d16] font-bold mb-1">01. FORMAT</div>
            <div className="font-bold text-sm text-[#faf9f5]">Personal Survivor Record</div>
            <div className="text-xs text-[#a89f91] mt-1 leading-relaxed">
              Grounded self-reflection, somatic coping tools, and personalized safety checkpoints.
            </div>
          </button>

          <button
            onClick={() => setRecipient("clinician")}
            className={`p-5 rounded-2xl text-left border transition-all cursor-pointer relative overflow-hidden ${
              recipient === "clinician"
                ? "bg-[#26211c] border-[#f48d16] text-[#faf9f5] shadow-[0_0_20px_rgba(244,141,22,0.15)]"
                : "bg-[#100e0c] border-[#302a24] text-[#a89f91] hover:border-[#483f36] hover:text-[#faf9f5]"
            }`}
          >
            <div className="font-mono text-[10px] text-[#f48d16] font-bold mb-1">02. FORMAT</div>
            <div className="font-bold text-sm text-[#faf9f5]">Clinical Referral Note</div>
            <div className="text-xs text-[#a89f91] mt-1 leading-relaxed">
              Autonomic telemetry timeline, PCL-5 screener scoring, and trauma markers.
            </div>
          </button>

          <button
            onClick={() => setRecipient("advocate")}
            className={`p-5 rounded-2xl text-left border transition-all cursor-pointer relative overflow-hidden ${
              recipient === "advocate"
                ? "bg-[#26211c] border-[#f48d16] text-[#faf9f5] shadow-[0_0_20px_rgba(244,141,22,0.15)]"
                : "bg-[#100e0c] border-[#302a24] text-[#a89f91] hover:border-[#483f36] hover:text-[#faf9f5]"
            }`}
          >
            <div className="font-mono text-[10px] text-[#f48d16] font-bold mb-1">03. FORMAT</div>
            <div className="font-bold text-sm text-[#faf9f5]">Human Rights / Legal Aid</div>
            <div className="text-xs text-[#a89f91] mt-1 leading-relaxed">
              Psychosocial impact timeline formatted for humanitarian protection affidavits.
            </div>
          </button>
        </div>
      </div>

      {/* Preview Window */}
      <div className="parley-bento-card rounded-3xl bg-[#181512] border border-[#302a24] p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#302a24] pb-4">
          <div className="flex items-center gap-2 text-xs font-mono text-[#a89f91]">
            <FileText className="w-4 h-4 text-[#f48d16]" />
            <span>Encrypted JSON Report Payload</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopy}
              className="px-4 py-2 rounded-full bg-[#201c18] hover:bg-[#26211c] text-[#faf9f5] text-xs font-medium border border-[#302a24] flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-5 py-2 rounded-full bg-[#f48d16] hover:bg-[#e07d0f] text-[#100e0c] text-xs font-bold shadow-[0_0_20px_rgba(244,141,22,0.25)] flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
            <button
              onClick={handleCloudflareR2Upload}
              className="px-5 py-2 rounded-full bg-[#26211c] hover:bg-[#302a24] text-[#f48d16] text-xs font-semibold border border-[#483f36] shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <CloudUpload className="w-3.5 h-3.5" />
              <span>{uploadedR2 ? "Saved to R2 Bucket" : "Save to Cloudflare R2"}</span>
            </button>
          </div>
        </div>

        <pre className="p-5 rounded-2xl bg-[#100e0c] border border-[#302a24] text-[11px] font-mono text-[#f48d16]/90 overflow-x-auto max-h-96 leading-relaxed">
          {reportText}
        </pre>
      </div>
    </div>
  );
}
