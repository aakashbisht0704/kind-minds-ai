"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/app/components/Sidebar";
import TopTabs from "@/app/components/TopTabs";
import ChatInputDock from "@/app/components/ChatInputDock";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/app/contexts/AuthContext";
import { fetchProblems, saveProblem, uploadToolFile, logActivity } from "@/lib/toolsAPI";
import { resolveBackendUrl } from "@/lib/api";

interface AnalysisResult {
  summary: string;
  key_points: string[];
  recommended_steps: string[];
}

export default function ScanProblemPage() {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const loadHistory = async () => {
    if (!user) {
      setHistory([]);
      return;
    }
    setLoadingHistory(true);
    const { data, error } = await fetchProblems(user.id);
    if (error) {
      console.error("Failed to load problems history", error);
      setHistory([]);
    } else {
      setHistory(data ?? []);
    }
    setLoadingHistory(false);
  };

  useEffect(() => {
    loadHistory();
  }, [user]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    if (file) {
      setMessage("Image stored for reference. Add a short description so we can analyse it.");
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || isProcessing) return;

    if (!prompt.trim()) {
      setMessage("Share a quick description of the problem so we can help break it down.");
      return;
    }

    setIsProcessing(true);
    setMessage(null);
    setAnalysis(null);

    try {
      let filePath: string | null = null;
      if (selectedFile) {
        const uploadResult = await uploadToolFile({
          file: selectedFile,
          userId: user.id,
          prefix: "problems",
        });
        if (uploadResult.error) {
          console.error("Problem upload failed", uploadResult.error);
          setMessage("We saved the analysis without the image due to an upload issue.");
        } else {
          filePath = uploadResult.filePath;
        }
      }

      const response = await fetch(resolveBackendUrl("/api/tools/scan-problem"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Problem analysis failed");
      }

      const data = await response.json();
      setAnalysis(data.analysis);

      const { error } = await saveProblem({
        userId: user.id,
        sourceType: selectedFile ? "image" : "text",
        prompt: prompt.trim(),
        analysis: data.analysis,
        sourceFilePath: selectedFile ? filePath : null,
      });

      if (error) {
        console.error("Failed to save problem analysis", error);
        setMessage("We analysed the problem but couldn't save it. Copy the steps to keep them.");
      } else {
        setMessage("Problem analysed. Steps saved to your notebook.");
        await logActivity({
          userId: user.id,
          title: "Scanned a problem for help",
          type: "scan_problem",
        });
        await loadHistory();
      }
    } catch (error) {
      console.error(error);
      setMessage("We couldn't analyse that problem right now. Try rephrasing or check back soon.");
    } finally {
      setIsProcessing(false);
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
              <h1 className="text-3xl font-semibold text-gray-900">Scan a Problem</h1>
              <p className="text-gray-600">
                Upload homework, equations, or tricky wording. We&apos;ll highlight key ideas and outline next steps.
              </p>
            </header>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <Card className="rounded-2xl border border-gray-200 p-6">
                <label htmlFor="prompt" className="text-sm font-semibold text-gray-800">
                  Describe the problem
                </label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  rows={4}
                  placeholder="Paste the question or describe what you see. Mention diagrams or context if helpful."
                  className="mt-3 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 shadow-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                  disabled={isProcessing}
                />
              </Card>

              <Card className="rounded-2xl border border-gray-200 p-6">
                <label className="text-sm font-semibold text-gray-800">
                  Optional: attach a reference image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="mt-3 block w-full text-sm text-gray-700 file:mr-4 file:rounded-full file:border-0 file:bg-purple-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-purple-700 hover:file:bg-purple-200"
                  disabled={isProcessing}
                />
              </Card>

              {message && (
                <div className="rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 text-sm text-purple-700">
                  {message}
                </div>
              )}

              <Button
                type="submit"
                disabled={isProcessing || !user}
                className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 py-3 text-base font-semibold text-white hover:from-purple-600 hover:to-purple-700"
              >
                {isProcessing ? "Analysing..." : "Analyse Problem"}
              </Button>
            </form>

            {analysis && (
              <section className="mt-10 space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">Analysis</h2>
                <Card className="rounded-2xl border border-gray-200 p-6">
                  <h3 className="text-base font-semibold text-gray-900">Summary</h3>
                  <p className="mt-2 text-sm text-gray-700 whitespace-pre-line">{analysis.summary}</p>

                  {analysis.key_points?.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold text-gray-900">Key Ideas</h4>
                      <ul className="mt-2 space-y-2 text-sm text-gray-700">
                        {analysis.key_points.map((point, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="mt-1 h-2 w-2 rounded-full bg-purple-500" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysis.recommended_steps?.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold text-gray-900">Recommended Steps</h4>
                      <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm text-gray-700">
                        {analysis.recommended_steps.map((step, index) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </Card>
              </section>
            )}

            <section className="mt-10">
              <h2 className="text-xl font-semibold text-gray-900">Problem Notebook</h2>
              <p className="mt-1 text-sm text-gray-500">
                Revisit analysed problems and reuse the step-by-step plan.
              </p>

              <div className="mt-4 space-y-4">
                {loadingHistory && <p className="text-sm text-gray-500">Loading problems...</p>}
                {!loadingHistory && history.length === 0 && (
                  <p className="text-sm text-gray-500">
                    Scan your first problem to build this library.
                  </p>
                )}
                {history.map((entry) => (
                  <Card key={entry.id} className="rounded-2xl border border-gray-200 p-5">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {new Date(entry.created_at).toLocaleString()}
                        </span>
                        <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                          {entry.source_type === "image" ? "Image + Text" : "Text"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-line">{entry.prompt}</p>
                      {entry.analysis?.summary && (
                        <div className="rounded-xl bg-purple-50 px-3 py-2 text-xs text-purple-700">
                          {entry.analysis.summary}
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


