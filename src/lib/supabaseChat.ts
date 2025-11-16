"use client";

import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "./supabase";

export type ChatTab = "academic" | "mindfulness";

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  content: string;
  role: ChatRole;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface ChatRow {
  id: string;
  user_id: string;
  tab: ChatTab;
  title: string | null;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string | null;
}

export type ChatWithMessages = ChatRow;

const getSupabaseClient = () => getSupabaseBrowserClient();

export const mapChatRow = (row: any): ChatWithMessages => {
  const messages = Array.isArray(row.messages) ? row.messages : [];
  return {
    id: row.id,
    user_id: row.user_id,
    tab: row.tab,
    title: row.title ?? "New Chat",
    messages,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
};

export async function getChatsByTab(userId: string, tab: ChatTab) {
  try {
    const supabase = getSupabaseClient();
    
    // Check if user is authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error("Session check error:", sessionError);
      return { data: [] as ChatWithMessages[], error: { message: sessionError.message || "Session check failed", details: sessionError } };
    }
    
    if (!session) {
      // Not an error - user just isn't logged in yet
      return { data: [] as ChatWithMessages[], error: null };
    }

    const { data, error } = await supabase
      .from("chats")
      .select("*")
      .eq("user_id", userId)
      .eq("tab", tab)
      .order("updated_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    // Debug logging
    console.log(`[getChatsByTab] Fetching chats for user ${userId}, tab: ${tab}`, {
      dataLength: data?.length ?? 0,
      hasError: !!error,
      errorDetails: error,
    });

    if (error) {
      // Only return as error if it has meaningful content
      const hasErrorContent = error.message || error.code || error.details || error.hint;
      if (hasErrorContent) {
        console.error("Supabase query error:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        return { data: [] as ChatWithMessages[], error };
      }
      // If error exists but has no content, treat as success with empty data
      console.warn("Supabase returned empty error object, treating as success");
      return { data: (data ?? []).map(mapChatRow), error: null };
    }

    const mappedData = (data ?? []).map(mapChatRow);
    console.log(`[getChatsByTab] Returning ${mappedData.length} chats for tab ${tab}`, mappedData);
    return { data: mappedData, error: null };
  } catch (err) {
    // Catch any unexpected errors
    console.error("Unexpected error in getChatsByTab:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return { data: [] as ChatWithMessages[], error: { message: errorMessage, details: err } };
  }
}

interface CreateChatPayload {
  user_id: string;
  tab: ChatTab;
  messages?: ChatMessage[];
  title?: string;
}

export async function createChat(payload: CreateChatPayload) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("chats")
    .insert({
      user_id: payload.user_id,
      tab: payload.tab,
      messages: payload.messages ?? [],
      title: payload.title ?? "New Chat",
    })
    .select("*")
    .single();

  if (error || !data) {
    return { data: null, error };
  }

  return { data: mapChatRow(data), error: null };
}

export async function appendMessageToChat(
  chatId: string,
  messages: ChatMessage[],
  latestUserMessage?: string
) {
  const supabase = getSupabaseClient();
  
  // CRITICAL: Fetch the latest messages from DB first to avoid race conditions
  // This ensures we always append to the most recent state, not a stale copy
  const { data: currentChat, error: fetchError } = await supabase
    .from("chats")
    .select("messages")
    .eq("id", chatId)
    .single();

  if (fetchError || !currentChat) {
    console.error("[appendMessageToChat] Failed to fetch current chat:", fetchError);
    return { data: null, error: fetchError };
  }

  // Get existing messages from DB (might have been updated by realtime or concurrent requests)
  const existingMessages = Array.isArray(currentChat.messages) 
    ? (currentChat.messages as ChatMessage[])
    : [];

  // The new message to append is always the last one in the messages array
  const newMessage = messages[messages.length - 1];
  
  if (!newMessage) {
    console.error("[appendMessageToChat] No new message to append");
    return { data: null, error: { message: "No new message provided" } as any };
  }

  // Check if the new message is already in the existing messages (avoid duplicates by ID)
  const isDuplicate = existingMessages.some(msg => msg.id === newMessage.id);

  // Append the new message only if it's not a duplicate
  const updatedMessages = isDuplicate 
    ? existingMessages 
    : [...existingMessages, newMessage];

  console.log(`[appendMessageToChat] Appending message to chat ${chatId}:`, {
    existingMessagesCount: existingMessages.length,
    newMessageId: newMessage.id,
    newMessageRole: newMessage.role,
    isDuplicate,
    finalMessagesCount: updatedMessages.length,
    existingMessageIds: existingMessages.map(m => m.id),
  });

  const updates: Record<string, unknown> = {
    messages: updatedMessages,
    updated_at: new Date().toISOString(),
  };

  if (latestUserMessage) {
    updates.title = `${latestUserMessage.slice(0, 50)}${
      latestUserMessage.length > 50 ? "..." : ""
    }`;
  }

  const { data, error } = await supabase
    .from("chats")
    .update(updates)
    .eq("id", chatId)
    .select("*")
    .single();

  if (error || !data) {
    console.error("[appendMessageToChat] Failed to update chat:", error);
    return { data: null, error };
  }

  return { data: mapChatRow(data), error: null };
}

export async function deleteChatById(chatId: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("chats").delete().eq("id", chatId);
  return { error };
}

export async function logSentimentEvent({
  chatId,
  sentiment,
  score,
}: {
  chatId: string;
  sentiment: string;
  score: number;
}) {
  const supabase = getSupabaseClient();
  console.log("[logSentimentEvent] Logging sentiment:", { chatId, sentiment, score });
  
  const { data, error } = await supabase.from("sentiment_logs").insert({
    chat_id: chatId,
    sentiment,
    score,
    created_at: new Date().toISOString(),
  }).select();
  
  if (error) {
    console.error("[logSentimentEvent] Error inserting sentiment log:", error);
  } else {
    console.log("[logSentimentEvent] Successfully inserted sentiment log:", data);
  }
  
  return { data, error };
}

type ChatChangeHandler = (payload: {
  eventType: RealtimePostgresChangesPayload<ChatRow>["eventType"];
  new: ChatWithMessages | null;
  old: ChatWithMessages | null;
}) => void;

export function subscribeToChats(userId: string, handler: ChatChangeHandler) {
  const supabase = getSupabaseClient();
  const channel = supabase
    .channel(`chats-user-${userId}`)
    .on<ChatRow>(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "chats",
        filter: `user_id=eq.${userId}`,
      },
      (payload) =>
        handler({
          eventType: payload.eventType,
          new: payload.new ? mapChatRow(payload.new) : null,
          old: payload.old ? mapChatRow(payload.old) : null,
        })
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

