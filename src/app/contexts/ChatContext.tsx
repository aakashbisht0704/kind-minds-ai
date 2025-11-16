"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import {
    ChatMessage,
    ChatTab,
    ChatWithMessages,
    createChat,
    deleteChatById,
    getChatsByTab,
    subscribeToChats,
    appendMessageToChat,
} from "@/lib/supabaseChat";
import { ensureProfileRow } from "@/lib/profileAPI";

interface ChatContextType {
    chats: ChatWithMessages[];
    currentChat: ChatWithMessages | null;
    loading: boolean;
    createNewChat: (tab: ChatTab, initialMessage?: ChatMessage) => Promise<ChatWithMessages | null>;
    selectChat: (chatId: string) => void;
    addMessage: (chatId: string, message: ChatMessage, fallbackChat?: ChatWithMessages) => Promise<void>;
    deleteChat: (chatId: string) => Promise<void>;
    getFilteredChats: (tab: ChatTab) => ChatWithMessages[];
    setCurrentChatByTab: (tab: ChatTab) => Promise<void>;
    refreshChats: (tab?: ChatTab) => Promise<void>;
    setPendingAssistantMessage: (chatId: string, pending: PendingAssistantMessage | null) => void;
    pendingAssistantMessages: Record<string, PendingAssistantMessage>;
}

interface PendingAssistantMessage {
    startedAt: number;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
    const { user, loading: authLoading } = useAuth();
    const [chats, setChats] = useState<ChatWithMessages[]>([]);
    const [currentChat, setCurrentChat] = useState<ChatWithMessages | null>(null);
    const [activeTab, setActiveTab] = useState<ChatTab>("academic");
    const [loading, setLoading] = useState(true);
    const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
    const [pendingAssistantMessages, setPendingAssistantMessages] = useState<Record<string, PendingAssistantMessage>>(
        {}
    );

    const supabaseUserId = user?.id ?? null;
    
    // Log authentication status for debugging
    useEffect(() => {
        console.log(`[ChatProvider] Auth state changed:`, {
            authLoading,
            hasUser: !!user,
            userId: user?.id ?? null,
            userEmail: user?.email ?? null,
        });
    }, [user, authLoading]);

