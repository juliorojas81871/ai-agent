import { createAnthropic } from "@ai-sdk/anthropic";
import { NextResponse } from "next/server"
import { streamText } from "ai";

export async function POST(req: Request) {
    const { messages, videoId } = await req.json();

    const anthropic = createAnthropic({
        apiKey: process.env.CLAUDE_API_KEY,
        headers: {
          "anthropic-beta": "token-efficient-tools-2025-04-20",
        },
    });

    const result = streamText({})

    return NextResponse.json({ message: "hello" });
}