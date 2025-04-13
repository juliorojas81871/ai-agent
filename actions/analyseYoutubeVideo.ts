"use server";

import { redirect } from "next/navigation";

export async function analyseYoutubeVideo(formData: FormData) {
    const url = formData.get("url")?.toString();
    if (!url) return;

    //   TODO:
    const videoId = "123";

    if (!videoId) return;

    redirect(`/video/${videoId}/analysis`);
}