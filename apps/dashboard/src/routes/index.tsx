import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  ShieldAlert,
  Flame,
  FileCheck2,
  Download,
  Heart,
  AlertTriangle,
  ArrowRight,
  PhoneCall,
  CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: DashboardHome,
});

function DashboardHome() {
  return (
    <div className="space-y-8">
      {/* Welcome Sanctuary Bento Card */}
      <div className="parley-bento-card rounded-[2.5rem] p-7 sm:p-10 relative overflow-hidden border border-[#383028]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f48d16]/10 text-[#f48d16] border border-[#f48d16]/25 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse"></span>
              <span>Anonymous Sanctuary Active • Zero PII</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#faf9f5] tracking-tight">
              Welcome to Your Safe Sanctuary
            </h1>
            <p className="text-[#a89f91] text-xs sm:text-sm max-w-2xl leading-relaxed">
              You are in a confidential, trauma-informed space. Move at whatever pace feels comfortable. Take a slow breath, speak with the triage agent, or ground your body whenever you feel ready.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/triage"
              className="px-6 py-3 rounded-full bg-[#f48d16] hover:bg-[#ff9c2b] text-stone-950 font-bold text-xs shadow-lg shadow-[#f48d16]/20 transition-all hover:scale-105 flex items-center gap-2"
            >
              <Activity className="w-4 h-4" />
              <span>Start Live Triage</span>
            </Link>
            <Link
              to="/grounding"
              className="px-5 py-3 rounded-full bg-[#241f1a] hover:bg-[#2c2620] text-[#faf9f5] font-semibold text-xs border border-[#383028] transition-colors flex items-center gap-2"
            >
              <Flame className="w-4 h-4 text-[#f48d16]" />
              <span>Grounding Room</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Autonomic Distress Telemetry Vitals Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="parley-bento-card rounded-2xl p-5 space-y-1">
          <div className="text-xs text-[#756d62] font-semibold flex items-center justify-between">
            <span>Autonomic Distress</span>
            <Heart className="w-4 h-4 text-[#f48d16]" />
          </div>
          <div className="text-2xl font-black text-[#faf9f5]">4.2 <span className="text-xs font-normal text-[#756d62]">/ 10</span></div>
          <div className="text-[11px] text-[#10b981] flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-3 h-3" /> Regulated / Grounded
          </div>
        </div>

        <div className="parley-bento-card rounded-2xl p-5 space-y-1">
          <div className="text-xs text-[#756d62] font-semibold flex items-center justify-between">
            <span>Trauma State</span>
            <Activity className="w-4 h-4 text-[#f48d16]" />
          </div>
          <div className="text-2xl font-black text-[#faf9f5]">Oriented</div>
          <div className="text-[11px] text-[#756d62]">No active dissociation</div>
        </div>

        <div className="parley-bento-card rounded-2xl p-5 space-y-1">
          <div className="text-xs text-[#756d62] font-semibold flex items-center justify-between">
            <span>Safety Plan</span>
            <ShieldAlert className="w-4 h-4 text-[#10b981]" />
          </div>
          <div className="text-2xl font-black text-[#faf9f5]">Step 3 of 6</div>
          <div className="text-[11px] text-[#10b981] font-semibold">Coping strategies logged</div>
        </div>

        <div className="parley-bento-card rounded-2xl p-5 space-y-1">
          <div className="text-xs text-[#756d62] font-semibold flex items-center justify-between">
            <span>Stealth Escapes</span>
            <AlertTriangle className="w-4 h-4 text-[#fb3858]" />
          </div>
          <div className="text-2xl font-black text-[#faf9f5]">Double ESC</div>
          <div className="text-[11px] text-[#fb3858] font-semibold">Wipes cache & redirects</div>
        </div>
      </div>

      {/* Parley Bento Module Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-[#faf9f5] flex items-center gap-2">
            <span>Clinical & Support Modules</span>
          </h2>
          <span className="text-xs text-[#756d62]">Autonomous Tool Pipeline</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Live Triage */}
          <Link
            to="/triage"
            className="group parley-bento-card rounded-3xl p-6 flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-[#f48d16]/10 text-[#f48d16] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-[#f48d16]/20">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#faf9f5] text-base">Conversational Triage Agent</h3>
              <p className="text-[#a89f91] text-xs leading-relaxed mt-2">
                Engage in real-time, trauma-informed dialogue. The agent predicts nervous system distress and autonomously executes grounding and safety protocols.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#302a24] flex items-center justify-between text-xs text-[#f48d16] font-semibold">
              <span>Open Triage Session</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 2: Grounding Room */}
          <Link
            to="/grounding"
            className="group parley-bento-card rounded-3xl p-6 flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-[#f48d16]/10 text-[#f48d16] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-[#f48d16]/20">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#faf9f5] text-base">Somatic Grounding Room</h3>
              <p className="text-[#a89f91] text-xs leading-relaxed mt-2">
                Down-regulate hyperarousal or pull out of dissociation using the 5-4-3-2-1 sensory method, physiological sigh breathing, and bilateral visual anchors.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#302a24] flex items-center justify-between text-xs text-[#f48d16] font-semibold">
              <span>Enter Grounding Room</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 3: Stanley-Brown Safety Plan */}
          <Link
            to="/safety-plan"
            className="group parley-bento-card rounded-3xl p-6 flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-[#10b981]/10 text-[#10b981] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-[#10b981]/20">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#faf9f5] text-base">Stanley-Brown Safety Plan</h3>
              <p className="text-[#a89f91] text-xs leading-relaxed mt-2">
                Build your personalized crisis hierarchy: early warning signs, internal coping mechanisms, trusted social distractions, and safe physical boundaries.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#302a24] flex items-center justify-between text-xs text-[#10b981] font-semibold">
              <span>View / Edit Safety Plan</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 4: Screeners */}
          <Link
            to="/assessments"
            className="group parley-bento-card rounded-3xl p-6 flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-[#f48d16]/10 text-[#f48d16] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-[#f48d16]/20">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#faf9f5] text-base">Standardized Trauma Screeners</h3>
              <p className="text-[#a89f91] text-xs leading-relaxed mt-2">
                Complete adapted PCL-5 trauma impact screeners or PHQ-4 distress assessments with immediate, empowering interpretations.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#302a24] flex items-center justify-between text-xs text-[#f48d16] font-semibold">
              <span>Start Assessment</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 5: Case Export */}
          <Link
            to="/export"
            className="group parley-bento-card rounded-3xl p-6 flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-[#10b981]/10 text-[#10b981] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-[#10b981]/20">
                <Download className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#faf9f5] text-base">Encrypted Case Export</h3>
              <p className="text-[#a89f91] text-xs leading-relaxed mt-2">
                Export an encrypted clinical trauma summary for trusted human advocates, medical professionals, or legal asylum caseworkers.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#302a24] flex items-center justify-between text-xs text-[#10b981] font-semibold">
              <span>Generate Summary</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 6: 24/7 Crisis Lifelines */}
          <div className="parley-bento-card rounded-3xl p-6 flex flex-col justify-between border-[#fb3858]/30">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-[#fb3858]/10 text-[#fb3858] flex items-center justify-center mb-4 border border-[#fb3858]/20">
                <PhoneCall className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#faf9f5] text-base">Immediate Human Crisis Line</h3>
              <p className="text-[#a89f91] text-xs leading-relaxed mt-2">
                If you are in immediate danger or need human crisis counseling right now, connect directly with 988 or verified international hotlines.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#302a24] flex items-center justify-between">
              <a
                href="tel:988"
                className="px-4 py-2 rounded-full bg-[#fb3858] hover:bg-[#ff4d6a] text-white text-xs font-bold transition-colors shadow-sm"
              >
                Call 988 Now
              </a>
              <a
                href="https://findahelpline.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#fb3858] hover:underline font-semibold"
              >
                Global List ↗
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
