import { getVideoDetails } from "@/actions/getVideoDetails";
import { currentUser } from "@clerk/nextjs/server";
import { streamText, tool } from "ai";
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { NextResponse } from "next/server";
import fetchTranscript from "@/tools/fetchTranscript";
import generateImage from "@/tools/generateImage";
import { getVideoIdFromUrl } from "@/lib/getVideoIdFromUrl";
import { z } from "zod";
import { titleGeneration } from "@/actions/titleGeneration";

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

    const systemMessage = `You are an AI agent ready to accept questions from the user about ONE specific video. The video ID in question is ${videoId} but you'll refer to this as ${videoDetails?.title || "Selected Video"}. Use emojis to make the conversation more engaging. If an error occurs, explain it to the user and ask them to try again later. If the error suggest the user upgrade, explain that they must upgrade to use the feature, tell them to go to 'Manage Plan' in the header and upgrade. If any tool is used, analyse the response and if it contains a cache, explain that the transcript is cached because they previously transcribed the video saving the user a token - use words like database instead of cache to make it more easy to understand. Format for notion.

When the user asks to generate a title, you MUST use the generateTitle tool with the videoId parameter. Do not try to generate the title yourself.`;

    const result = streamText({
        model,
        messages: [{ role: "system", content: systemMessage }, ...messages],
        tools: {
            fetchTranscript: fetchTranscript,
            generateImage: generateImage(videoId, user.id),
            extractVideoId: tool({
                description: "Extract the video ID from a URL",
                parameters: z.object({
                  url: z.string().describe("The URL to extract the video ID from"),
                }),
                execute: async ({ url }) => {
                  const videoId = await getVideoIdFromUrl(url);
                  return { videoId };
                },
            }),
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
            generateTitle: tool({
                description: "Generate a title for a YouTube video",
                parameters: z.object({
                    videoId: z.string().describe("The video ID to generate a title for"),
                }),
                execute: async ({ videoId }) => {
                    // Get video details to use as summary
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
        }
    });


    return result.toDataStreamResponse();
}