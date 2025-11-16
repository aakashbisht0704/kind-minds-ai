"use client";

import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-dvh bg-white text-gray-900">
      <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
        <header>
          <h1 className="text-3xl font-semibold">Privacy Policy</h1>
          <p className="mt-2 text-sm text-gray-600">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </header>

        <section className="space-y-4 text-sm leading-relaxed text-gray-700">
          <p>
            KindMinds is built with care for students and their mental wellbeing. We collect only
            the data we need to provide the service, improve your experience, and keep your account
            secure.
          </p>

          <h2 className="mt-4 text-lg font-semibold">What we collect</h2>
          <ul className="ml-5 list-disc space-y-1">
            <li>Account details you provide (like email, name, and age/class).</li>
            <li>Chat content and tool usage, stored so you can revisit past sessions.</li>
            <li>
              Basic analytics (like pages visited, device type) to improve performance and
              reliability.
            </li>
          </ul>

          <h2 className="mt-4 text-lg font-semibold">How we use your data</h2>
          <ul className="ml-5 list-disc space-y-1">
            <li>To personalize academic and mindfulness support.</li>
            <li>To help you track your mood, activities, and progress over time.</li>
            <li>To maintain and improve the safety, reliability, and quality of KindMinds.</li>
          </ul>

          <h2 className="mt-4 text-lg font-semibold">Your choices</h2>
          <ul className="ml-5 list-disc space-y-1">
            <li>You can update profile information from your profile page.</li>
            <li>You can delete chats and certain tool entries directly in the app.</li>
            <li>
              You can request additional deletion or export of your data by emailing{" "}
              <a
                href="mailto:hello@kindminds.in"
                className="text-purple-600 hover:underline"
              >
                hello@kindminds.in
              </a>
              .
            </li>
          </ul>

          <p className="mt-4 text-xs text-gray-500">
            This page will continue to evolve as we add new features. For any questions or concerns,
            please reach out to us.
          </p>
        </section>

        <div className="pt-4 border-t border-gray-200">
          <Link href="/" className="text-sm text-purple-600 hover:underline">
            ← Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}


