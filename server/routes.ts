import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertStudySessionSchema, updateTopicSchema } from "@shared/schema";
import { promises as fs } from "fs";
import path from "path";

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

async function seedDataFromCSVs() {
  try {
    // Check if data already exists
    const existingTopics = await storage.getAllTopics();
    const existingSchedule = await storage.getAllScheduleItems();
    
    // Check if schedule needs sortOrder migration (has items but sortOrder is null/undefined)
    // Note: sortOrder can be 0 (first item), so we only check for null/undefined
    const needsScheduleReseed = existingSchedule.length > 0 && 
      existingSchedule.some(item => item.sortOrder === undefined || item.sortOrder === null);
    
    if (existingTopics.length > 0 && !needsScheduleReseed) {
      console.log("✓ Data already seeded, skipping...");
      return;
    }

    if (needsScheduleReseed) {
      console.log("Reseeding schedule with sortOrder...");
      await storage.deleteAllScheduleItems();
    }

    const topicsPath = path.join(process.cwd(), "attached_assets", "Topics_1762504447673.csv");
    const schedulePath = path.join(process.cwd(), "attached_assets", "Schedule_1762504447672.csv");
    const referencesPath = path.join(process.cwd(), "attached_assets", "References_1762504447672.csv");

    const topicsData = await fs.readFile(topicsPath, "utf-8");
    const scheduleData = await fs.readFile(schedulePath, "utf-8");
    const referencesData = await fs.readFile(referencesPath, "utf-8");

    if (existingTopics.length === 0) {
      console.log("Seeding topics...");
      const topicsLines = topicsData.split("\n").slice(1).filter(Boolean);
      for (const line of topicsLines) {
        const parts = parseCSVLine(line);
        if (parts.length >= 3 && parts[0] && parts[1] && parts[2]) {
          await storage.createTopic({
            number: parseInt(parts[0]),
            subject: parts[1],
            topic: parts[2],
            completed: 0,
            confidence: 0,
          });
        }
      }
    }

    if (existingSchedule.length === 0 || needsScheduleReseed) {
      console.log("Seeding schedule...");
      const scheduleLines = scheduleData.split("\n").slice(1).filter(Boolean);
      let sortOrder = 0;
      for (const line of scheduleLines) {
        const parts = parseCSVLine(line);
        if (parts.length >= 4 && parts[0] && parts[1] && parts[2] && parts[3]) {
          await storage.createScheduleItem({
            week: parseInt(parts[0]),
            date: parts[1],
            topicsToCover: parts[2],
            studyType: parts[3],
            studyHours: parts[4] || "",
            completed: 0,
            sortOrder: sortOrder++,
          });
        }
      }
    }

    const existingReferences = await storage.getAllReferences();
    if (existingReferences.length === 0) {
      console.log("Seeding references...");
      const referencesLines = referencesData.split("\n").slice(1).filter(Boolean);
      for (const line of referencesLines) {
        const parts = parseCSVLine(line);
        if (parts.length >= 5 && parts[0] && parts[1] && parts[2] && parts[3] && parts[4]) {
          await storage.createReference({
            syllabusSection: parts[0],
            topic: parts[1],
            resourceType: parts[2],
            titleDescription: parts[3],
            url: parts[4],
          });
        }
      }
    }

    console.log("✓ Seeded data from CSV files successfully");
  } catch (error) {
    console.error("Error seeding data:", error);
    throw error;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  await seedDataFromCSVs();

  // Development only - endpoint to clear and reseed schedule
  if (process.env.NODE_ENV === "development") {
    app.post("/api/dev/reseed-schedule", async (req, res) => {
      try {
        // Clear schedule items
        await storage.deleteAllScheduleItems();
        
        // Re-seed schedule with proper sortOrder
        const schedulePath = path.join(process.cwd(), "attached_assets", "Schedule_1762504447672.csv");
        const scheduleData = await fs.readFile(schedulePath, "utf-8");
        
        const scheduleLines = scheduleData.split("\n").slice(1).filter(Boolean);
        let sortOrder = 0;
        for (const line of scheduleLines) {
          const parts = parseCSVLine(line);
          if (parts.length >= 4 && parts[0] && parts[1] && parts[2] && parts[3]) {
            await storage.createScheduleItem({
              week: parseInt(parts[0]),
              date: parts[1],
              topicsToCover: parts[2],
              studyType: parts[3],
              studyHours: parts[4] || "",
              completed: 0,
              sortOrder: sortOrder++,
            });
          }
        }
        
        res.json({ message: "Schedule reseeded successfully" });
      } catch (error) {
        console.error("Reseed error:", error);
        res.status(500).json({ error: "Failed to reseed schedule" });
      }
    });
  }

  app.get("/api/topics", async (req, res) => {
    try {
      const topics = await storage.getAllTopics();
      res.json(topics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch topics" });
    }
  });

  app.get("/api/topics/:id", async (req, res) => {
    try {
      const topic = await storage.getTopic(req.params.id);
      if (!topic) {
        return res.status(404).json({ error: "Topic not found" });
      }
      res.json(topic);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch topic" });
    }
  });

  app.patch("/api/topics/:id", async (req, res) => {
    try {
      const validation = updateTopicSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error });
      }

      const updated = await storage.updateTopic(req.params.id, validation.data);
      if (!updated) {
        return res.status(404).json({ error: "Topic not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update topic" });
    }
  });

  app.get("/api/sessions", async (req, res) => {
    try {
      const sessions = await storage.getAllSessions();
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sessions" });
    }
  });

  app.post("/api/sessions", async (req, res) => {
    try {
      const validation = insertStudySessionSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error });
      }

      const session = await storage.createSession(validation.data);
      res.status(201).json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to create session" });
    }
  });

  app.delete("/api/sessions/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteSession(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json({ message: "Session deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete session" });
    }
  });

  app.get("/api/schedule", async (req, res) => {
    try {
      const items = await storage.getAllScheduleItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch schedule" });
    }
  });

  app.patch("/api/schedule/:id", async (req, res) => {
    try {
      const { completed } = req.body;
      if (typeof completed !== "number") {
        return res.status(400).json({ error: "Invalid completed value" });
      }

      const updated = await storage.updateScheduleItem(req.params.id, completed);
      if (!updated) {
        return res.status(404).json({ error: "Schedule item not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update schedule item" });
    }
  });

  app.get("/api/references", async (req, res) => {
    try {
      const references = await storage.getAllReferences();
      res.json(references);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch references" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
