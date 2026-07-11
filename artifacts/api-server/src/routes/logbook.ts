import { Router } from "express";
import multer from "multer";
import { db } from "@workspace/db";
import { logbookEntriesTable, logbookPhotosTable, programSchedulesTable } from "@workspace/db";
import { eq, desc, inArray, and, gte, lte } from "drizzle-orm";
import { requireKetSek, requireLogin } from "../lib/auth";
import {
  CreateLogbookEntryBody,
  UpdateLogbookEntryBody,
} from "@workspace/api-zod";
import { ObjectStorageService } from "../lib/objectStorage";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  HeadingLevel,
} from "docx";
import PDFDocument from "pdfkit";

const router = Router();
const objectStorageService = new ObjectStorageService();

const ALLOWED_MIMES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
const MAX_BYTES = 10 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIMES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("INVALID_TYPE"));
    }
  },
});

async function deleteFromStorage(storageKey: string, log: { warn: (...args: any[]) => void }): Promise<void> {
  try {
    await objectStorageService.deleteObjectEntity(storageKey);
  } catch (err) {
    log.warn({ err, storageKey }, "Failed to delete object from storage (non-fatal)");
  }
}

function mapPhoto(p: any) {
  return { ...p, url: `/api/storage${p.storageKey}`, createdAt: p.createdAt.toISOString() };
}

function mapEntry(row: any, photos: any[]) {
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
    photos: photos.map(mapPhoto),
  };
}