    const loadChats = useCallback(async (tab: ChatTab, preserveCurrentChat = false) => {
        // Wait for auth to finish loading before attempting to fetch chats
        if (authLoading) {
            return;
        }
        
        if (!supabaseUserId) {
            setChats([]);
            setCurrentChat(null);
            setLoading(false);
            setHasLoadedOnce(false);
            setPendingAssistantMessages({});
            return;
        }

        const shouldShowSpinner = !hasLoadedOnce;
        if (shouldShowSpinner) {
            setLoading(true);
        }
        
        // Capture current chat before async operation to avoid stale closure
        const currentChatId = currentChat?.id;
        const currentChatTab = currentChat?.tab;
        
        const result = await getChatsByTab(supabaseUserId, tab);
        console.log(`[loadChats] Result for tab ${tab}:`, {
            dataLength: result.data?.length ?? 0,
            hasError: !!result.error,
            chats: result.data,
        });
        
        // Only treat as error if it has meaningful content
        const hasError = result.error && (result.error.message || result.error.code || result.error.details);
        if (hasError) {
            console.error("Failed to fetch chats:", {
                message: result.error?.message,
                code: result.error?.code,
                details: result.error?.details,
                fullError: result.error,
            });
            if (shouldShowSpinner) {
                setLoading(false);
            }
            // Still try to use empty array to avoid breaking the UI
            setChats([]);
            setCurrentChat(null);
            return;
        }
        
        // If error exists but is empty/null, treat as success
        if (result.error && !hasError) {
            console.warn("Received empty error object, treating as success");
        }

        const sortedChats = result.data.sort((a, b) => {
            const dateA = new Date(a.updated_at ?? a.created_at).getTime();
            const dateB = new Date(b.updated_at ?? b.created_at).getTime();
            return dateB - dateA;
        });
        
        console.log(`[loadChats] Setting ${sortedChats.length} sorted chats for tab ${tab}`, sortedChats);
        
        // Merge with existing chats from other tabs instead of replacing
        setChats((prevChats) => {
            // Remove all chats from this tab (they'll be replaced with fresh data)
            const chatsFromOtherTabs = prevChats.filter((chat) => chat.tab !== tab);
            // Combine chats from other tabs with new chats from this tab
            const merged = [...chatsFromOtherTabs, ...sortedChats];
            // Remove duplicates by ID (in case same chat appears twice)
            const uniqueChats = merged.reduce((acc, chat) => {
                if (!acc.find(c => c.id === chat.id)) {
                    acc.push(chat);
                }
                return acc;
            }, [] as ChatWithMessages[]);
            // Sort all chats by updated_at
            const allSorted = uniqueChats.sort((a, b) => {
                const dateA = new Date(a.updated_at ?? a.created_at).getTime();
                const dateB = new Date(b.updated_at ?? b.created_at).getTime();
                return dateB - dateA;
            });
            console.log(`[loadChats] Merged chats: ${chatsFromOtherTabs.length} from other tabs + ${sortedChats.length} from ${tab} = ${allSorted.length} total (unique)`);
            return allSorted;
        });
        
        // Only update currentChat if we're not preserving it, or if it's not in the fetched chats
        if (preserveCurrentChat && currentChatId && currentChatTab === tab) {
            // Try to find the current chat in the fetched data
            const updatedCurrentChat = sortedChats.find((chat) => chat.id === currentChatId);
            if (updatedCurrentChat) {
                // Only update if the fetched version is different (more recent)
                setCurrentChat((prev) => {
                    if (!prev || prev.id !== currentChatId) return prev;
                    const prevUpdated = new Date(prev.updated_at ?? prev.created_at).getTime();
                    const fetchedUpdated = new Date(updatedCurrentChat.updated_at ?? updatedCurrentChat.created_at).getTime();
                    // Only update if fetched is newer (within 1 second tolerance for race conditions)
                    return fetchedUpdated > prevUpdated + 1000 ? updatedCurrentChat : prev;
                });
            } else {
                // Current chat not found, keep existing if tab matches, otherwise switch
                setCurrentChat((prev) => {
                    if (prev && prev.tab === tab) return prev; // Keep it even if not in list (might be newly created)
                    return sortedChats.length > 0 ? sortedChats[0] : null;
                });
            }
        } else {
            // Normal behavior: switch to first chat of the tab
            const sameCurrent = sortedChats.find((chat) => chat.id === currentChatId && chat.tab === tab);
            if (sameCurrent) {
                setCurrentChat(sameCurrent);
            } else if (sortedChats.length > 0) {
                setCurrentChat(sortedChats[0]);
            } else {
                // Only clear if we're switching tabs
                if (currentChatTab !== tab) {
                    setCurrentChat(null);
                }
            }
        }
        
        if (shouldShowSpinner) {
            setLoading(false);
        }
        setHasLoadedOnce(true);
    }, [supabaseUserId, hasLoadedOnce, currentChat, authLoading]);

