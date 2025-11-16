"use client";

import { motion, useMotionValue } from "motion/react";
import { ContainerTextFlip } from "@/components/ui/container-text-flip";
import { GridBackground, DotBackground } from "@/components/ui/backgrounds";

export default function HeroLanding() {
  const path1 = useMotionValue(0);
  const path2 = useMotionValue(100);

  return (
    <section id="hero" className="relative isolate overflow-hidden py-28 sm:py-36">
      {/* Background layers */}
      <GridBackground />
      <DotBackground className="opacity-50" />

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl"
        >
          The{" "}
          <span className="bg-gradient-to-r from-[#6C63FF] via-[#9C7BFF] to-[#F28AB2] bg-clip-text text-transparent">
            AI-powered
          </span>{" "}
          study & wellness companion
        </motion.h1>

        <p className="mx-auto mt-4 max-w-2xl text-sm text-zinc-500">
          Balance your academic goals with mindfulness. From smarter study
          sessions to stress management, Kindminds helps you stay sharp, calm,
          and in control.
        </p>

        <div className="mt-8 flex justify-center">
          <ContainerTextFlip
            words={[
              "Focus without burnout",
              "Master your studies",
              "Reduce stress daily",
              "Find balance with AI",
            ]}
            className="text-[#2b2b2b] text-3xl md:text-5xl font-bold"
          />
        </div>

        {/* CTA Button */}
        <div className="mt-10 flex justify-center">
          <motion.a
            href="/academic"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-lg bg-gradient-to-r from-[#6C63FF] via-[#9C7BFF] to-[#F28AB2] px-6 py-3 text-white font-medium shadow-lg transition"
          >
            Try KindMindsAI
          </motion.a>
        </div>
      </div>
    </section>
  );
}
