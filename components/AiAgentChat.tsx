"use client";
import React, { useEffect, useRef, useCallback, useMemo } from 'react'
import { Message, useChat } from "@ai-sdk/react";
import { Button } from './ui/button';
import ReactMarkdown from "react-markdown";
import { useSchematicFlag } from '@schematichq/schematic-react';
import { FeatureFlag } from '@/features/flags';
import { BotIcon, ImageIcon, LetterText, PenIcon } from 'lucide-react';
import { toast } from 'sonner';

// Types
interface ToolInvocation {
    toolCallId: string;
    toolName: string;
    result?: Record<string, unknown>;
}

interface ToolPart {
    type: "tool-invocation";
    toolInvocation: ToolInvocation;
}

// Constants
const TOAST_STYLES = {
    default: {
        duration: 5000,
        position: "top-center" as const,
        style: {
            fontSize: "1.1rem",
            padding: "1rem",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        }
    },
    info: {
        background: "#EFF6FF",
        color: "#1E40AF",
        border: "1px solid #3B82F6",
    },
    error: {
        background: "#FEE2E2",
        color: "#DC2626",
        border: "1px solid #DC2626",
    }
};

// Utility functions
const formatToolInvocation = (part: ToolPart): string => {
    if (!part.toolInvocation) return "Unknown Tool";
    return `🔧 Tool Used: ${part.toolInvocation.toolName}`;
};

