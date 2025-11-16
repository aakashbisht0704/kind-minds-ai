// app/tools/page.tsx
"use client";

import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import TopTabs from "../../components/TopTabs";
import { FloatBlobs } from "../../components/FloatBlobs";
import { Menu, ArrowRight, Monitor, User, Brain, MessageSquare, FileText, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const tools = [
  {
    id: "quiz-doc",
    title: "Quiz from your Doc",
    description: "Automatically generate quizzes from any uploaded document to test your understanding and reinforce learning efficiently.",
    icon: Monitor,
    featured: true,
  },
  {
    id: "personality-test",
    title: "Personality Test",
    description: "Take a scientifically designed personality assessment.",
    icon: User,
    featured: false,
  },
  {
    id: "thought-labelling",
    title: "Thought Labelling Activity",
    description: "Practice recognizing and naming your emotions and thoughts.",
    icon: Brain,
    featured: false,
  },
  {
    id: "reframing-thoughts",
    title: "Reframing Thoughts Tool",
    description: "Identify negative thought patterns and transform them into positive",
    icon: MessageSquare,
    featured: false,
  },
  {
    id: "flashcards-doc",
    title: "Flashcards from your Doc",
    description: "Create personalized flashcards from your study materials for quick, effective revision anytime, anywhere.",
    icon: FileText,
    featured: false,
  },
  {
    id: "scan-problem",
    title: "Scan a Problem",
    description: "Snap a picture of handwritten notes, equations, or text, and get instant explanations or summaries right on your device.",
    icon: ScanLine,
    featured: false,
  },
];

export default function ToolsPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const featuredTool = tools.find(t => t.featured);
  const regularTools = tools.filter(t => !t.featured);

  return (
    <div className="relative grid min-h-dvh grid-cols-1 md:grid-cols-[320px_1fr]">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <main className="relative h-dvh flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b md:hidden flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <span className="text-lg font-semibold">Tools</span>
        </div>

        {/* Content - No scrolling */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full mx-auto w-full max-w-[1200px] px-4 sm:px-6 py-4 flex flex-col">
            <TopTabs />

            {/* Featured Tool */}
            {featuredTool && (
              <div className="mt-4 flex-shrink-0">
                <div className="relative bg-[#F5F5F5] rounded-2xl p-6 border border-gray-200">
                  <div className="flex items-center gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center border border-gray-200">
                        <featuredTool.icon className="w-8 h-8 text-gray-800" strokeWidth={1.5} />
                      </div>
                    </div>

                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-900 mb-1.5">
                        {featuredTool.title}
                      </h2>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {featuredTool.description}
                      </p>
                    </div>

                    <button
                      onClick={() => router.push(`/tools/${featuredTool.id}`)}
                      className="flex-shrink-0 w-12 h-12 bg-black hover:bg-gray-800 rounded-full flex items-center justify-center transition-colors"
                    >
                      <ArrowRight className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Regular Tools Grid - Compact */}
            <div className="mt-4 flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-hidden">
              {regularTools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <div
                    key={tool.id}
                    className="relative bg-[#F5F5F5] rounded-2xl p-5 border border-gray-200 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center border border-gray-200">
                          <Icon className="w-6 h-6 text-gray-800" strokeWidth={1.5} />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-gray-900 mb-1">
                          {tool.title}
                        </h3>
                        <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                          {tool.description}
                        </p>
                      </div>

                      <button
                        onClick={() => router.push(`/tools/${tool.id}`)}
                        className="flex-shrink-0 w-10 h-10 bg-black hover:bg-gray-800 rounded-full flex items-center justify-center transition-colors"
                      >
                        <ArrowRight className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-72 max-w-xs h-full bg-[#111214]">
            <Sidebar onClose={() => setIsSidebarOpen(false)} />
          </div>
          <div
            className="flex-1 bg-black/40"
            onClick={() => setIsSidebarOpen(false)}
          />
        </div>
      )}

      <FloatBlobs top={-10} left={80} rotate={20} />
    </div>
  );
}