    useEffect(() => {
        if (!supabaseUserId) return;
        const unsubscribe = subscribeToChats(supabaseUserId, ({ eventType, new: newChat, old: oldChat }) => {
            setChats((prevChats) => {
                switch (eventType) {
                    case "INSERT":
                    case "UPDATE": {
                        if (!newChat) return prevChats;
                        const withoutChat = prevChats.filter((chat) => chat.id !== newChat.id);
                        const updated = [newChat, ...withoutChat];
                        return updated.sort((a, b) => {
                            const dateA = new Date(a.updated_at ?? a.created_at).getTime();
                            const dateB = new Date(b.updated_at ?? b.created_at).getTime();
                            return dateB - dateA;
                        });
                    }
                    case "DELETE": {
                        if (!oldChat) return prevChats;
                        return prevChats.filter((chat) => chat.id !== oldChat.id);
                    }
                    default:
                        return prevChats;
                }
            });

            // Update currentChat when realtime events occur
            if (eventType === "DELETE" && oldChat) {
                setCurrentChat((prev) => {
                    if (prev?.id === oldChat.id) {
                        // After chats are updated, find the first chat of the same tab
                        // Use a small delay to ensure chats state has updated
                        setTimeout(() => {
                            setChats((currentChats) => {
                                const chatsOfTab = currentChats.filter((c) => c.tab === prev.tab);
                                setCurrentChat(chatsOfTab.length > 0 ? chatsOfTab[0] : null);
                                return currentChats;
                            });
                        }, 0);
                        return null; // Temporarily set to null
                    }
                    return prev;
                });
            } else if ((eventType === "INSERT" || eventType === "UPDATE") && newChat) {
                setCurrentChat((prev) => {
                    // Always update if it's the current chat
                    if (prev?.id === newChat.id) {
                        return newChat;
                    }
                    // If it's a new chat and we don't have a current chat for this tab, switch to it
                    if (eventType === "INSERT" && (!prev || prev.tab !== newChat.tab)) {
                        return newChat;
                    }
                    return prev;
                });
            }
        });

        return () => {
            unsubscribe?.();
        };
    }, [supabaseUserId]);

