"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/app/components/Sidebar";
import TopTabs from "@/app/components/TopTabs";
import ChatInputDock from "@/app/components/ChatInputDock";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/app/contexts/AuthContext";
import {
  Quiz,
  QuizQuestion,
  fetchQuizzes,
  saveQuiz,
  uploadToolFile,
  getSignedFileUrl,
  saveQuizAttempt,
  logActivity,
} from "@/lib/toolsAPI";
import { resolveBackendUrl } from "@/lib/api";
import { CheckCircle2, XCircle, ArrowRight, Play, Download, X } from "lucide-react";

export default function QuizFromDocPage() {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>("");
  const [generatedQuiz, setGeneratedQuiz] = useState<{ title: string; questions: QuizQuestion[] } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<Quiz[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [viewingQuiz, setViewingQuiz] = useState<Quiz | null>(null);
  const [numQuestions, setNumQuestions] = useState(5);

  const loadHistory = async () => {
    if (!user) {
      setHistory([]);
      return;
    }
    setLoadingHistory(true);
    const { data, error } = await fetchQuizzes(user.id);
    if (error) {
      console.error("Failed to load quizzes history", error);
      setHistory([]);
    } else {
      setHistory((data ?? []) as Quiz[]);
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
      setMessage("Upload a document so we can create a quiz from it.");
      return;
    }

    setMessage(null);
    setIsProcessing(true);
    setGeneratedQuiz(null);

    try {
      const fileText = await selectedFile.text();
      if (!fileText.trim()) {
        setMessage("The file appears to be empty. Please upload a document with content.");
        return;
      }

      const uploadResult = await uploadToolFile({
        file: selectedFile,
        userId: user.id,
        prefix: "quizzes",
      });

      if (uploadResult.error) {
        console.error("Failed to upload file", uploadResult.error);
        setMessage("We couldn't upload that file. Please try again.");
        return;
      }

      const response = await fetch(resolveBackendUrl("/api/tools/quiz"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: fileText.slice(0, 8000),
          filename: selectedFile.name,
          num_questions: numQuestions,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Quiz generation failed:", errorText);
        setMessage(`Failed to generate quiz: ${errorText || "Please check if the backend server is running."}`);
        return;
      }

      const data = await response.json();
      setGeneratedQuiz({ title: data.title, questions: data.questions });

      const { error } = await saveQuiz({
        userId: user.id,
        title: data.title ?? selectedFile.name,
        sourceFilePath: uploadResult.filePath,
        questions: data.questions,
      });

      if (error) {
        console.error("Failed to save quiz", error);
        setMessage("Quiz generated, but saving failed. Copy them manually for now.");
      } else {
        setMessage("Quiz saved! Take it anytime.");
        await logActivity({
          userId: user.id,
          title: data.title ?? selectedFile.name ?? "Generated quiz from document",
          type: "quiz_created",
        });
        await loadHistory();
      }
    } catch (error) {
      console.error("Quiz generation failed", error);
      setMessage("We couldn't create a quiz right now. Please try again later.");
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
              <h1 className="text-3xl font-semibold text-gray-900">Quiz from Your Doc</h1>
              <p className="text-gray-600">
                Upload notes or study guides and we&apos;ll create interactive quizzes to test your understanding.
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

              <Card className="rounded-2xl border border-gray-200 p-6">
                <label className="text-sm font-semibold text-gray-800 mb-3 block">
                  Number of Questions
                </label>
                <div className="flex gap-2">
                  {[3, 5, 7, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setNumQuestions(num)}
                      className={`flex-1 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                        numQuestions === num
                          ? "border-purple-500 bg-purple-50 text-purple-700"
                          : "border-gray-200 bg-white text-gray-700 hover:border-purple-300 hover:bg-purple-50"
                      }`}
                    >
                      {num} Questions
                    </button>
                  ))}
                </div>
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
                {isProcessing ? "Generating Quiz..." : "Generate Quiz"}
              </Button>
            </form>

            {generatedQuiz && generatedQuiz.questions.length > 0 && (
              <section className="mt-10 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Generated Quiz</h2>
                  <Button
                    onClick={() => {
                      // Find the quiz in history
                      const quiz = history.find(q => q.title === generatedQuiz.title && q.questions.length === generatedQuiz.questions.length) || 
                                  ({ id: "", title: generatedQuiz.title, questions: generatedQuiz.questions, created_at: new Date().toISOString() } as Quiz);
                      setViewingQuiz(quiz);
                    }}
                    className="rounded-lg bg-purple-500 hover:bg-purple-600 text-white"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Take Quiz
                  </Button>
                </div>
                <Card className="rounded-2xl border border-purple-200 p-5 bg-gradient-to-br from-purple-50 via-white to-purple-100">
                  <h3 className="text-lg font-semibold text-gray-900">{generatedQuiz.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {generatedQuiz.questions.length} questions ready to test your knowledge!
                  </p>
                </Card>
              </section>
            )}

            <section className="mt-10">
              <h2 className="text-xl font-semibold text-gray-900">Saved Quizzes</h2>
              <p className="mt-1 text-sm text-gray-500">
                Revisit quizzes you&apos;ve generated from past documents.
              </p>

              <div className="mt-4 space-y-4">
                {loadingHistory && <p className="text-sm text-gray-500">Loading quizzes...</p>}
                {!loadingHistory && history.length === 0 && (
                  <p className="text-sm text-gray-500">
                    Generate your first quiz to see it saved here.
                  </p>
                )}
                {history.map((quiz) => {
                  const questions = Array.isArray(quiz.questions) ? quiz.questions : [];
                  return (
                    <Card
                      key={quiz.id}
                      className="rounded-2xl border border-gray-200 p-5 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setViewingQuiz(quiz)}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-gray-900">
                            {quiz.title || "Quiz"}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {new Date(quiz.created_at).toLocaleString()}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {questions.length > 0 && (
                            <span className="text-sm font-semibold text-purple-600">
                              {questions.length} {questions.length === 1 ? "question" : "questions"}
                            </span>
                          )}
                          {quiz.source_file_path && (
                            <div onClick={(e) => e.stopPropagation()}>
                              <DownloadLink path={quiz.source_file_path} />
                            </div>
                          )}
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewingQuiz(quiz);
                            }}
                            className="rounded-lg bg-purple-500 hover:bg-purple-600 text-white"
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Take Quiz
                          </Button>
                        </div>
                      </div>
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

      {/* Quiz Viewer Modal */}
      <Dialog open={!!viewingQuiz} onOpenChange={(open) => !open && setViewingQuiz(null)}>
        <DialogContent className="max-w-4xl w-full p-0 gap-0 bg-transparent border-none">
          <DialogTitle className="sr-only">{viewingQuiz?.title || "Quiz"}</DialogTitle>
          {viewingQuiz && <QuizViewer quiz={viewingQuiz} onClose={() => setViewingQuiz(null)} userId={user?.id || ""} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function QuizViewer({ quiz, onClose, userId }: { quiz: Quiz; onClose: () => void; userId: string }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const questions = Array.isArray(quiz.questions) ? (quiz.questions as QuizQuestion[]) : [];
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const allAnswered = questions.every((_, idx) => selectedAnswers[idx] !== undefined);

  const handleAnswerSelect = (optionIndex: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [currentQuestionIndex]: optionIndex }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    // Calculate score
    let correctCount = 0;
    questions.forEach((q, qIdx) => {
      const selectedOptionIndex = selectedAnswers[qIdx];
      if (selectedOptionIndex !== undefined) {
        const selectedOption = q.options[selectedOptionIndex];
        if (selectedOption.is_correct) {
          correctCount++;
        }
      }
    });

    setScore(correctCount);
    setShowResults(true);

    // Save quiz attempt
    if (userId && quiz.id) {
      await saveQuizAttempt({
        quizId: quiz.id,
        userId,
        score: correctCount,
        totalQuestions: questions.length,
        answers: selectedAnswers,
      });
    }
  };

  if (showResults) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col">
        {/* Fixed Header */}
        <div className="flex-shrink-0 p-6 border-b border-gray-200">
          <div className="text-center space-y-4">
            <div className="text-5xl font-bold text-purple-600">{score}/{questions.length}</div>
            <div className="text-xl font-semibold text-gray-900">{percentage}% Correct</div>
            <p className="text-gray-600">
              {percentage >= 80 ? "🎉 Excellent work!" : percentage >= 60 ? "👍 Good job!" : "💪 Keep practicing!"}
            </p>
          </div>
        </div>

        {/* Scrollable Results */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4 text-left">
            {questions.map((q, qIdx) => {
              const selectedIdx = selectedAnswers[qIdx];
              const selectedOption = selectedIdx !== undefined ? q.options[selectedIdx] : null;
              const isCorrect = selectedOption?.is_correct || false;

              return (
                <Card key={qIdx} className="p-4 border-2" style={{ borderColor: isCorrect ? "#10b981" : "#ef4444" }}>
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{q.question}</p>
                      <p className="mt-2 text-sm text-gray-600">
                        Your answer: <span className={isCorrect ? "text-green-600 font-semibold" : "text-red-600"}>{selectedOption?.text}</span>
                      </p>
                      {q.explanation && (
                        <p className="mt-2 text-sm text-purple-600">{q.explanation}</p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="flex-shrink-0 p-6 border-t border-gray-200">
          <div className="flex gap-4 justify-center">
            <Button onClick={onClose} variant="outline" className="rounded-xl">
              Close
            </Button>
            <Button
              onClick={() => {
                setCurrentQuestionIndex(0);
                setSelectedAnswers({});
                setShowResults(false);
                setScore(0);
              }}
              className="rounded-xl bg-purple-500 hover:bg-purple-600 text-white"
            >
              Retake Quiz
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col">
      {/* Fixed Header */}
      <div className="flex-shrink-0 p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{quiz.title}</h3>
            <p className="text-sm text-gray-500">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Scrollable Question Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">{currentQuestion.question}</h2>
          <div className="space-y-3">
            {currentQuestion.options.map((option, optIdx) => {
              const isSelected = selectedAnswers[currentQuestionIndex] === optIdx;
              return (
                <button
                  key={optIdx}
                  type="button"
                  onClick={() => handleAnswerSelect(optIdx)}
                  className={`w-full text-left rounded-xl border-2 px-4 py-3 text-sm transition ${
                    isSelected
                      ? "border-purple-500 bg-purple-50 text-purple-700 font-semibold"
                      : "border-gray-200 bg-white text-gray-700 hover:border-purple-300 hover:bg-purple-50"
                  }`}
                >
                  {String.fromCharCode(65 + optIdx)}. {option.text}
                </button>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Fixed Footer */}
      <div className="flex-shrink-0 p-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="rounded-xl"
          >
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={selectedAnswers[currentQuestionIndex] === undefined}
            className="rounded-xl bg-purple-500 hover:bg-purple-600 text-white"
          >
            {isLastQuestion ? "Submit Quiz" : "Next"}
            {!isLastQuestion && <ArrowRight className="h-4 w-4 ml-2" />}
          </Button>
        </div>
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
      onClick={(e) => e.stopPropagation()}
    >
      <Download className="h-3 w-3 mr-1" />
      Download Source
    </a>
  );
}

