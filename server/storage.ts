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
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getAllTopics(): Promise<Topic[]>;
  getTopic(id: string): Promise<Topic | undefined>;
  createTopic(topic: InsertTopic): Promise<Topic>;
  updateTopic(id: string, data: UpdateTopic): Promise<Topic | undefined>;

  getAllSessions(): Promise<StudySession[]>;
  getSession(id: string): Promise<StudySession | undefined>;
  createSession(session: InsertStudySession): Promise<StudySession>;

  getAllScheduleItems(): Promise<ScheduleItem[]>;
  getScheduleItem(id: string): Promise<ScheduleItem | undefined>;
  createScheduleItem(item: InsertScheduleItem): Promise<ScheduleItem>;
  updateScheduleItem(id: string, completed: number): Promise<ScheduleItem | undefined>;

  getAllReferences(): Promise<Reference[]>;
  getReference(id: string): Promise<Reference | undefined>;
  createReference(reference: InsertReference): Promise<Reference>;
}

export class MemStorage implements IStorage {
  private topics: Map<string, Topic>;
  private sessions: Map<string, StudySession>;
  private scheduleItems: Map<string, ScheduleItem>;
  private references: Map<string, Reference>;

  constructor() {
    this.topics = new Map();
    this.sessions = new Map();
    this.scheduleItems = new Map();
    this.references = new Map();
  }

  async getAllTopics(): Promise<Topic[]> {
    return Array.from(this.topics.values());
  }

  async getTopic(id: string): Promise<Topic | undefined> {
    return this.topics.get(id);
  }

  async createTopic(insertTopic: InsertTopic): Promise<Topic> {
    const id = `topic-${randomUUID()}`;
    const topic: Topic = { ...insertTopic, id };
    this.topics.set(id, topic);
    return topic;
  }

  async updateTopic(id: string, data: UpdateTopic): Promise<Topic | undefined> {
    const topic = this.topics.get(id);
    if (!topic) return undefined;

    const updated: Topic = {
      ...topic,
      completed: data.completed,
      confidence: data.confidence,
    };
    this.topics.set(id, updated);
    return updated;
  }

  async getAllSessions(): Promise<StudySession[]> {
    return Array.from(this.sessions.values());
  }

  async getSession(id: string): Promise<StudySession | undefined> {
    return this.sessions.get(id);
  }

  async createSession(insertSession: InsertStudySession): Promise<StudySession> {
    const id = `session-${randomUUID()}`;
    const session: StudySession = {
      ...insertSession,
      id,
      createdAt: new Date(),
    };
    this.sessions.set(id, session);
    return session;
  }

  async getAllScheduleItems(): Promise<ScheduleItem[]> {
    return Array.from(this.scheduleItems.values());
  }

  async getScheduleItem(id: string): Promise<ScheduleItem | undefined> {
    return this.scheduleItems.get(id);
  }

  async createScheduleItem(insertItem: InsertScheduleItem): Promise<ScheduleItem> {
    const id = `schedule-${randomUUID()}`;
    const item: ScheduleItem = { ...insertItem, id };
    this.scheduleItems.set(id, item);
    return item;
  }

  async updateScheduleItem(id: string, completed: number): Promise<ScheduleItem | undefined> {
    const item = this.scheduleItems.get(id);
    if (!item) return undefined;

    const updated: ScheduleItem = { ...item, completed };
    this.scheduleItems.set(id, updated);
    return updated;
  }

  async getAllReferences(): Promise<Reference[]> {
    return Array.from(this.references.values());
  }

  async getReference(id: string): Promise<Reference | undefined> {
    return this.references.get(id);
  }

  async createReference(insertReference: InsertReference): Promise<Reference> {
    const id = `ref-${randomUUID()}`;
    const reference: Reference = { ...insertReference, id };
    this.references.set(id, reference);
    return reference;
  }
}

export const storage = new MemStorage();
