import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const topics = pgTable("topics", {
  id: varchar("id").primaryKey(),
  number: integer("number").notNull(),
  subject: text("subject").notNull(),
  topic: text("topic").notNull(),
  completed: integer("completed").notNull().default(0),
  confidence: integer("confidence").notNull().default(0),
});

export const studySessions = pgTable("study_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: text("date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time"),
  duration: integer("duration").notNull().default(0),
  topicId: varchar("topic_id"),
  subject: text("subject"),
  notes: text("notes"),
  imageProof: text("image_proof"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const scheduleItems = pgTable("schedule_items", {
  id: varchar("id").primaryKey(),
  week: integer("week").notNull(),
  date: text("date").notNull(),
  topicsToCover: text("topics_to_cover").notNull(),
  studyType: text("study_type").notNull(),
  studyHours: text("study_hours").notNull(),
  completed: integer("completed").notNull().default(0),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const references = pgTable("references", {
  id: varchar("id").primaryKey(),
  syllabusSection: text("syllabus_section").notNull(),
  topic: text("topic").notNull(),
  resourceType: text("resource_type").notNull(),
  titleDescription: text("title_description").notNull(),
  url: text("url").notNull(),
});

export const insertTopicSchema = createInsertSchema(topics).omit({ id: true });
export const insertStudySessionSchema = createInsertSchema(studySessions).omit({ id: true, createdAt: true });
export const insertScheduleItemSchema = createInsertSchema(scheduleItems).omit({ id: true });
export const insertReferenceSchema = createInsertSchema(references).omit({ id: true });

export type InsertTopic = z.infer<typeof insertTopicSchema>;
export type Topic = typeof topics.$inferSelect;

export type InsertStudySession = z.infer<typeof insertStudySessionSchema>;
export type StudySession = typeof studySessions.$inferSelect;

export type InsertScheduleItem = z.infer<typeof insertScheduleItemSchema>;
export type ScheduleItem = typeof scheduleItems.$inferSelect;

export type InsertReference = z.infer<typeof insertReferenceSchema>;
export type Reference = typeof references.$inferSelect;

export const updateTopicSchema = z.object({
  completed: z.number().min(0).max(1),
  confidence: z.number().min(0).max(100),
});

export type UpdateTopic = z.infer<typeof updateTopicSchema>;
