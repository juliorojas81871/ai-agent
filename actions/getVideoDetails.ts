"use server"
import { VideoDetails } from "@/types/types";
import { google } from "googleapis";

const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY,
});

export async function getVideoDetails(videoId: string) {
    if (!process.env.YOUTUBE_API_KEY) {
        console.error("❌ YouTube API key is not configured");
        return null;
    }

    try {
        const videoResponse = await youtube.videos.list({
            part: ["statistics", "snippet"],
            id: [videoId],
        });

        const videoDetails = videoResponse.data.items?.[0];

        if (!videoDetails) {
            console.error("❌ Video not found:", videoId);
            return null;
        }

        const channelResponse = await youtube.channels.list({
            part: ["snippet", "statistics"],
            id: [videoDetails.snippet?.channelId || ""],
        });

        const channelDetails = channelResponse.data.items?.[0];

        if (!channelDetails) {
            console.error("❌ Channel details not found for video:", videoId);
            return null;
        }

        const video: VideoDetails = {
            // video info
            title: videoDetails.snippet?.title || "Unknown Title",
            thumbnail:
                videoDetails.snippet?.thumbnails?.maxres?.url ||
                videoDetails.snippet?.thumbnails?.high?.url ||
                videoDetails.snippet?.thumbnails?.default?.url ||
                "",
            publishedAt:
                videoDetails.snippet?.publishedAt || new Date().toISOString(),

            // video metrics
            views: videoDetails.statistics?.viewCount || "0",
            likes: videoDetails.statistics?.likeCount || "Not Available",
            comments: videoDetails.statistics?.commentCount || "Not Available",

            // channel info
            channel: {
                title: videoDetails.snippet?.channelTitle || "Unknown Channel",
                thumbnail: channelDetails.snippet?.thumbnails?.default?.url || "",
                subscribers: channelDetails.statistics?.subscriberCount || "0",
            },
        };
        return video;
    } catch (error) {
        console.error("❌ Error fetching video details:", error);
        return null;
    }
}