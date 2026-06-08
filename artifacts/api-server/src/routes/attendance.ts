import { Router } from "express";
import { db, attendanceTable } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import { getMemberName, getRole, requireLogin } from "../lib/auth";
import ExcelJS from "exceljs";

const router = Router();

const VALID_STATUSES = ["hadir", "izin", "sakit", "alfa"] as const;

function today() {
  return new Date().toISOString().split("T")[0];
}

function isFutureDate(date: string): boolean {
  return date > today();
}

const MEMBERS = [
  "Muhamad Naufal", "Fadhilah Apta Nur Safitri", "Lutfia Tri Rahmacahyani",
  "Navida Fitria", "Miftakhul Jannah", "Vrizcka Aullia Asmara",
  "Quro'atul A'ini", "Dewi Anita Sari", "Tiara Nuril Safitri",
];

function isKetSek(req: any) {
  const role = getRole(req);
  return role === "ketua" || role === "sekretaris";
}

const STATUS_LABELS: Record<string, string> = {
  hadir: "H",
  izin: "I",
  sakit: "S",
  alfa: "A",
};

function excelStyle(s: Partial<ExcelJS.Style>): ExcelJS.Style {
  return s as ExcelJS.Style;
}

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  H: { bg: "DCFAE6", fg: "16A34A" }, // green
  I: { bg: "FFF7E6", fg: "D97706" }, // amber
  S: { bg: "FEF3C7", fg: "B45309" }, // yellow
  A: { bg: "FEE2E2", fg: "DC2626" }, // red
};

const HEADER_BG = "1E3A5F";
const HEADER_FG = "FFFFFF";
const TOTAL_BG = "E8EEF5";

function getWeekDates(start: string, weekIndex: number): string[] {
  const startDate = new Date(start);
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + weekIndex * 7 + i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}

function getWeekLabel(dates: string[]): string {
  const s = new Date(dates[0]).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  const e = new Date(dates[6]).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  return `Week ${s} \u2013 ${e}`;
}

