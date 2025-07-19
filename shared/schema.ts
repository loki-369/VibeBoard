import { pgTable, text, serial, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const moodboards = pgTable("moodboards", {
  id: serial("id").primaryKey(),
  mood: text("mood").notNull(),
  quote: text("quote").notNull(),
  images: json("images").$type<string[]>().notNull(),
  colors: json("colors").$type<string[]>().notNull(),
  spotifyPlaylistId: text("spotify_playlist_id"),
  shareId: text("share_id").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMoodboardSchema = createInsertSchema(moodboards).omit({
  id: true,
  createdAt: true,
});

export type InsertMoodboard = z.infer<typeof insertMoodboardSchema>;
export type Moodboard = typeof moodboards.$inferSelect;

// API response schemas
export const generateMoodboardSchema = z.object({
  mood: z.string().min(1).max(100),
});

export const analyzeMoodFromImageSchema = z.object({
  image: z.string(), // base64 encoded image
  cvAnalysis: z.object({
    avgBrightness: z.number(),
    contrast: z.number(),
    edgeIntensity: z.number(),
    faceDetected: z.boolean(),
  }).optional(), // Optional OpenCV analysis from frontend
});

export type GenerateMoodboardRequest = z.infer<typeof generateMoodboardSchema>;
export type AnalyzeMoodFromImageRequest = z.infer<typeof analyzeMoodFromImageSchema>;

export const analyzeMoodResponseSchema = z.object({
  mood: z.string(),
});

export type AnalyzeMoodResponse = z.infer<typeof analyzeMoodResponseSchema>;

export const moodboardResponseSchema = z.object({
  id: z.number(),
  mood: z.string(),
  quote: z.string(),
  images: z.array(z.string()),
  colors: z.array(z.string()),
  spotifyPlaylistId: z.string().optional(),
  shareId: z.string(),
  createdAt: z.string(),
});

export type MoodboardResponse = z.infer<typeof moodboardResponseSchema>;
