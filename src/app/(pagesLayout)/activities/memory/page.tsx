// app/(pagesLayout)/activities/memory/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import ChatInputDock from "@/app/components/ChatInputDock";
import Sidebar from "@/app/components/Sidebar";
import TopTabs from "@/app/components/TopTabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/contexts/AuthContext";
import { logActivity } from "@/lib/toolsAPI";

type MemoryCard = {
  id: number;
  symbol: string;
  matched: boolean;
};

const BASE_SYMBOLS = ["🌙", "⭐", "🌊", "🌿", "🔥", "🌸", "🎵", "☁️"]; // 8 pairs → 16 cards

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function MemoryPage() {
  const { user } = useAuth();
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [lockBoard, setLockBoard] = useState(false);
  const [moves, setMoves] = useState(0);
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [activityLogged, setActivityLogged] = useState(false);

  const matchedCount = useMemo(
    () => cards.filter((c) => c.matched).length,
    [cards]
  );

  const allMatched = cards.length > 0 && matchedCount === cards.length;

  const initialiseGame = () => {
    const doubled = [...BASE_SYMBOLS, ...BASE_SYMBOLS].map((symbol, index) => ({
      id: index,
      symbol,
      matched: false,
    }));
    const shuffled = shuffle(doubled);
    setCards(shuffled);
    setFlippedIndices([]);
    setMoves(0);
    setCompleted(false);
    setLockBoard(false);
    setStarted(false);
    setActivityLogged(false);
  };

  useEffect(() => {
    initialiseGame();
  }, []);

  useEffect(() => {
    if (allMatched && cards.length > 0) {
      setCompleted(true);
    }
  }, [allMatched, cards.length]);

  // Log completion to activities once per game
  useEffect(() => {
    if (!completed || activityLogged || !user?.id) return;
    (async () => {
      try {
        await logActivity({
          userId: user.id,
          title: `Finished memory game in ${moves} moves`,
          type: "memory_game",
        });
      } catch (error) {
        console.error("Failed to log memory game activity", error);
      } finally {
        setActivityLogged(true);
      }
    })();
  }, [completed, activityLogged, user?.id, moves]);

  const handleCardClick = (index: number) => {
    if (lockBoard || completed) return;
    if (flippedIndices.includes(index)) return;
    if (!started) setStarted(true);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setLockBoard(true);
      setMoves((m) => m + 1);

      const [firstIdx, secondIdx] = newFlipped;
      const firstCard = cards[firstIdx];
      const secondCard = cards[secondIdx];

      if (firstCard.symbol === secondCard.symbol) {
        // Match
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c, idx) =>
              idx === firstIdx || idx === secondIdx ? { ...c, matched: true } : c
            )
          );
          setFlippedIndices([]);
          setLockBoard(false);
        }, 500);
      } else {
        // No match, flip back
        setTimeout(() => {
          setFlippedIndices([]);
          setLockBoard(false);
        }, 800);
      }
    }
  };

  return (
    <div className="relative grid min-h-dvh grid-cols-1 md:grid-cols-[320px_1fr] overflow-x-hidden">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <main className="mx-auto max-w-[1100px] px-6 pb-[6rem]">
        <TopTabs />

        <section className="mt-8 flex flex-col gap-6">
          <header className="space-y-2">
            <h1 className="text-4xl font-bold">Memory Game</h1>
            <p className="text-zinc-600 max-w-xl">
              Strengthen your working memory with a calming card‑matching game. Flip two cards at a
              time and try to find all the pairs.
            </p>
          </header>

          <div className="flex flex-col md:flex-row gap-8">
            <Card className="flex-1 rounded-3xl bg-white/95 border shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-zinc-500">Moves</p>
                  <p className="text-2xl font-semibold">{moves}</p>
                </div>
                <div className="text-sm text-zinc-500">
                  Pairs found: {matchedCount / 2} / {BASE_SYMBOLS.length}
                </div>
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={initialiseGame}
                  disabled={!started && !completed}
                >
                  Restart
                </Button>
              </div>

              <div className="grid grid-cols-4 gap-3 mt-4">
                {cards.map((card, index) => {
                  const isFlipped = card.matched || flippedIndices.includes(index);
                  return (
                    <button
                      key={card.id}
                      onClick={() => handleCardClick(index)}
                      disabled={card.matched || lockBoard}
                      className={`relative aspect-square rounded-2xl border transition transform ${
                        isFlipped
                          ? "bg-gradient-to-br from-[#FDE1FF] to-[#C7D2FE] text-slate-900 scale-100"
                          : "bg-slate-900/5 text-slate-400 hover:bg-slate-100"
                      } flex items-center justify-center text-3xl`}
                    >
                      <div className="relative w-full h-full [perspective:800px]">
                        <div
                          className={`absolute inset-0 flex items-center justify-center rounded-2xl transition-transform duration-300 [transform-style:preserve-3d] ${
                            isFlipped ? "[transform:rotateY(180deg)]" : ""
                          }`}
                        >
                          {/* Front (star/back) */}
                          <span className="absolute inset-0 flex items-center justify-center [backface-visibility:hidden]">
                            ✶
                          </span>
                          {/* Back (symbol) */}
                          <span className="absolute inset-0 flex items-center justify-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
                            {card.symbol}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

               {completed && (
                 <div className="mt-6 rounded-2xl bg-gradient-to-r from-emerald-100 to-sky-100 p-4 text-center">
                   <p className="font-semibold text-emerald-800">
                     Great job! You matched all the cards in {moves} moves. 🎉
                   </p>
                   <Button className="mt-3 rounded-full" onClick={initialiseGame}>
                     Play again
                   </Button>
                 </div>
               )}
            </Card>

            <Card className="w-full md:w-80 rounded-3xl bg-white/95 border shadow-sm p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">How it works</h2>
              <ul className="space-y-3 text-sm text-gray-600 text-left list-disc list-inside">
                <li>Tap any card to reveal what’s underneath.</li>
                <li>Try to remember where each symbol is.</li>
                <li>Flip two cards at a time to find matching pairs.</li>
                <li>The fewer moves you use, the sharper your focus!</li>
              </ul>
              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Tip: Take slow, gentle breaths as you play. Pairing focus with calm helps train
                  your brain to feel safe while concentrating.
                </p>
              </div>
            </Card>
          </div>
        </section>
      </main>

    </div>
  );
}


