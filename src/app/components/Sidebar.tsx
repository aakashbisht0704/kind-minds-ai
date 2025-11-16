// components/Sidebar.tsx
"use client";

import { Plus, MessageSquare, User, X, Trash2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { useChat } from "../contexts/ChatContext";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useState } from "react";
import DeleteChatModal from "./modals/DeleteChatModal";
import Link from "next/link";
import { fetchProfile } from "@/lib/profileAPI";

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { currentChat, createNewChat, selectChat, deleteChat, getFilteredChats, loading: chatsLoading } = useChat();
  const { user, signOut, loading } = useAuth();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<{ id: string; title: string | null } | null>(null);
  const [preferredMode, setPreferredMode] = useState<"academic" | "mindfulness">("academic");

  // Load preferred mode so it can influence new chats when not on a specific tab
  useEffect(() => {
    if (!user?.id) return;
    const loadPreferred = async () => {
      const { data, error } = await fetchProfile(user.id);
      if (error) {
        console.error("Failed to load profile in sidebar", error);
        return;
      }
      if (data?.preferred_mode === "academic" || data?.preferred_mode === "mindfulness") {
        setPreferredMode(data.preferred_mode);
      }
    };
    loadPreferred();
  }, [user?.id]);

  // Filter chats based on current page; fall back to preferred mode outside chat tabs
  const currentType =
    pathname.startsWith("/mindfulness") || pathname.startsWith("/grounding")
      ? "mindfulness"
      : pathname.startsWith("/academic")
      ? "academic"
      : preferredMode;
  const filteredChats = getFilteredChats(currentType);
  
  // Debug: Log filtered chats to see what's available
  console.log(`[Sidebar] Rendering sidebar for ${currentType}:`, {
    filteredChatsCount: filteredChats.length,
    chats: filteredChats.map(c => ({ id: c.id, tab: c.tab, title: c.title })),
  });

  const handleNewChat = async () => {
    await createNewChat(currentType);
    if (onClose) onClose(); // Close mobile sidebar
  };

  const handleSelectChat = (chatId: string) => {
    selectChat(chatId);
    if (onClose) onClose(); // Close mobile sidebar
  };

  const handleDeleteClick = (e: React.MouseEvent, chat: { id: string; title: string | null }) => {
    e.stopPropagation(); // Prevent chat selection
    setChatToDelete(chat);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (chatToDelete) {
      await deleteChat(chatToDelete.id);
      setChatToDelete(null);
    }
  };

  const formatChatTitle = (title: string | null | undefined) => {
    const safeTitle = title && title.trim().length > 0 ? title : "New Chat";
    return safeTitle.length > 25 ? `${safeTitle.slice(0, 25)}...` : safeTitle;
  };

  return (
    <>
      <aside className="flex h-full flex-col bg-[#111214] text-white w-full max-w-xs min-w-[64px]">
        {/* Top branding + close */}
        <div className="p-4 flex items-center justify-between">
          <div className="text-xl font-bold bg-gradient-to-r from-[#9C6BFF] via-[#C277FF] to-[#9C6BFF] bg-clip-text text-transparent">
            KindMinds
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={onClose}
            >
              <X className="h-5 w-5 text-white" />
            </Button>
          )}
        </div>

        {/* New chat button */}
        <div className="px-4 mb-4">
          <Button
            variant="secondary"
            className="flex w-full items-center justify-between rounded-xl bg-[#1A1C1E] px-4 py-4 sm:py-6 text-left text-xs sm:text-sm font-medium hover:bg-[#222428]"
            onClick={handleNewChat}
          >
            <span className="flex items-center gap-2 sm:gap-3 text-zinc-200">
              <Plus className="h-4 w-4 opacity-90" />
              <span className="hidden sm:inline">Begin a New Chat</span>
            </span>
            <Plus className="h-4 w-4 opacity-90" />
          </Button>
        </div>

        {/* Chat list header with count */}
        <div className="px-4 pb-2">
          <div className="text-xs text-zinc-400">
            {currentType === 'academic' ? '📚 Academic' : '🧘 Mindfulness'} Chats ({filteredChats.length})
          </div>
        </div>

        {/* Chat list */}
        <div className="flex-1 space-y-1 overflow-y-auto px-2 sm:px-4">
          {chatsLoading ? (
            <div className="px-2 py-4 text-center text-xs text-zinc-500">
              Loading chats...
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="px-2 py-4 text-center text-xs text-zinc-500">
              No {currentType} chats yet.<br />Start a new conversation!
            </div>
          ) : (
            filteredChats.map((chat) => (
              <div
                key={chat.id}
                className={`group flex w-full items-center justify-between rounded-lg px-2 sm:px-3 py-2 text-left text-xs sm:text-sm text-zinc-200 hover:bg-[#222428] ${currentChat?.id === chat.id ? 'bg-[#222428]' : 'bg-[#1A1C1E]'
                  }`}
              >
                <Button
                  variant="ghost"
                  className="flex-1 flex items-center justify-start gap-2 opacity-95 text-left p-0 h-auto hover:bg-transparent"
                  onClick={() => handleSelectChat(chat.id)}
                >
                  <MessageSquare className="h-3 w-3 opacity-80 flex-shrink-0" />
                  <span className="line-clamp-1 text-xs">{formatChatTitle(chat.title)}</span>
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20 hover:text-red-400"
                  onClick={(e) => handleDeleteClick(e, chat)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Bottom user profile / login */}
        <div className="p-4">
          {loading ? (
            <div className="flex items-center gap-2 sm:gap-3 rounded-xl bg-[#1A1C1E] px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-zinc-200">
              <div className="grid h-6 w-6 place-items-center rounded-md bg-zinc-800">
                <User className="h-4 w-4" />
              </div>
              <span className="hidden sm:inline">Loading...</span>
            </div>
          ) : user ? (
            <div className="flex items-center gap-2 sm:gap-3 rounded-xl bg-[#1A1C1E] px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-zinc-200">
              <div className="grid h-6 w-6 place-items-center rounded-md bg-zinc-800 flex-shrink-0">
                <User className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0 hidden sm:block">
                <p className="text-xs text-zinc-400 truncate">{user.email}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={signOut}
                className="h-6 w-6 p-0 hover:bg-red-500/20 hover:text-red-400"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              asChild
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#2A2B2E] hover:bg-[#35363A] px-4 py-4 text-sm text-white font-medium transition-colors"
            >
              <Link href={`/login?redirect=${encodeURIComponent(pathname)}`}>
                <User className="h-5 w-5" />
                <span>Login</span>
              </Link>
            </Button>
          )}
        </div>
      </aside>

      {/* Delete Confirmation Modal */}
      <DeleteChatModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setChatToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        chatTitle={chatToDelete?.title || ""}
      />
    </>
  );
}
