import { Router } from "express";
import { db } from "@workspace/db";
import {
  announcementsTable,
  deadlinesTable,
  issuesTable,
  complaintsTable,
  cookingSchedulesTable,
  cleaningSchedulesTable,
  programSchedulesTable,
  inventoryTable,
  attendanceTable,
} from "@workspace/db";
import { desc, eq } from "drizzle-orm";

const router = Router();

router.get("/dashboard/summary", async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const [announcements, deadlines, issues, complaints, cooking, cleaning, programs, inventory, todayAttendance] =
      await Promise.all([
        db.select().from(announcementsTable).orderBy(desc(announcementsTable.createdAt)),
        db.select().from(deadlinesTable).orderBy(deadlinesTable.dueDate),
        db.select().from(issuesTable),
        db.select().from(complaintsTable),
        db.select().from(cookingSchedulesTable).orderBy(cookingSchedulesTable.date),
        db.select().from(cleaningSchedulesTable).orderBy(cleaningSchedulesTable.date),
        db.select().from(programSchedulesTable),
        db.select().from(inventoryTable),
        db.select().from(attendanceTable).where(eq(attendanceTable.date, today!)),
      ]);

    const upcomingDeadlines = deadlines.filter(d => d.status === "pending" && d.dueDate >= today!).length;
    const openIssues = issues.filter(i => i.status !== "resolved").length;
    const openComplaints = complaints.filter(c => c.status === "open").length;
    const ongoingPrograms = programs.filter(p => p.status === "ongoing").length;

    const todayCookingRow = cooking.find(c => c.date === today);
    const todayCleaningRow = cleaning.find(c => c.date === today);

    const todayCooking = todayCookingRow ? (todayCookingRow.persons as string[]) : null;
    const todayCleaning = todayCleaningRow ? (todayCleaningRow.persons as string[]) : null;

    const recentAnnouncements = announcements.slice(0, 3).map(r => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    }));

    const urgentDeadlines = deadlines
      .filter(d => d.status === "pending" && d.dueDate >= today!)
      .slice(0, 3)
      .map(r => ({ ...r, createdAt: r.createdAt.toISOString() }));

    const presentToday = todayAttendance.filter(a => a.status === "hadir").length;
    const absentToday = todayAttendance.filter(a => a.status !== "hadir").length;
    const attendanceSummary = {
      hadir: todayAttendance.filter(a => a.status === "hadir").length,
      izin: todayAttendance.filter(a => a.status === "izin").length,
      sakit: todayAttendance.filter(a => a.status === "sakit").length,
      alfa: todayAttendance.filter(a => a.status === "alfa").length,
    };

    res.json({
      totalAnnouncements: announcements.length,
      upcomingDeadlines,
      openIssues,
      openComplaints,
      todayCooking,
      todayCleaning,
      ongoingPrograms,
      totalInventoryItems: inventory.length,
      recentAnnouncements,
      urgentDeadlines,
      presentToday,
      absentToday,
      attendanceSummary,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
