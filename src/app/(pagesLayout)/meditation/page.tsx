"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/contexts/AuthContext";
import { incrementMeditationStats } from "@/lib/profileAPI";
import { createActivity } from "@/lib/toolsAPI";

type BreathPhase = {
  id: "inhale" | "hold" | "exhale";
  label: string;
  duration: number; // seconds per phase
};

const PHASES: BreathPhase[] = [
  { id: "inhale", label: "Breathe in gently", duration: 4 },
  { id: "hold", label: "Hold softly", duration: 4 },
  { id: "exhale", label: "Breathe out slowly", duration: 6 },
];

const DURATIONS = [
  { id: "2", label: "2 min", seconds: 120 },
  { id: "5", label: "5 min", seconds: 300 },
  { id: "10", label: "10 min", seconds: 600 },
];

interface PhaseState {
  index: number;
  remaining: number;
}

export default function MeditationPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedDuration, setSelectedDuration] = useState<number | null>(300);
  const [sessionRemaining, setSessionRemaining] = useState<number>(300);
  const [phaseState, setPhaseState] = useState<PhaseState>({
    index: 0,
    remaining: PHASES[0].duration,
  });
  const [running, setRunning] = useState<boolean>(false);
  const [finished, setFinished] = useState<boolean>(false);
  const [sessionLogged, setSessionLogged] = useState<boolean>(false);

  // When duration changes, reset session
  useEffect(() => {
    if (selectedDuration != null) {
      setSessionRemaining(selectedDuration);
      setPhaseState({ index: 0, remaining: PHASES[0].duration });
      setFinished(false);
      setSessionLogged(false);
      setRunning(false);
    }
  }, [selectedDuration]);

  // Breathing loop
  useEffect(() => {
    if (!running || selectedDuration == null || finished) return;

    const interval = setInterval(() => {
      setPhaseState((prev) => {
        let { index, remaining } = prev;
        if (remaining <= 1) {
          const nextIndex = (index + 1) % PHASES.length;
          return { index: nextIndex, remaining: PHASES[nextIndex].duration };
        }
        return { ...prev, remaining: remaining - 1 };
      });

      setSessionRemaining((prev) => {
        const next = Math.max(0, prev - 1);
        if (next === 0) {
          setFinished(true);
          setRunning(false);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [running, selectedDuration, finished]);

  const currentPhase = PHASES[phaseState.index];
  const totalSession = selectedDuration ?? 0;
  const overallProgress =
    totalSession > 0 ? 1 - sessionRemaining / totalSession : 0;
  const phaseProgress = currentPhase
    ? 1 - phaseState.remaining / currentPhase.duration
    : 0;

  const handleStart = () => {
    if (!selectedDuration) return;
    setFinished(false);
    setSessionLogged(false);
    setSessionRemaining(selectedDuration);
    setPhaseState({ index: 0, remaining: PHASES[0].duration });
    setRunning(true);
  };

  const handleReset = () => {
    setRunning(false);
    setFinished(false);
    setSessionLogged(false);
    if (selectedDuration != null) {
      setSessionRemaining(selectedDuration);
    }
    setPhaseState({ index: 0, remaining: PHASES[0].duration });
  };

  // When a session finishes, log meditation minutes and streak + activity row once
  useEffect(() => {
    if (!finished || !selectedDuration || sessionLogged || !user?.id) return;

    const minutes = selectedDuration / 60;
    const completedAt = new Date().toISOString();

    (async () => {
      try {
        await incrementMeditationStats(user.id, selectedDuration, completedAt);
        await createActivity({
          userId: user.id,
          title: `Meditation session (${DURATIONS.find(d => d.seconds === selectedDuration)?.label ?? `${minutes} min`})`,
          type: "meditation",
          date: completedAt,
        });
      } catch (error) {
        console.error("Failed to log meditation session", error);
      } finally {
        setSessionLogged(true);
      }
    })();
  }, [finished, selectedDuration, sessionLogged, user?.id]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex items-center justify-center relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),transparent_55%),_radial-gradient(circle_at_bottom,_rgba(94,92,255,0.15),transparent_55%)]" />

      <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center max-w-2xl">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-4">
          Guided Breath · Calm Focus
        </p>

        {/* Duration selector */}
        {!running && !finished && (
          <div className="mb-6 flex flex-wrap justify-center gap-3">
            {DURATIONS.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDuration(d.seconds)}
                className={`px-4 py-2 rounded-full text-sm border transition ${
                  selectedDuration === d.seconds
                    ? "bg-sky-500 text-slate-950 border-transparent shadow-sm"
                    : "border-slate-600 text-slate-200 hover:border-slate-300"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        )}

        {/* Intro / header – animate only once on mount */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="space-y-6"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-slate-50">
            {finished ? "You did it." : "Let’s breathe together."}
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-xl mx-auto">
            {finished
              ? "Notice how your body feels right now. You can stay here in the calm for as long as you like, or return to your day whenever you’re ready."
              : "Follow the guidance on the screen. There’s nothing you need to get right — just breathe at your own pace."}
          </p>
        </motion.div>

        {/* Breathing circle & phase */}
        {!finished && (
          <div className="mt-10 flex flex-col items-center gap-6">
            <motion.div
              className="relative h-56 w-56 rounded-full bg-slate-900/40 border border-slate-700/60 flex items-center justify-center overflow-hidden"
              animate={{
                scale: currentPhase.id === "inhale" ? 1.1 : 0.95,
              }}
              transition={{ duration: currentPhase.duration, ease: "easeInOut" }}
            >
              <motion.div
                className="h-40 w-40 rounded-full bg-gradient-to-br from-sky-400/40 via-indigo-400/40 to-purple-500/30"
                animate={{
                  scale:
                    currentPhase.id === "inhale"
                      ? 1.15
                      : currentPhase.id === "exhale"
                      ? 0.85
                      : 1.0,
                }}
                transition={{ duration: currentPhase.duration, ease: "easeInOut" }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-1">
                  {currentPhase.id === "inhale"
                    ? "Inhale"
                    : currentPhase.id === "hold"
                    ? "Hold"
                    : "Exhale"}
                </p>
                <p className="text-2xl font-semibold">
                  {currentPhase.label}
                </p>
                <p className="mt-3 text-sm text-slate-300">
                  {phaseState.remaining}s
                </p>
              </div>
            </motion.div>

            {/* Session progress bar */}
            <div className="w-full max-w-md">
              <div className="h-1.5 w-full rounded-full bg-slate-800/80 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-300 via-sky-400 to-indigo-400"
                  style={{ width: `${overallWithGuard(overallProgress) * 100}%` }}
                />
              </div>
              <p className="mt-3 text-xs text-slate-400">
                {sessionRemaining > 0
                  ? `${formatTimeRemaining(sessionRemaining)} left`
                  : "Session complete"}
              </p>
            </div>
          </div>
        )}

        {/* Controls / post-session actions */}
        <div className="mt-10 flex flex-col sm:flex-row gap 4 justify-center">
          {!running && !finished && (
            <Button
              onClick={handleStart}
              className="rounded-full px-8 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold"
            >
              Start session
            </Button>
          )}
          {running && (
            <Button
              variant="outline"
              className="rounded-full border-slate-600 text-slate-200"
              onClick={() => setRunning(false)}
            >
              Pause
            </Button>
          )}
          {!running && selectedDuration && !finished && (
            <Button
              variant="ghost"
              className="rounded-full text-slate-300"
              onClick={handleReset}
            >
              Reset
            </Button>
          )}
          {finished && (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleStart}
                className="rounded-full px-8 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold"
              >
                Breathe again
              </Button>
              <Button
                variant="outline"
                className="rounded-full border-slate-600 text-slate-200"
                onClick={() => router.push("/mindfulness")}
              >
                Back to Mindfulness
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Guard for NaN or out-of-range progress values
function overallWithGuard(value: number) {
  if (Number.isNaN(value) || !Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

function formatTimeRemaining(totalSeconds: number) {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return "0:00";
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const minutesPart = Math.floor(seconds / 60);
  const secondsPart = seconds % 60;
  const mm = String(minutesPart);
  const ss = String(secondsPart).padStart(2, "0");
  return `${mm}:${ss}`;
}


