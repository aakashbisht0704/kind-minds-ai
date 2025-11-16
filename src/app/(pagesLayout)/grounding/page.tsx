"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

type SequenceStep = {
  id: string;
  title: string;
  subtitle: string;
  duration: number; // milliseconds
};

const SEQUENCE: SequenceStep[] = [
  {
    id: "intro",
    title: "You’re safe. You’re not alone.",
    subtitle: "We’ll gently walk through the 5‑4‑3‑2‑1 grounding method together.",
    // Uniform 10s per step for a slower, more spacious rhythm
    duration: 10000,
  },
  {
    id: "5",
    title: "5 things you can see",
    subtitle: "Look around and silently name five things you can see in your environment.",
    duration: 10000,
  },
  {
    id: "4",
    title: "4 things you can touch",
    subtitle: "Notice four things you can touch — your clothes, the chair, the floor, anything near you.",
    duration: 10000,
  },
  {
    id: "3",
    title: "3 things you can hear",
    subtitle: "Listen for three different sounds — close, far away, or even your own breathing.",
    duration: 10000,
  },
  {
    id: "2",
    title: "2 things you can smell",
    subtitle: "Gently notice two scents around you, or recall smells that make you feel calm.",
    duration: 10000,
  },
  {
    id: "1",
    title: "1 thing you can taste",
    subtitle: "Notice any lingering taste, or take a sip of water if you can.",
    duration: 10000,
  },
];

export default function GroundingPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [stepProgress, setStepProgress] = useState(0); // 0 → 1 over the current step

  useEffect(() => {
    if (finished) return;

    const step = SEQUENCE[currentIndex];
    setStepProgress(0);

    let frameId: number;
    const start = performance.now();

    const tick = (timestamp: number) => {
      const elapsed = timestamp - start;
      const ratio = Math.min(1, elapsed / step.duration);
      setStepProgress(ratio);

      if (elapsed >= step.duration) {
        if (currentIndex < SEQUENCE.length - 1) {
          setCurrentIndex((prev) => prev + 1);
        } else {
          setFinished(true);
        }
        return;
      }
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [currentIndex, finished]);

  const currentStep = SEQUENCE[currentIndex];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex items-center justify-center relative overflow-hidden">
      {/* Soft ambient glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.18),transparent_55%),_radial-gradient(circle_at_bottom,_rgba(244,114,182,0.14),transparent_55%)]" />

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center max-w-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="space-y-4"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              5 · 4 · 3 · 2 · 1 Grounding
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-slate-50">
              {currentStep.title}
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-slate-300 leading-relaxed">
              {currentStep.subtitle}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Overall step indicator */}
        <div className="mt-10 flex items-center gap-2">
          {SEQUENCE.map((step, index) => (
            <div
              key={step.id}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                index < currentIndex
                  ? "bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-300 w-8"
                  : index === currentIndex
                  ? "bg-slate-200 w-8"
                  : "bg-slate-700 w-4"
              }`}
            />
          ))}
        </div>

        {/* Per-step timer bar */}
        {!finished && (
          <div className="mt-6 w-full max-w-md mx-auto">
            <div className="h-1.5 w-full rounded-full bg-slate-800/80 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-400 via-blue-400 to-emerald-300"
                style={{ width: `${stepProgress * 100}%` }}
              />
            </div>
            <p className="mt-3 text-xs text-slate-400">
              {Math.max(
                1,
                Math.ceil(
                  (SEQUENCE[currentIndex].duration * (1 - stepProgress)) / 1000
                )
              )}{" "}
              seconds left in this step
            </p>
          </div>
        )}

        {/* Final controls appear only after sequence completes */}
        <AnimatePresence>
          {finished && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
              className="mt-12 flex flex-col items-center gap-4"
            >
              <p className="text-sm text-slate-300 max-w-md">
                Take a gentle breath. You just anchored yourself in the present moment.
                You can stay here a little longer, or head back to your chat whenever you’re ready.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mt-2">
                <Button
                  className="rounded-full px-6 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold"
                  onClick={() => router.push("/mindfulness")}
                >
                  Back to chat
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full px-6 py-2 border-slate-500/60 bg-slate-900/40 text-slate-200 hover:bg-slate-800/70"
                >
                  Stay in calm space
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}


