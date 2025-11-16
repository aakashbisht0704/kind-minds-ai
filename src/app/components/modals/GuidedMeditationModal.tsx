// components/modals/GuidedMeditationModal.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

/**
 * Small guided meditation player modal.
 * You can replace the audio and animations later.
 */

export default function GuidedMeditationModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (s: boolean) => void;
}) {
  const [playing, setPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // default 3 min

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setTimeLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [playing]);

  useEffect(() => {
    if (timeLeft <= 0) {
      setPlaying(false);
    }
  }, [timeLeft]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Guided Meditation — Harmony</DialogTitle>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          <p className="text-zinc-600">
            Follow inhale/exhale prompts. This short guided session helps regulate breath and calm the mind.
          </p>

          <div className="flex items-center gap-3">
            <Button onClick={() => setPlaying((p) => !p)}>{playing ? "Pause" : "Play"}</Button>
            <div className="text-sm text-zinc-500">Time left: {Math.ceil(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}</div>
          </div>

          <div className="rounded-lg bg-zinc-50 p-3">
            <div className="text-xs text-zinc-500 mb-2">Voice</div>
            <div className="flex gap-2">
              <Button variant="outline">Shekhar</Button>
              <Button variant="outline">Amitabh</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
