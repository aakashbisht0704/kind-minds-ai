"use client";

import { getSupabaseBrowserClient } from "./supabase";

const getSupabase = () => getSupabaseBrowserClient();

export interface ProfileRecord {
  id: string;
  name: string | null;
  age_class: string | null;
  preferred_mode: "academic" | "mindfulness" | null;
  avatar_path: string | null;
  mbti_type: string | null; // MBTI personality type (e.g., "ENFP", "INTJ")
  onboarding_complete: boolean;
  chats_count: number;
  meditation_minutes: number;
  streak_days: number;
  created_at: string;
}

export async function fetchProfile(userId: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  return { data: data as ProfileRecord | null, error };
}

export async function updateProfile(
  userId: string,
  updates: Partial<Pick<ProfileRecord, "name" | "preferred_mode" | "age_class" | "avatar_path" | "mbti_type">>
) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select("*")
    .maybeSingle();

  // Supabase sometimes returns an "empty" error object even when the update succeeds.
  // Normalize those to null so callers don't treat them as failures.
  const hasErrorContent =
    error && (error.message || (error as any).code || error.details || error.hint);

  if (error && !hasErrorContent && data) {
    console.warn("[updateProfile] Received empty error object from Supabase; treating as success.", {
      updates,
      rawError: error,
    });
    return { data: data as ProfileRecord | null, error: null };
  }

  return { data: data as ProfileRecord | null, error };
}

export async function uploadAvatar({
  file,
  userId,
}: {
  file: File;
  userId: string;
}) {
  const supabase = getSupabase();
  const fileExt = file.name.split(".").pop();
  const filePath = `avatars/${userId}/${Date.now()}.${fileExt ?? "png"}`;
  const { error } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, {
      upsert: true,
      cacheControl: "3600",
    });
  return { filePath, error };
}

export async function getAvatarUrl(path: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase.storage
    .from("avatars")
    .createSignedUrl(path, 60 * 60);
  return { url: data?.signedUrl ?? null, error };
}

export async function ensureProfileRow(userId: string) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: userId,
      },
      { onConflict: "id" }
    );
  return { error };
}

export async function incrementMeditationStats(
  userId: string,
  seconds: number,
  completedAt: string
) {
  const supabase = getSupabase();
  const { error } = await supabase.rpc("increment_meditation_stats", {
    p_user_id: userId,
    p_seconds: Math.max(0, Math.floor(seconds)),
    p_completed_at: completedAt,
  });
  return { error };
}


