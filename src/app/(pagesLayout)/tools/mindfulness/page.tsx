// app/tools/mindfulness/page.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Sidebar from "@/app/components/Sidebar";
import TopTabs from "@/app/components/TopTabs";
import ChatInputDock from "@/app/components/ChatInputDock";
import { FloatBlobs } from "@/app/components/FloatBlobs";

export default function MindfulnessActivityPage() {
  return (
    <div className="relative grid min-h-screen grid-cols-1 md:grid-cols-[320px_1fr] overflow-x-hidden">
      <div className="hidden md:block"><Sidebar /></div>

      <main className="mx-auto max-w-[1100px] px-6 pb-[7.5rem]">
        <TopTabs />

        <article className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
          <section>
            <h1 className="text-4xl font-bold">What is meditation</h1>
            <p className="mt-3 text-zinc-600 max-w-[720px]">
              Meditation is a practice in which an individual uses a technique to train attention
              and awareness, and achieve a mentally clear and emotionally calm and stable state.
            </p>
            <hr className="mt-6 border-zinc-200" />

            {/* Main content (scheduling, journal etc.) - simplified example */}
            <div className="mt-8 space-y-8">
              <div className="rounded-2xl bg-white p-6 shadow-sm border">
                <h3 className="text-xl font-semibold">Pick your meditation time</h3>
                <p className="text-sm text-zinc-500 mt-2">We recommend first thing in the morning.</p>
                <div className="mt-6">
                  <input type="time" className="rounded-lg border px-4 py-3 w-full" />
                  <div className="mt-4 flex gap-3">
                    <Button>Save</Button>
                    <Button variant="outline">No thanks</Button>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm border">
                <h3 className="text-xl font-semibold">Journal</h3>
                <p className="text-sm text-zinc-500 mt-2">Daily reflection after sessions.</p>
                <textarea className="w-full mt-3 p-3 rounded-lg border" rows={6} placeholder="Write how you feel..." />
                <div className="mt-3 flex gap-3">
                  <Button>Save entry</Button>
                  <Button variant="outline">View journal</Button>
                </div>
              </div>
            </div>
          </section>

          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-4">
              <div className="rounded-2xl bg-gradient-to-br from-[#F0EAFB] to-[#FFEFF2] p-6">
                <h3 className="text-lg font-semibold">Harmony — Quick start</h3>
                <p className="text-sm text-zinc-600 mt-2">Open a guided session quickly</p>
                <div className="mt-4">
                  <Link href="/tools/guided"><Button>Open guided</Button></Link>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 border">
                <h4 className="text-sm font-semibold">Session Settings</h4>
                <p className="text-xs text-zinc-500 mt-2">Pick voice & background sound</p>
              </div>
            </div>
          </aside>
        </article>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-50"><ChatInputDock /></div>
      <FloatBlobs top={-10} left={80} rotate={30} />
    </div>
  );
}
