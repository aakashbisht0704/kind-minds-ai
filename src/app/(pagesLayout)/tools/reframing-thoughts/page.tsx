"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/app/components/Sidebar";
import TopTabs from "@/app/components/TopTabs";
import ChatInputDock from "@/app/components/ChatInputDock";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/app/contexts/AuthContext";
import { fetchReframes, saveReframe, logActivity } from "@/lib/toolsAPI";
import { fetchProfile } from "@/lib/profileAPI";
import { resolveBackendUrl } from "@/lib/api";

export default function ReframingThoughtsPage() {
  const { user } = useAuth();
  const [thought, setThought] = useState("");
  const [reframed, setReframed] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadHistory = async () => {
    if (!user) {
      setHistory([]);
      return;
    }
    setLoadingHistory(true);
    const { data, error } = await fetchReframes(user.id);
    if (error) {
      console.error("Failed to load reframes", error);
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
    if (!user || isGenerating) return;
    if (!thought.trim()) {
      setMessage("Please describe the thought you'd like to reframe.");
      return;
    }

    setMessage(null);
    setIsGenerating(true);
    try {
      // Get user profile to fetch MBTI type for personalization
      let mbtiType: string | null = null;
      if (user?.id) {
        const { data: profile } = await fetchProfile(user.id);
        mbtiType = profile?.mbti_type || null;
      }

      const response = await fetch(resolveBackendUrl("/api/tools/reframe"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          thought: thought.trim(),
          mbti_type: mbtiType,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate reframed thought");
      }

      const data = await response.json();
      setReframed(data.reframed);

      const { error } = await saveReframe({
        userId: user.id,
        originalThought: thought.trim(),
        reframedThought: data.reframed,
      });

      if (error) {
        console.error("Failed to save reframed thought", error);
        setMessage("Generated a response, but we couldn't save it. You can copy it manually.");
      } else {
        setMessage("Reframe saved to your journal.");
        await logActivity({
          userId: user.id,
          title: "Reframed a difficult thought",
          type: "reframe",
        });
        await loadHistory();
      }
    } catch (error) {
      console.error(error);
      setMessage("We couldn't reframe that thought right now. Please try again shortly.");
    } finally {
      setIsGenerating(false);
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
              <h1 className="text-3xl font-semibold text-gray-900">Reframe Your Thoughts</h1>
              <p className="text-gray-600">
                Transform unhelpful beliefs into balanced, compassionate statements.
              </p>
            </header>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <Card className="rounded-2xl border border-gray-200 p-6">
                <label htmlFor="thought" className="text-sm font-semibold text-gray-800">
                  What thought would you like to reframe?
                </label>
                <textarea
                  id="thought"
                  value={thought}
                  onChange={(event) => setThought(event.target.value)}
                  rows={4}
                  placeholder="Write the thought as you experience it. Include context if helpful."
                  className="mt-3 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 shadow-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                  disabled={isGenerating}
                />
              </Card>

              {reframed && (
                <Card className="rounded-2xl border border-purple-200 bg-purple-50 p-6">
                  <h2 className="text-base font-semibold text-purple-700">Reframed Perspective</h2>
                  <p className="mt-3 text-sm text-purple-800 whitespace-pre-line">{reframed}</p>
                </Card>
              )}

              {message && (
                <div className="rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 text-sm text-purple-700">
                  {message}
                </div>
              )}

              <Button
                type="submit"
                disabled={isGenerating || !user}
                className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 py-3 text-base font-semibold text-white hover:from-purple-600 hover:to-purple-700"
              >
                {isGenerating ? "Reframing..." : "Generate Reframe"}
              </Button>
            </form>

            <section className="mt-10">
              <h2 className="text-xl font-semibold text-gray-900">Reframe Journal</h2>
              <p className="mt-1 text-sm text-gray-500">
                Look back on past reframes to reinforce new thinking patterns.
              </p>

              <div className="mt-4 space-y-4">
                {loadingHistory && <p className="text-sm text-gray-500">Loading entries...</p>}
                {!loadingHistory && history.length === 0 && (
                  <p className="text-sm text-gray-500">
                    Generate a reframe to start building your journal.
                  </p>
                )}
                {history.map((entry) => (
                  <Card key={entry.id} className="rounded-2xl border border-gray-200 p-5">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {new Date(entry.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-gray-500">Original thought</p>
                        <p className="text-sm text-gray-700 whitespace-pre-line">{entry.original_thought}</p>
                      </div>
                      <div className="rounded-xl bg-purple-50 px-3 py-2">
                        <p className="text-xs uppercase tracking-wider text-purple-500">Reframe</p>
                        <p className="text-sm text-purple-800 whitespace-pre-line">{entry.reframed_thought}</p>
                      </div>
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


