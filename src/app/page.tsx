"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import HeroLanding from "./components/landing/HeroLanding";
import FeatureCardsLanding from "./components/landing/FeatureCardsLanding";
import NavbarLanding from "./components/landing/NavbarLanding";
import { CanvasRevealEffect } from "@/components/ui/canvas-reveal-effect";
import { CometCard } from "@/components/ui/comet-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export default function Page() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newsletterMessage, setNewsletterMessage] = useState<string | null>(null);

  const handleNewsletterSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setNewsletterMessage(null);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.from("newsletter_subscribers").insert({
        email: email.trim().toLowerCase(),
        name: name.trim() || null,
        source: "landing_contact",
      });
      if (error) {
        console.error("Failed to save newsletter signup", error);
        setNewsletterMessage("We couldn't save your email right now. Please try again in a moment.");
      } else {
        setNewsletterMessage("You’re in. We’ll only reach out with thoughtful updates.");
        setEmail("");
        setName("");
      }
    } catch (err) {
      console.error("Unexpected error saving newsletter signup", err);
      setNewsletterMessage("Something went wrong. Please try again shortly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-dvh bg-white text-[#2b2b2b] overflow-x-hidden">
      {/* Navbar */}
      <div className="fixed top-0 left-0 right-0 z-30 py-5 bg-white">
        <NavbarLanding />
      </div>

      {/* Content wrapper with top padding so it doesn't hide behind navbar */}
      <main className="pt-28">
        {/* Hero */}
        <HeroLanding />

        {/* Canvas reveal band (quick value props) */}
        <section id="reveal" className="relative py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex flex-col lg:flex-row items-center justify-center gap-6">
              <CometCard className="w-80">
                <RevealCard
                  title="Smarter Study"
                  description="AI-powered flashcards, summaries, and problem scanning to make learning effortless."
                >
                  <CanvasRevealEffect animationSpeed={5.1} containerClassName="bg-indigo-900" />
                </RevealCard>
              </CometCard>

              <CometCard className="w-80">
                <RevealCard
                  title="Mindful Breaks"
                  description="Guided breathing, grounding, and meditation spaces for when everything feels heavy."
                >
                  <CanvasRevealEffect
                    animationSpeed={3}
                    containerClassName="bg-purple-700"
                    colors={[
                      [236, 72, 153],
                      [232, 121, 249],
                    ]}
                  />
                  <div className="absolute inset-0 [mask-image:radial-gradient(400px_at_center,white,transparent)] bg-black/40 dark:bg-black/90" />
                </RevealCard>
              </CometCard>

              <CometCard className="w-80">
                <RevealCard
                  title="Stay Balanced"
                  description="Track your mood, build streaks, and let KindMinds nudge you toward healthier routines."
                >
                  <CanvasRevealEffect
                    animationSpeed={3}
                    containerClassName="bg-sky-700"
                    colors={[[125, 211, 252]]}
                  />
                </RevealCard>
              </CometCard>
            </div>
          </div>
        </section>

        {/* Features section */}
        <section id="features" className="border-t border-gray-100 bg-gray-50/60 py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-10 flex flex-col items-center text-center space-y-3">
              <p className="text-xs font-semibold tracking-[0.3em] uppercase text-purple-500">
                Features
              </p>
              <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900">
                Everything in one calm, student-friendly space
              </h2>
              <p className="max-w-2xl text-sm sm:text-base text-gray-600">
                From exam prep to emotional check-ins, KindMinds weaves academic support and
                mental wellness into a single, gentle experience.
              </p>
            </div>

            <FeatureCardsLanding />
          </div>
        </section>

        {/* Pricing section */}
        <section id="pricing" className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-10 flex flex-col items-center text-center space-y-3">
              <p className="text-xs font-semibold tracking-[0.3em] uppercase text-purple-500">
                Pricing
              </p>
              <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900">
                Start free. Upgrade only if it feels right.
              </h2>
              <p className="max-w-2xl text-sm sm:text-base text-gray-600">
                We keep things simple and student-friendly. No dark patterns, no pressure – just
                clear tiers for different needs.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {/* Free tier */}
              <div className="rounded-3xl border border-gray-200 bg-white/95 p-6 shadow-sm flex flex-col">
                <h3 className="text-lg font-semibold text-gray-900">Free</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Essentials for studying and checking in with yourself.
                </p>
                <p className="mt-6 text-3xl font-bold text-gray-900">
                  ₹0 <span className="text-sm font-medium text-gray-500">/ month</span>
                </p>
                <ul className="mt-6 space-y-2 text-sm text-gray-600 flex-1">
                  <li>· Academic & mindfulness chats</li>
                  <li>· Basic flashcards & quiz from doc</li>
                  <li>· 5‑4‑3‑2‑1 grounding & memory game</li>
                </ul>
                <Button className="mt-6 w-full rounded-full bg-gray-900 text-white hover:bg-gray-800">
                  Get started free
                </Button>
              </div>

              {/* Premium tier */}
              <div className="rounded-3xl border border-purple-500 bg-gradient-to-b from-purple-50 to-white p-6 shadow-md flex flex-col">
                <div className="mb-2 inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                  Most popular
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Premium</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Deeper personalization plus richer tools for focus & wellbeing.
                </p>
                <p className="mt-6 text-3xl font-bold text-gray-900">
                  ₹X <span className="text-sm font-medium text-gray-500">/ month</span>
                </p>
                <ul className="mt-6 space-y-2 text-sm text-gray-700 flex-1">
                  <li>· Everything in Free</li>
                  <li>· MBTI‑aware responses & reframing</li>
                  <li>· Advanced quiz & flashcard history</li>
                  <li>· Mood chart & activity insights</li>
                </ul>
                <Button className="mt-6 w-full rounded-full bg-purple-600 text-white hover:bg-purple-500">
                  Upgrade to Premium
                </Button>
              </div>

              {/* Premium+ tier */}
              <div className="rounded-3xl border border-gray-200 bg-white/95 p-6 shadow-sm flex flex-col">
                <h3 className="text-lg font-semibold text-gray-900">Premium+</h3>
                <p className="mt-1 text-sm text-gray-500">
                  For schools, counseling centers, and student programs.
                </p>
                <p className="mt-6 text-3xl font-bold text-gray-900">
                  Custom <span className="text-sm font-medium text-gray-500">pricing</span>
                </p>
                <ul className="mt-6 space-y-2 text-sm text-gray-600 flex-1">
                  <li>· Everything in Premium</li>
                  <li>· Multi‑seat access & shared spaces</li>
                  <li>· Priority support & onboarding</li>
                  <li>· Custom integrations & reporting</li>
                </ul>
                <Button
                  variant="outline"
                  className="mt-6 w-full rounded-full border-purple-400 text-purple-700 hover:bg-purple-50"
                >
                  Talk to us
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Contact + newsletter section */}
        <section id="contact" className="border-t border-gray-100 bg-gray-50/80 py-20">
          <div className="mx-auto max-w-6xl px-6 grid gap-10 md:grid-cols-[1.1fr_1fr] items-start">
            <div>
              <p className="text-xs font-semibold tracking-[0.3em] uppercase text-purple-500">
                Contact
              </p>
              <h2 className="mt-2 text-3xl sm:text-4xl font-semibold text-gray-900">
                We’d love to hear from you.
              </h2>
              <p className="mt-3 text-sm sm:text-base text-gray-600 max-w-xl">
                Whether you’re a student, educator, or someone building mental health products, we’re
                always open to thoughtful conversations.
              </p>

              <div className="mt-6 space-y-2 text-sm text-gray-700">
                <p>
                  <span className="font-semibold">Email:</span>{" "}
                  <a href="mailto:hello@kindminds.in" className="text-purple-600 hover:underline">
                    hello@kindminds.in
                  </a>
                </p>
                <p>
                  <span className="font-semibold">X / Twitter:</span>{" "}
                  <span className="text-gray-600">@kindminds (coming soon)</span>
                </p>
                <p>
                  <span className="font-semibold">Location:</span>{" "}
                  <span className="text-gray-600">Built remotely, with students in mind.</span>
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white/95 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">Join the KindMinds newsletter</h3>
              <p className="mt-2 text-sm text-gray-600">
                Be the first to hear about new tools, wellbeing experiments, and ways we&apos;re
                making AI gentler for students.
              </p>

              <form onSubmit={handleNewsletterSubmit} className="mt-5 space-y-3">
                <div>
                  <label className="text-xs font-semibold uppercase text-gray-500">
                    Email address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-gray-500">
                    Name <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="So we know how to address you"
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
                  />
                </div>
                {newsletterMessage && (
                  <p className="text-xs text-purple-700 bg-purple-50 border border-purple-100 rounded-xl px-3 py-2">
                    {newsletterMessage}
                  </p>
                )}
                <Button
                  type="submit"
                  disabled={isSubmitting || !email}
                  className="w-full rounded-full bg-purple-600 text-white hover:bg-purple-500"
                >
                  {isSubmitting ? "Joining..." : "Join newsletter"}
                </Button>
                <p className="mt-1 text-[11px] text-gray-500">
                  No spam. Just occasional updates and resources that might genuinely help.
                </p>
              </form>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white py-6">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-xs text-gray-500 sm:flex-row">
            <p>© {new Date().getFullYear()} KindMinds. All rights reserved.</p>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/privacy" className="hover:text-gray-800">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-gray-800">
                Terms & Conditions
              </Link>
              <a href="#contact" className="hover:text-gray-800">
                Contact
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

/* -------------------------------
   Card wrapper for CanvasRevealEffect
-------------------------------- */
const RevealCard = ({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative group/canvas-card flex flex-col items-center justify-center border border-black/10 dark:border-white/20 max-w-sm w-full h-[28rem] rounded-xl overflow-hidden shadow-lg bg-white dark:bg-black"
    >
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 h-full w-full"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-20 px-6 text-center transition-colors duration-300">
        <h3
          className={`text-lg font-semibold ${
            hovered ? "text-white" : "text-zinc-900 dark:text-white"
          }`}
        >
          {hovered ? title : "Got a problem?"}
        </h3>
        <p
          className={`mt-2 text-sm transition-colors duration-300 ${
            hovered ? "text-white/80" : "text-zinc-600 dark:text-zinc-400"
          }`}
        >
          {hovered ? description : "We have got the solution"}
        </p>
      </div>
    </div>
  );
};