function formatTanggalId(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

function safeDateRangeLabel(dateFrom?: string, dateTo?: string): string {
  if (dateFrom && dateTo) return `${dateFrom}_sd_${dateTo}`;
  if (dateFrom) return `mulai_${dateFrom}`;
  if (dateTo) return `sd_${dateTo}`;
  return "semua";
}

// GET /logbook?programId=
router.get("/logbook", async (req, res) => {
  try {
    const programId = Number(req.query["programId"]);
    if (!programId) {
      res.status(400).json({ error: "programId diperlukan" });
      return;
    }
    const entries = await db
      .select()
      .from(logbookEntriesTable)
      .where(eq(logbookEntriesTable.programId, programId))
      .orderBy(desc(logbookEntriesTable.tanggal));

    if (entries.length === 0) {
      res.json([]);
      return;
    }

    const entryIds = entries.map((e) => e.id);
    const photos = await db
      .select()
      .from(logbookPhotosTable)
      .where(inArray(logbookPhotosTable.logbookEntryId, entryIds));

    const photosByEntry = new Map<number, typeof photos>();
    for (const p of photos) {
      const arr = photosByEntry.get(p.logbookEntryId) ?? [];
      arr.push(p);
      photosByEntry.set(p.logbookEntryId, arr);
    }

    res.json(entries.map((e) => mapEntry(e, photosByEntry.get(e.id) ?? [])));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /logbook
router.post("/logbook", requireKetSek, async (req, res) => {
  try {
    const parsed = CreateLogbookEntryBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Data tidak valid", details: parsed.error.flatten() });
      return;
    }
    const { programId, tanggal, kegiatan, lokasi, peserta, sasaran, hasilKegiatan, kendala, tindakLanjut, penanggungjawab } = parsed.data;
    const [row] = await db
      .insert(logbookEntriesTable)
      .values({ programId, tanggal, kegiatan, lokasi, peserta: peserta ?? [], sasaran, hasilKegiatan, kendala, tindakLanjut, penanggungjawab })
      .returning();
    res.status(201).json(mapEntry(row, []));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PATCH /logbook/:id
router.patch("/logbook/:id", requireKetSek, async (req, res) => {
  try {
    const id = Number(req.params["id"]);
    const parsed = UpdateLogbookEntryBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Data tidak valid", details: parsed.error.flatten() });
      return;
    }
    const updates: any = {};
    const d = parsed.data;
    if (d.tanggal !== undefined) updates.tanggal = d.tanggal;
    if (d.kegiatan !== undefined) updates.kegiatan = d.kegiatan;
    if (d.lokasi !== undefined) updates.lokasi = d.lokasi;
    if (d.peserta !== undefined) updates.peserta = d.peserta;
    if (d.sasaran !== undefined) updates.sasaran = d.sasaran;
    if (d.hasilKegiatan !== undefined) updates.hasilKegiatan = d.hasilKegiatan;
    if (d.kendala !== undefined) updates.kendala = d.kendala;
    if (d.tindakLanjut !== undefined) updates.tindakLanjut = d.tindakLanjut;
    if (d.penanggungjawab !== undefined) updates.penanggungjawab = d.penanggungjawab;
    const [row] = await db
      .update(logbookEntriesTable)
      .set(updates)
      .where(eq(logbookEntriesTable.id, id))
      .returning();
    if (!row) { res.status(404).json({ error: "Tidak ditemukan" }); return; }
    const photos = await db.select().from(logbookPhotosTable).where(eq(logbookPhotosTable.logbookEntryId, id));
    res.json(mapEntry(row, photos));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /logbook/:id — also cleans up all associated photos from object storage
router.delete("/logbook/:id", requireKetSek, async (req, res) => {
  try {
    const id = Number(req.params["id"]);
    const photos = await db.select().from(logbookPhotosTable).where(eq(logbookPhotosTable.logbookEntryId, id));
    await db.delete(logbookEntriesTable).where(eq(logbookEntriesTable.id, id));
    for (const photo of photos) {
      await deleteFromStorage(photo.storageKey, req.log);
    }
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /logbook/photos — multipart upload: validates type/size, stores to GCS, saves record
router.post(
  "/logbook/photos",
  requireKetSek,
  (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
        res.status(400).json({ error: "Ukuran file melebihi batas maksimal 10 MB" });
        return;
      }
      if (err instanceof Error && err.message === "INVALID_TYPE") {
        res.status(400).json({ error: "Tipe file tidak didukung. Gunakan JPEG, PNG, atau WebP." });
        return;
      }
      if (err) { next(err); return; }
      next();
    });
  },
  async (req, res) => {
    try {
      const logbookEntryId = Number(req.body?.logbookEntryId);
      if (!logbookEntryId || isNaN(logbookEntryId)) {
        res.status(400).json({ error: "logbookEntryId diperlukan" });
        return;
      }

      const file = req.file;
      if (!file) {
        res.status(400).json({ error: "File foto diperlukan" });
        return;
      }

      const storageKey = await objectStorageService.uploadObjectEntity(file.buffer, {
        name: file.originalname,
        size: file.size,
        contentType: file.mimetype,
      });

      const fileName = file.originalname || "photo";
      const [row] = await db
        .insert(logbookPhotosTable)
        .values({ logbookEntryId, storageKey, fileName })
        .returning();

      const url = `/api/storage${storageKey}`;
      res.status(201).json({ ...row, url, createdAt: row.createdAt.toISOString() });
    } catch (err) {
      req.log.error(err);
      res.status(500).json({ error: "Gagal mengupload foto" });
    }
  },
);

// POST /logbook/photos/from-upload - saves metadata after direct signed upload
router.post("/logbook/photos/from-upload", requireKetSek, async (req, res) => {
  try {
    const logbookEntryId = Number(req.body?.logbookEntryId);
    const storageKey = String(req.body?.storageKey ?? req.body?.objectPath ?? "");
    const fileName = String(req.body?.fileName ?? "").trim();

    if (!logbookEntryId || isNaN(logbookEntryId)) {
      res.status(400).json({ error: "logbookEntryId diperlukan" });
      return;
    }
    if (!storageKey.startsWith("/objects/uploads/")) {
      res.status(400).json({ error: "storageKey tidak valid" });
      return;
    }
    if (!fileName) {
      res.status(400).json({ error: "fileName diperlukan" });
      return;
    }

    await objectStorageService.getObjectEntityFile(storageKey);

    const [row] = await db
      .insert(logbookPhotosTable)
      .values({ logbookEntryId, storageKey, fileName })
      .returning();

    const url = `/api/storage${storageKey}`;
    res.status(201).json({ ...row, url, createdAt: row.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Gagal menyimpan metadata foto" });
  }
});

// DELETE /logbook/photos/:id — removes from object storage then from DB
router.delete("/logbook/photos/:id", requireKetSek, async (req, res) => {
  try {
    const id = Number(req.params["id"]);
    const [photo] = await db.select().from(logbookPhotosTable).where(eq(logbookPhotosTable.id, id));
    if (!photo) { res.status(404).json({ error: "Foto tidak ditemukan" }); return; }
    await deleteFromStorage(photo.storageKey, req.log);
    await db.delete(logbookPhotosTable).where(eq(logbookPhotosTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

async function fetchEntriesFiltered(programId: number, dateFrom?: string, dateTo?: string) {
  const conditions = [eq(logbookEntriesTable.programId, programId)];
  if (dateFrom) conditions.push(gte(logbookEntriesTable.tanggal, dateFrom));
  if (dateTo) conditions.push(lte(logbookEntriesTable.tanggal, dateTo));

  const entries = await db
    .select()
    .from(logbookEntriesTable)
    .where(and(...conditions))
    .orderBy(desc(logbookEntriesTable.tanggal));

  const entryIds = entries.map((e) => e.id);
  const photos =
    entryIds.length > 0
      ? await db.select().from(logbookPhotosTable).where(inArray(logbookPhotosTable.logbookEntryId, entryIds))
      : [];

  const photosByEntry = new Map<number, typeof photos>();
  for (const p of photos) {
    const arr = photosByEntry.get(p.logbookEntryId) ?? [];
    arr.push(p);
    photosByEntry.set(p.logbookEntryId, arr);
  }

  return { entries, photosByEntry };
}

// GET /logbook/export/word?programId=&dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD
router.get("/logbook/export/word", requireLogin, async (req, res) => {
  try {
    const programId = Number(req.query["programId"]);
    if (!programId) {
      res.status(400).json({ error: "programId diperlukan" });
      return;
    }
    const dateFrom = req.query["dateFrom"] as string | undefined;
    const dateTo = req.query["dateTo"] as string | undefined;

    const [program] = await db.select().from(programSchedulesTable).where(eq(programSchedulesTable.id, programId));
    if (!program) {
      res.status(404).json({ error: "Program tidak ditemukan" });
      return;
    }

    const { entries, photosByEntry } = await fetchEntriesFiltered(programId, dateFrom, dateTo);

    function makeBorderedCell(text: string, bold = false, shading?: string) {
      return new TableCell({
        children: [
          new Paragraph({
            children: [new TextRun({ text, bold, size: 20 })],
            spacing: { before: 60, after: 60 },
          }),
        ],
        shading: shading ? { fill: shading } : undefined,
        margins: { top: 60, bottom: 60, left: 100, right: 100 },
      });
    }

    const tableRows: TableRow[] = [
      new TableRow({
        children: [
          makeBorderedCell("No", true, "D9D9D9"),
          makeBorderedCell("Tanggal", true, "D9D9D9"),
          makeBorderedCell("Kegiatan", true, "D9D9D9"),
          makeBorderedCell("Lokasi", true, "D9D9D9"),
          makeBorderedCell("Peserta", true, "D9D9D9"),
          makeBorderedCell("Sasaran", true, "D9D9D9"),
          makeBorderedCell("Hasil Kegiatan", true, "D9D9D9"),
          makeBorderedCell("Kendala", true, "D9D9D9"),
          makeBorderedCell("Tindak Lanjut", true, "D9D9D9"),
          makeBorderedCell("Penanggung Jawab", true, "D9D9D9"),
          makeBorderedCell("Dokumentasi", true, "D9D9D9"),
        ],
        tableHeader: true,
      }),
    ];

    entries.forEach((entry, idx) => {
      const entryPhotos = photosByEntry.get(entry.id) ?? [];
      const photoNames = entryPhotos.map((p) => p.fileName).join(", ") || "-";
      tableRows.push(
        new TableRow({
          children: [
            makeBorderedCell(String(idx + 1)),
            makeBorderedCell(entry.tanggal),
            makeBorderedCell(entry.kegiatan),
            makeBorderedCell(entry.lokasi),
            makeBorderedCell((entry.peserta as string[]).join(", ")),
            makeBorderedCell(entry.sasaran),
            makeBorderedCell(entry.hasilKegiatan),
            makeBorderedCell(entry.kendala ?? "-"),
            makeBorderedCell(entry.tindakLanjut ?? "-"),
            makeBorderedCell(entry.penanggungjawab),
            makeBorderedCell(photoNames),
          ],
        }),
      );
    });

    const subtitleParts = [`Program Kerja: ${program.programName}`];
    if (dateFrom || dateTo) {
      const rangeStr = dateFrom && dateTo
        ? `${formatTanggalId(dateFrom)} – ${formatTanggalId(dateTo)}`
        : dateFrom
          ? `Mulai ${formatTanggalId(dateFrom)}`
          : `Sampai ${formatTanggalId(dateTo!)}`;
      subtitleParts.push(`Periode: ${rangeStr}`);
    }

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 },
            },
          },
          children: [
            new Paragraph({
              text: "LOGBOOK KEGIATAN",
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              spacing: { after: 120 },
            }),
            ...subtitleParts.map((text, i) =>
              new Paragraph({
                children: [new TextRun({ text, bold: i === 0, size: 24 })],
                alignment: AlignmentType.CENTER,
                spacing: { after: i === subtitleParts.length - 1 ? 240 : 80 },
              })
            ),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: tableRows,
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1 },
                bottom: { style: BorderStyle.SINGLE, size: 1 },
                left: { style: BorderStyle.SINGLE, size: 1 },
                right: { style: BorderStyle.SINGLE, size: 1 },
                insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
                insideVertical: { style: BorderStyle.SINGLE, size: 1 },
              },
            }),
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    const safeName = program.programName.replace(/[^a-zA-Z0-9_\-]/g, "_");
    const rangeLabel = safeDateRangeLabel(dateFrom, dateTo);
    res.setHeader("Content-Disposition", `attachment; filename="logbook_${safeName}_${rangeLabel}.docx"`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.send(buffer);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /logbook/export/pdf?programId=&dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD
router.get("/logbook/export/pdf", requireLogin, async (req, res) => {
  try {
    const programId = Number(req.query["programId"]);
    if (!programId) {
      res.status(400).json({ error: "programId diperlukan" });
      return;
    }
    const dateFrom = req.query["dateFrom"] as string | undefined;
    const dateTo = req.query["dateTo"] as string | undefined;

    const [program] = await db.select().from(programSchedulesTable).where(eq(programSchedulesTable.id, programId));
    if (!program) {
      res.status(404).json({ error: "Program tidak ditemukan" });
      return;
    }

    const { entries, photosByEntry } = await fetchEntriesFiltered(programId, dateFrom, dateTo);

    const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 30 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));

    const pageW = 841.89;
    const margin = 30;
    const usableW = pageW - margin * 2;

    const COLS = [
      { label: "No", w: 0.03 },
      { label: "Tanggal", w: 0.08 },
      { label: "Kegiatan", w: 0.14 },
      { label: "Lokasi", w: 0.08 },
      { label: "Peserta", w: 0.10 },
      { label: "Sasaran", w: 0.10 },
      { label: "Hasil Kegiatan", w: 0.18 },
      { label: "Kendala", w: 0.09 },
      { label: "Tindak Lanjut", w: 0.09 },
      { label: "Penanggung Jawab", w: 0.11 },
    ];
    const colWidths = COLS.map((c) => c.w * usableW);

    const FONT_SIZE = 7;
    const HEADER_FONT_SIZE = 7.5;
    const LINE_HEIGHT = FONT_SIZE * 1.3;
    const CELL_PAD_X = 3;
    const CELL_PAD_Y = 3;

    function drawCell(
      x: number,
      y: number,
      w: number,
      h: number,
      text: string,
      opts: { bold?: boolean; bg?: string; fontSize?: number } = {}
    ) {
      if (opts.bg) {
        doc.save().rect(x, y, w, h).fill(opts.bg).restore();
      }
      doc
        .rect(x, y, w, h)
        .stroke("#999999");
      doc
        .font(opts.bold ? "Helvetica-Bold" : "Helvetica")
        .fontSize(opts.fontSize ?? FONT_SIZE)
        .fillColor("#111111")
        .text(text, x + CELL_PAD_X, y + CELL_PAD_Y, {
          width: w - CELL_PAD_X * 2,
          height: h - CELL_PAD_Y * 2,
          ellipsis: false,
          lineBreak: true,
        });
    }

    function calcRowHeight(cells: string[]): number {
      let maxLines = 1;
      cells.forEach((text, i) => {
        const w = colWidths[i] - CELL_PAD_X * 2;
        const approxCharsPerLine = Math.floor(w / (FONT_SIZE * 0.45));
        const lines = text.split("\n").reduce((acc, line) => {
          return acc + Math.max(1, Math.ceil(line.length / Math.max(1, approxCharsPerLine)));
        }, 0);
        if (lines > maxLines) maxLines = lines;
      });
      return maxLines * LINE_HEIGHT + CELL_PAD_Y * 2;
    }

    let cursorY = margin;

    doc
      .font("Helvetica-Bold")
      .fontSize(13)
      .fillColor("#111111")
      .text("LOGBOOK KEGIATAN", margin, cursorY, { width: usableW, align: "center" });
    cursorY += 18;

    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .fillColor("#333333")
      .text(`Program Kerja: ${program.programName}`, margin, cursorY, { width: usableW, align: "center" });
    cursorY += 13;

    if (dateFrom || dateTo) {
      const rangeStr = dateFrom && dateTo
        ? `${formatTanggalId(dateFrom)} – ${formatTanggalId(dateTo)}`
        : dateFrom
          ? `Mulai ${formatTanggalId(dateFrom)}`
          : `Sampai ${formatTanggalId(dateTo!)}`;
      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor("#555555")
        .text(`Periode: ${rangeStr}`, margin, cursorY, { width: usableW, align: "center" });
      cursorY += 12;
    }
    cursorY += 6;

    const headerRowH = HEADER_FONT_SIZE * 1.3 + CELL_PAD_Y * 2 + 2;
    let x = margin;
    COLS.forEach((col, i) => {
      drawCell(x, cursorY, colWidths[i], headerRowH, col.label, { bold: true, bg: "#D9D9D9", fontSize: HEADER_FONT_SIZE });
      x += colWidths[i];
    });
    cursorY += headerRowH;

    const pageH = 595.28;

    for (let idx = 0; idx < entries.length; idx++) {
      const entry = entries[idx];
      const entryPhotos = photosByEntry.get(entry.id) ?? [];
      const photoNames = entryPhotos.map((p) => p.fileName).join(", ") || "-";

      const cells = [
        String(idx + 1),
        entry.tanggal,
        entry.kegiatan,
        entry.lokasi,
        (entry.peserta as string[]).join(", "),
        entry.sasaran,
        entry.hasilKegiatan,
        entry.kendala ?? "-",
        entry.tindakLanjut ?? "-",
        entry.penanggungjawab,
      ];

      const rowH = calcRowHeight(cells);

      if (cursorY + rowH > pageH - margin) {
        doc.addPage({ size: "A4", layout: "landscape", margin: 30 });
        cursorY = margin;

        x = margin;
        COLS.forEach((col, i) => {
          drawCell(x, cursorY, colWidths[i], headerRowH, col.label, { bold: true, bg: "#D9D9D9", fontSize: HEADER_FONT_SIZE });
          x += colWidths[i];
        });
        cursorY += headerRowH;
      }

      const bg = idx % 2 === 1 ? "#F7FAFB" : undefined;
      x = margin;
      cells.forEach((text, i) => {
        drawCell(x, cursorY, colWidths[i], rowH, text, { bg });
        x += colWidths[i];
      });

      void photoNames;
      cursorY += rowH;
    }

    doc.end();

    await new Promise<void>((resolve) => doc.on("end", resolve));

    const pdfBuffer = Buffer.concat(chunks);
    const safeName = program.programName.replace(/[^a-zA-Z0-9_\-]/g, "_");
    const rangeLabel = safeDateRangeLabel(dateFrom, dateTo);
    res.setHeader("Content-Disposition", `attachment; filename="logbook_${safeName}_${rangeLabel}.pdf"`);
    res.setHeader("Content-Type", "application/pdf");
    res.send(pdfBuffer);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
