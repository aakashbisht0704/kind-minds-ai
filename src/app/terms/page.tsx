"use client";

import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-dvh bg-white text-gray-900">
      <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
        <header>
          <h1 className="text-3xl font-semibold">Terms &amp; Conditions</h1>
          <p className="mt-2 text-sm text-gray-600">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </header>

        <section className="space-y-4 text-sm leading-relaxed text-gray-700">
          <p>
            By using KindMinds, you agree to these terms. Please read them carefully. If you do not
            agree, you should not use the service.
          </p>

          <h2 className="mt-4 text-lg font-semibold">Use of KindMinds</h2>
          <ul className="ml-5 list-disc space-y-1">
            <li>
              KindMinds is designed for learning support and mental wellness reflection, not for
              crisis response or emergency services.
            </li>
            <li>
              You are responsible for the content you share and must use the platform respectfully
              and within applicable laws.
            </li>
          </ul>

          <h2 className="mt-4 text-lg font-semibold">No medical or legal advice</h2>
          <p>
            KindMinds and its AI assistants do not provide medical, psychological, or legal
            diagnosis or treatment. For crisis situations or medical emergencies, contact local
            emergency services or a trusted professional immediately.
          </p>

          <h2 className="mt-4 text-lg font-semibold">Accounts &amp; data</h2>
          <ul className="ml-5 list-disc space-y-1">
            <li>You are responsible for keeping your login credentials secure.</li>
            <li>
              We may update or modify features over time. We&apos;ll aim to do so in ways that
              improve your experience.
            </li>
          </ul>

          <h2 className="mt-4 text-lg font-semibold">Changes to these terms</h2>
          <p>
            We may revise these Terms from time to time. When we do, we&apos;ll update the date at
            the top of this page. Continued use of KindMinds after changes means you accept the
            updated terms.
          </p>

          <p className="mt-4 text-xs text-gray-500">
            If you have questions about these Terms, please contact us at{" "}
            <a
              href="mailto:hello@kindminds.in"
              className="text-purple-600 hover:underline"
            >
              hello@kindminds.in
            </a>
            .
          </p>
        </section>

        <div className="pt-4 border-top border-gray-200">
          <Link href="/" className="text-sm text-purple-600 hover:underline">
            ← Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}


