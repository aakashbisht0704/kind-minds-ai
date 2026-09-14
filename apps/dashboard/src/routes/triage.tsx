import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { sendTriageMessage } from "~/server/triageServer";
import type { TriageMessage, ToolCallLog } from "@kindminds/types";
import {
  Send,
  Activity,
  ShieldAlert,
  Flame,
  AlertCircle,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowDown,
  RefreshCw,
} from "lucide-react";

export const Route = createFileRoute("/triage")({
  component: TriagePage,
});

function TriagePage() {
  const [sessionId] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("triage_session_id");
      if (stored) return stored;
      const created = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      sessionStorage.setItem("triage_session_id", created);
      return created;
    }
    return "sess_demo";
  });

  const [messages, setMessages] = useState<TriageMessage[]>([
    {
      id: "msg_init",
      sessionId,
      role: "assistant",
      content:
        "Welcome. I am KindMinds Triage Agent. You are safe here, and we can move at whatever pace feels comfortable for you. How are you feeling in your body and mind right now?",
      timestamp: new Date().toISOString(),
    },
  ]);

  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [distressScore, setDistressScore] = useState<number>(4.2);
  const [primaryState, setPrimaryState] = useState<string>("grounded");
  const [trajectory, setTrajectory] = useState<string>("stable");
  const [activeGrounding, setActiveGrounding] = useState<{ protocol: string; cue: string } | null>(null);
  const [crisisAlert, setCrisisAlert] = useState<boolean>(false);
  const [toolLogs, setToolLogs] = useState<ToolCallLog[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = input.trim();
    if (!text || isSending) return;

    setInput("");
    setIsSending(true);

    const userMsg: TriageMessage = {
      id: `msg_${Date.now()}_user`,
      sessionId,
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const result = await sendTriageMessage({
        data: {
          sessionId,
          text,
        },
      });

      setMessages((prev) => [...prev, result.message]);
      setDistressScore(result.distressScore);
      setPrimaryState(result.primaryState);

      if (result.message.toolCalls) {
        setToolLogs((prev) => [...result.message.toolCalls!, ...prev].slice(0, 15));
      }

      if (result.groundingAction) {
        setActiveGrounding({
          protocol: result.groundingAction.protocolType,
          cue: result.groundingAction.initialCue,
        });
      }

      if (result.safetyEscalation) {
        setCrisisAlert(true);
      }
    } catch (err) {
      console.error("Failed to send triage message", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_err_${Date.now()}`,
          sessionId,
          role: "assistant",
          content:
            "I am right here with you. Take a gentle breath. We can take this slow and try again in a moment.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8.0) return "text-[#fb3858]";
    if (score >= 6.0) return "text-[#f48d16]";
    return "text-[#10b981]";
  };

  const getBarColor = (score: number) => {
    if (score >= 8.0) return "from-[#f48d16] to-[#fb3858]";
    if (score >= 6.0) return "from-[#f48d16] to-[#ff9c2b]";
    return "from-[#10b981] to-[#34d399]";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-140px)] min-h-[560px]">
      {/* Chat Interface Column (8 Cols) */}
      <div className="lg:col-span-8 flex flex-col h-full parley-bento-card rounded-[2.5rem] border border-[#302a24] overflow-hidden shadow-2xl">
        {/* Chat Header */}
        <div className="p-4 sm:p-5 border-b border-[#302a24] bg-[#14110e] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#f48d16]/10 text-[#f48d16] flex items-center justify-center font-bold border border-[#f48d16]/20">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#faf9f5] flex items-center gap-2">
                KindMinds Clinical Agent
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse"></span>
              </div>
              <div className="text-[10px] text-[#756d62]">Autonomous Tool Loop Active • Edge Latency ~320ms</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/grounding"
              className="px-3.5 py-1.5 rounded-full bg-[#f48d16]/10 hover:bg-[#f48d16]/20 border border-[#f48d16]/30 text-[#f48d16] text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Somatic Grounding</span>
            </Link>
          </div>
        </div>

        {/* Crisis Escalation Alert Banner */}
        {crisisAlert && (
          <div className="bg-[#1c0e10] border-b border-[#fb3858]/40 p-4 text-xs text-[#fb3858] flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#fb3858] flex-shrink-0" />
              <span>
                <strong>Safety Escalation:</strong> High acute distress detected. Please remember 24/7 confidential help is ready for you right now at <strong>988</strong> (Call or Text).
              </span>
            </div>
            <a
              href="tel:988"
              className="px-4 py-1.5 bg-[#fb3858] hover:bg-[#ff4d6a] text-white font-bold rounded-full text-xs shadow-sm"
            >
              Call 988
            </a>
          </div>
        )}

        {/* Active Grounding Trigger Banner */}
        {activeGrounding && (
          <div className="bg-[#111914] border-b border-[#10b981]/30 p-3 text-xs text-[#10b981] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#10b981] flex-shrink-0" />
              <span>
                <strong>Grounding Suggested:</strong> {activeGrounding.cue}
              </span>
            </div>
            <Link
              to="/grounding"
              className="px-3.5 py-1 bg-[#10b981] hover:bg-[#34d399] text-stone-950 font-bold rounded-full text-xs shadow-sm"
            >
              Open Exercise
            </Link>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed shadow-sm ${
                  msg.role === "user"
                    ? "bg-[#241f1a] border border-[#383028] text-[#faf9f5] rounded-tr-xs"
                    : "bg-[#181512] border border-[#f48d16]/25 text-[#faf9f5] rounded-tl-xs space-y-2"
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-1 text-[10px]">
                  <span className={msg.role === "user" ? "text-[#756d62] font-medium" : "text-[#f48d16] font-bold"}>
                    {msg.role === "user" ? "Survivor" : "KindMinds Clinical Agent"}
                  </span>
                  <span className="text-[#756d62]">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                {/* Message text (shielded for privacy) */}
                <p className="shield-sensitive whitespace-pre-wrap text-[#faf9f5] leading-relaxed">{msg.content}</p>

                {/* Tool Call Indicators inside message */}
                {msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-[#302a24] space-y-1.5">
                    {msg.toolCalls.map((tc) => (
                      <div
                        key={tc.id}
                        className="px-3 py-1.5 rounded-xl bg-[#12100e] border border-[#302a24] text-[11px] font-mono text-[#f48d16] flex items-center justify-between"
                      >
                        <span className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#f48d16]"></span>
                          <span>Tool: <strong>{tc.name}</strong></span>
                        </span>
                        <span className="text-[10px] text-[#756d62]">{tc.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isSending && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl rounded-tl-xs bg-[#181512] border border-[#f48d16]/25 p-4 text-xs text-[#a89f91] flex items-center gap-2.5">
                <RefreshCw className="w-4 h-4 text-[#f48d16] animate-spin" />
                <span>Agent evaluating autonomic distress and preparing non-retraumatizing response...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="p-4 border-t border-[#302a24] bg-[#14110e] flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Share how you're feeling, or ask for a grounding exercise..."
            disabled={isSending}
            className="flex-1 px-4 py-3 bg-[#181512] border border-[#302a24] rounded-full text-xs text-[#faf9f5] placeholder-[#756d62] focus:outline-none focus:border-[#f48d16]/60 disabled:opacity-50 transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || isSending}
            className="p-3 bg-[#f48d16] hover:bg-[#ff9c2b] text-stone-950 font-bold rounded-full shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-105"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Telemetry & Agent Activity Column (4 Cols) */}
      <div className="lg:col-span-4 flex flex-col gap-4 h-full">
        {/* Vitals Radar Card */}
        <div className="p-6 rounded-[2rem] parley-bento-card border border-[#302a24] space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#302a24] pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#faf9f5] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#f48d16]" />
              <span>Real-Time Distress Radar</span>
            </span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/25 font-semibold">
              Live
            </span>
          </div>

          {/* Distress Score */}
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-[#756d62] font-semibold">Distress Score</span>
              <span className={`text-3xl font-black ${getScoreColor(distressScore)}`}>
                {distressScore.toFixed(1)} <span className="text-xs text-[#756d62] font-normal">/ 10</span>
              </span>
            </div>
            <div className="w-full bg-[#241f1a] rounded-full h-2 overflow-hidden">
              <div
                className={`bg-gradient-to-r ${getBarColor(distressScore)} h-2 rounded-full transition-all duration-500`}
                style={{ width: `${Math.min(100, Math.max(5, distressScore * 10))}%` }}
              ></div>
            </div>
          </div>

          {/* Trauma State Grid */}
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 rounded-xl bg-[#14110e] border border-[#2b251f]">
              <div className="text-[10px] text-[#756d62] font-semibold">Autonomic State</div>
              <div className="font-bold text-[#faf9f5] capitalize text-xs mt-0.5">{primaryState.replace(/_/g, " ")}</div>
            </div>
            <div className="p-3 rounded-xl bg-[#14110e] border border-[#2b251f]">
              <div className="text-[10px] text-[#756d62] font-semibold">Trajectory</div>
              <div className="font-bold text-[#f48d16] capitalize text-xs mt-0.5">{trajectory}</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#14110e] border border-[#2b251f] text-xs space-y-1">
            <div className="font-semibold text-[#faf9f5] text-xs">Clinical Interpretation:</div>
            <p className="text-[#a89f91] text-[11px] leading-relaxed">
              {distressScore >= 8.0
                ? "Severe hyperarousal or panic detected. Sensory grounding and safety containment prioritized."
                : distressScore >= 6.0
                ? "Moderate emotional elevation. Slowing conversational pace and encouraging breathing regulation."
                : "Regulated baseline. Survivor is oriented to the present space with coherent reflection."}
            </p>
          </div>
        </div>

        {/* Recent Agent Tool Calls Card */}
        <div className="flex-1 p-6 rounded-[2rem] parley-bento-card border border-[#302a24] space-y-4 overflow-hidden flex flex-col shadow-xl">
          <div className="flex items-center justify-between border-b border-[#302a24] pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#faf9f5] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#f48d16]" />
              <span>Agent Tool Telemetry Feed</span>
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 text-xs">
            {toolLogs.length === 0 ? (
              <div className="text-[#756d62] text-xs text-center py-6">
                No tool calls executed yet. Tools trigger automatically on message exchange.
              </div>
            ) : (
              toolLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-2xl bg-[#14110e] border border-[#2b251f] space-y-1 font-mono text-[11px]"
                >
                  <div className="flex items-center justify-between text-[#f48d16] font-bold">
                    <span>{log.name}</span>
                    <span className="text-[10px] text-[#756d62]">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </span>
                  </div>
                  <div className="text-[#756d62] truncate text-[10px]">
                    Args: {JSON.stringify(log.arguments)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
