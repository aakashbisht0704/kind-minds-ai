// components/modals/BreathingModal.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

/**
 * Short breathing trainer
 */

export default function BreathingModal({ open, onOpenChange }: { open: boolean; onOpenChange: (b: boolean) => void; }) {
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [counter, setCounter] = useState(4);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setCounter((c) => {
        if (c <= 1) {
          // next phase
          setPhase((p) => (p === "inhale" ? "hold" : p === "hold" ? "exhale" : "inhale"));
          // reset depending on phase
          return phase === "inhale" ? 2 : phase === "hold" ? 6 : 4; // quick example durations
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, phase]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Breathing Exercise — Serenity</DialogTitle>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          <div className="text-center">
            <div className="text-2xl font-semibold capitalize">{phase}</div>
            <div className="text-xs text-zinc-500">Counting: {counter}</div>
          </div>

          <div className="flex justify-center">
            <div className="h-32 w-32 rounded-full bg-gradient-to-br from-[#E7E0FF] to-[#FFDDEB] grid place-items-center">
              {/* visual pulsing circle could be animated */}
              <div className="h-20 w-20 rounded-full bg-white/70" />
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Button onClick={() => setRunning((r) => !r)}>{running ? "Stop" : "Start"}</Button>
            <Button variant="outline" onClick={() => { onOpenChange(false); setRunning(false); }}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
