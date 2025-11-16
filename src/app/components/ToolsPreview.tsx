// components/ToolPreview.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import GuidedMeditationModal from "./modals/GuidedMeditationModal";
import BreathingModal from "./modals/BreathingModal";


/**
 * Tool metadata should come from backend — here we map id to content.
 * Keep this file as a presentation layer reading `toolId`.
 */

export default function ToolPreview({ toolId }: { toolId: string | null }) {
  const [openGuided, setOpenGuided] = useState(false);
  const [openBreath, setOpenBreath] = useState(false);

  if (!toolId) {
    return <div className="text-zinc-600">Pick a tool from the left to preview it.</div>;
  }

  const previews: Record<
    string,
    { title: string; description: string; actions?: React.ReactNode }
  > = {
    mindfulness: {
      title: "Mindfulness exercise",
      description:
        "Complete program: schedule meditation, journaling, progress, audio guidance and tracking. Click Open to go to the full activity page.",
      actions: <Link href="/tools/mindfulness"><Button>Open activity</Button></Link>,
    },
    guided: {
      title: "Guided Meditation (Harmony)",
      description: "Short guided breathing session. Click Start to open the mini guided player.",
      actions: <Button onClick={() => setOpenGuided(true)}>Start Guided</Button>,
    },
    breathing: {
      title: "Breathing Exercises (Serenity)",
      description: "Short breathing exercises — open the mini breathing trainer.",
      actions: <Button onClick={() => setOpenBreath(true)}>Start Breathing</Button>,
    },
    memory: {
      title: "Memory Challenges",
      description: "Memory training page with daily challenges and progress tracking.",
      actions: <Link href="/tools/memory"><Button>Open memory page</Button></Link>,
    },
    puzzle: {
      title: "Puzzle",
      description: "Puzzles page. Timed puzzles and leaderboards.",
      actions: <Link href="/tools/puzzle"><Button>Open puzzle</Button></Link>,
    },
    problem: {
      title: "Problem Solving",
      description: "Problem solving drills, timeboxed tasks and scoring.",
      actions: <Link href="/tools/problem"><Button>Open</Button></Link>,
    },
  };

  const content = previews[toolId];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">{content?.title}</h2>
      <p className="text-zinc-600">{content?.description}</p>

      <div>{content?.actions}</div>

      {/* Mini windows */}
      <GuidedMeditationModal open={openGuided} onOpenChange={setOpenGuided} />
      <BreathingModal open={openBreath} onOpenChange={setOpenBreath} />
    </div>
  );
}
