// components/ToolCard.tsx
"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ToolCard({ tool }: { tool: any }) {
  const router = useRouter();

  return (
    <Card
      className={`w-full rounded-2xl shadow-md bg-gradient-to-br ${tool.color} text-white p-4 overflow-hidden`}
    >
      <div className="flex items-center justify-between h-[96px] sm:h-[110px]">
        {/* Left - play + text */}
        <div className="flex items-start gap-4">
          <button
            onClick={() => {
              if (tool.type === "page") router.push(`/tools/${tool.id}`);
              else {
                // replace with modal open logic later
                console.log("open mini window for", tool.id);
              }
            }}
            className="h-10 w-10 rounded-full bg-white/95 text-black grid place-items-center shadow"
            aria-label={`Play ${tool.title}`}
          >
            <Play className="h-4 w-4" />
          </button>

          <div className="flex flex-col">
            <h3 className="text-lg sm:text-xl font-bold leading-tight">{tool.title}</h3>
            <p className="text-sm opacity-90 mt-1">{tool.subtitle}</p>

            <div className="mt-3 flex items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-sm">Play</span>
                  {tool.duration && (
                    <span className="inline-block bg-white/20 px-3 py-1 rounded-lg text-xs">
                      {tool.duration}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right - duration + illustration */}
        <div className="flex flex-col items-end gap-2">
          {tool.image && (
            <img
              src={tool.image}
              alt={tool.title}
              className="h-14 w-14 sm:h-16 sm:w-16 object-contain rounded"
              draggable={false}
            />
          )}
        </div>
      </div>
    </Card>
  );
}
