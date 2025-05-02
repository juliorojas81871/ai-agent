"use client";
import React, { useEffect, useRef } from 'react'
import { Message, useChat } from "@ai-sdk/react";
import { Button } from './ui/button';
import ReactMarkdown from "react-markdown";
import { useSchematicFlag } from '@schematichq/schematic-react';
import { FeatureFlag } from '@/features/flags';
import { BotIcon, ImageIcon, LetterText, PenIcon } from 'lucide-react';
import { toast } from 'sonner';


function AiAgentChat({ videoId }: { videoId: string }) {
    const { messages, input, handleInputChange, handleSubmit, append, status } = useChat({
      maxSteps: 5,
      body: {
        videoId,
      },
    });

    const bottomRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    interface ToolInvocation {
        toolCallId: string;
        toolName: string;
        result?: Record<string, unknown>;
      }

      interface ToolPart {
        type: "tool-invocation";
        toolInvocation: ToolInvocation;
      }

      const formatToolInvocation = (part: ToolPart) => {
        if (!part.toolInvocation) return "Unknown Tool";
        return `🔧 Tool Used: ${part.toolInvocation.toolName}`;
      };

    const isScriptGenerationEnabled = useSchematicFlag(
        FeatureFlag.SCRIPT_GENERATION
    );
    const isImageGenerationEnabled = useSchematicFlag(
        FeatureFlag.IMAGE_GENERATION
    );
    const isTitleGenerationEnabled = useSchematicFlag(
        FeatureFlag.TITLE_GENERATIONS
    );
    const isVideoAnalysisEnabled = useSchematicFlag(FeatureFlag.ANALYSE_VIDEO);


    const generateScript = async () => {
        const randomId = Math.random().toString(36).substring(2, 15);

        const userMessage: Message = {
          id: `generate-script-${randomId}`,
          role: "user",
          content:
            "Generate a step-by-step shooting script for this video that I can use on my own channel to produce a video that is similar to this one which mean do not just send the transcripts as the script but use necessary tools needed for generating script , create new one based on those content , dont do any other steps such as generating a image, just generate the script only!",
        };
        append(userMessage);
      };

    const generateTitle = async () => {
        const randomId = Math.random().toString(36).substring(2, 15);
        const userMessage: Message = {
          id: `generate-title-${randomId}`,
          role: "user",
          content: "Please generate a new title for this video using the generateTitle tool.",
        };
        append(userMessage);
    };
    const generateImage = async () => {
        const randomId = Math.random().toString(36).substring(2, 15);
        const userMessage: Message = {
            id: `generate-image-${randomId}`,
            role: "user",
            content: "Generate a thumbnail for this video",
        };
        append(userMessage);
    };

    useEffect(() => {
        if (bottomRef.current && messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop =
            messagesContainerRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        let toastId;
    
        switch (status) {
          case "submitted":
            toastId = toast("Agent is thinking...", {
              id: toastId,
              icon: <BotIcon className="w-4 h-4" />,
              duration: 5000,
              position: "top-center",
              style: {
                background: "#EFF6FF",
                color: "#1E40AF",
                border: "1px solid #3B82F6",
                fontSize: "1.1rem",
                padding: "1rem",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              }
            });
            break;
          case "streaming":
            toastId = toast("Agent is replying...", {
              id: toastId,
              icon: <BotIcon className="w-4 h-4" />,
              duration: 5000,
              position: "top-center",
              style: {
                background: "#EFF6FF",
                color: "#1E40AF",
                border: "1px solid #3B82F6",
                fontSize: "1.1rem",
                padding: "1rem",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              }
            });
            break;
          case "error":
            toastId = toast("Whoops! Something went wrong, please try again.", {
              id: toastId,
              icon: <BotIcon className="w-4 h-4" />,
              duration: 5000,
              position: "top-center",
              style: {
                background: "#FEE2E2",
                color: "#DC2626",
                border: "1px solid #DC2626",
                fontSize: "1.1rem",
                padding: "1rem",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              }
            });
            break;
          case "ready":
            toast.dismiss(toastId);
    
            break;
        }
      }, [status]);

    return (
        <div className='flex flex-col h-full'>
            <div className="hidden lg:block px-4 pb-3 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800">AI Agent</h2>
            </div>
            {/* messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4" ref={messagesContainerRef}>
                <div className="space-y-6">
                    {messages.length === 0 && (
                    <div className="flex items-center justify-center h-full min-h-[200px]">
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
                    {messages.map((m) => (
                        <div
                            key={m.id}
                            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[85%] ${
                                m.role === "user" ? "bg-blue-500" : "bg-gray-100"
                                } rounded-2xl px-4 py-3`}
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
                                        className="bg-white/50 rounded-lg p-2 space-y-2 text-gray-800 "
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
            {/* input */}
            <div className="border-t border-gray-100 p-4 bg-white">
                <div className="space-y-3">
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <input
                            className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 ocus:border-transparent"
                            type="text"
                            placeholder={
                                !isVideoAnalysisEnabled
                                    ? "Upgrade to ask anything about your video..."
                                    : "Ask anything about your video..."
                            }
                            value={input}
                            onChange={handleInputChange}
                        />
                        <Button
                            type="submit"
                            disabled={
                                status === "streaming" ||
                                status === "submitted" ||
                                !isVideoAnalysisEnabled
                            }
                            className="px-4 py-2 bg-blue-500 text-white text-sm rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {status === "streaming"
                                ? "AI is replying..."
                                : status === "submitted"
                                    ? "AI is thinking..."
                                    : "Send"}
                        </Button>
                    </form>
                    <div className="flex gap-2">
                        <button
                            className="text-xs xl:text-sm w-full flex items-center justify-center gap-2 py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={generateScript}
                            type="button"
                            disabled={!isScriptGenerationEnabled}
                        >
                            <LetterText className="w-4 h-4" />
                            {isScriptGenerationEnabled ? (
                                <span>Generate Script</span>
                            ) : (
                                <span>Upgrade to generate a script</span>
                            )}
                        </button>
                        <button
                            className="text-xs xl:text-sm w-full flex items-center justify-center gap-2 py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={generateTitle}
                            type="button"
                            disabled={!isTitleGenerationEnabled}
                        >
                            <PenIcon className="w-4 h-4" />
                            Generate Title
                        </button>

                        <button
                            className="text-xs xl:text-sm w-full flex items-center justify-center gap-2 py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={generateImage}
                            type="button"
                            disabled={!isImageGenerationEnabled}
                        >
                            <ImageIcon className="w-4 h-4" />
                            Generate Image
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AiAgentChat