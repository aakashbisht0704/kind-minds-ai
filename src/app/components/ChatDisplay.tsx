"use client";

import { useChat } from "../contexts/ChatContext";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import { RefObject, useEffect, useRef } from "react";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { Button } from "@/components/ui/button";
import { useActivity } from "../contexts/ActivityContext";
import { useRouter } from "next/navigation";
import LoadingDots from "./LoadingDots";

interface ChatDisplayProps {
    scrollContainerRef?: RefObject<HTMLElement>;
}

export default function ChatDisplay({ scrollContainerRef }: ChatDisplayProps = {}) {
    const { currentChat, pendingAssistantMessages } = useChat();
    const { startActivity } = useActivity();
    const router = useRouter();
    const internalContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = scrollContainerRef?.current ?? internalContainerRef.current;
        if (!container) return;

        const scrollOptions: ScrollToOptions = {
            top: container.scrollHeight,
            behavior: "smooth"
        };

        if (typeof container.scrollTo === "function") {
            container.scrollTo(scrollOptions);
        } else {
            container.scrollTop = container.scrollHeight;
        }
    }, [currentChat?.messages, scrollContainerRef]);

    return (
        <div className="flex flex-col h-full">
            <div
                ref={internalContainerRef}
                className="flex-1 overflow-y-auto space-y-4 p-4"
            >
                <AnimatePresence initial={false}>
                    {currentChat?.messages.map((message) => {
                        const parsed = new Date(message.timestamp);
                        const timeLabel = isNaN(parsed.getTime())
                            ? ""
                            : parsed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

                        return (
                            <motion.div
                                key={message.id}
                                initial={{
                                    opacity: 0,
                                    x: message.role === 'user' ? 50 : -50,
                                    y: 20
                                }}
                                animate={{
                                    opacity: 1,
                                    x: 0,
                                    y: 0
                                }}
                                transition={{
                                    duration: 0.3,
                                    ease: "easeOut"
                                }}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-white shadow-lg ${message.role === 'user'
                                    ? 'bg-gradient-to-br from-[#A78BFA] to-[#8B5CF6]'
                                    : 'bg-gradient-to-br from-[#7C3AED] to-[#6D28D9]'
                                    }`}>
                                    <div className="text-sm leading-relaxed math-content space-y-3">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkMath, remarkGfm]}
                                            rehypePlugins={[rehypeKatex]}
                                            components={{
                                                p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                                                strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
                                                ol: ({ children }) => <ol className="list-decimal list-outside ml-5 mb-3 space-y-1.5">{children}</ol>,
                                                ul: ({ children }) => <ul className="list-disc list-outside ml-5 mb-3 space-y-1.5">{children}</ul>,
                                                li: ({ children }) => <li className="pl-1">{children}</li>,
                                                h1: ({ children }) => <h1 className="text-lg font-bold mb-3 mt-2">{children}</h1>,
                                                h2: ({ children }) => <h2 className="text-base font-bold mb-2 mt-2">{children}</h2>,
                                                h3: ({ children }) => <h3 className="text-sm font-bold mb-2 mt-1">{children}</h3>,
                                                code: ({ children }) => <code className="bg-white/20 px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>,
                                                em: ({ children }) => <em className="italic">{children}</em>,
                                            }}
                                        >
                                            {message.content}
                                        </ReactMarkdown>
                                        {message.metadata && message.metadata["cta"] === "mindfulness" && (
                                            <div className="flex justify-end">
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    className="rounded-full bg-white/20 text-white hover:bg-white/30"
                                                    onClick={() => {
                                                        const activityType =
                                                            typeof message.metadata?.["activityType"] === "string"
                                                                ? (message.metadata["activityType"] as string)
                                                                : "breathing";
                                                        startActivity(activityType);
                                                        router.push("/mindfulness");
                                                    }}
                                                >
                                                    {(message.metadata?.["buttonLabel"] as string) || "Go to Mindfulness Activities"}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                    {timeLabel && (
                                        <p className="text-xs mt-3 text-white/70 border-t border-white/20 pt-2">
                                            {timeLabel}
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
                {currentChat && pendingAssistantMessages[currentChat.id] && (
                    <motion.div
                        key="assistant-loading"
                        initial={{ opacity: 0, x: -40, y: 10 }}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        exit={{ opacity: 0, x: -40, y: -10 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="flex justify-start"
                    >
                        <div className="max-w-[80%] rounded-2xl px-4 py-3 text-white shadow-lg bg-gradient-to-br from-[#7C3AED] to-[#6D28D9]">
                            <LoadingDots />
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
