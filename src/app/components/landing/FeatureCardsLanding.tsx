// app/components/landing/FeatureCardsLanding.tsx
"use client";

import { motion } from "motion/react";
import Image from "next/image";

type Card = {
  title: string;
  body: string;
  icon: string;
};

const cards: Card[] = [
  {
    title: "Mindful Breaks",
    body: "Quick breathing and grounding exercises to reset between tasks.",
    icon: "/mindfulness1.svg",
  },
  {
    title: "Focus Routines",
    body: "Short, structured focus flows to beat procrastination.",
    icon: "/mindfulness4.svg",
  },
  {
    title: "Ease Anxiety",
    body: "Gentle guidance for moments when things feel heavy.",
    icon: "/mindfulness2.svg",
  },
  {
    title: "Study Smarter",
    body: "AI prompts that plan, chunk, and keep you on track.",
    icon: "/mindfulness3.svg",
  },
];

export default function FeatureCardsLanding() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c, i) => (
        <motion.div
          key={c.title}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ delay: i * 0.05, duration: 0.4 }}
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#E7E0FF] via-[#F4E7FF] to-[#FFDDEB] p-5 shadow-sm ring-1 ring-black/5"
        >
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold text-[#595a61]">{c.title}</h3>
            <Image
              src={c.icon}
              alt=""
              width={44}
              height={44}
              className="opacity-80 transition-transform duration-300 group-hover:-rotate-6"
            />
          </div>
          <p className="mt-3 text-xs leading-snug text-[#6b6b72]">{c.body}</p>

          {/* soft hover glow */}
          <div className="pointer-events-none absolute -bottom-8 right-6 h-32 w-32 rounded-full bg-[radial-gradient(circle,_rgba(108,99,255,0.25),transparent_60%)] blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </motion.div>
      ))}
    </div>
  );
}
