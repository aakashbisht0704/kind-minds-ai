"use client";

import React from "react";
import { cn } from "@/lib/utils";

/* ----------------------------------------
   GRID BACKGROUND
----------------------------------------- */
export function GridBackground({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "absolute inset-0",
        "[background-size:40px_40px]",
        "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
        "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]",
        className
      )}
    >
      {/* fade-out mask to avoid harsh edges */}
      <div className="absolute inset-0 bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black" />
    </div>
  );
}

/* ----------------------------------------
   DOT BACKGROUND
----------------------------------------- */
export function DotBackground({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "absolute inset-0",
        "bg-white dark:bg-black",
        "bg-[radial-gradient(circle,_#d4d4d8_1px,transparent_1px)] [background-size:24px_24px]",
        "dark:bg-[radial-gradient(circle,_#262626_1px,transparent_1px)]",
        className
      )}
    >
      {/* subtle radial fade */}
      <div className="absolute inset-0 bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black" />
    </div>
  );
}
