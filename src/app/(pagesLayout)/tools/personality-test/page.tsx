"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/app/components/Sidebar";
import TopTabs from "@/app/components/TopTabs";
import ChatInputDock from "@/app/components/ChatInputDock";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/app/contexts/AuthContext";
import { savePersonalityResult, fetchPersonalityResults, logActivity } from "@/lib/toolsAPI";
import { updateProfile } from "@/lib/profileAPI";

// MBTI Questions - Each question maps to a dimension and preference
// Format: { id, text, dimension: 'EI'|'SN'|'TF'|'JP', preference: 'E'|'I'|'S'|'N'|'T'|'F'|'J'|'P' }
const mbtiQuestions = [
  // E/I Dimension - Extraversion vs Introversion (Energy source)
  { id: "ei1", text: "I feel energized after socializing with large groups of people.", dimension: "EI", preference: "E" },
  { id: "ei2", text: "I prefer to recharge by spending time alone or with a few close friends.", dimension: "EI", preference: "I" },
  { id: "ei3", text: "I enjoy being the center of attention in social situations.", dimension: "EI", preference: "E" },
  { id: "ei4", text: "I need quiet time to process my thoughts and feelings.", dimension: "EI", preference: "I" },
  { id: "ei5", text: "I prefer to think out loud and discuss ideas with others.", dimension: "EI", preference: "E" },
  { id: "ei6", text: "I prefer to think things through internally before sharing my thoughts.", dimension: "EI", preference: "I" },
  
  // S/N Dimension - Sensing vs Intuition (Information processing)
  { id: "sn1", text: "I focus on facts, details, and what is practical and realistic.", dimension: "SN", preference: "S" },
  { id: "sn2", text: "I focus on possibilities, patterns, and what could be in the future.", dimension: "SN", preference: "N" },
  { id: "sn3", text: "I prefer concrete, step-by-step instructions over abstract concepts.", dimension: "SN", preference: "S" },
  { id: "sn4", text: "I enjoy exploring abstract ideas and theoretical concepts.", dimension: "SN", preference: "N" },
  { id: "sn5", text: "I pay attention to specific facts and details in my environment.", dimension: "SN", preference: "S" },
  { id: "sn6", text: "I notice the big picture and underlying meanings.", dimension: "SN", preference: "N" },
  
  // T/F Dimension - Thinking vs Feeling (Decision making)
  { id: "tf1", text: "I make decisions based on logic and objective analysis.", dimension: "TF", preference: "T" },
  { id: "tf2", text: "I make decisions based on values and how they affect people.", dimension: "TF", preference: "F" },
  { id: "tf3", text: "I prioritize fairness and truthfulness over harmony.", dimension: "TF", preference: "T" },
  { id: "tf4", text: "I prioritize harmony and people's feelings over strict logic.", dimension: "TF", preference: "F" },
  { id: "tf5", text: "I am naturally critical and analytical in my approach.", dimension: "TF", preference: "T" },
  { id: "tf6", text: "I am naturally empathetic and considerate of others' emotions.", dimension: "TF", preference: "F" },
  
  // J/P Dimension - Judging vs Perceiving (Lifestyle organization)
  { id: "jp1", text: "I prefer to have things planned and organized in advance.", dimension: "JP", preference: "J" },
  { id: "jp2", text: "I prefer to keep my options open and be spontaneous.", dimension: "JP", preference: "P" },
  { id: "jp3", text: "I like to make decisions quickly and stick to them.", dimension: "JP", preference: "J" },
  { id: "jp4", text: "I prefer to gather more information before making decisions.", dimension: "JP", preference: "P" },
  { id: "jp5", text: "I work best with structure, deadlines, and clear expectations.", dimension: "JP", preference: "J" },
  { id: "jp6", text: "I work best with flexibility and adaptability to change.", dimension: "JP", preference: "P" },
];

