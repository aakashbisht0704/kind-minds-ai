"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/app/components/Sidebar";
import TopTabs from "@/app/components/TopTabs";
import ChatInputDock from "@/app/components/ChatInputDock";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/app/contexts/AuthContext";
import {
  Flashcard,
  fetchFlashcards,
  saveFlashcards,
  uploadToolFile,
  getSignedFileUrl,
  logActivity,
} from "@/lib/toolsAPI";
import { resolveBackendUrl } from "@/lib/api";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, X, RotateCcw } from "lucide-react";

export default function FlashcardsFromDocPage() {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>("");
  const [generatedCards, setGeneratedCards] = useState<Flashcard[] | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [viewingSet, setViewingSet] = useState<{ cards: Flashcard[]; title: string } | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState(0); // -1 for previous, 1 for next

  const loadHistory = async () => {
    if (!user) {
      setHistory([]);
      return;
    }
    setLoadingHistory(true);
    const { data, error } = await fetchFlashcards(user.id);
    if (error) {
      console.error("Failed to load flashcards history", error);
      setHistory([]);
    } else {
      setHistory(data ?? []);
    }
    setLoadingHistory(false);
  };

  useEffect(() => {
    loadHistory();
  }, [user]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      setFilePreview("");
      return;
    }

    if (!file.type.startsWith("text/") && file.type !== "application/json") {
      setMessage("Please upload a plain text or JSON file. PDF support is coming soon.");
      setSelectedFile(null);
      setFilePreview("");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === "string" ? reader.result : "";
      setFilePreview(text.slice(0, 1200));
      setSelectedFile(file);
      setMessage(null);
    };
    reader.onerror = () => {
      setMessage("We couldn't read that file. Try again with a different format.");
    };
    reader.readAsText(file);
  };

  const handleGenerate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || isProcessing) return;

    if (!selectedFile) {
      setMessage("Upload a document so we can build flashcards from it.");
      return;
    }

    setMessage(null);
    setIsProcessing(true);
    setGeneratedCards(null);

    try {
      const fileText = await selectedFile.text();
      if (!fileText.trim()) {
        setMessage("The file appears to be empty. Please upload a document with content.");
        return;
      }

      const uploadResult = await uploadToolFile({
        file: selectedFile,
        userId: user.id,
        prefix: "flashcards",
      });

      if (uploadResult.error) {
        console.error("Failed to upload file", uploadResult.error);
        setMessage("We couldn't upload that file. Please try again.");
        return;
      }

      const response = await fetch(resolveBackendUrl("/api/tools/flashcards"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: fileText.slice(0, 8000),
          filename: selectedFile.name,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate flashcards");
      }

      const data = await response.json();
      setGeneratedCards(data.cards);

      const { error } = await saveFlashcards({
        userId: user.id,
        title: data.title ?? selectedFile.name,
        sourceFilePath: uploadResult.filePath,
        cards: data.cards,
      });

      if (error) {
        console.error("Failed to save flashcards", error);
        setMessage("Flashcards generated, but saving failed. Copy them manually for now.");
      } else {
        setMessage("Flashcards saved! Review them anytime.");
        // Log activity for profile timeline
        await logActivity({
          userId: user.id,
          title: data.title ?? selectedFile.name ?? "Flashcards from document",
          type: "flashcards",
        });
        await loadHistory();
      }
    } catch (error) {
      console.error("Flashcard generation failed", error);
      setMessage("We couldn't create flashcards right now. Please try again later.");
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
              <h1 className="text-3xl font-semibold text-gray-900">Flashcards from Your Doc</h1>
              <p className="text-gray-600">
                Upload notes or study guides and we&apos;ll craft bite-sized Q&A for spaced repetition.
              </p>
            </header>

            <form onSubmit={handleGenerate} className="mt-8 space-y-6">
              <Card className="rounded-2xl border border-gray-200 p-6">
                <label className="text-sm font-semibold text-gray-800">
                  Upload a text document
                </label>
                <input
                  type="file"
                  accept=".txt,.md,.json,text/plain,application/json"
                  onChange={handleFileChange}
                  className="mt-3 block w-full text-sm text-gray-700 file:mr-4 file:rounded-full file:border-0 file:bg-purple-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-purple-700 hover:file:bg-purple-200"
                  disabled={isProcessing}
                />
                {filePreview && (
                  <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-600">
                    <p className="font-semibold text-gray-700">Preview</p>
                    <pre className="mt-2 max-h-40 overflow-y-auto whitespace-pre-wrap">
                      {filePreview}
                    </pre>
                  </div>
                )}
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
                {isProcessing ? "Generating..." : "Create Flashcards"}
              </Button>
            </form>

            {generatedCards && generatedCards.length > 0 && (
              <section className="mt-10 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Generated Flashcards</h2>
                  <Button
                    onClick={() => {
                      setViewingSet({ cards: generatedCards, title: "New Flashcards" });
                      setCurrentCardIndex(0);
                      setIsFlipped(false);
                    }}
                    className="rounded-lg bg-purple-500 hover:bg-purple-600 text-white"
                  >
                    View as Flashcards
                  </Button>
                </div>
                {generatedCards.map((card, index) => (
                  <Card key={index} className="rounded-2xl border border-gray-200 p-5">
                    <p className="text-xs uppercase tracking-wider text-gray-500">Question</p>
                    <p className="text-sm font-semibold text-gray-800">{card.question}</p>
                    <p className="mt-3 text-xs uppercase tracking-wider text-purple-500">Answer</p>
                    <p className="text-sm text-gray-700 whitespace-pre-line">{card.answer}</p>
                  </Card>
                ))}
              </section>
            )}

            <section className="mt-10">
              <h2 className="text-xl font-semibold text-gray-900">Saved Sets</h2>
              <p className="mt-1 text-sm text-gray-500">
                Revisit flashcards you&apos;ve generated from past documents.
              </p>

              <div className="mt-4 space-y-4">
                {loadingHistory && <p className="text-sm text-gray-500">Loading sets...</p>}
                {!loadingHistory && history.length === 0 && (
                  <p className="text-sm text-gray-500">
                    Generate your first set to see it saved here.
                  </p>
                )}
                {history.map((entry) => {
                  const cards = Array.isArray(entry.cards) ? entry.cards : [];
                  return (
                    <Card 
                      key={entry.id} 
                      className="rounded-2xl border border-gray-200 p-5 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => {
                        if (cards.length > 0) {
                          setViewingSet({ cards, title: entry.title || "Flashcard Set" });
                          setCurrentCardIndex(0);
                          setIsFlipped(false);
                        }
                      }}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-gray-900">
                            {entry.title || "Flashcard Set"}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {new Date(entry.created_at).toLocaleString()}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {cards.length > 0 && (
                            <span className="text-sm font-semibold text-purple-600">
                              {cards.length} {cards.length === 1 ? 'card' : 'cards'}
                            </span>
                          )}
                          {entry.source_file_path && (
                            <div onClick={(e) => e.stopPropagation()}>
                              <DownloadLink path={entry.source_file_path} />
                            </div>
                          )}
                        </div>
                      </div>
                      {cards.length === 0 && (
                        <p className="mt-3 text-xs text-gray-500">
                          No cards available in this set.
                        </p>
                      )}
                    </Card>
                  );
                })}
              </div>
            </section>
          </div>
        </div>

        <div className="flex-shrink-0">
          <ChatInputDock position="fixed" />
        </div>
      </main>

      {/* Flashcard Viewer Modal */}
      <Dialog open={!!viewingSet} onOpenChange={(open) => !open && setViewingSet(null)}>
        <DialogContent className="max-w-4xl w-full p-0 gap-0 bg-transparent border-none">
          {viewingSet && (
            <FlashcardViewer
              cards={viewingSet.cards}
              title={viewingSet.title}
              currentIndex={currentCardIndex}
              onIndexChange={setCurrentCardIndex}
              isFlipped={isFlipped}
              onFlip={setIsFlipped}
              direction={direction}
              onDirectionChange={setDirection}
              onClose={() => setViewingSet(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FlashcardViewer({
  cards,
  title,
  currentIndex,
  onIndexChange,
  isFlipped,
  onFlip,
  direction,
  onDirectionChange,
  onClose,
}: {
  cards: Flashcard[];
  title: string;
  currentIndex: number;
  onIndexChange: (index: number) => void;
  isFlipped: boolean;
  onFlip: (flipped: boolean) => void;
  direction: number;
  onDirectionChange: (dir: number) => void;
  onClose: () => void;
}) {
  const currentCard = cards[currentIndex];

  const handlePrevious = () => {
    if (currentIndex > 0) {
      onDirectionChange(-1);
      onIndexChange(currentIndex - 1);
      onFlip(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      onDirectionChange(1);
      onIndexChange(currentIndex + 1);
      onFlip(false);
    }
  };

  const handleFlip = () => {
    onFlip(!isFlipped);
  };

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 1000 : -1000,
      opacity: 0,
      rotateY: dir > 0 ? 90 : -90,
    }),
    center: {
      x: 0,
      opacity: 1,
      rotateY: 0,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -1000 : 1000,
      opacity: 0,
      rotateY: dir > 0 ? -90 : 90,
    }),
  };

  const flipVariants = {
    front: {
      rotateY: 0,
      opacity: 1,
    },
    back: {
      rotateY: 180,
      opacity: 1,
    },
  };

  return (
    <div className="relative w-full h-[600px] flex flex-col items-center justify-center bg-white rounded-2xl shadow-2xl">
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">
            Card {currentIndex + 1} of {cards.length}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="rounded-full hover:bg-gray-100"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Flashcard Container */}
      <div className="relative w-full max-w-2xl h-[400px] mx-auto" style={{ perspective: '1000px' }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
              rotateY: { duration: 0.5 },
            }}
            className="absolute inset-0 cursor-pointer"
            style={{ transformStyle: 'preserve-3d' }}
            onClick={handleFlip}
          >
            {/* Front (Question) */}
            <motion.div
              className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 p-8 flex flex-col items-center justify-center"
              style={{ backfaceVisibility: 'hidden' }}
              variants={flipVariants}
              animate={isFlipped ? "back" : "front"}
              transition={{ duration: 0.6 }}
            >
              <p className="text-xs uppercase tracking-wider text-purple-600 mb-4 font-semibold">
                Question
              </p>
              <p className="text-2xl font-semibold text-gray-900 text-center whitespace-pre-line">
                {currentCard.question}
              </p>
              <p className="text-xs text-purple-600 mt-6">Click to flip</p>
            </motion.div>

            {/* Back (Answer) */}
            <motion.div
              className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 border-2 border-purple-400 p-8 flex flex-col items-center justify-center text-white"
              style={{ 
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)'
              }}
              variants={flipVariants}
              animate={isFlipped ? "front" : "back"}
              transition={{ duration: 0.6 }}
            >
              <p className="text-xs uppercase tracking-wider text-purple-100 mb-4 font-semibold">
                Answer
              </p>
              <p className="text-2xl font-semibold text-white text-center whitespace-pre-line">
                {currentCard.answer}
              </p>
              <p className="text-xs text-purple-100 mt-6">Click to flip</p>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="rounded-full h-12 w-12 disabled:opacity-50"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleFlip}
            className="rounded-full"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Flip
          </Button>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          disabled={currentIndex === cards.length - 1}
          className="rounded-full h-12 w-12 disabled:opacity-50"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}

function DownloadLink({ path }: { path: string }) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { url } = await getSignedFileUrl(path);
      if (active) {
        setSignedUrl(url);
      }
    })();
    return () => {
      active = false;
    };
  }, [path]);

  if (!signedUrl) {
    return null;
  }

  return (
    <a
      href={signedUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center rounded-lg border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700 transition hover:bg-purple-100"
    >
      Download Source
    </a>
  );
}


