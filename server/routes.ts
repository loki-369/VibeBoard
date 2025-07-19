import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateMoodboardSchema, analyzeMoodFromImageSchema, type GenerateMoodboardRequest, type AnalyzeMoodFromImageRequest, type MoodboardResponse } from "@shared/schema";
import OpenAI from "openai";
import { nanoid } from "nanoid";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || ""
});

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || process.env.UNSPLASH_API_KEY || "";

// Mood to color mapping
const moodColorMap: Record<string, string[]> = {
  happy: ["#FFA726", "#66BB6A", "#42A5F5", "#FFEB3B"],
  peaceful: ["#81C784", "#64B5F6", "#A5D6A7", "#E1F5FE"],
  excited: ["#FF7043", "#FFA726", "#FFCA28", "#EC407A"],
  sad: ["#90A4AE", "#78909C", "#B0BEC5", "#CFD8DC"],
  angry: ["#E53935", "#FF5722", "#F44336", "#D32F2F"],
  anxious: ["#9E9E9E", "#78909C", "#546E7A", "#607D8B"],
  motivated: ["#4CAF50", "#2196F3", "#FF9800", "#9C27B0"],
  creative: ["#9C27B0", "#E91E63", "#FF5722", "#607D8B"],
  nostalgic: ["#8D6E63", "#A1887F", "#BCAAA4", "#D7CCC8"],
  dreamy: ["#CE93D8", "#F8BBD9", "#C5CAE9", "#DCEDC8"],
};

// Mood to Spotify playlist mapping
const moodPlaylistMap: Record<string, string> = {
  happy: "37i9dQZF1DX0XUsuxWHRQd",
  peaceful: "37i9dQZF1DWZqd5JICZI0u",
  excited: "37i9dQZF1DX32NsLKyzScr",
  sad: "37i9dQZF1DX3YSRoSdA634",
  motivated: "37i9dQZF1DXdxcBWuJkbcy",
  creative: "37i9dQZF1DX0SM0LYsmbMT",
  nostalgic: "37i9dQZF1DX1s9knjP51Oa",
  dreamy: "37i9dQZF1DX3Sp0P28SIer",
};

function getColorsForMood(mood: string): string[] {
  const lowerMood = mood.toLowerCase();
  
  // Try exact match first
  if (moodColorMap[lowerMood]) {
    return moodColorMap[lowerMood];
  }
  
  // Try partial matches
  for (const [key, colors] of Object.entries(moodColorMap)) {
    if (lowerMood.includes(key) || key.includes(lowerMood)) {
      return colors;
    }
  }
  
  // Default colors for unknown moods
  return ["#42A5F5", "#66BB6A", "#FFA726", "#AB47BC"];
}

function getPlaylistForMood(mood: string): string | undefined {
  const lowerMood = mood.toLowerCase();
  
  // Try exact match first
  if (moodPlaylistMap[lowerMood]) {
    return moodPlaylistMap[lowerMood];
  }
  
  // Try partial matches
  for (const [key, playlistId] of Object.entries(moodPlaylistMap)) {
    if (lowerMood.includes(key) || key.includes(lowerMood)) {
      return playlistId;
    }
  }
  
  // Default playlist
  return "37i9dQZF1DX0XUsuxWHRQd";
}

async function fetchUnsplashImages(mood: string): Promise<string[]> {
  if (!UNSPLASH_ACCESS_KEY) {
    throw new Error("Unsplash API key not configured");
  }

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(mood)}&per_page=4&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }

    const data = await response.json();
    return data.results.map((photo: any) => photo.urls.regular);
  } catch (error) {
    console.error("Error fetching Unsplash images:", error);
    // Return fallback images
    return [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    ];
  }
}

