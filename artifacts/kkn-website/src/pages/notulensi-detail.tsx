import { useParams, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetNotulensi,
  useUpdateNotulensi,
  useDeleteNotulensi,
  getGetNotulensiListQueryKey,
  getGetNotulensiQueryKey,
} from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Copy,
  Download,
  Calendar,
  User,
  Users,
  BookOpen,
  FileText,
  Pencil,
  Trash2,
  Check,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { MemberPicker } from "@/components/ui/member-picker";
import { getApiErrorDesc, extractApiFieldErrors } from "@/lib/api-error";

function formatDate(d: string) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

async function exportDocx(n: {
  title: string;
  meetingDate: string;
  author: string;
  attendees: string[];
  agenda?: string | null;
  content: string;
}) {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } =
    await import("docx");

  const dateStr = new Date(n.meetingDate).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const children = [
    new Paragraph({
      text: "NOTULENSI RAPAT",
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
    }),
    new Paragraph({
      text: n.title,
      heading: HeadingLevel.HEADING_2,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Tanggal\t: ", bold: true }),
        new TextRun(dateStr),
      ],
      spacing: { after: 120 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Penulis\t: ", bold: true }),
        new TextRun(n.author),
      ],
      spacing: { after: 120 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Peserta\t: ", bold: true }),
        new TextRun(n.attendees.length > 0 ? n.attendees.join(", ") : "-"),
      ],
      spacing: { after: 400 },
    }),
  ];

  if (n.agenda) {
    children.push(
      new Paragraph({
        text: "AGENDA",
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 200, after: 160 },
      })
    );
    n.agenda.split("\n").forEach((line) => {
      children.push(
        new Paragraph({
          text: line || " ",
          spacing: { after: 100 },
        })
      );
    });
    children.push(new Paragraph({ text: "", spacing: { after: 200 } }));
  }

  children.push(
    new Paragraph({
      text: "ISI NOTULENSI",
      heading: HeadingLevel.HEADING_3,
      spacing: { before: 200, after: 160 },
    })
  );

  n.content.split("\n").forEach((line) => {
    children.push(
      new Paragraph({
        text: line || " ",
        spacing: { after: 120 },
      })
    );
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Notulensi - ${n.title}.docx`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function NotulensiDetailPage() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { can } = useAuth();
  const canEdit = can("notulensi");

  const id = Number(params.id);
  const { data: notulensi, isLoading } = useGetNotulensi(id);
  const deleteMutation = useDeleteNotulensi();
  const updateMutation = useUpdateNotulensi();

  const [showDelete, setShowDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    meetingDate: "",
    attendeesSelected: [] as string[],
    agenda: "",
    content: "",
    author: "",
  });
  const [editFieldErrors, setEditFieldErrors] = useState<Record<string, string>>({});

  function fE(k: keyof typeof editForm, v: string | string[]) {
    setEditForm((p) => ({ ...p, [k]: v }));
    setEditFieldErrors((fe) => ({ ...fe, [k]: "" }));
  }

  function openEdit() {
    if (!notulensi) return;
    setEditFieldErrors({});
    setEditForm({
      title: notulensi.title,
      meetingDate: notulensi.meetingDate.slice(0, 10),
      attendeesSelected: notulensi.attendees,
      agenda: notulensi.agenda ?? "",
      content: notulensi.content,
      author: notulensi.author,
    });
    setShowEdit(true);
  }

  function handleSaveEdit() {
    if (!editForm.title || !editForm.meetingDate || !editForm.content || !editForm.author) return;
    updateMutation.mutate(
      {
        id,
        data: {
          title: editForm.title,
          meetingDate: editForm.meetingDate,
          attendees: editForm.attendeesSelected,
          agenda: editForm.agenda || undefined,
          content: editForm.content,
          author: editForm.author,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetNotulensiQueryKey(id) });
          queryClient.invalidateQueries({ queryKey: getGetNotulensiListQueryKey() });
          toast({ title: "Notulensi diperbarui" });
          setShowEdit(false);
        },
        onError: (err) => { setEditFieldErrors(extractApiFieldErrors(err)); toast({ title: "Gagal menyimpan", description: getApiErrorDesc(err), variant: "destructive" }); },
      }
    );
  }

  function handleCopy() {
    if (!notulensi) return;
    const dateStr = formatDate(notulensi.meetingDate);
    const text = [
      `NOTULENSI RAPAT`,
      `${notulensi.title}`,
      ``,
      `Tanggal : ${dateStr}`,
      `Penulis : ${notulensi.author}`,
      `Peserta : ${notulensi.attendees.length > 0 ? notulensi.attendees.join(", ") : "-"}`,
      ``,
      ...(notulensi.agenda
        ? [`AGENDA`, notulensi.agenda, ``]
        : []),
      `ISI NOTULENSI`,
      notulensi.content,
    ].join("\n");

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast({ title: "Teks notulensi disalin ke clipboard" });
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function handleExport() {
    if (!notulensi) return;
    setExporting(true);
    try {
      await exportDocx(notulensi);
      toast({ title: "File DOCX berhasil diunduh" });
    } catch {
      toast({ title: "Gagal mengekspor DOCX", variant: "destructive" });
    } finally {
      setExporting(false);
    }
  }

  function handleDelete() {
    deleteMutation.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetNotulensiListQueryKey() });
          toast({ title: "Notulensi dihapus" });
          navigate("/pengumuman");
        },
        onError: (err) => toast({ title: "Gagal menghapus", description: getApiErrorDesc(err), variant: "destructive" }),
      }
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="glass-card p-8 space-y-4">
          <div className="h-6 bg-gray-200 rounded w-2/3" />
          <div className="h-4 bg-gray-100 rounded w-1/3" />
          <div className="h-4 bg-gray-100 rounded w-1/2" />
          <div className="h-32 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  if (!notulensi) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-violet-800">Notulensi tidak ditemukan.</p>
        <Button variant="outline" onClick={() => navigate("/notulensi")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Button
          variant="ghost"
          className="rounded-full text-gray-600 hover:text-gray-900 -ml-2"
          onClick={() => navigate("/pengumuman")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Semua Notulensi
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full gap-2"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            {copied ? "Disalin!" : "Salin Teks"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full gap-2"
            onClick={handleExport}
            disabled={exporting}
          >
            <Download className="w-4 h-4" />
            {exporting ? "Mengekspor…" : "Ekspor DOCX"}
          </Button>
          {canEdit && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-9 w-9"
                onClick={openEdit}
              >
                <Pencil className="w-4 h-4 text-sky-500" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-9 w-9"
                onClick={() => setShowDelete(true)}
              >
                <Trash2 className="w-4 h-4 text-rose-500" />
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="glass-card p-8 space-y-6">
        <div>
          <div className="flex flex-wrap gap-3 mb-3">
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-sky-600 bg-sky-50 px-3 py-1.5 rounded-full border border-sky-100">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(notulensi.meetingDate)}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 leading-snug">{notulensi.title}</h1>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 py-4 border-t border-b border-white/40">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0 mt-0.5">
              <User className="w-4 h-4 text-rose-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Penulis / Notulis</p>
              <p className="text-gray-800 font-medium">{notulensi.author}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center shrink-0 mt-0.5">
              <Users className="w-4 h-4 text-sky-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Peserta</p>
              {notulensi.attendees.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {notulensi.attendees.map((a, i) => (
                    <span
                      key={i}
                      className="text-xs bg-white/90 border border-white/60 px-2 py-0.5 rounded-full text-gray-700"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">-</p>
              )}
            </div>
          </div>
        </div>

        {notulensi.agenda && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-rose-400" />
              <h2 className="font-bold text-gray-800 uppercase text-sm tracking-wide">Agenda</h2>
            </div>
            <div className="bg-white/90 rounded-xl p-4 border border-white/60 text-gray-700 whitespace-pre-wrap leading-relaxed">
              {notulensi.agenda}
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-sky-400" />
            <h2 className="font-bold text-gray-800 uppercase text-sm tracking-wide">Isi Notulensi</h2>
          </div>
          <div className="bg-white/90 rounded-xl p-4 border border-white/60 text-gray-700 whitespace-pre-wrap leading-relaxed min-h-[120px]">
            {notulensi.content}
          </div>
        </div>

        <p className="text-xs text-gray-400 text-right">
          Dibuat: {new Date(notulensi.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent className="form-dialog border-white/50">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Notulensi?</AlertDialogTitle>
            <AlertDialogDescription>
              Notulensi ini akan dihapus permanen dan tidak bisa dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-rose-500 hover:bg-rose-600 text-white"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="form-dialog border-white/50 max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-800">Edit Notulensi</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Judul</Label>
              <Input
                className="rounded-xl bg-white/90 border-white/60"
                placeholder="Judul rapat..."
                value={editForm.title}
                onChange={(e) => fE("title", e.target.value)}
              />
              {editFieldErrors.title && <p className="text-xs text-rose-500">{editFieldErrors.title}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Tanggal Rapat</Label>
              <Input
                type="date"
                className="rounded-xl bg-white/90 border-white/60"
                value={editForm.meetingDate}
                onChange={(e) => fE("meetingDate", e.target.value)}
              />
              {editFieldErrors.meetingDate && <p className="text-xs text-rose-500">{editFieldErrors.meetingDate}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Notulis</Label>
              <Input
                className="rounded-xl bg-white/90 border-white/60"
                placeholder="Nama notulis..."
                value={editForm.author}
                onChange={(e) => fE("author", e.target.value)}
              />
              {editFieldErrors.author && <p className="text-xs text-rose-500">{editFieldErrors.author}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Peserta</Label>
              <div className="rounded-xl bg-white/90 border border-white/60 p-3">
                <MemberPicker
                  selected={editForm.attendeesSelected}
                  onChange={(v) => fE("attendeesSelected", v)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Agenda</Label>
              <Textarea
                className="rounded-xl bg-white/90 border-white/60 min-h-[80px] resize-none"
                placeholder="Daftar agenda rapat..."
                value={editForm.agenda}
                onChange={(e) => fE("agenda", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Isi Notulensi</Label>
              <Textarea
                className="rounded-xl bg-white/90 border-white/60 min-h-[120px] resize-none"
                placeholder="Catatan hasil rapat..."
                value={editForm.content}
                onChange={(e) => fE("content", e.target.value)}
              />
              {editFieldErrors.content && <p className="text-xs text-rose-500">{editFieldErrors.content}</p>}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" className="rounded-full" onClick={() => setShowEdit(false)}>
              Batal
            </Button>
            <Button
              className="rounded-full bg-gradient-to-r from-rose-400 to-sky-400 text-white"
              onClick={handleSaveEdit}
              disabled={
                updateMutation.isPending ||
                !editForm.title ||
                !editForm.meetingDate ||
                !editForm.content ||
                !editForm.author
              }
            >
              {updateMutation.isPending ? "Menyimpan…" : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
