// app/tools/problem/page.tsx
"use client";

import ChatInputDock from "@/app/components/ChatInputDock";
import Sidebar from "@/app/components/Sidebar";
import TopTabs from "@/app/components/TopTabs";


export default function ProblemPage() {
  return (
    <div className="relative grid min-h-dvh grid-cols-1 md:grid-cols-[320px_1fr] overflow-x-hidden">
      <div className="hidden md:block"><Sidebar /></div>

      <main className="mx-auto max-w-[1100px] px-6 pb-[6rem]">
        <TopTabs />
        <h1 className="text-4xl font-bold mt-8">Problem Solving</h1>
        <p className="text-zinc-600 mt-2">Timebound reasoning tasks to practice speed & accuracy.</p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="rounded-2xl p-6 bg-white border shadow-sm">Timed math drills</div>
          <div className="rounded-2xl p-6 bg-white border shadow-sm">Riddle & logic puzzles</div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-50"><ChatInputDock /></div>
    </div>
  );
}
