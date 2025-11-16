"use client";

import { createContext, useContext, useMemo, useState, ReactNode } from "react";
import GuidedMeditationModal from "../components/modals/GuidedMeditationModal";
import BreathingModal from "../components/modals/BreathingModal";
import GroundingModal from "../components/modals/GroundingModal";

type ActivityType = "breathing" | "meditation" | "54321" | null;

interface ActivityContextValue {
  startActivity: (type: string) => void;
}

const ActivityContext = createContext<ActivityContextValue | undefined>(undefined);

export function ActivityProvider({ children }: { children: ReactNode }) {
  const [activeActivity, setActiveActivity] = useState<ActivityType>(null);

  const startActivity = (type: string) => {
    const normalized = type.toLowerCase();
    if (normalized.includes("breath") || normalized === "breathing") {
      setActiveActivity("breathing");
    } else if (normalized.includes("meditation") || normalized === "meditate") {
      setActiveActivity("meditation");
    } else if (normalized === "54321" || normalized.includes("ground")) {
      setActiveActivity("54321");
    } else {
      // default to breathing if unknown
      setActiveActivity("breathing");
    }
  };

  const contextValue = useMemo<ActivityContextValue>(
    () => ({
      startActivity,
    }),
    []
  );

  return (
    <ActivityContext.Provider value={contextValue}>
      {children}
      <GuidedMeditationModal
        open={activeActivity === "meditation"}
        onOpenChange={(open) => setActiveActivity(open ? "meditation" : null)}
      />
      <BreathingModal
        open={activeActivity === "breathing"}
        onOpenChange={(open) => setActiveActivity(open ? "breathing" : null)}
      />
      <GroundingModal
        open={activeActivity === "54321"}
        onOpenChange={(open) => setActiveActivity(open ? "54321" : null)}
      />
    </ActivityContext.Provider>
  );
}

export function useActivity() {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error("useActivity must be used within an ActivityProvider");
  }
  return context;
}


