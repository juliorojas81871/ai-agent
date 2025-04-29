"use server";
import { currentUser } from "@clerk/nextjs/server";
import { Innertube } from "youtubei.js";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import { client } from "@/lib/schematic";
import { FeatureFlag, featureFlagEvents } from "@/features/flags";

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

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

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
    const existingTranscript = await convex.query(
      api.transcript.getTranscriptByVideoId,
      { videoId, userId: user.id }
      );

    if (existingTranscript) {
      return {
        cache:
          "This video has already been transcribed - Accessing cached transcript instead of using a token",
        transcript: existingTranscript.transcript,
      };
    }

    try {
      const transcript = await fetchTranscript(videoId);

      // store transcript
      await convex.mutation(api.transcript.storeTranscript, {
        videoId,
        userId: user.id,
        transcript,
      });

      // Track usage after successful transcript generation
      try {
        await client.track({
          event: featureFlagEvents[FeatureFlag.TRANSCRIPTION].event,
          company: {
            id: user.id,
          },
          user: {
            id: user.id,
          },
        });
      } catch (error) {
        // Log error but don't fail the operation
        console.error('Error tracking transcript usage:', error);
      }

      return {
        transcript,
        cache:
          "This video was transcribed using a token, the transcript is now saved in the database",
      };
    } catch (error) {
      console.error("❌ Error fetching transcript:", error);
      return {
        transcript: [],
        cache: "Error fetching transcript, please try again later",
      }
    }

}