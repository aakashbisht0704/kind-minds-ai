"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import TopTabs from "../../components/TopTabs";
import ChatInputDock from "../../components/ChatInputDock";
import ChatDisplay from "../../components/ChatDisplay";
import HeroMindfullness from "../../components/HeroMindfullness";
import PageTransitionWrapper from "../../components/PageTransitionWrapper";
import { FloatBlobs } from "../../components/FloatBlobs";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChat } from "../../contexts/ChatContext";

export default function MindfulnessPage() {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { currentChat, setCurrentChatByTab } = useChat();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Ensure current chat matches the mindfulness tab
  useEffect(() => {
    setCurrentChatByTab('mindfulness');
  }, [setCurrentChatByTab]);

  const mindfulnessChat = currentChat && currentChat.tab === "mindfulness" ? currentChat : null;

  return (
    <div className="relative grid min-h-dvh grid-cols-1 md:grid-cols-[320px_1fr] overflow-x-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <main className="relative h-dvh flex flex-col overflow-hidden">
        {/* Mobile top bar with hamburger */}
        <div className="flex items-center justify-between px-4 py-3 border-b md:hidden flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <span className="text-lg font-semibold">Mindfulness</span>
        </div>

        {/* Scrollable content area */}
        <div ref={scrollAreaRef} className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1080px] px-4 sm:px-6 py-4">
            <TopTabs />

            {/* Show hero only when there are no messages */}
            {(!mindfulnessChat || mindfulnessChat.messages.length === 0) && (
              <div className="mt-6 sm:mt-10">
                <HeroMindfullness />
              </div>
            )}

            {/* Chat Display - only show when there are messages */}
            {mindfulnessChat && mindfulnessChat.messages.length > 0 && (
              <div className="mt-8 min-h-[400px]">
                <ChatDisplay scrollContainerRef={scrollAreaRef} />
              </div>
            )}
          </div>
        </div>

        {/* Chat dock positioned at bottom of screen */}
        <div className="flex-shrink-0">
          <ChatInputDock position="fixed" />
        </div>

        {/* Background floating blobs */}
        <FloatBlobs top={-7} left={88} rotate={60} />
        <FloatBlobs top={85} left={-10} rotate={240} />
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
    </div>
  );
}
