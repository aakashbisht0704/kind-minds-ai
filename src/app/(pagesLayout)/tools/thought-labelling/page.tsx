"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/app/components/Sidebar";
import TopTabs from "@/app/components/TopTabs";
import ChatInputDock from "@/app/components/ChatInputDock";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/app/contexts/AuthContext";
import { fetchThoughtLabels, saveThoughtLabel } from "@/lib/toolsAPI";

const cognitiveLabels = [
  "All-or-Nothing Thinking",
  "Overgeneralization",
  "Mental Filter",
  "Discounting the Positive",
  "Jumping to Conclusions",
  "Magnification or Minimization",
  "Emotional Reasoning",
  "Should Statements",
  "Labeling",
  "Personalization",
];

export default function ThoughtLabellingPage() {
  const { user } = useAuth();
  const [thought, setThought] = useState("");
  const [label, setLabel] = useState(cognitiveLabels[0]);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadHistory = async () => {
    if (!user) {
      setHistory([]);
      return;
    }
    setLoadingHistory(true);
    const { data, error } = await fetchThoughtLabels(user.id);
    if (error) {
      console.error("Failed to load thought labels", error);
      setHistory([]);
    } else {
      setHistory(data ?? []);
    }
    setLoadingHistory(false);
  };

  useEffect(() => {
    loadHistory();
  }, [user]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || isSubmitting) return;

    if (!thought.trim()) {
      setMessage("Please describe your thought before saving.");
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    try {
      const { error } = await saveThoughtLabel({
        userId: user.id,
        thought: thought.trim(),
        label,
        notes: notes.trim() || undefined,
      });
      if (error) {
        console.error("Failed to save thought label", error);
        setMessage("We couldn't save this entry right now. Please try again.");
      } else {
        setMessage("Thought saved. Nice job practicing awareness!");
        setThought("");
        setNotes("");
        await loadHistory();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative grid min-h-dvh grid-cols-1 md:grid-cols-[320px_1fr] overflow-x-hidden">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <main className="relative h-dvh flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1080px] px-4 sm:px-6 py-8">
            <TopTabs />

            <header className="mt-6 flex flex-col gap-3">
              <h1 className="text-3xl font-semibold text-gray-900">Thought Labelling</h1>
              <p className="text-gray-600">
                Catch and label unhelpful thought patterns so you can respond with more balance.
              </p>
            </header>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <Card className="rounded-2xl border border-gray-200 p-6">
                <label htmlFor="thought" className="text-sm font-semibold text-gray-800">
                  What thought or situation are you noticing?
                </label>
                <textarea
                  id="thought"
                  value={thought}
                  onChange={(event) => setThought(event.target.value)}
                  placeholder="Write the exact language you used with yourself..."
                  rows={4}
                  className="mt-3 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 shadow-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                  disabled={isSubmitting}
                />
              </Card>

              <Card className="rounded-2xl border border-gray-200 p-6">
                <label htmlFor="label" className="text-sm font-semibold text-gray-800">
                  Choose the cognitive distortion that best fits:
                </label>
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {cognitiveLabels.map((option) => {
                    const isActive = label === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setLabel(option)}
                        className={`rounded-xl border px-3 py-2 text-sm transition ${
                          isActive
                            ? "border-purple-500 bg-purple-50 text-purple-700"
                            : "border-gray-200 bg-white text-gray-700 hover:border-purple-300 hover:bg-purple-50"
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </Card>

              <Card className="rounded-2xl border border-gray-200 p-6">
                <label htmlFor="notes" className="text-sm font-semibold text-gray-800">
                  Notes (optional)
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="How does this thought show up? What would a kinder response sound like?"
                  rows={3}
                  className="mt-3 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 shadow-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                  disabled={isSubmitting}
                />
              </Card>

              {message && (
                <div className="rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 text-sm text-purple-700">
                  {message}
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting || !user}
                className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 py-3 text-base font-semibold text-white hover:from-purple-600 hover:to-purple-700"
              >
                {isSubmitting ? "Saving..." : "Save Thought"}
              </Button>
            </form>

            <section className="mt-10">
              <h2 className="text-xl font-semibold text-gray-900">Thought Journal</h2>
              <p className="mt-1 text-sm text-gray-500">
                Revisit your saved thoughts and observe patterns over time.
              </p>

              <div className="mt-4 space-y-4">
                {loadingHistory && <p className="text-sm text-gray-500">Loading entries...</p>}
                {!loadingHistory && history.length === 0 && (
                  <p className="text-sm text-gray-500">
                    Start logging thoughts to build your awareness journal.
                  </p>
                )}
                {history.map((entry) => (
                  <Card key={entry.id} className="rounded-2xl border border-gray-200 p-5">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-semibold text-purple-600">{entry.label}</h3>
                        <span className="text-xs text-gray-500">
                          {new Date(entry.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-line">{entry.thought}</p>
                      {entry.notes && (
                        <div className="rounded-xl bg-purple-50 px-3 py-2 text-xs text-purple-700">
                          {entry.notes}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          </div>
        </div>

        <div className="flex-shrink-0">
          <ChatInputDock position="fixed" />
        </div>
      </main>
    </div>
  );
}


