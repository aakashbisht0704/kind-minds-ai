// components/ToolList.tsx
"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

export type Tool = {
  id: string;
  title: string;
  subtitle?: string;
  type: "page" | "mini"; // page = open full page, mini = open modal/window
  color?: string; // optional color for card accent
  duration?: string;
  image?: string;
};

const TOOLS: Tool[] = [
  {
    id: "mindfulness",
    title: "Mindfulness exercise",
    subtitle: "Full program: schedule, journaling, progress tracking.",
    type: "page",
    image: "/mindfulness1.svg",
  },
  {
    id: "guided",
    title: "Guided Meditation",
    subtitle: "Start a guided breathing session (Harmony).",
    type: "mini",
    duration: "3 min",
    image: "/mindfulness2.svg",
  },
  {
    id: "breathing",
    title: "Breathing Exercises",
    subtitle: "Quick breathing techniques (Serenity).",
    type: "mini",
    duration: "2 min",
    image: "/mindfulness3.svg",
  },
  {
    id: "memory",
    title: "Memory Challenges",
    subtitle: "Train memory with mini-games & daily challenges.",
    type: "page",
    image: "/memory.svg",
  },
  {
    id: "puzzle",
    title: "Puzzle",
    subtitle: "Pattern & logic puzzles to boost problem solving.",
    type: "page",
    image: "/puzzle.svg",
  },
  {
    id: "problem",
    title: "Problem Solving",
    subtitle: "Timed problems to improve reasoning speed.",
    type: "page",
    image: "/problem.svg",
  },
];

export default function ToolList({
  selectedId,
  onSelect,
}: {
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const router = useRouter();

  return (
    <div className="space-y-4">
      {TOOLS.map((tool) => (
        <Card key={tool.id} className="p-4 bg-white border border-zinc-100 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-[#E7E0FF] to-[#FFDDEB] grid place-items-center">
                {tool.image ? <img src={tool.image} alt={tool.title} className="h-10 w-10 object-contain" /> : null}
              </div>
              <div>
                <h3 className="text-lg font-semibold">{tool.title}</h3>
                <p className="text-sm text-zinc-500">{tool.subtitle}</p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="text-sm text-zinc-400">{tool.duration ?? ""}</div>

              <div className="flex items-center gap-2">
                <Button
                  variant={selectedId === "{tool.id}" ? "default" : "outline"}
                  onClick={() => {
                    if (tool.type === "page") {
                      const href =
                        tool.id === "memory" ? "/activities/memory" : `/tools/${tool.id}`;
                      router.push(href);
                    } else {
                      // mini: select to show preview / open modal
                      onSelect(tool.id);
                    }
                  }}
                >
                  <Play className="mr-2 h-4 w-4" /> {tool.type === "page" ? "Open" : "Start"}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