const likertOptions = [
  { value: 1, label: "Strongly Disagree" },
  { value: 2, label: "Disagree" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Agree" },
  { value: 5, label: "Strongly Agree" },
];

type AnswersState = Record<string, number | null>;

function defaultAnswers() {
  return mbtiQuestions.reduce<AnswersState>((acc, q) => {
    acc[q.id] = null; // null means not answered yet, 3 means Neutral was explicitly selected
    return acc;
  }, {});
}

// Calculate MBTI type from answers
function calculateMBTI(answers: AnswersState): string {
  const dimensions: Record<string, { first: number; second: number }> = {
    EI: { first: 0, second: 0 }, // E vs I
    SN: { first: 0, second: 0 }, // S vs N
    TF: { first: 0, second: 0 }, // T vs F
    JP: { first: 0, second: 0 }, // J vs P
  };

  // Calculate scores for each dimension
  mbtiQuestions.forEach((question) => {
    const answer = answers[question.id];
    // Skip if question not answered (null)
    if (answer === null || answer === undefined) return;
    
    const dimension = dimensions[question.dimension];
    // Treat answer as Likert scale: 1-5, with 3 being neutral
    // Score calculation: answer - 3 gives -2 to +2 range
    if (question.preference === "E" || question.preference === "S" || question.preference === "T" || question.preference === "J") {
      dimension.first += answer - 3; // Positive score for first preference
    } else {
      dimension.second += answer - 3; // Positive score for second preference
    }
  });

  // Determine type based on which side scores higher
  const type = [
    dimensions.EI.first >= dimensions.EI.second ? "E" : "I",
    dimensions.SN.first >= dimensions.SN.second ? "S" : "N",
    dimensions.TF.first >= dimensions.TF.second ? "T" : "F",
    dimensions.JP.first >= dimensions.JP.second ? "J" : "P",
  ].join("");

  return type;
}

// MBTI Type Descriptions
const mbtiDescriptions: Record<string, { name: string; description: string }> = {
  INTJ: { name: "The Architect", description: "Imaginative and strategic thinkers with a plan for everything." },
  INTP: { name: "The Thinker", description: "Innovative inventors with an unquenchable thirst for knowledge." },
  ENTJ: { name: "The Commander", description: "Bold, imaginative, and strong-willed leaders who find a way or make one." },
  ENTP: { name: "The Debater", description: "Smart and curious thinkers who cannot resist an intellectual challenge." },
  INFJ: { name: "The Advocate", description: "Creative and insightful, inspiring and convincing idealists." },
  INFP: { name: "The Mediator", description: "Poetic, kind, and altruistic people, always eager to help a good cause." },
  ENFJ: { name: "The Protagonist", description: "Charismatic and inspiring leaders, able to mesmerize their listeners." },
  ENFP: { name: "The Campaigner", description: "Enthusiastic, creative, and sociable free spirits." },
  ISTJ: { name: "The Logistician", description: "Practical and fact-minded, reliable and responsible." },
  ISFJ: { name: "The Protector", description: "Very dedicated and warm protectors, always ready to defend their loved ones." },
  ESTJ: { name: "The Executive", description: "Excellent administrators, unsurpassed at managing things or people." },
  ESFJ: { name: "The Consul", description: "Extraordinarily caring, social, and popular people, always eager to help." },
  ISTP: { name: "The Virtuoso", description: "Bold and practical experimenters, masters of all kinds of tools." },
  ISFP: { name: "The Adventurer", description: "Flexible and charming artists, always ready to explore new possibilities." },
  ESTP: { name: "The Entrepreneur", description: "Smart, energetic, and perceptive people, true thrill-seekers." },
  ESFP: { name: "The Entertainer", description: "Spontaneous, energetic, and enthusiastic people - life is never boring around them." },
};

export default function PersonalityTestPage() {
  const { user } = useAuth();
  const [answers, setAnswers] = useState<AnswersState>(defaultAnswers);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const mbtiType = useMemo(() => calculateMBTI(answers), [answers]);
  const mbtiInfo = mbtiDescriptions[mbtiType];
  // Progress: count questions that have been answered (using answeredQuestions set to track interactions)
  const answeredCount = answeredQuestions.size;
  const progress = Math.round((answeredCount / mbtiQuestions.length) * 100);
  const isComplete = answeredCount === mbtiQuestions.length;

  const loadHistory = async () => {
    if (!user) {
      setHistory([]);
      return;
    }
    setLoadingHistory(true);
    const { data, error } = await fetchPersonalityResults(user.id);
    if (error) {
      console.error("Failed to load personality results", error);
      setHistory([]);
    } else {
      setHistory(data ?? []);
    }
    setLoadingHistory(false);
  };

  useEffect(() => {
    loadHistory();
  }, [user]);

  const handleOptionSelect = (questionId: string, value: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
    // Mark question as answered when user selects any option (including Neutral)
    setAnsweredQuestions((prev) => new Set(prev).add(questionId));
  };

  const handleNext = () => {
    if (currentQuestionIndex < mbtiQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || isSubmitting || !isComplete) return;

    setIsSubmitting(true);
    try {
      const { error } = await savePersonalityResult({
        userId: user.id,
        answers,
        summary: mbtiInfo.description,
        personalityType: mbtiType,
        score: 0, // Not used for MBTI
      });

      if (error) {
        console.error("Failed to save personality result", error);
        setResultMessage("We couldn't save your result right now. Please try again.");
      } else {
        // Update user profile with MBTI type for personalization across the platform
        const { error: profileError } = await updateProfile(user.id, { mbti_type: mbtiType });
        if (profileError) {
          console.error("Failed to update profile with MBTI type", profileError);
        }
        // Log activity for profile timeline
        await logActivity({
          userId: user.id,
          title: `Completed MBTI assessment (${mbtiType})`,
          type: "personality_test",
        });
        setResultMessage(`Assessment saved! Your MBTI type is ${mbtiType} - ${mbtiInfo.name}. This will personalize your KindMinds experience.`);
        await loadHistory();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQuestion = mbtiQuestions[currentQuestionIndex];
  const dimensionLabels: Record<string, string> = {
    EI: "Extraversion (E) vs Introversion (I)",
    SN: "Sensing (S) vs Intuition (N)",
    TF: "Thinking (T) vs Feeling (F)",
    JP: "Judging (J) vs Perceiving (P)",
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
              <h1 className="text-3xl font-semibold text-gray-900">MBTI Personality Test</h1>
              <p className="text-gray-600">
                Discover your Myers-Briggs Type Indicator (MBTI) personality type to personalize your KindMinds experience.
              </p>
              <div className="mt-2">
                <div className="flex items-center justify-between text-sm text-gray-500 mb-1">
                  <span>Progress: {progress}%</span>
                  <span>Question {currentQuestionIndex + 1} of {mbtiQuestions.length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </header>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              {/* Current Question */}
              <Card className="rounded-2xl border border-gray-200 p-6">
                <div className="mb-4">
                  <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
                    {dimensionLabels[currentQuestion.dimension]}
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">{currentQuestion.text}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  {likertOptions.map((option) => {
                    const currentAnswer = answers[currentQuestion.id];
                    const isActive = currentAnswer === option.value;
                    const isUnanswered = currentAnswer === null || currentAnswer === undefined;
                    return (
                      <button
                        type="button"
                        key={option.value}
                        onClick={() => handleOptionSelect(currentQuestion.id, option.value)}
                        className={`rounded-xl border px-4 py-3 text-sm transition ${
                          isActive
                            ? "border-purple-500 bg-purple-50 text-purple-700 font-semibold"
                            : isUnanswered
                            ? "border-gray-200 bg-gray-50 text-gray-500 hover:border-purple-300 hover:bg-purple-50"
                            : "border-gray-200 bg-white text-gray-700 hover:border-purple-300 hover:bg-purple-50"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>

                {/* Navigation */}
                <div className="mt-6 flex items-center justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                    className="rounded-xl"
                  >
                    Previous
                  </Button>
                  {currentQuestionIndex < mbtiQuestions.length - 1 ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleNext}
                      className="rounded-xl"
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={!isComplete || isSubmitting || !user}
                      className="rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 disabled:opacity-50"
                    >
                      {isComplete ? (isSubmitting ? "Saving..." : "Complete Test") : "Answer all questions to complete"}
                    </Button>
                  )}
                </div>
              </Card>

              {/* MBTI Result Preview */}
              {isComplete && (
                <Card className="rounded-2xl border border-purple-200 p-6 bg-gradient-to-br from-purple-50 via-white to-purple-100">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Your MBTI Type</h2>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <span className="text-4xl font-bold text-purple-600">{mbtiType}</span>
                      <div>
                        <p className="text-lg font-semibold text-gray-900">{mbtiInfo.name}</p>
                        <p className="text-sm text-gray-600">{mbtiInfo.description}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {resultMessage && (
                <div className="rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 text-sm text-purple-700">
                  {resultMessage}
                </div>
              )}

            </form>

            <section className="mt-10">
              <h2 className="text-xl font-semibold text-gray-900">Previous Assessments</h2>
              <p className="mt-1 text-sm text-gray-500">
                Track your MBTI type over time and see how your personality insights evolve.
              </p>

              <div className="mt-4 space-y-4">
                {loadingHistory && <p className="text-sm text-gray-500">Loading history...</p>}
                {!loadingHistory && history.length === 0 && (
                  <p className="text-sm text-gray-500">
                    Complete the assessment to see your MBTI type history.
                  </p>
                )}
                {history.map((entry) => {
                  const typeInfo = mbtiDescriptions[entry.personality_type] || { name: entry.personality_type, description: entry.summary || "" };
                  return (
                    <Card key={entry.id} className="rounded-2xl border border-gray-200 p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="text-2xl font-bold text-purple-600">{entry.personality_type}</span>
                            <span className="text-base font-semibold text-gray-900">{typeInfo.name}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(entry.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {typeInfo.description && (
                        <p className="mt-3 text-sm text-gray-600">{typeInfo.description}</p>
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
    </div>
  );
}