function AiAgentChat({ videoId }: { videoId: string }) {
    const { messages, input, handleInputChange, handleSubmit, append, status } = useChat({
        maxSteps: 5,
        body: {
            videoId,
        },
    });

    const bottomRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const toastRef = useRef<string | number | undefined>(undefined);
    const scrollTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

    // Feature flags
    const isScriptGenerationEnabled = useSchematicFlag(FeatureFlag.SCRIPT_GENERATION);
    const isImageGenerationEnabled = useSchematicFlag(FeatureFlag.IMAGE_GENERATION);
    const isTitleGenerationEnabled = useSchematicFlag(FeatureFlag.TITLE_GENERATIONS);
    const isVideoAnalysisEnabled = useSchematicFlag(FeatureFlag.ANALYSE_VIDEO);

    // Memoized message generation functions
    const generateScript = useCallback(async () => {
        const randomId = Math.random().toString(36).substring(2, 15);
        const userMessage: Message = {
            id: `generate-script-${randomId}`,
            role: "user",
            content: "Generate a step-by-step shooting script for this video that I can use on my own channel to produce a video that is similar to this one which mean do not just send the transcripts as the script but use necessary tools needed for generating script , create new one based on those content , dont do any other steps such as generating a image, just generate the script only!",
        };
        append(userMessage);
    }, [append]);

    const generateTitle = useCallback(async () => {
        const randomId = Math.random().toString(36).substring(2, 15);
        const userMessage: Message = {
            id: `generate-title-${randomId}`,
            role: "user",
            content: "Please generate a new title for this video using the generateTitle tool.",
        };
        append(userMessage);
    }, [append]);

    const generateImage = useCallback(async () => {
        const randomId = Math.random().toString(36).substring(2, 15);
        const userMessage: Message = {
            id: `generate-image-${randomId}`,
            role: "user",
            content: "Generate a thumbnail for this video",
        };
        append(userMessage);
    }, [append]);

    // Debounced scroll effect
    useEffect(() => {
        if (bottomRef.current && messagesContainerRef.current) {
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
            scrollTimeoutRef.current = setTimeout(() => {
                messagesContainerRef.current!.scrollTop = messagesContainerRef.current!.scrollHeight;
            }, 100);
        }
        return () => {
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
        };
    }, [messages]);

    // Toast effect
    useEffect(() => {
        const showToast = (message: string, isError = false) => {
            toastRef.current = toast(message, {
                id: toastRef.current,
                icon: <BotIcon className="w-4 h-4" aria-hidden="true" />,
                ...TOAST_STYLES.default,
                style: {
                    ...TOAST_STYLES.default.style,
                    ...(isError ? TOAST_STYLES.error : TOAST_STYLES.info),
                }
            });
        };

        switch (status) {
            case "submitted":
                showToast("Agent is thinking...");
                break;
            case "streaming":
                showToast("Agent is replying...");
                break;
            case "error":
                showToast("Whoops! Something went wrong, please try again.", true);
                break;
            case "ready":
                if (toastRef.current) {
                    toast.dismiss(toastRef.current);
                }
                break;
        }
    }, [status]);

    // Memoized button states
    const isSubmitDisabled = useMemo(() => 
        status === "streaming" || 
        status === "submitted" || 
        !isVideoAnalysisEnabled
    , [status, isVideoAnalysisEnabled]);

    const submitButtonLabel = useMemo(() => {
        switch (status) {
            case "streaming": return "AI is replying...";
            case "submitted": return "AI is thinking...";
            default: return "Send";
        }
    }, [status]);

    return (
        <div className='flex flex-col h-full' role="region" aria-label="AI Agent Chat">
            <div className="hidden lg:block px-4 pb-3 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800" id="chat-heading">AI Agent</h2>
            </div>
            {/* messages */}
            <div 
                className="flex-1 overflow-y-auto px-4 py-4" 
                ref={messagesContainerRef}
                role="log"
                aria-label="Chat messages"
                aria-live="polite"
            >
                <div className="space-y-6">
                    {messages.length === 0 && (
                    <div className="flex items-center justify-center h-full min-h-[200px]" role="status" aria-label="Welcome message">
                        <div className="text-center space-y-2">
                            <h3 className="text-lg font-medium text-gray-700">
                                Welcome to AI Agent Chat
                            </h3>
                            <p className="text-sm text-gray-500">
                                Ask any question about your video!
                            </p>
                        </div>
                    </div>
                    )}
                    <div role="list">
                        {messages.map((m) => (
                            <div
                                key={m.id}
                                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                                role="listitem"
                            >
                                <div
                                    className={`max-w-[85%] ${
                                    m.role === "user" ? "bg-blue-500" : "bg-gray-100"
                                    } rounded-2xl px-4 py-3`}
                                    role="article"
                                    aria-label={`${m.role === "user" ? "Your message" : "AI response"}`}
                                >
                                    {m.parts && m.role === "assistant" ? (
                                    // AI message
                                    <div className="space-y-3">
                                        {m.parts.map((part, i) =>
                                        part.type === "text" ? (
                                            <div key={i} className="prose prose-sm max-w-none">
                                                <ReactMarkdown>{part.text}</ReactMarkdown>
                                            </div>
                                        ) : part.type === "tool-invocation" ? (
                                            <div
                                            key={i}
                                            className="bg-white/50 rounded-lg p-2 space-y-2 text-gray-800"
                                            role="status"
                                            aria-label="Tool usage"
                                            >
                                            <div className="font-medium text-xs">
                                                {formatToolInvocation(part as ToolPart)}
                                            </div>
                                            {(part as ToolPart).toolInvocation.result && (
                                                <pre className="text-xs bg-white/75 p-2 rounded overflow-auto max-h-40">
                                                {JSON.stringify(
                                                    (part as ToolPart).toolInvocation.result,
                                                    null,
                                                    2
                                                )}
                                                </pre>
                                            )}
                                            </div>
                                        ) : null
                                        )}
                                    </div>
                                    ) : (
                                    // User message
                                    <div className="prose prose-sm max-w-none text-white">
                                        <ReactMarkdown>{m.content}</ReactMarkdown>
                                    </div>
                                    )}
                                    <div ref={bottomRef} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {/* input */}
            <div className="border-t border-gray-100 p-4 bg-white">
                <div className="space-y-3">
                    <form 
                        onSubmit={handleSubmit} 
                        className="flex gap-2"
                        role="search"
                        aria-label="Chat input"
                    >
                        <input
                            className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            type="text"
                            placeholder={
                                !isVideoAnalysisEnabled
                                    ? "Upgrade to ask anything about your video..."
                                    : "Ask anything about your video..."
                            }
                            value={input}
                            onChange={handleInputChange}
                            aria-label="Chat message input"
                            disabled={!isVideoAnalysisEnabled}
                        />
                        <Button
                            type="submit"
                            disabled={isSubmitDisabled}
                            className="px-4 py-2 bg-blue-500 text-white text-sm rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label={submitButtonLabel}
                        >
                            {submitButtonLabel}
                        </Button>
                    </form>
                    <div className="flex gap-2" role="toolbar" aria-label="AI tools">
                        <button
                            className="text-xs xl:text-sm w-full flex items-center justify-center gap-2 py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            onClick={generateScript}
                            type="button"
                            disabled={!isScriptGenerationEnabled}
                            aria-label={isScriptGenerationEnabled ? "Generate script" : "Upgrade to generate a script"}
                        >
                            <LetterText className="w-4 h-4" aria-hidden="true" />
                            {isScriptGenerationEnabled ? (
                                <span>Generate Script</span>
                            ) : (
                                <span>Upgrade to generate a script</span>
                            )}
                        </button>
                        <button
                            className="text-xs xl:text-sm w-full flex items-center justify-center gap-2 py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            onClick={generateTitle}
                            type="button"
                            disabled={!isTitleGenerationEnabled}
                            aria-label="Generate title"
                        >
                            <PenIcon className="w-4 h-4" aria-hidden="true" />
                            Generate Title
                        </button>

                        <button
                            className="text-xs xl:text-sm w-full flex items-center justify-center gap-2 py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            onClick={generateImage}
                            type="button"
                            disabled={!isImageGenerationEnabled}
                            aria-label="Generate image"
                        >
                            <ImageIcon className="w-4 h-4" aria-hidden="true" />
                            Generate Image
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AiAgentChat