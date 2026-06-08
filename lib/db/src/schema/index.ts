import { pgTable, serial, text, integer, timestamp, jsonb, boolean, uniqueIndex } from "drizzle-orm/pg-core";
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
  itemType: text("item_type").notNull().default("kelompok"), // kelompok | pribadi
  ownerName: text("owner_name"), // pribadi: pemilik; kelompok: opsional
  ownerLabel: text("owner_label"), // kelompok: "Milik Bersama" | nama anggota
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

export const kasTable = pgTable("kas", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  amount: integer("amount").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull().default("lainnya"),
  date: text("date").notNull(),
  notes: text("notes"),
  fund: text("fund").notNull().default("umum"), // umum | darurat | iuran_makan | proker
  prokerId: integer("proker_id"), // nullable, FK to proker_funds
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertKasSchema = createInsertSchema(kasTable).omit({ id: true, createdAt: true });
export type InsertKas = z.infer<typeof insertKasSchema>;
export type Kas = typeof kasTable.$inferSelect;

export const kasItemsTable = pgTable("kas_items", {
  id: serial("id").primaryKey(),
  kasId: integer("kas_id").notNull().references(() => kasTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  amount: integer("amount").notNull(),
});

export const insertKasItemSchema = createInsertSchema(kasItemsTable).omit({ id: true });
export type InsertKasItem = z.infer<typeof insertKasItemSchema>;
export type KasItem = typeof kasItemsTable.$inferSelect;

export const kasConfigTable = pgTable("kas_config", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export type KasConfig = typeof kasConfigTable.$inferSelect;

export const prokerFundsTable = pgTable("proker_funds", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  budget: integer("budget").notNull().default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertProkerFundSchema = createInsertSchema(prokerFundsTable).omit({ id: true, createdAt: true });
export type InsertProkerFund = z.infer<typeof insertProkerFundSchema>;
export type ProkerFund = typeof prokerFundsTable.$inferSelect;

export const notulensiTable = pgTable("notulensi", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  meetingDate: text("meeting_date").notNull(),
  attendees: jsonb("attendees").notNull().$type<string[]>(),
  agenda: text("agenda"),
  content: text("content").notNull(),
  author: text("author").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertNotulensiSchema = createInsertSchema(notulensiTable).omit({ id: true, createdAt: true });
export type InsertNotulensi = z.infer<typeof insertNotulensiSchema>;
export type Notulensi = typeof notulensiTable.$inferSelect;

export const permissionsTable = pgTable("permissions", {
  id: serial("id").primaryKey(),
  role: text("role").notNull(),
  resource: text("resource").notNull(),
  canEdit: boolean("can_edit").notNull().default(false),
});

export const insertPermissionSchema = createInsertSchema(permissionsTable).omit({ id: true });
export type InsertPermission = z.infer<typeof insertPermissionSchema>;
export type Permission = typeof permissionsTable.$inferSelect;

export const membersTable = pgTable(
  "members",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    systemRole: text("system_role").notNull().default("anggota"),
    divisionRole: text("division_role").notNull(),
    passwordHash: text("password_hash").notNull(),
    avatarUrl: text("avatar_url"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("members_name_unique").on(t.name)],
);

export const insertMemberSchema = createInsertSchema(membersTable).omit({ id: true, createdAt: true });
export type InsertMember = z.infer<typeof insertMemberSchema>;
export type Member = typeof membersTable.$inferSelect;

export const memberConditionsTable = pgTable("member_conditions", {
  id: serial("id").primaryKey(),
  memberName: text("member_name").notNull(),
  type: text("type").notNull(), // alergi | kondisi | fobia | catatan
  description: text("description").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertMemberConditionSchema = createInsertSchema(memberConditionsTable).omit({ id: true, createdAt: true });
export type InsertMemberCondition = z.infer<typeof insertMemberConditionSchema>;
export type MemberCondition = typeof memberConditionsTable.$inferSelect;

export const attendanceTable = pgTable(
  "attendance",
  {
    id: serial("id").primaryKey(),
    memberName: text("member_name").notNull(),
    date: text("date").notNull(),
    status: text("status").notNull().default("hadir"), // hadir | izin | sakit | alfa
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("attendance_member_date_unique").on(t.memberName, t.date)],
);

export const insertAttendanceSchema = createInsertSchema(attendanceTable).omit({ id: true, createdAt: true });
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type Attendance = typeof attendanceTable.$inferSelect;