function buildWeekSheet(
  wb: ExcelJS.Workbook,
  name: string,
  rows: { memberName: string; date: string; status: string }[],
  dates: string[],
) {
  const rowsByMember: Record<string, Record<string, string>> = {};
  for (const m of MEMBERS) {
    rowsByMember[m] = {};
    for (const d of dates) rowsByMember[m][d] = "";
  }
  for (const r of rows) {
    if (rowsByMember[r.memberName] && dates.includes(r.date)) {
      rowsByMember[r.memberName][r.date] = STATUS_LABELS[r.status] ?? r.status;
    }
  }

  const ws = wb.addWorksheet(name);

  const dayHeaders = dates.map(d => {
    const day = new Date(d).toLocaleDateString("id-ID", { weekday: "short" });
    const num = new Date(d).getDate();
    return `${day} ${num}`;
  });

  const totalCols = 2 + dates.length + 5; // No, Nama, dates, H, I, S, A, Total

  // Header row
  const headerRow = ws.addRow(["No", "Nama Peserta", ...dayHeaders, "H", "I", "S", "A", "Keterangan"]);
  for (let i = 1; i <= totalCols; i++) {
    const cell = headerRow.getCell(i);
    cell.style = {
      font: { bold: true, color: { argb: HEADER_FG } },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: HEADER_BG } },
      alignment: { horizontal: "center", vertical: "middle" },
      border: {
        top: { style: "thin", color: { argb: "D1D5DB" } },
        bottom: { style: "thin", color: { argb: "D1D5DB" } },
        left: { style: "thin", color: { argb: "D1D5DB" } },
        right: { style: "thin", color: { argb: "D1D5DB" } },
      },
    };
  }
  headerRow.height = 28;

  // Member rows
  for (let i = 0; i < MEMBERS.length; i++) {
    const m = MEMBERS[i];
    const cells = dates.map(d => rowsByMember[m][d] ?? "");
    const hadir = cells.filter(c => c === "H").length;
    const izin = cells.filter(c => c === "I").length;
    const sakit = cells.filter(c => c === "S").length;
    const alfa = cells.filter(c => c === "A").length;
    const total = hadir + izin + sakit + alfa;

    const row = ws.addRow([i + 1, m, ...cells, hadir, izin, sakit, alfa, total]);
    row.height = 22;

    // Number cell
    const numCell = row.getCell(1);
    numCell.value = i + 1;
    numCell.style = { alignment: { horizontal: "center" }, border: {
      top: { style: "thin", color: { argb: "D1D5DB" } },
      bottom: { style: "thin", color: { argb: "D1D5DB" } },
      left: { style: "thin", color: { argb: "D1D5DB" } },
      right: { style: "thin", color: { argb: "D1D5DB" } },
    }};

    // Name cell
    const nameCell = row.getCell(2);
    nameCell.value = m;
    nameCell.style = { border: {
      top: { style: "thin", color: { argb: "D1D5DB" } },
      bottom: { style: "thin", color: { argb: "D1D5DB" } },
      left: { style: "thin", color: { argb: "D1D5DB" } },
      right: { style: "thin", color: { argb: "D1D5DB" } },
    }};

    // Day cells with status color
    for (let j = 0; j < dates.length; j++) {
      const val = cells[j];
      const st = val ? STATUS_STYLES[val] : null;
      const cell = row.getCell(3 + j);
      cell.value = val;
      cell.style = {
        fill: st ? { type: "pattern", pattern: "solid", fgColor: { argb: st.bg } } : undefined,
        font: st ? { color: { argb: st.fg } } : undefined,
        alignment: { horizontal: "center" },
        border: {
          top: { style: "thin", color: { argb: "D1D5DB" } },
          bottom: { style: "thin", color: { argb: "D1D5DB" } },
          left: { style: "thin", color: { argb: "D1D5DB" } },
          right: { style: "thin", color: { argb: "D1D5DB" } },
        },
      };
    }

    // Summary columns
    const summaryStart = 3 + dates.length;
    const summaryStyle = excelStyle({ alignment: { horizontal: "center" }, border: {
      top: { style: "thin", color: { argb: "D1D5DB" } },
      bottom: { style: "thin", color: { argb: "D1D5DB" } },
      left: { style: "thin", color: { argb: "D1D5DB" } },
      right: { style: "thin", color: { argb: "D1D5DB" } },
    }});
    const hCell = row.getCell(summaryStart); hCell.value = hadir; hCell.style = summaryStyle;
    const iCell = row.getCell(summaryStart + 1); iCell.value = izin; iCell.style = summaryStyle;
    const sCell = row.getCell(summaryStart + 2); sCell.value = sakit; sCell.style = summaryStyle;
    const aCell = row.getCell(summaryStart + 3); aCell.value = alfa; aCell.style = summaryStyle;
    const tCell = row.getCell(summaryStart + 4); tCell.value = total;
    tCell.style = excelStyle({ font: { bold: true }, alignment: { horizontal: "center" }, border: {
      top: { style: "thin", color: { argb: "D1D5DB" } },
      bottom: { style: "thin", color: { argb: "D1D5DB" } },
      left: { style: "thin", color: { argb: "D1D5DB" } },
      right: { style: "thin", color: { argb: "D1D5DB" } },
    }});
  }

  // Totals row
  const totalRow = ws.addRow(["", "TOTAL"]);
  totalRow.height = 24;

  const totalStyle = (_value: unknown): ExcelJS.Style => excelStyle({
    font: { bold: true },
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: TOTAL_BG } },
    alignment: { horizontal: "center" },
    border: {
      top: { style: "thin", color: { argb: "D1D5DB" } },
      bottom: { style: "thin", color: { argb: "D1D5DB" } },
      left: { style: "thin", color: { argb: "D1D5DB" } },
      right: { style: "thin", color: { argb: "D1D5DB" } },
    },
  });

  const totalCell1 = totalRow.getCell(1); totalCell1.value = ""; totalCell1.style = totalStyle("");
  const totalCell2 = totalRow.getCell(2); totalCell2.value = "TOTAL"; totalCell2.style = totalStyle("TOTAL");

  for (let j = 0; j < dates.length; j++) {
    const d = dates[j];
    let dayHadir = 0;
    for (const m of MEMBERS) {
      if (rowsByMember[m][d] === "H") dayHadir++;
    }
    const cell = totalRow.getCell(3 + j);
    cell.value = dayHadir;
    cell.style = totalStyle(dayHadir);
  }

  let totalHadir = 0, totalIzin = 0, totalSakit = 0, totalAlfa = 0, totalAll = 0;
  for (let i = 0; i < MEMBERS.length; i++) {
    const row = ws.getRow(i + 2); // skip header
    totalHadir += Number(row.getCell(3 + dates.length).value ?? 0);
    totalIzin += Number(row.getCell(4 + dates.length).value ?? 0);
    totalSakit += Number(row.getCell(5 + dates.length).value ?? 0);
    totalAlfa += Number(row.getCell(6 + dates.length).value ?? 0);
    totalAll += Number(row.getCell(7 + dates.length).value ?? 0);
  }

  const tH = totalRow.getCell(3 + dates.length); tH.value = totalHadir; tH.style = totalStyle(totalHadir);
  const tI = totalRow.getCell(4 + dates.length); tI.value = totalIzin; tI.style = totalStyle(totalIzin);
  const tS = totalRow.getCell(5 + dates.length); tS.value = totalSakit; tS.style = totalStyle(totalSakit);
  const tA = totalRow.getCell(6 + dates.length); tA.value = totalAlfa; tA.style = totalStyle(totalAlfa);
  const tT = totalRow.getCell(7 + dates.length); tT.value = totalAll; tT.style = totalStyle(totalAll);

  // Set column widths
  ws.getColumn(1).width = 4;  // No
  ws.getColumn(2).width = 28; // Nama
  for (let j = 0; j < dates.length; j++) {
    ws.getColumn(3 + j).width = 8;
  }
  const summaryStart = 3 + dates.length;
  ws.getColumn(summaryStart).width = 6;
  ws.getColumn(summaryStart + 1).width = 6;
  ws.getColumn(summaryStart + 2).width = 6;
  ws.getColumn(summaryStart + 3).width = 6;
  ws.getColumn(summaryStart + 4).width = 8;

  // Freeze header + freeze nama column
  ws.views = [{ state: "frozen", xSplit: 2, ySplit: 1 }];
}

