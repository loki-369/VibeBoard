import { moodboards, type Moodboard, type InsertMoodboard } from "@shared/schema";

export interface IStorage {
  createMoodboard(moodboard: InsertMoodboard): Promise<Moodboard>;
  getMoodboard(id: number): Promise<Moodboard | undefined>;
  getMoodboardByShareId(shareId: string): Promise<Moodboard | undefined>;
}

export class MemStorage implements IStorage {
  private moodboards: Map<number, Moodboard>;
  private shareIdMap: Map<string, number>;
  private currentId: number;

  constructor() {
    this.moodboards = new Map();
    this.shareIdMap = new Map();
    this.currentId = 1;
  }

  async createMoodboard(insertMoodboard: InsertMoodboard): Promise<Moodboard> {
    const id = this.currentId++;
    const moodboard: Moodboard = {
      id,
      mood: insertMoodboard.mood,
      quote: insertMoodboard.quote,
      images: insertMoodboard.images as string[],
      colors: insertMoodboard.colors as string[],
      spotifyPlaylistId: insertMoodboard.spotifyPlaylistId || null,
      shareId: insertMoodboard.shareId,
      createdAt: new Date(),
    };
    
    this.moodboards.set(id, moodboard);
    this.shareIdMap.set(moodboard.shareId, id);
    return moodboard;
  }

  async getMoodboard(id: number): Promise<Moodboard | undefined> {
    return this.moodboards.get(id);
  }

  async getMoodboardByShareId(shareId: string): Promise<Moodboard | undefined> {
    const id = this.shareIdMap.get(shareId);
    if (!id) return undefined;
    return this.moodboards.get(id);
  }
}

export const storage = new MemStorage();
