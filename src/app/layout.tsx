// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { FloatBlobs } from "./components/FloatBlobs";
import { ChatProvider } from "./contexts/ChatContext";
import { ActivityProvider } from "./contexts/ActivityContext";
import { AuthProvider } from "./contexts/AuthContext";
import { RequireAuthGate } from "./components/RequireAuthGate";


export const metadata: Metadata = {
  title: "Kindminds",
  description:
    "AI tools for academic success and mental wellness—focus, study smarter, and manage stress in one place.",
};

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, "min-h-dvh relative text-gray-900")}>
        <AuthProvider>
          <ActivityProvider>
            <ChatProvider>
              <RequireAuthGate />
              <main className="relative z-10 bg-white/80 backdrop-blur-sm">
                {children}
              </main>
              <Toaster />
            </ChatProvider>
          </ActivityProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