async function generateAIQuote(mood: string): Promise<string> {
  if (!openai.apiKey) {
    throw new Error("OpenAI API key not configured");
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are a wise and inspirational quote generator. Create meaningful, uplifting quotes that resonate with the given mood. Keep quotes between 10-25 words and make them emotionally resonant.",
        },
        {
          role: "user",
          content: `Generate an inspiring quote about feeling ${mood}. The quote should be meaningful and emotionally resonant.`,
        },
      ],
      max_tokens: 100,
      temperature: 0.8,
    });

    return response.choices[0].message.content?.trim() || `"Every ${mood} moment is a step toward growth and self-discovery."`;
  } catch (error) {
    console.error("Error generating AI quote:", error);
    return `"Every ${mood} moment is a step toward growth and self-discovery."`;
  }
}

async function analyzeMoodFromImage(base64Image: string): Promise<string> {
  if (!openai.apiKey) {
    throw new Error("OpenAI API key not configured");
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an expert at analyzing emotions and moods from images. Look at facial expressions, body language, colors, lighting, and overall atmosphere. Respond with a single word that best describes the person's mood or the emotional tone of the image. Use words like: happy, sad, excited, peaceful, anxious, motivated, dreamy, nostalgic, creative, angry, etc.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this image and tell me what mood or emotion it conveys. Respond with just one descriptive word that captures the primary mood.",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 10,
      temperature: 0.3,
    });

    const detectedMood = response.choices[0].message.content?.trim().toLowerCase() || "peaceful";
    // Clean up the response to ensure it's a single word
    return detectedMood.split(' ')[0].replace(/[^a-z]/g, '');
  } catch (error) {
    console.error("Error analyzing mood from image:", error);
    return "peaceful"; // Default fallback mood
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Analyze mood from image
  app.post("/api/analyze-mood", async (req, res) => {
    try {
      const validatedData = analyzeMoodFromImageSchema.parse(req.body);
      const { image } = validatedData;

      const detectedMood = await analyzeMoodFromImage(image);

      res.json({ mood: detectedMood });
    } catch (error) {
      console.error("Error analyzing mood from image:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to analyze mood from image" 
      });
    }
  });

  // Generate moodboard
  app.post("/api/moodboards", async (req, res) => {
    try {
      const validatedData = generateMoodboardSchema.parse(req.body);
      const { mood } = validatedData;

      // Generate all components in parallel
      const [images, quote] = await Promise.all([
        fetchUnsplashImages(mood),
        generateAIQuote(mood),
      ]);

      const colors = getColorsForMood(mood);
      const spotifyPlaylistId = getPlaylistForMood(mood);
      const shareId = nanoid(10);

      const moodboard = await storage.createMoodboard({
        mood,
        quote,
        images,
        colors,
        spotifyPlaylistId,
        shareId,
      });

      const response: MoodboardResponse = {
        id: moodboard.id,
        mood: moodboard.mood,
        quote: moodboard.quote,
        images: moodboard.images,
        colors: moodboard.colors,
        spotifyPlaylistId: moodboard.spotifyPlaylistId || undefined,
        shareId: moodboard.shareId,
        createdAt: moodboard.createdAt.toISOString(),
      };

      res.json(response);
    } catch (error) {
      console.error("Error generating moodboard:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to generate moodboard" 
      });
    }
  });

  // Get moodboard by share ID
  app.get("/api/moodboards/:shareId", async (req, res) => {
    try {
      const { shareId } = req.params;
      const moodboard = await storage.getMoodboardByShareId(shareId);

      if (!moodboard) {
        return res.status(404).json({ message: "Moodboard not found" });
      }

      const response: MoodboardResponse = {
        id: moodboard.id,
        mood: moodboard.mood,
        quote: moodboard.quote,
        images: moodboard.images,
        colors: moodboard.colors,
        spotifyPlaylistId: moodboard.spotifyPlaylistId || undefined,
        shareId: moodboard.shareId,
        createdAt: moodboard.createdAt.toISOString(),
      };

      res.json(response);
    } catch (error) {
      console.error("Error fetching moodboard:", error);
      res.status(500).json({ message: "Failed to fetch moodboard" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
