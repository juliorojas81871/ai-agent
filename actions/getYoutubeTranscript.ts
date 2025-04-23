"use server";

import { currentUser } from "@clerk/nextjs/server";
import { Innertube } from "youtubei.js";


const youtube = await Innertube.create({
    lang: "en",
    location: "US",
    retrieve_player: false,
  });

function formatTimestamp(start_ms: number): string {
    const minutes = Math.floor(start_ms / 60000);
    const seconds = Math.floor((start_ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export interface TranscriptEntry {
    text: string;
    timestamp: string;
}

async function fetchTranscript(videoId: string): Promise<TranscriptEntry[]> {
    try {
        const info = await youtube.getInfo(videoId);
        const transcriptData = await info.getTranscript();
        const transcript: TranscriptEntry[] =
            transcriptData.transcript.content?.body?.initial_segments.map(
            (segment) => ({
                text: segment.snippet.text ?? "N/A",
                timestamp: formatTimestamp(Number(segment.start_ms)),
            })
            ) ?? [];

        return transcript;
    } catch (error) {
        console.error("Error fetching transcript:", error);
        throw error;
    }

}

export async function getYoutubeTranscript(videoId: string) {

    const user = await currentUser();


    if (!user?.id) {
        throw new Error("User not found");
    }

    // TODO: check if transcipt alread exist in database

    const transcript = await fetchTranscript(videoId);
    return {
        transcript,
        cache: "thise was not cached",
    }

}