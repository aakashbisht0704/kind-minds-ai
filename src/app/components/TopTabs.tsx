// components/TopTabs.tsx
"use client";

import { motion } from "motion/react";
import { useRouter, usePathname } from "next/navigation";

const tabs = [
  { label: "Academic", path: "/academic" },
  { label: "Mindfulness", path: "/mindfulness" },
  { label: "Tools", path: "/tools" },
  { label: "Activities", path: "/activities" },
  { label: "Profile", path: "/profile" },
];

export default function TopTabs() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="sticky top-0 z-40 flex justify-center pt-4 sm:pt-6 pb-4 sm:pb-6 bg-transparent -mx-4 sm:-mx-6 px-4 sm:px-6">
      <div className="relative inline-flex max-w-full overflow-x-auto rounded-full border border-zinc-200 bg-white p-1 shadow-sm">
        {tabs.map((tab) => {
          const isActive = pathname === tab.path;
          return (
            <motion.button
              key={tab.label}
              className={[
                "relative z-10 rounded-full px-3 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap",
                isActive
                  ? "text-black bg-zinc-100"
                  : "text-zinc-500 hover:text-zinc-700",
              ].join(" ")}
              whileHover={{ scale: 1.08, backgroundColor: "rgba(0,0,0,0.04)" }}
              transition={{ type: "spring", bounce: 0.25, duration: 0.3 }}
              onClick={() => router.push(tab.path)}
            >
              {isActive && (
                <motion.span
                  layoutId="pill"
                  className="absolute inset-0 -z-10 rounded-full bg-black/5"
                  transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                />
              )}
              {tab.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
