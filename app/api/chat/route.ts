import { getVideoDetails } from "@/actions/getVideoDetails";
import { currentUser } from "@clerk/nextjs/server";
import { streamText } from "ai";
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { NextResponse } from "next/server";
import fetchTranscript from "@/tools/fetchTranscript";

const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
});

const model = google("gemini-2.0-flash-001")


export async function POST(req: Request) {
    const { messages, videoId } = await req.json();

    const user = await currentUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const videoDetails = await getVideoDetails(videoId);

    const systemMessage = `You are an AI agent ready to accept questions from the user about ONE specific video. The video ID in question is ${videoId} but you'll refer to this as ${videoDetails?.title || "Selected Video"}. Use emojis to make the conversation more engaging. If an error occurs, explain it to the user and ask them to try again later. If the error suggest the user upgrade, explain that they must upgrade to use the feature, tell them to go to 'Manage Plan' in the header and upgrade. If any tool is used, analyse the response and if it contains a cache, explain that the transcript is cached because they previously transcribed the video saving the user a token - use words like database instead of cache to make it more easy to understand. Format for notion.`;

    const result = streamText({
        model,
        messages: [{ role: "system", content: systemMessage }, ...messages],
        tools: {
            fetchTranscript: fetchTranscript,
        }
    });


    return result.toDataStreamResponse();
}