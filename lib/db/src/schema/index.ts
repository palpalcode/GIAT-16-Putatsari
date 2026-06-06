import { pgTable, serial, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const announcementsTable = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  priority: text("priority").notNull().default("medium"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAnnouncementSchema = createInsertSchema(announcementsTable).omit({ id: true, createdAt: true });
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type Announcement = typeof announcementsTable.$inferSelect;

export const cookingSchedulesTable = pgTable("cooking_schedules", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(),
  persons: jsonb("persons").notNull().$type<string[]>(),
  menu: text("menu"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCookingScheduleSchema = createInsertSchema(cookingSchedulesTable).omit({ id: true, createdAt: true });
export type InsertCookingSchedule = z.infer<typeof insertCookingScheduleSchema>;
export type CookingSchedule = typeof cookingSchedulesTable.$inferSelect;

export const cleaningSchedulesTable = pgTable("cleaning_schedules", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(),
  persons: jsonb("persons").notNull().$type<string[]>(),
  area: text("area"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCleaningScheduleSchema = createInsertSchema(cleaningSchedulesTable).omit({ id: true, createdAt: true });
export type InsertCleaningSchedule = z.infer<typeof insertCleaningScheduleSchema>;
export type CleaningSchedule = typeof cleaningSchedulesTable.$inferSelect;

export const programSchedulesTable = pgTable("program_schedules", {
  id: serial("id").primaryKey(),
  programName: text("program_name").notNull(),
  date: text("date").notNull(),
  leader: text("leader").notNull(),
  members: jsonb("members").notNull().$type<string[]>(),
  status: text("status").notNull().default("planned"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertProgramScheduleSchema = createInsertSchema(programSchedulesTable).omit({ id: true, createdAt: true });
export type InsertProgramSchedule = z.infer<typeof insertProgramScheduleSchema>;
export type ProgramSchedule = typeof programSchedulesTable.$inferSelect;

export const inventoryTable = pgTable("inventory", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  quantity: integer("quantity").notNull().default(0),
  unit: text("unit").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertInventorySchema = createInsertSchema(inventoryTable).omit({ id: true, createdAt: true });
export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type Inventory = typeof inventoryTable.$inferSelect;

export const deadlinesTable = pgTable("deadlines", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull(),
  dueDate: text("due_date").notNull(),
  status: text("status").notNull().default("pending"),
  assignedTo: jsonb("assigned_to").notNull().$type<string[]>(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertDeadlineSchema = createInsertSchema(deadlinesTable).omit({ id: true, createdAt: true });
export type InsertDeadline = z.infer<typeof insertDeadlineSchema>;
export type Deadline = typeof deadlinesTable.$inferSelect;

export const complaintsTable = pgTable("complaints", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  reportedBy: text("reported_by").notNull(),
  status: text("status").notNull().default("open"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertComplaintSchema = createInsertSchema(complaintsTable).omit({ id: true, createdAt: true });
export type InsertComplaint = z.infer<typeof insertComplaintSchema>;
export type Complaint = typeof complaintsTable.$inferSelect;

export const issuesTable = pgTable("issues", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  priority: text("priority").notNull().default("medium"),
  status: text("status").notNull().default("open"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertIssueSchema = createInsertSchema(issuesTable).omit({ id: true, createdAt: true });
export type InsertIssue = z.infer<typeof insertIssueSchema>;
export type Issue = typeof issuesTable.$inferSelect;

export const templatesTable = pgTable("templates", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTemplateSchema = createInsertSchema(templatesTable).omit({ id: true, createdAt: true });
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type Template = typeof templatesTable.$inferSelect;
