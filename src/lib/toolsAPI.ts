"use client";

import { getSupabaseBrowserClient } from "./supabase";

const getSupabase = () => getSupabaseBrowserClient();

export async function savePersonalityResult({
  userId,
  answers,
  summary,
  personalityType,
  score,
}: {
  userId: string;
  answers: Record<string, number>;
  summary: string;
  personalityType: string;
  score: number;
}) {
  const supabase = getSupabase();
  const { error } = await supabase.from("personality_results").insert({
    user_id: userId,
    answers,
    summary,
    personality_type: personalityType,
    score,
  });
  return { error };
}

export async function fetchPersonalityResults(userId: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("personality_results")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return { data, error };
}

export async function saveThoughtLabel({
  userId,
  thought,
  label,
  notes,
}: {
  userId: string;
  thought: string;
  label: string;
  notes?: string;
}) {
  const supabase = getSupabase();
  const { error } = await supabase.from("thought_labels").insert({
    user_id: userId,
    thought,
    label,
    notes: notes ?? null,
  });
  return { error };
}

export async function fetchThoughtLabels(userId: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("thought_labels")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return { data, error };
}

export async function saveReframe({
  userId,
  originalThought,
  reframedThought,
}: {
  userId: string;
  originalThought: string;
  reframedThought: string;
}) {
  const supabase = getSupabase();
  const { error } = await supabase.from("reframes").insert({
    user_id: userId,
    original_thought: originalThought,
    reframed_thought: reframedThought,
  });
  return { error };
}

export async function fetchReframes(userId: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("reframes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return { data, error };
}

export interface Flashcard {
  question: string;
  answer: string;
}

export async function saveFlashcards({
  userId,
  title,
  sourceFilePath,
  cards,
}: {
  userId: string;
  title: string;
  sourceFilePath: string | null;
  cards: Flashcard[];
}) {
  const supabase = getSupabase();
  const { error } = await supabase.from("flashcards").insert({
    user_id: userId,
    title,
    source_file_path: sourceFilePath,
    cards,
  });
  return { error };
}

export async function fetchFlashcards(userId: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("flashcards")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return { data, error };
}

export async function saveProblem({
  userId,
  sourceType,
  prompt,
  analysis,
  sourceFilePath,
}: {
  userId: string;
  sourceType: "text" | "image";
  prompt: string;
  analysis: Record<string, unknown> | null;
  sourceFilePath?: string | null;
}) {
  const supabase = getSupabase();
  const { error } = await supabase.from("problems").insert({
    user_id: userId,
    source_type: sourceType,
    source_file_path: sourceFilePath ?? null,
    prompt,
    analysis,
  });
  return { error };
}

export async function fetchProblems(userId: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("problems")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return { data, error };
}

export async function uploadToolFile({
  file,
  userId,
  prefix,
}: {
  file: File;
  userId: string;
  prefix: string;
}) {
  const supabase = getSupabase();
  const fileExt = file.name.split(".").pop();
  const filePath = `${prefix}/${userId}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${fileExt ?? "bin"}`;

  const { error } = await supabase.storage
    .from("tool-uploads")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  return { error, filePath: error ? null : filePath };
}

export async function getSignedFileUrl(path: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase.storage
    .from("tool-uploads")
    .createSignedUrl(path, 60 * 60);
  return { url: data?.signedUrl ?? null, error };
}

export interface ActivityRecord {
  id: string;
  title: string;
  type: string;
  date: string;
  completed: boolean;
}

export async function fetchActivities(userId: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: true });
  return { data, error };
}

export async function updateActivityCompletion(activityId: string, completed: boolean) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("activities")
    .update({ completed })
    .eq("id", activityId);
  return { error };
}

export async function createActivity({
  userId,
  title,
  type,
  date,
}: {
  userId: string;
  title: string;
  type: string;
  date: string;
}) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("activities")
    .insert({ user_id: userId, title, type, date })
    .select("*")
    .single();
  return { data, error };
}

export async function deleteActivity(activityId: string) {
  const supabase = getSupabase();
  const { error } = await supabase.from("activities").delete().eq("id", activityId);
  return { error };
}

// Lightweight helper for logging completed activities/tools into the activities table
export async function logActivity({
  userId,
  title,
  type,
  date,
}: {
  userId: string;
  title: string;
  type: string;
  date?: string;
}) {
  const supabase = getSupabase();
  const isoDate = date ?? new Date().toISOString();
  const { error } = await supabase.from("activities").insert({
    user_id: userId,
    title,
    type,
    date: isoDate,
    completed: true,
  });
  return { error };
}

export interface QuizOption {
  text: string;
  is_correct: boolean;
}

export interface QuizQuestion {
  question: string;
  options: QuizOption[];
  explanation?: string;
}

export interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  source_file_path?: string;
  created_at: string;
}

export async function saveQuiz({
  userId,
  title,
  sourceFilePath,
  questions,
}: {
  userId: string;
  title: string;
  sourceFilePath: string | null;
  questions: QuizQuestion[];
}) {
  const supabase = getSupabase();
  const { error } = await supabase.from("quizzes").insert({
    user_id: userId,
    title,
    source_file_path: sourceFilePath,
    questions,
  });
  return { error };
}

export async function fetchQuizzes(userId: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("quizzes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return { data, error };
}

export async function saveQuizAttempt({
  quizId,
  userId,
  score,
  totalQuestions,
  answers,
}: {
  quizId: string;
  userId: string;
  score: number;
  totalQuestions: number;
  answers: Record<string, number>; // question_index: selected_option_index
}) {
  const supabase = getSupabase();
  const { error } = await supabase.from("quiz_attempts").insert({
    quiz_id: quizId,
    user_id: userId,
    score,
    total_questions: totalQuestions,
    answers,
  });
  return { error };
}

export async function fetchQuizAttempts(quizId: string, userId: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("quiz_attempts")
    .select("*")
    .eq("quiz_id", quizId)
    .eq("user_id", userId)
    .order("completed_at", { ascending: false });
  return { data, error };
}


