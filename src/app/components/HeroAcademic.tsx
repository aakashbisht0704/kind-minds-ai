"use client";
import SparklesText from "./aceternity/SparkleText";

export default function HeroAcademic() {
  return (
    <div className="relative w-full px-4">
      <div className="relative mx-auto max-w-2xl text-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-medium leading-tight tracking-tight">
          How can we <SparklesText>assist</SparklesText> you today?
        </h1>

        <p className="mx-auto mt-4 sm:mt-5 max-w-xl text-xs sm:text-sm md:text-base text-zinc-500">
          AI tools for academic success and mental wellness. Stay focused, study
          smarter, and manage stress — all in one place.
        </p>
      </div>
    </div>
  );
}
