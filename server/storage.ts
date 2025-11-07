import {
  type Topic,
  type InsertTopic,
  type StudySession,
  type InsertStudySession,
  type ScheduleItem,
  type InsertScheduleItem,
  type Reference,
  type InsertReference,
  type UpdateTopic,
  topics,
  studySessions,
  scheduleItems,
  references,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/neon-serverless";
import { neonConfig, Pool } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import ws from "ws";

// Configure WebSocket for Neon serverless
neonConfig.webSocketConstructor = ws;

export interface IStorage {
  getAllTopics(): Promise<Topic[]>;
  getTopic(id: string): Promise<Topic | undefined>;
  createTopic(topic: InsertTopic): Promise<Topic>;
  updateTopic(id: string, data: UpdateTopic): Promise<Topic | undefined>;

  getAllSessions(): Promise<StudySession[]>;
  getSession(id: string): Promise<StudySession | undefined>;
  createSession(session: InsertStudySession): Promise<StudySession>;
  deleteSession(id: string): Promise<boolean>;

  getAllScheduleItems(): Promise<ScheduleItem[]>;
  getScheduleItem(id: string): Promise<ScheduleItem | undefined>;
  createScheduleItem(item: InsertScheduleItem): Promise<ScheduleItem>;
  updateScheduleItem(id: string, completed: number): Promise<ScheduleItem | undefined>;
  deleteAllScheduleItems(): Promise<void>;

  getAllReferences(): Promise<Reference[]>;
  getReference(id: string): Promise<Reference | undefined>;
  createReference(reference: InsertReference): Promise<Reference>;
}

export class DatabaseStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is required");
    }
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    this.db = drizzle(pool);
  }

  async getAllTopics(): Promise<Topic[]> {
    return this.db.select().from(topics);
  }

  async getTopic(id: string): Promise<Topic | undefined> {
    const result = await this.db.select().from(topics).where(eq(topics.id, id));
    return result[0];
  }

  async createTopic(insertTopic: InsertTopic): Promise<Topic> {
    const id = `topic-${randomUUID()}`;
    const result = await this.db.insert(topics).values({ ...insertTopic, id }).returning();
    return result[0];
  }

  async updateTopic(id: string, data: UpdateTopic): Promise<Topic | undefined> {
    const result = await this.db
      .update(topics)
      .set(data)
      .where(eq(topics.id, id))
      .returning();
    return result[0];
  }

  async getAllSessions(): Promise<StudySession[]> {
    return this.db.select().from(studySessions);
  }

  async getSession(id: string): Promise<StudySession | undefined> {
    const result = await this.db.select().from(studySessions).where(eq(studySessions.id, id));
    return result[0];
  }

  async createSession(insertSession: InsertStudySession): Promise<StudySession> {
    const id = `session-${randomUUID()}`;
    const result = await this.db
      .insert(studySessions)
      .values({ ...insertSession, id })
      .returning();
    return result[0];
  }

  async deleteSession(id: string): Promise<boolean> {
    const result = await this.db
      .delete(studySessions)
      .where(eq(studySessions.id, id))
      .returning();
    return result.length > 0;
  }

  async getAllScheduleItems(): Promise<ScheduleItem[]> {
    const items = await this.db.select().from(scheduleItems);
    // Sort by sortOrder to maintain CSV insertion order
    return items.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }

  async getScheduleItem(id: string): Promise<ScheduleItem | undefined> {
    const result = await this.db.select().from(scheduleItems).where(eq(scheduleItems.id, id));
    return result[0];
  }

  async createScheduleItem(insertItem: InsertScheduleItem): Promise<ScheduleItem> {
    const id = `schedule-${randomUUID()}`;
    const result = await this.db.insert(scheduleItems).values({ ...insertItem, id }).returning();
    return result[0];
  }

  async updateScheduleItem(id: string, completed: number): Promise<ScheduleItem | undefined> {
    const result = await this.db
      .update(scheduleItems)
      .set({ completed })
      .where(eq(scheduleItems.id, id))
      .returning();
    return result[0];
  }

  async deleteAllScheduleItems(): Promise<void> {
    await this.db.delete(scheduleItems);
  }

  async getAllReferences(): Promise<Reference[]> {
    return this.db.select().from(references);
  }

  async getReference(id: string): Promise<Reference | undefined> {
    const result = await this.db.select().from(references).where(eq(references.id, id));
    return result[0];
  }

  async createReference(insertReference: InsertReference): Promise<Reference> {
    const id = `ref-${randomUUID()}`;
    const result = await this.db.insert(references).values({ ...insertReference, id }).returning();
    return result[0];
  }
}

export const storage = new DatabaseStorage();