// GET /attendance?date=YYYY-MM-DD \u2014 list attendance, optionally filter by date
router.get("/attendance", async (req, res) => {
  try {
    const dateFilter = typeof req.query.date === "string" ? req.query.date : null;
    if (dateFilter && isFutureDate(dateFilter)) {
      res.status(400).json({ error: "Tidak dapat melihat presensi untuk tanggal di masa depan" });
      return;
    }
    const rows = await db.select().from(attendanceTable).orderBy(attendanceTable.date, attendanceTable.memberName);
    const filtered = dateFilter ? rows.filter(r => r.date === dateFilter) : rows;
    res.json(filtered.map(r => ({ ...r, createdAt: r.createdAt.toISOString() })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /attendance \u2014 create or upsert attendance record
router.post("/attendance", requireLogin, async (req, res) => {
  const { memberName, date, status, notes } = req.body;
  if (!memberName || !date || !status) {
    res.status(400).json({ error: "memberName, date, dan status wajib diisi" }); return;
  }
  if (isFutureDate(date)) {
    res.status(400).json({ error: "Tidak dapat mengisi presensi untuk tanggal di masa depan" }); return;
  }
  if (!VALID_STATUSES.includes(status)) {
    res.status(400).json({ error: `status harus salah satu dari: ${VALID_STATUSES.join(", ")}` }); return;
  }
  const self = getMemberName(req);
  if (self !== memberName && !isKetSek(req)) {
    res.status(403).json({ error: "Hanya bisa mengisi absensi diri sendiri" }); return;
  }

  try {
    const existing = await db.select().from(attendanceTable)
      .where(and(eq(attendanceTable.memberName, memberName), eq(attendanceTable.date, date)));
    let row;
    if (existing.length) {
      [row] = await db.update(attendanceTable).set({ status, notes: notes ?? null })
        .where(eq(attendanceTable.id, existing[0].id)).returning();
    } else {
      [row] = await db.insert(attendanceTable).values({ memberName, date, status, notes: notes ?? null }).returning();
    }
    res.status(201).json({ ...row, createdAt: row.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PATCH /attendance/:id \u2014 update attendance record (self or ketua/sekretaris)
router.patch("/attendance/:id", requireLogin, async (req, res) => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "ID tidak valid" }); return; }

  const existing = await db.select().from(attendanceTable).where(eq(attendanceTable.id, id));
  if (!existing.length) { res.status(404).json({ error: "Tidak ditemukan" }); return; }

  const self = getMemberName(req);
  if (self !== existing[0].memberName && !isKetSek(req)) {
    res.status(403).json({ error: "Akses ditolak" }); return;
  }

  const { status, notes } = req.body;
  if (status && !VALID_STATUSES.includes(status)) {
    res.status(400).json({ error: `status harus salah satu dari: ${VALID_STATUSES.join(", ")}` }); return;
  }

  try {
    const upd: Record<string, any> = {};
    if (status) upd.status = status;
    if (notes !== undefined) upd.notes = notes ?? null;
    const [row] = await db.update(attendanceTable).set(upd).where(eq(attendanceTable.id, id)).returning();
    res.json({ ...row, createdAt: row.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /attendance/:id \u2014 ketua/sekretaris only
router.delete("/attendance/:id", requireLogin, async (req, res) => {
  if (!isKetSek(req)) {
    res.status(403).json({ error: "Hanya ketua/sekretaris yang dapat menghapus absensi" }); return;
  }
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "ID tidak valid" }); return; }

  try {
    await db.delete(attendanceTable).where(eq(attendanceTable.id, id));
    res.status(204).end();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /attendance/export \u2014 export all attendance records as multi-week Excel workbook (ketua/sekretaris only)
router.get("/attendance/export", requireLogin, async (req, res) => {
  try {
    if (!isKetSek(req)) {
      res.status(403).json({ error: "Hanya ketua/sekretaris yang dapat mengunduh laporan absensi" }); return;
    }

    const rows = await db.select().from(attendanceTable).orderBy(attendanceTable.date, attendanceTable.memberName);
    const startDate = typeof req.query.start === "string" ? req.query.start : "2026-06-15";
    const weekCount = typeof req.query.weeks === "string" ? parseInt(req.query.weeks, 10) : 7;
    const validWeeks = Number.isNaN(weekCount) || weekCount < 1 ? 7 : Math.min(weekCount, 52);

    const wb = new ExcelJS.Workbook();
    const flatRows = rows.map(r => ({ memberName: r.memberName, date: r.date, status: r.status }));

    for (let w = 0; w < validWeeks; w++) {
      const dates = getWeekDates(startDate, w);
      buildWeekSheet(wb, getWeekLabel(dates), flatRows, dates);
    }

    const buf = await wb.xlsx.writeBuffer();
    res.setHeader("Content-Disposition", `attachment; filename="absensi-kkn-${startDate}.xlsx"`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(Buffer.from(buf));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
