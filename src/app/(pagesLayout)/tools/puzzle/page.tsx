// app/tools/puzzle/page.tsx
"use client";

import ChatInputDock from "@/app/components/ChatInputDock";
import Sidebar from "@/app/components/Sidebar";
import TopTabs from "@/app/components/TopTabs";

export default function PuzzlePage() {
  return (
    <div className="relative grid min-h-dvh grid-cols-1 md:grid-cols-[320px_1fr] overflow-x-hidden">
      <div className="hidden md:block"><Sidebar /></div>

      <main className="mx-auto max-w-[1100px] px-6 pb-[6rem]">
        <TopTabs />
        <h1 className="text-4xl font-bold mt-8">Puzzles</h1>
        <p className="text-zinc-600 mt-2">Logic and pattern puzzles for practice.</p>

        {/* Example puzzle list */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="rounded-2xl p-6 bg-white border shadow-sm">Pattern rotation puzzle</div>
          <div className="rounded-2xl p-6 bg-white border shadow-sm">Tangram challenge</div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-50"><ChatInputDock /></div>
    </div>
  );
}
