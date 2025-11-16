"use client";

import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import TopTabs from "../../components/TopTabs";
import { FloatBlobs } from "../../components/FloatBlobs";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotificationsPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
                    <span className="text-lg font-semibold">Notifications</span>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden">
                    <div className="h-full mx-auto w-full max-w-[1200px] px-4 sm:px-6 py-4 flex flex-col">
                        <TopTabs />

                        {/* Centered empty state */}
                        <div className="flex-1 flex items-center justify-center">
                            <p className="text-2xl text-gray-400 font-medium">
                                No new notifications!
                            </p>
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

            {/* Decorative blobs */}
            <FloatBlobs top={5} left={85} rotate={30} />
            <FloatBlobs top={80} left={5} rotate={150} />
        </div>
    );
}

