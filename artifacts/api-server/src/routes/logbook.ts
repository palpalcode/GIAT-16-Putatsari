import { Router } from "express";
import multer from "multer";
import { randomUUID } from "crypto";
import { db } from "@workspace/db";
import { logbookEntriesTable, logbookPhotosTable, programSchedulesTable } from "@workspace/db";
import { eq, desc, inArray } from "drizzle-orm";
import { requireKetSek, requireLogin } from "../lib/auth";
import {
  CreateLogbookEntryBody,
  UpdateLogbookEntryBody,
} from "@workspace/api-zod";
import { objectStorageClient } from "../lib/objectStorage";
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

const router = Router();

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

function parseStoragePath(path: string): { bucketName: string; objectName: string } {
  const normalized = path.startsWith("/") ? path.slice(1) : path;
  const parts = normalized.split("/");
  return { bucketName: parts[0], objectName: parts.slice(1).join("/") };
}

function storageKeyToGcsPath(storageKey: string): { bucketName: string; objectName: string } | null {
  const privateDir = process.env["PRIVATE_OBJECT_DIR"];
  if (!privateDir) return null;
  if (!storageKey.startsWith("/objects/")) return null;
  const entityId = storageKey.slice("/objects/".length);
  const fullPath = `${privateDir}/${entityId}`;
  return parseStoragePath(fullPath);
}

async function deleteFromStorage(storageKey: string, log: { warn: (...args: any[]) => void }): Promise<void> {
  try {
    const parsed = storageKeyToGcsPath(storageKey);
    if (!parsed) return;
    const file = objectStorageClient.bucket(parsed.bucketName).file(parsed.objectName);
    await file.delete({ ignoreNotFound: true });
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

// GET /logbook?programId=
router.get("/logbook", requireLogin, async (req, res) => {
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

      const privateDir = process.env["PRIVATE_OBJECT_DIR"];
      if (!privateDir) {
        res.status(500).json({ error: "Object storage tidak dikonfigurasi" });
        return;
      }

      const objectId = randomUUID();
      const fullPath = `${privateDir}/uploads/${objectId}`;
      const { bucketName, objectName } = parseStoragePath(fullPath);
      const storageKey = `/objects/uploads/${objectId}`;

      const bucket = objectStorageClient.bucket(bucketName);
      const gcsFile = bucket.file(objectName);
      await gcsFile.save(file.buffer, { contentType: file.mimetype, resumable: false });

      const fileName = file.originalname || `photo_${objectId}`;
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

// GET /logbook/export/word?programId=
router.get("/logbook/export/word", requireLogin, async (req, res) => {
  try {
    const programId = Number(req.query["programId"]);
    if (!programId) {
      res.status(400).json({ error: "programId diperlukan" });
      return;
    }

    const [program] = await db.select().from(programSchedulesTable).where(eq(programSchedulesTable.id, programId));
    if (!program) {
      res.status(404).json({ error: "Program tidak ditemukan" });
      return;
    }

    const entries = await db
      .select()
      .from(logbookEntriesTable)
      .where(eq(logbookEntriesTable.programId, programId))
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
            new Paragraph({
              children: [new TextRun({ text: `Program Kerja: ${program.programName}`, bold: true, size: 24 })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 240 },
            }),
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
    res.setHeader("Content-Disposition", `attachment; filename="logbook_${safeName}.docx"`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.send(buffer);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
