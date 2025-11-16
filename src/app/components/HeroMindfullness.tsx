"use client";

import SparklesText from "./aceternity/SparkleText";
import { GradientCard } from "./GradientCard";

const examplePrompts = [
  {
    title: "Feeling Anxious?",
    subtitle: "Get calming exercises and breathing techniques to ease anxiety.",
    image: "/mindfulness1.svg",
  },
  {
    title: "Feeling Tense?",
    subtitle: "Find grounding tools to regain control and reduce overwhelm.",
    image: "/mindfulness2.svg",
  },
  {
    title: "Feeling Stressed?",
    subtitle: "Access quick mindfulness tips to relieve stress instantly",
    image: "/mindfulness3.svg",
  },
  {
    title: "Need Focus?",
    subtitle:
      "Try focused breathing and affirmation prompts to boost concentration.",
    image: "/mindfulness4.svg",
  },
];

export default function HeroMindfullness() {
  return (
    <div className="relative w-full">
      {/* Heading */}
      <div className="relative mx-auto max-w-2xl text-center sm:mt-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-medium leading-tight tracking-tight">
          How can we <SparklesText>assist</SparklesText> you today?
        </h1>
      </div>

      {/* Scrollable card grid */}
      <div className="mt-12 sm:mt-10 h-[450px] sm:h-auto overflow-y-auto sm:overflow-visible px-2 sm:px-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
          {examplePrompts.map((prompt) => (
            <GradientCard
              key={prompt.title}
              title={prompt.title}
              subtext={prompt.subtitle}
              image={prompt.image}
              className="w-full max-w-[280px]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
