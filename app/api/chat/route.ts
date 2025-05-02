import { getVideoDetails } from "@/actions/getVideoDetails";
import { currentUser } from "@clerk/nextjs/server";
import { streamText, tool } from "ai";
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { NextResponse } from "next/server";
import { z } from "zod";
import { titleGeneration } from "@/actions/titleGeneration";
import { dalleImageGeneration } from "@/actions/dalleImageGeneration";
import { getYoutubeTranscript } from "@/actions/getYoutubeTranscript";

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

    const systemMessage = `You are an AI agent ready to accept questions from the user about ONE specific video. The video ID in question is ${videoId} but you'll refer to this as ${videoDetails?.title || "Selected Video"}. Use emojis to make the conversation more engaging.

You have access to several tools and capabilities:
1. You can analyze the video content, generate insights, and answer questions about the video
2. You can transcribe and analyze the video's content
3. You can generate titles, scripts, and thumbnails using the specific tools when requested
4. You can provide recommendations and suggestions based on the video content

When users specifically request to generate a title, script, or thumbnail, use the corresponding tools:
- For titles: Use the generateTitle tool
- For scripts: Use the generateScript tool
- For thumbnails: Use the generateThumbnail tool

For other tasks, you can use your own capabilities and the available tools flexibly. If an error occurs, explain it to the user and ask them to try again later. If the error suggests the user needs to upgrade, explain that they must upgrade to use the feature and direct them to 'Manage Plan' in the header.

When using tools that involve caching (like transcripts), explain that the data is retrieved from the database to save processing time and tokens.`;

    const result = streamText({
        model,
        messages: [{ role: "system", content: systemMessage }, ...messages],
        tools: {
            getVideoDetails: tool({
                description: "Get the details of a YouTube video",
                parameters: z.object({
                  videoId: z.string().describe("The video ID to get the details for"),
                }),
                execute: async ({ videoId }) => {
                  const videoDetails = await getVideoDetails(videoId);
                  return { videoDetails };
                },
            }),
            getTranscript: tool({
                description: "Get the transcript of a YouTube video",
                parameters: z.object({
                    videoId: z.string().describe("The video ID to get the transcript for"),
                }),
                execute: async ({ videoId }) => {
                    const transcript = await getYoutubeTranscript(videoId);
                    if (!transcript.transcript || transcript.transcript.length === 0) {
                        throw new Error("No transcript available for this video");
                    }
                    return { 
                        transcript: transcript.transcript,
                        cache: transcript.cache 
                    };
                },
            }),
            generateTitle: tool({
                description: "Generate a title for a YouTube video",
                parameters: z.object({
                    videoId: z.string().describe("The video ID to generate a title for"),
                }),
                execute: async ({ videoId }) => {
                    const videoDetails = await getVideoDetails(videoId);
                    const summary = videoDetails?.title || "A YouTube video";
                    const titleConsiderations = "Make it SEO friendly and engaging";
                    
                    const result = await titleGeneration(videoId, summary, titleConsiderations);
                    if (!result.success) {
                        throw new Error(result.error || "Failed to generate title");
                    }
                    return { title: result.data };
                },
            }),
            generateScript: tool({
                description: "Generate a detailed shooting script based on the video transcript",
                parameters: z.object({
                    videoId: z.string().describe("The video ID to generate a script for"),
                }),
                execute: async ({ videoId }) => {
                    const transcript = await getYoutubeTranscript(videoId);
                    const videoDetails = await getVideoDetails(videoId);
                    
                    if (!transcript.transcript || transcript.transcript.length === 0) {
                        throw new Error("No transcript available for this video");
                    }

                    const script = transcript.transcript.map(entry => ({
                        timestamp: entry.timestamp,
                        scene: entry.text,
                        visual: entry.text,
                        notes: "Key points to highlight in this scene"
                    }));

                    return {
                        title: videoDetails?.title || "Video",
                        script
                    };
                },
            }),
            generateThumbnail: tool({
                description: "Generate a thumbnail for a YouTube video",
                parameters: z.object({
                    videoId: z.string().describe("The video ID to generate a thumbnail for"),
                }),
                execute: async ({ videoId }) => {
                    const videoDetails = await getVideoDetails(videoId);
                    const prompt = `Create an eye-catching YouTube thumbnail for a video titled "${videoDetails?.title || 'YouTube Video'}". The thumbnail should be visually appealing and represent the video's content.`;
                    
                    const result = await dalleImageGeneration(prompt, videoId);
                    if (!result.imageUrl) {
                        throw new Error("Failed to generate thumbnail");
                    }
                    return { thumbnailUrl: result.imageUrl };
                },
            }),
        }
    });

    return result.toDataStreamResponse();
}