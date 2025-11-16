"use client";

import { Paperclip, Mic, Send } from "lucide-react";
import { useState } from "react";
import { useChat } from "../contexts/ChatContext";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChatMessage, ChatWithMessages, logSentimentEvent } from "@/lib/supabaseChat";
import { useActivity } from "../contexts/ActivityContext";
import { useAuth } from "@/app/contexts/AuthContext";
import { fetchProfile } from "@/lib/profileAPI";
import { resolveBackendUrl } from "@/lib/api";

interface ChatInputDockProps {
  position?: string;
}

export default function ChatInputDock({ position }: ChatInputDockProps) {
  const [value, setValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { currentChat, addMessage, createNewChat, setPendingAssistantMessage } = useChat();
  const { startActivity } = useActivity();
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  /**
   * Determines which activity to trigger based on sentiment score
   * @param score Sentiment score (-1 to 1)
   * @returns Activity type to trigger, or null if no activity needed
   */
  const getActivityForSentiment = (score: number): string | null => {
    if (score <= -0.8) {
      // Crisis level: 54321 grounding method for panic attacks
      return "54321";
    } else if (score <= -0.4) {
      // High negative: breathing exercises for anxiety/stress
      return "breathing";
    } else if (score < -0.2) {
      // Moderate negative: gentle breathing exercises
      return "breathing";
    }
    // Neutral or positive: no activity needed
    return null;
  };

  /**
   * Analyzes sentiment of user message and triggers appropriate activity if needed
   * @param message User message text
   * @param chatId Chat ID
   * @param chatTab Chat tab type
   * @param fallbackChat Fallback chat object
   * @returns Object with sentiment data and activity info, or null if analysis failed
   */
  const analyzeSentiment = async (
    message: string,
    chatId: string,
    chatTab: "academic" | "mindfulness",
    fallbackChat?: ChatWithMessages | null
  ): Promise<{ sentiment: string; score: number; activity: string | null } | null> => {
    try {
      console.log("[analyzeSentiment] Analyzing sentiment for message:", message.substring(0, 50));
      
      const response = await fetch(resolveBackendUrl("/api/tools/sentiment"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: message }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[analyzeSentiment] API error:", response.status, errorText);
        throw new Error(`Failed to analyze sentiment: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log("[analyzeSentiment] Received sentiment data:", data);
      
      const sentimentLabel = String(data.sentiment || "neutral").toLowerCase();
      const sentimentScore = Number(data.score ?? 0);

      console.log("[analyzeSentiment] Parsed sentiment:", {
        label: sentimentLabel,
        score: sentimentScore,
        chatId,
      });

      // Log sentiment to database (non-blocking, don't wait for it to complete)
      logSentimentEvent({
        chatId,
        sentiment: sentimentLabel,
        score: sentimentScore,
      }).catch((error) => {
        console.error("[analyzeSentiment] Failed to log sentiment event:", error);
      });

      // Determine which activity is recommended based on sentiment score
      const activityType = getActivityForSentiment(sentimentScore);

      // Only automatically trigger crisis-level activities (54321)
      // Other activities should be suggested to the user first
      if (activityType === "54321" && sentimentScore <= -0.8) {
        // CRISIS LEVEL: Auto-redirect to dedicated 5-4-3-2-1 grounding page
        console.log(
          `[analyzeSentiment] CRISIS detected - redirecting to /grounding (score: ${sentimentScore})`
        );
        if (typeof window !== "undefined") {
          router.push("/grounding");
        }
      } else if (activityType) {
        // HIGH/MODERATE NEGATIVE: Don't auto-trigger, but return activity type
        // so the LLM can suggest it to the user
        console.log(`[analyzeSentiment] Negative sentiment detected - Activity suggested: ${activityType} (score: ${sentimentScore})`);
      }

      return {
        sentiment: sentimentLabel,
        score: sentimentScore,
        activity: activityType,
      };
    } catch (error) {
      console.error("[analyzeSentiment] Sentiment analysis failed:", error);
      return null;
    }
  };

  const handleSend = async () => {
    if (!value.trim() || isSending) return;

    const userMessageContent = value.trim();
    const chatTab = pathname.startsWith("/mindfulness") ? "mindfulness" : "academic";

    // Clear input and set sending state
    setValue('');
    setIsSending(true);

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      content: userMessageContent,
      role: "user",
      timestamp: new Date().toISOString(),
    };

    let activeChat = currentChat && currentChat.tab === chatTab ? currentChat : null;
    let messagesToSend: ChatMessage[] = [];

    if (!activeChat) {
      const createdChat = await createNewChat(chatTab, userMessage);
      if (!createdChat) {
        setIsSending(false);
        console.error("Unable to create chat");
        return;
      }
      activeChat = createdChat;
      messagesToSend = createdChat.messages;
    } else {
      // Build messages array from current chat before adding user message
      messagesToSend = [...activeChat.messages, userMessage];
      // Add user message - pass activeChat as fallback in case state hasn't updated
      await addMessage(activeChat.id, userMessage, activeChat);
      // Update local activeChat for API call (messagesToSend already has user message)
    }

    // STEP 1: Analyze sentiment immediately after user sends message
    // This happens BEFORE LLM responds to enable proactive support
    let sentimentData: { sentiment: string; score: number; activity: string | null } | null = null;
    if (activeChat) {
      console.log("[handleSend] Analyzing sentiment BEFORE LLM call...");
      sentimentData = await analyzeSentiment(userMessageContent, activeChat.id, chatTab, activeChat);
      
      if (sentimentData) {
        console.log(`[handleSend] Sentiment analysis complete:`, {
          sentiment: sentimentData.sentiment,
          score: sentimentData.score,
          activityTriggered: sentimentData.activity,
        });
      }
    }

    // STEP 2: Call backend API for LLM response
    try {
      if (activeChat) {
        setPendingAssistantMessage(activeChat.id, { startedAt: Date.now() });
      }

      // Get user profile to fetch MBTI type for personalization
      let mbtiType: string | null = null;
      if (user?.id) {
        const { data: profile } = await fetchProfile(user.id);
        mbtiType = profile?.mbti_type || null;
      }

      // Include sentiment data in the request so LLM can suggest appropriate activities
      const requestBody: {
        messages: Array<{ role: string; content: string }>;
        chat_type: string;
        mbti_type: string | null;
        sentiment?: { sentiment: string; score: number; suggested_activity: string | null };
      } = {
        messages: messagesToSend.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        chat_type: chatTab,
        mbti_type: mbtiType,
      };

      // If sentiment analysis found negative sentiment (but not crisis), include it
      // so the LLM can suggest the activity to the user
      if (sentimentData && sentimentData.activity && sentimentData.score > -0.8) {
        requestBody.sentiment = {
          sentiment: sentimentData.sentiment,
          score: sentimentData.score,
          suggested_activity: sentimentData.activity,
        };
      }

      const response = await fetch(resolveBackendUrl("/api/chat"), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }

      const data = await response.json();
      // Removed artificial delay - let the LLM be fast!
      
      // Always add the assistant's response with the chat ID to ensure it goes to the right chat
      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        content: data.response,
        role: "assistant",
        timestamp: new Date().toISOString(),
      };
      
      // Add assistant message
      // Pass activeChat as fallback in case state hasn't updated yet (e.g., just created)
      await addMessage(activeChat.id, assistantMessage, activeChat);

      // Check if user's message is an affirmative response to start an activity
      // Store the suggested activity in a way we can detect user agreement
      if (sentimentData && sentimentData.activity && sentimentData.score > -0.8) {
        const lowerMessage = userMessageContent.toLowerCase().trim();
        const affirmativeWords = ["yes", "yeah", "yep", "sure", "okay", "ok", "alright", "let's do it", "start", "begin", "go ahead"];
        const isAffirmative = affirmativeWords.some(word => lowerMessage.includes(word));
        
        // If user agreed to do the activity and it wasn't crisis-level, trigger it now
        if (isAffirmative && sentimentData.activity) {
          console.log(`[handleSend] User agreed to ${sentimentData.activity} activity - triggering now`);
          startActivity(sentimentData.activity);
        }
      }

      // If sentiment analysis auto-triggered crisis-level activity, log it
      if (sentimentData && sentimentData.activity === "54321" && sentimentData.score <= -0.8) {
        console.log(`[handleSend] Crisis-level activity 54321 was auto-triggered (score: ${sentimentData.score})`);
      }

    } catch (error) {
      console.error('Error calling AI:', error);
      // Add error message to the active chat
      if (activeChat) {
        setPendingAssistantMessage(activeChat.id, null);
        const errorMessage: ChatMessage = {
          id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          content: "I'm sorry, I'm having trouble connecting right now. Please make sure the backend server is running.",
          role: "assistant",
          timestamp: new Date().toISOString(),
        };
        await addMessage(activeChat.id, errorMessage, activeChat);
      }
    } finally {
      setIsSending(false);
      // Note: Sentiment analysis is now done BEFORE LLM call, not in finally block
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full p-4 bg-white/95 backdrop-blur-md">
      <div className="mx-auto w-full max-w-[1080px] px-4 sm:px-6">
        <motion.div
          className="flex items-center gap-3 rounded-full bg-white border border-black p-2 shadow-xl"
          animate={isSending ? { scale: [1, 0.98, 1] } : {}}
          transition={{ duration: 0.2 }}
        >
          {/* Attachment Button */}
          <button className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
            <Paperclip className="h-5 w-5 text-gray-600" />
          </button>

          {/* Input Field */}
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="type your prompt here"
            disabled={isSending}
            className="flex-1 bg-transparent border-none outline-none text-gray-800 placeholder-gray-400 text-base px-2 disabled:opacity-50"
          />

          {/* Microphone Button */}
          <button className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors">
            <Mic className="h-5 w-5 text-gray-600" />
          </button>

          {/* Send Button */}
          <motion.button
            onClick={handleSend}
            disabled={!value.trim() || isSending}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-300 transition-all shadow-lg"
          >
            <motion.div
              animate={isSending ? { rotate: 360 } : {}}
              transition={{ duration: 1, repeat: isSending ? Infinity : 0, ease: "linear" }}
            >
              <Send className="h-5 w-5 text-white" />
            </motion.div>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