    useEffect(() => {
        console.log(`[useEffect] Chat loading effect triggered:`, {
            authLoading,
            supabaseUserId,
            activeTab,
            hasLoadedOnce,
            currentChatTab: currentChat?.tab,
            shouldLoad: !hasLoadedOnce || activeTab !== currentChat?.tab,
        });
        
        // Don't try to load chats while auth is still loading
        if (authLoading) {
            console.log(`[useEffect] Auth still loading, skipping...`);
            return;
        }
        
        if (!supabaseUserId) {
            console.log(`[useEffect] No user ID, clearing chats`);
            setChats([]);
            setCurrentChat(null);
            setLoading(false);
            return;
        }
        
        // Only load chats if we haven't loaded once, or if the tab actually changed
        const shouldLoad = !hasLoadedOnce || activeTab !== currentChat?.tab;
        console.log(`[useEffect] Should load chats?`, shouldLoad);
        
        if (shouldLoad) {
            // When switching tabs, don't preserve current chat
            // When initially loading, preserve if we have a current chat
            const preserve = hasLoadedOnce && currentChat?.tab === activeTab;
            console.log(`[useEffect] Calling loadChats for tab ${activeTab}, preserve=${preserve}`);
            loadChats(activeTab, preserve);
        } else {
            console.log(`[useEffect] Skipping loadChats - already loaded and tab matches`);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [supabaseUserId, activeTab, authLoading, hasLoadedOnce]);

    const createNewChat = async (tab: ChatTab, initialMessage?: ChatMessage) => {
        if (!supabaseUserId) return null;

        const initialMessages = initialMessage ? [initialMessage] : [];
        const { error: ensureProfileError } = await ensureProfileRow(supabaseUserId);
        if (ensureProfileError) {
            console.error("Failed to ensure profile exists:", ensureProfileError);
            return null;
        }
        const { data, error } = await createChat({
            user_id: supabaseUserId,
            tab,
            messages: initialMessages,
            title:
                initialMessage && initialMessage.role === "user"
                    ? `${initialMessage.content.slice(0, 50)}${initialMessage.content.length > 50 ? "..." : ""}`
                    : "New Chat",
        });

        if (error) {
            console.error("Failed to create chat:", error);
            return null;
        }

        setChats((prev) => [data, ...prev]);
        setCurrentChat(data);
        setActiveTab((prev) => (prev === tab ? prev : tab));
        return data;
    };

    const selectChat = (chatId: string) => {
        const chat = chats.find((c) => c.id === chatId);
        if (chat) {
            setCurrentChat(chat);
            setActiveTab((prev) => (prev === chat.tab ? prev : chat.tab));
        }
    };

    const addMessage = async (chatId: string, message: ChatMessage, fallbackChat?: ChatWithMessages) => {
        // Always get the latest chat from state first (updated by realtime subscriptions)
        let chatFromState = chats.find((c) => c.id === chatId);
        
        // If not found in state, try again after a brief delay (handles race conditions)
        // This is especially important when chat was just created
        if (!chatFromState && fallbackChat && fallbackChat.id === chatId) {
            console.log("[addMessage] Chat not in state yet, waiting for state update");
            await new Promise(resolve => setTimeout(resolve, 50));
            chatFromState = chats.find((c) => c.id === chatId);
        }
        
        // Use chat from state if found, otherwise use fallbackChat
        const chat = chatFromState ?? (fallbackChat && fallbackChat.id === chatId ? fallbackChat : null);
        
        if (!chat) {
            console.error("[addMessage] Chat not found for message append:", {
                chatId,
                chatsInState: chats.length,
                chatIds: chats.map(c => c.id),
                hasFallback: !!fallbackChat,
                fallbackChatId: fallbackChat?.id,
                fallbackChatMatches: fallbackChat?.id === chatId,
            });
            return;
        }
        
        // Log which source we're using
        if (chatFromState) {
            console.log(`[addMessage] Using chat from state for chat ${chatId}`);
        } else if (fallbackChat && fallbackChat.id === chatId) {
            console.log(`[addMessage] Using fallback chat for chat ${chatId} (chat not in state yet)`);
        }

        // Always append the new message to the latest messages from state
        // This ensures we don't lose messages due to race conditions
        const updatedMessages = [...chat.messages, message];
        console.log(`[addMessage] Adding ${message.role} message to chat ${chatId}:`, {
            currentMessagesCount: chat.messages.length,
            newMessageId: message.id,
            updatedMessagesCount: updatedMessages.length,
            chatTitle: chat.title,
        });
        const { data, error } = await appendMessageToChat(chatId, updatedMessages, message.role === "user" ? message.content : undefined);
        if (error) {
            console.error("Failed to append message:", error);
            setPendingAssistantMessages((prev) => {
                const next = { ...prev };
                delete next[chatId];
                return next;
            });
            // Still update local state optimistically even if DB update fails
            const optimisticChat = { ...chat, messages: updatedMessages, updated_at: new Date().toISOString() };
            setChats((prev) => {
                const exists = prev.some((c) => c.id === chatId);
                const nextChats = exists
                    ? prev.map((c) => (c.id === chatId ? optimisticChat : c))
                    : [optimisticChat, ...prev];
                return nextChats.sort(
                    (a, b) =>
                        new Date(b.updated_at ?? b.created_at).getTime() -
                        new Date(a.updated_at ?? a.created_at).getTime()
                );
            });
            setCurrentChat((prev) => (prev?.id === chatId ? optimisticChat : prev));
            return;
        }

        // Only update if we got data back
        if (data) {
            setChats((prev) => {
                const exists = prev.some((c) => c.id === chatId);
                const nextChats = exists
                    ? prev.map((c) => (c.id === chatId ? data : c))
                    : [data, ...prev];
                return nextChats.sort(
                    (a, b) =>
                        new Date(b.updated_at ?? b.created_at).getTime() -
                        new Date(a.updated_at ?? a.created_at).getTime()
                );
            });

            // Only update currentChat if it matches and data is valid
            setCurrentChat((prev) => {
                if (prev?.id === chatId) {
                    return data;
                }
                return prev;
            });
        } else {
            // Fallback to optimistic update if data is null but no error
            const optimisticChat = { ...chat, messages: updatedMessages, updated_at: new Date().toISOString() };
            setChats((prev) => {
                const exists = prev.some((c) => c.id === chatId);
                const nextChats = exists
                    ? prev.map((c) => (c.id === chatId ? optimisticChat : c))
                    : [optimisticChat, ...prev];
                return nextChats.sort(
                    (a, b) =>
                        new Date(b.updated_at ?? b.created_at).getTime() -
                        new Date(a.updated_at ?? a.created_at).getTime()
                );
            });
            setCurrentChat((prev) => (prev?.id === chatId ? optimisticChat : prev));
        }
        
        if (message.role === "assistant") {
            setPendingAssistantMessages((prev) => {
                const next = { ...prev };
                delete next[chatId];
                return next;
            });
        }
    };

    const deleteChat = async (chatId: string) => {
        const { error } = await deleteChatById(chatId);
        if (error) {
            console.error("Failed to delete chat:", error);
            return;
        }

        setChats((prev) => prev.filter((chat) => chat.id !== chatId));
        setPendingAssistantMessages((prev) => {
            const next = { ...prev };
            delete next[chatId];
            return next;
        });
        if (currentChat?.id === chatId) {
            setCurrentChat(null);
        }
    };

    const getFilteredChats = (tab: ChatTab) => {
        const filtered = chats.filter((chat) => chat.tab === tab);
        console.log(`[getFilteredChats] Filtering for tab ${tab}:`, {
            totalChats: chats.length,
            filteredChats: filtered.length,
            allChats: chats.map(c => ({ id: c.id, tab: c.tab, title: c.title })),
            filtered: filtered.map(c => ({ id: c.id, tab: c.tab, title: c.title })),
        });
        return filtered;
    };

    const setCurrentChatByTab = useCallback(async (tab: ChatTab) => {
        console.log(`[setCurrentChatByTab] Called with tab: ${tab}`, {
            currentActiveTab: activeTab,
            hasLoadedOnce,
            authLoading,
            supabaseUserId,
            currentChatsCount: chats.length,
            chatsInTab: chats.filter(c => c.tab === tab).length,
        });
        
        // Wait for auth to be ready
        if (authLoading) {
            console.log(`[setCurrentChatByTab] Auth loading, will retry after auth is ready`);
            // Don't return early - set the active tab anyway so it's ready
            setActiveTab(tab);
            return;
        }
        
        // If we don't have a user, just set the tab
        if (!supabaseUserId) {
            setActiveTab(tab);
            return;
        }
        
        // Check if we already have chats for this tab
        const existingChatsForTab = chats.filter(c => c.tab === tab);
        const hasChatsForTab = existingChatsForTab.length > 0;
        
        // Only reload if we're actually switching tabs OR if we haven't loaded this tab's chats yet
        if (activeTab !== tab) {
            console.log(`[setCurrentChatByTab] Switching tabs from ${activeTab} to ${tab}`);
            setActiveTab(tab);
            // If we already have chats for this tab, preserve them
            await loadChats(tab, hasChatsForTab);
        } else {
            // Already on this tab
            console.log(`[setCurrentChatByTab] Already on tab ${tab}, hasLoadedOnce: ${hasLoadedOnce}, hasChatsForTab: ${hasChatsForTab}`);
            if (!hasLoadedOnce || !hasChatsForTab) {
                console.log(`[setCurrentChatByTab] Not loaded yet or no chats, calling loadChats`);
                await loadChats(tab, hasChatsForTab);
            } else {
                console.log(`[setCurrentChatByTab] Already loaded with ${existingChatsForTab.length} chats, skipping reload`);
            }
        }
    }, [activeTab, loadChats, hasLoadedOnce, authLoading, supabaseUserId, chats]);

    const refreshChats = useCallback(async (tab: ChatTab = activeTab) => {
        await loadChats(tab);
    }, [activeTab, loadChats]);

    const setPendingAssistantMessage = (chatId: string, pending: PendingAssistantMessage | null) => {
        setPendingAssistantMessages((prev) => {
            if (pending) {
                return { ...prev, [chatId]: pending };
            }
            const next = { ...prev };
            delete next[chatId];
            return next;
        });
    };

    const contextValue: ChatContextType = {
        chats,
        currentChat,
        loading,
        createNewChat,
        selectChat,
        addMessage,
        deleteChat,
        getFilteredChats,
        setCurrentChatByTab,
        refreshChats,
        setPendingAssistantMessage,
        pendingAssistantMessages,
    };

    return <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>;
}

export function useChat() {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error("useChat must be used within a ChatProvider");
    }
    return context;
}
