import { Router } from "express";
import { db, attendanceTable } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import { getMemberName, getRole, requireLogin } from "../lib/auth";
import ExcelJS from "exceljs";

const router = Router();

const VALID_STATUSES = ["hadir", "izin", "sakit", "alfa"] as const;

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
  return `Week ${s} – ${e}`;
}

function setColWidth(ws: ExcelJS.Worksheet, col: string, value: string) {
  const current = ws.getColumn(col).width ?? 8;
  const needed = Math.max(current, value.length + 2);
  ws.getColumn(col).width = needed;
}

function fillCell(row: ExcelJS.Row, col: number, value: string | number, options?: {
  bold?: boolean; bg?: string; fg?: string; align?: ExcelJS.Alignment;
  border?: boolean;
}) {
  const cell = row.getCell(col);
  cell.value = value as any;
  const opt: ExcelJS.Style = {};
  if (options?.bold) opt.font = { bold: true, color: { argb: options?.fg ? options.fg : "000000" } };
  else if (options?.fg) opt.font = { color: { argb: options.fg } };
  if (options?.bg) opt.fill = { type: "pattern", pattern: "solid", fgColor: { argb: options.bg } };
  if (options?.align) opt.alignment = options.align;
  if (options?.border) {
    opt.border = {
      top: { style: "thin", color: { argb: "D1D5DB" } },
      bottom: { style: "thin", color: { argb: "D1D5DB" } },
      left: { style: "thin", color: { argb: "D1D5DB" } },
      right: { style: "thin", color: { argb: "D1D5DB" } },
    };
  }
  if (Object.keys(opt).length) cell.style = opt;
}

function buildWeekWorksheet(rows: { memberName: string; date: string; status: string }[], dates: string[]): ExcelJS.Worksheet {
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

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet();

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
    fillCell(row, 1, i + 1, { align: { horizontal: "center" }, border: true });
    // Name cell
    fillCell(row, 2, m, { border: true });

    // Day cells with status color
    for (let j = 0; j < dates.length; j++) {
      const val = cells[j];
      const style = val ? STATUS_STYLES[val] : null;
      fillCell(row, 3 + j, val, {
        bg: style?.bg,
        fg: style?.fg,
        align: { horizontal: "center" },
        border: true,
      });
    }

    // Summary columns
    fillCell(row, 3 + dates.length, hadir, { align: { horizontal: "center" }, border: true });
    fillCell(row, 4 + dates.length, izin, { align: { horizontal: "center" }, border: true });
    fillCell(row, 5 + dates.length, sakit, { align: { horizontal: "center" }, border: true });
    fillCell(row, 6 + dates.length, alfa, { align: { horizontal: "center" }, border: true });
    fillCell(row, 7 + dates.length, total, { align: { horizontal: "center" }, border: true, bold: true });
  }

  // Totals row
  const totalRow = ws.addRow(["", "TOTAL"]);
  totalRow.height = 24;
  fillCell(totalRow, 1, "", { bold: true, bg: TOTAL_BG, border: true });
  fillCell(totalRow, 2, "TOTAL", { bold: true, bg: TOTAL_BG, border: true });

  for (let j = 0; j < dates.length; j++) {
    const d = dates[j];
    let dayHadir = 0;
    for (const m of MEMBERS) {
      if (rowsByMember[m][d] === "H") dayHadir++;
    }
    fillCell(totalRow, 3 + j, dayHadir, { bold: true, bg: TOTAL_BG, align: { horizontal: "center" }, border: true });
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
  fillCell(totalRow, 3 + dates.length, totalHadir, { bold: true, bg: TOTAL_BG, align: { horizontal: "center" }, border: true });
  fillCell(totalRow, 4 + dates.length, totalIzin, { bold: true, bg: TOTAL_BG, align: { horizontal: "center" }, border: true });
  fillCell(totalRow, 5 + dates.length, totalSakit, { bold: true, bg: TOTAL_BG, align: { horizontal: "center" }, border: true });
  fillCell(totalRow, 6 + dates.length, totalAlfa, { bold: true, bg: TOTAL_BG, align: { horizontal: "center" }, border: true });
  fillCell(totalRow, 7 + dates.length, totalAll, { bold: true, bg: TOTAL_BG, align: { horizontal: "center" }, border: true });

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

  return ws;
}

// GET /attendance?date=YYYY-MM-DD — list attendance, optionally filter by date
router.get("/attendance", async (req, res) => {
  try {
    const rows = await db.select().from(attendanceTable).orderBy(attendanceTable.date, attendanceTable.memberName);
    const dateFilter = typeof req.query.date === "string" ? req.query.date : null;
    const filtered = dateFilter ? rows.filter(r => r.date === dateFilter) : rows;
    res.json(filtered.map(r => ({ ...r, createdAt: r.createdAt.toISOString() })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /attendance — create or upsert attendance record
router.post("/attendance", requireLogin, async (req, res) => {
  const { memberName, date, status, notes } = req.body;
  if (!memberName || !date || !status) {
    res.status(400).json({ error: "memberName, date, dan status wajib diisi" }); return;
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

// PATCH /attendance/:id — update attendance record (self or ketua/sekretaris)
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

// DELETE /attendance/:id — ketua/sekretaris only
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

// GET /attendance/export — export all attendance records as multi-week Excel workbook
router.get("/attendance/export", async (req, res) => {
  try {
    const rows = await db.select().from(attendanceTable).orderBy(attendanceTable.date, attendanceTable.memberName);
    const startDate = typeof req.query.start === "string" ? req.query.start : "2026-06-15";
    const weekCount = typeof req.query.weeks === "string" ? parseInt(req.query.weeks, 10) : 7;
    const validWeeks = Number.isNaN(weekCount) || weekCount < 1 ? 7 : Math.min(weekCount, 52);

    const wb = new ExcelJS.Workbook();
    const flatRows = rows.map(r => ({ memberName: r.memberName, date: r.date, status: r.status }));

    for (let w = 0; w < validWeeks; w++) {
      const dates = getWeekDates(startDate, w);
      const ws = buildWeekWorksheet(flatRows, dates);
      ws.name = getWeekLabel(dates);
      wb.addWorksheet(getWeekLabel(dates));
      // Copy from temporary worksheet to new one
      const targetWs = wb.getWorksheet(getWeekLabel(dates))!;
      // Copy rows
      ws.eachRow((row, rowNumber) => {
        const targetRow = targetWs.getRow(rowNumber);
        row.eachCell((cell, colNumber) => {
          const targetCell = targetRow.getCell(colNumber);
          targetCell.value = cell.value;
          targetCell.style = { ...cell.style };
        });
        targetRow.height = row.height;
      });
      // Copy columns
      ws.columns.forEach((col, i) => {
        if (col) {
          targetWs.getColumn(i + 1).width = col.width;
        }
      });
      targetWs.views = ws.views;
      wb.removeWorksheet(ws.id);
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
