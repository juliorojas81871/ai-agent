"use server";

import { api } from "@/convex/_generated/api";
import { FeatureFlag, featureFlagEvents } from "@/features/flags";
import { getConvexClient } from "@/lib/convex";
import { client } from "@/lib/schematic";
import { currentUser } from "@clerk/nextjs/server";

const IMAGE_SIZE = "1792x1024" as const;
const convexClient = getConvexClient();

export const dalleImageGeneration = async (prompt: string, videoId: string) => {
    const user = await currentUser();

    if (!user?.id) {
      throw new Error("User not found");
    }

    function generateRandomNum():number{
        return Math.floor(Math.random()* 100000000)+1;
    }
    const randomSeed = generateRandomNum()

    if (!prompt) {
      throw new Error("Failed to generate image prompt");
    }

    const width = 1972;
    const height = 1024;
     // Each seed generates a new image variation
    const model = 'flux'; // Using 'flux' as default if model is not provided
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&seed=${randomSeed}&model=${model}`;

    // Step 1: Get a short-lived upload URL for Convex
    const postUrl = await convexClient.mutation(api.images.generateUploadUrl);

    // Step 2: Download the image from the URL
    const image: Blob = await fetch(imageUrl).then((res) => res.blob());

    // Step 3: Upload the image to the convex storage bucket
    const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": image!.type },
        body: image,
    });

    const { storageId } = await result.json();

    // Step 4: Save the newly allocated storage id to the database
    await convexClient.mutation(api.images.storeImage, {
        storageId: storageId,
        videoId,
        userId: user.id,
    });

    // get serve image url
    const dbImageUrl = await convexClient.query(api.images.getImage, {
        videoId,
        userId: user.id,
    });

    // Track the image generation event
    await client.track({
        event: featureFlagEvents[FeatureFlag.IMAGE_GENERATION].event,
        company: {
        id: user.id,
        },
        user: {
        id: user.id,
        },
    });

    return {
        imageUrl: dbImageUrl,
    };
};