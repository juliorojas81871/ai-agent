"use server";

import { getVideoIdFromUrl } from "@/lib/getVideoIdFromUrl";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { client } from "@/lib/schematic";
import { FeatureFlag } from "@/features/flags";

const MANAGE_PLAN_PATH = "/manage-plan";

export async function analyseYoutubeVideo(formData: FormData) {
    const url = formData.get("url")?.toString();
    if (!url) {
        throw new Error("Please enter a YouTube URL");
    }

    const user = await currentUser();
    if (!user?.id) {
        throw new Error("Please sign in to analyze videos");
    }

    // Check if video analysis feature is enabled
    const schematicCtx = {
        company: { id: user.id },
        user: { id: user.id },
    };

    const isVideoAnalysisEnabled = await client.checkFlag(
        schematicCtx,
        FeatureFlag.ANALYSE_VIDEO
    );

    const isTranscriptionEnabled = await client.checkFlag(
        schematicCtx,
        FeatureFlag.TRANSCRIPTION
    );

    if (!isVideoAnalysisEnabled || !isTranscriptionEnabled) {
        redirect(MANAGE_PLAN_PATH);
    }

    const videoId = getVideoIdFromUrl(url);
    if (!videoId) {
        throw new Error("Please enter a valid YouTube URL");
    }

    redirect(`/video/${videoId}/analysis`);
}