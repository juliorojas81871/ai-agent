"use server";

import { api } from "@/convex/_generated/api";
import { FeatureFlag, featureFlagEvents } from "@/features/flags";
import { getConvexClient } from "@/lib/convex";
import { client } from "@/lib/schematic";
import { currentUser } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const convexClient = getConvexClient();

export async function titleGeneration(
  videoId: string,
  videoSummary: string,
  considerations: string
) {
  const user = await currentUser();

  if (!user?.id) {
    throw new Error("User not found");
  }

const apiKey= process.env.GEMINI_API_KEY || ""

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-001",
    systemInstruction:"You are a helpful YouTube video creator assistant that creates high quality SEO friendly concise video titles."
 });

const prompt = `Please provide ONE concise YouTube title (and nothing else) for this video. Focus on the main points and key takeaways, it should be SEO friendly and 100 characters or less:\n\n${videoSummary}\n\n${considerations}`;

  try {

    const result = await model.generateContent(prompt);

    const title = result.response.text()?.trim() || "Unable to generate title";

    if (!title) {
      return {
        success: false,
        error: "Failed to generate title (System error)",
      };
    }

    try {
      // Save the title to the database
      const titleId = await convexClient.mutation(api.titles.generate, {
        videoId,
        userId: user.id,
        title: title,
      });

      if (!titleId) {
        throw new Error("Failed to save title to database");
      }

      // Track the usage
      await client.track({
        event: featureFlagEvents[FeatureFlag.TITLE_GENERATIONS].event,
        company: {
          id: user.id,
        },
        user: {
          id: user.id,
        },
      });

      return {
        success: true,
        data: title
      };
    } catch (dbError) {
      console.error("❌ Error saving title to database:", dbError);
      return {
        success: false,
        error: "Failed to save title to database"
      };
    }
  } catch (error) {
    console.error("❌ Error generating title:", error);
    return {
      success: false,
      error: "Failed to generate title"
    };
  }
}