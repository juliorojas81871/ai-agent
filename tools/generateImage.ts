import { pollinationsImageGeneration } from "@/actions/pollinationsImageGeneration";
import { FeatureFlag } from "@/features/flags";
import { client } from "@/lib/schematic";
import { tool } from "ai";
import { z } from "zod";

const generateImage = (videoId: string, userId: string) =>
    tool({
        description: "Generate an image",
        parameters: z.object({
            prompt: z.string().describe("The prompt to generate an image for"),
            videoId: z.string().describe("The YouTube video ID"),
    }),
    execute: async ({ prompt }) => {
        const schematicCtx = {
        company: { id: userId },
        user: {
            id: userId,
        },
        };

        const isImageGenerationEnabled = await client.checkFlag(
            schematicCtx,
            FeatureFlag.IMAGE_GENERATION
        );

        if (!isImageGenerationEnabled) {
            return {
                error: "Image generation is not enabled, the user must upgrade",
            };
        }

        const image = await pollinationsImageGeneration(prompt, videoId);
        return { image };
    },
});

export default generateImage;