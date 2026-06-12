"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  parseWorkbook,
  rowToWordInput,
  downloadTemplate,
  type ParsedRow,
} from "@/lib/excel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Emoji } from "@/components/Emoji";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

interface RowState {
  row: ParsedRow;
  errors: string[];
  duplicate: boolean;
}

type DuplicateMode = "skip" | "update";

interface Summary {
  inserted: number;
  updated: number;
  skipped: number;
  failed: number;
}

export function ImportManager() {
  const [rows, setRows] = useState<RowState[] | null>(null);
  const [fileName, setFileName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [dupMode, setDupMode] = useState<DuplicateMode>("skip");
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [summary, setSummary] = useState<Summary | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validRows = rows?.filter((r) => r.errors.length === 0) ?? [];
  const invalidCount = (rows?.length ?? 0) - validRows.length;
  const duplicateCount = validRows.filter((r) => r.duplicate).length;

  async function handleFile(file: File) {
    setSummary(null);
    setParsing(true);
    try {
      const parsed = await parseWorkbook(file);
      if (parsed.length === 0) {
        toast.error("Faylda ma'lumot topilmadi.");
        setParsing(false);
        return;
      }

      // Mavjud inglizcha so'zlarni olib, dublikatlarni belgilaymiz.
      const supabase = createClient();
      const { data: existing } = await supabase.from("words").select("english");
      const existingSet = new Set(
        (existing ?? []).map((r) => (r.english as string).toLowerCase()),
      );

      const states: RowState[] = parsed.map((row) => {
        const errors: string[] = [];
        if (!row.english.trim()) errors.push("english bo'sh");
        if (!row.uzbek.trim()) errors.push("uzbek bo'sh");
        return {
          row,
          errors,
          duplicate:
            errors.length === 0 &&
            existingSet.has(row.english.trim().toLowerCase()),
        };
      });

      setRows(states);
      setFileName(file.name);
    } catch (e) {
      toast.error("Faylni o'qishda xatolik. .xlsx formatini tekshiring.");
    } finally {
      setParsing(false);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function reset() {
    setRows(null);
    setFileName("");
    setSummary(null);
    setProgress(0);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function runImport() {
    if (!validRows.length) return;
    setImporting(true);
    setProgress(0);

    const supabase = createClient();

    // lower(english) -> id xaritasi (yangilash uchun kerak).
    const { data: existing } = await supabase
      .from("words")
      .select("id, english");
    const idByEnglish = new Map<string, string>();
    for (const r of existing ?? []) {
      idByEnglish.set((r.english as string).toLowerCase(), r.id as string);
    }

    const toInsert: ReturnType<typeof rowToWordInput>[] = [];
    const toUpdate: { id: string; payload: ReturnType<typeof rowToWordInput> }[] = [];
    let skipped = 0;

    for (const state of validRows) {
      const payload = rowToWordInput(state.row);
      const existingId = idByEnglish.get(payload.english.toLowerCase());
      if (existingId) {
        if (dupMode === "skip") {
          skipped++;
        } else {
          toUpdate.push({ id: existingId, payload });
        }
      } else {
        toInsert.push(payload);
      }
    }

    const result: Summary = { inserted: 0, updated: 0, skipped, failed: 0 };
    const totalOps = toInsert.length + toUpdate.length;
    let done = 0;

    // Insert — bo'laklarga bo'lib (100 tadan).
    for (let i = 0; i < toInsert.length; i += 100) {
      const chunk = toInsert.slice(i, i + 100);
      const { error } = await supabase.from("words").insert(chunk);
      if (error) result.failed += chunk.length;
      else result.inserted += chunk.length;
      done += chunk.length;
      setProgress(totalOps ? Math.round((done / totalOps) * 100) : 100);
    }

    // Update — bittalab.
    for (const { id, payload } of toUpdate) {
      const { error } = await supabase.from("words").update(payload).eq("id", id);
      if (error) result.failed += 1;
      else result.updated += 1;
      done += 1;
      setProgress(totalOps ? Math.round((done / totalOps) * 100) : 100);
    }

    setSummary(result);
    setImporting(false);
    toast.success(
      `✅ ${result.inserted} ta qo'shildi, ${result.updated} yangilandi, ${result.skipped} o'tkazib yuborildi`,
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold">Import / Eksport 📊</h1>
          <p className="text-muted-foreground">
            Excel (.xlsx) fayldan so&apos;zlarni ommaviy yuklang.
          </p>
        </div>
        <Button variant="secondary" onClick={downloadTemplate}>
          <Download className="h-5 w-5" /> Namuna faylni yuklab olish
        </Button>
      </div>

      {/* Drop zona */}
      {!rows && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`mt-6 flex flex-col items-center justify-center rounded-2xl border-4 border-dashed p-12 text-center transition-colors ${
            dragOver ? "border-primary bg-primary/5" : "border-border bg-card"
          }`}
        >
          <div className="text-5xl">{parsing ? "⏳" : "📥"}</div>
          <p className="mt-4 text-lg font-extrabold">
            {parsing ? "O'qilmoqda..." : "Faylni shu yerga tashlang"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            yoki tugma orqali tanlang. Ustunlar: english, uzbek, transcription,
            example_en, example_uz, category, emoji
          </p>
          <Button
            className="mt-5"
            disabled={parsing}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="h-5 w-5" /> Fayl tanlash
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
        </div>
      )}

      {/* Preview */}
      {rows && (
        <div className="mt-6">
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border-2 border-border bg-card p-4">
            <FileSpreadsheet className="h-6 w-6 text-secondary" />
            <span className="font-bold">{fileName}</span>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{validRows.length} yaroqli</Badge>
              {invalidCount > 0 && (
                <Badge variant="default" className="bg-destructive">
                  {invalidCount} xato
                </Badge>
              )}
              {duplicateCount > 0 && (
                <Badge variant="purple">{duplicateCount} dublikat</Badge>
              )}
            </div>
            <button
              type="button"
              onClick={reset}
              className="ml-auto flex items-center gap-1 rounded-xl border-2 border-border px-3 py-1.5 text-sm font-bold hover:bg-muted"
            >
              <X className="h-4 w-4" /> Boshqa fayl
            </button>
          </div>

          {/* Dublikat rejimi */}
          {duplicateCount > 0 && (
            <div className="mt-4 rounded-2xl border-2 border-purple/40 bg-purple/5 p-4">
              <p className="font-extrabold">
                {duplicateCount} ta so&apos;z allaqachon bazada bor. Nima qilamiz?
              </p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <RadioOption
                  checked={dupMode === "skip"}
                  onChange={() => setDupMode("skip")}
                  title="O'tkazib yuborish"
                  desc="Mavjud so'zlar o'zgarmaydi"
                />
                <RadioOption
                  checked={dupMode === "update"}
                  onChange={() => setDupMode("update")}
                  title="Yangilash"
                  desc="Mavjud so'zlar yangi ma'lumot bilan yangilanadi"
                />
              </div>
            </div>
          )}

          {/* Preview jadval */}
          <div className="mt-4 max-h-[420px] overflow-auto rounded-2xl border-2 border-border bg-card">
            <Table>
              <TableHeader className="sticky top-0 bg-card">
                <TableRow>
                  <TableHead className="w-10">#</TableHead>
                  <TableHead>english</TableHead>
                  <TableHead>uzbek</TableHead>
                  <TableHead className="hidden sm:table-cell">category</TableHead>
                  <TableHead className="hidden md:table-cell">emoji</TableHead>
                  <TableHead>Holat</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((state, i) => {
                  const hasError = state.errors.length > 0;
                  return (
                    <TableRow
                      key={i}
                      className={
                        hasError
                          ? "bg-destructive/10"
                          : state.duplicate
                            ? "bg-purple/5"
                            : ""
                      }
                    >
                      <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="font-bold">
                        {state.row.english || (
                          <span className="text-destructive">— bo&apos;sh —</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {state.row.uzbek || (
                          <span className="text-destructive">— bo&apos;sh —</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {state.row.category || "umumiy"}
                      </TableCell>
                      <TableCell className="hidden text-xl md:table-cell">
                        {state.row.emoji ? <Emoji emoji={state.row.emoji} /> : null}
                      </TableCell>
                      <TableCell>
                        {hasError ? (
                          <span className="inline-flex items-center gap-1 text-sm font-bold text-destructive">
                            <AlertTriangle className="h-4 w-4" />
                            {state.errors.join(", ")}
                          </span>
                        ) : state.duplicate ? (
                          <span className="text-sm font-bold text-purple">
                            dublikat
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-sm font-bold text-secondary">
                            <CheckCircle2 className="h-4 w-4" /> yangi
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Progress / Summary / Action */}
          {summary ? (
            <div className="mt-4 rounded-2xl border-2 border-secondary/50 bg-secondary/10 p-5">
              <p className="text-lg font-extrabold">Import yakunlandi! 🎉</p>
              <p className="mt-1">
                ✅ {summary.inserted} ta qo&apos;shildi
                {summary.updated > 0 && `, 🔄 ${summary.updated} yangilandi`}
                {summary.skipped > 0 && `, ⏭️ ${summary.skipped} o'tkazib yuborildi`}
                {summary.failed > 0 && `, ❌ ${summary.failed} xato`}
              </p>
              <Button className="mt-4" onClick={reset}>
                Yana import qilish
              </Button>
            </div>
          ) : (
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <Button
                size="lg"
                onClick={runImport}
                disabled={importing || validRows.length === 0}
              >
                {importing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> Yuklanmoqda...{" "}
                    {progress}%
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5" /> {validRows.length} ta so&apos;zni
                    import qilish
                  </>
                )}
              </Button>
              {importing && (
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RadioOption({
  checked,
  onChange,
  title,
  desc,
}: {
  checked: boolean;
  onChange: () => void;
  title: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`flex flex-1 items-start gap-3 rounded-xl border-2 p-3 text-left transition-colors ${
        checked ? "border-purple bg-purple/10" : "border-border bg-card hover:bg-muted"
      }`}
    >
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
          checked ? "border-purple" : "border-muted-foreground"
        }`}
      >
        {checked && <span className="h-2.5 w-2.5 rounded-full bg-purple" />}
      </span>
      <span>
        <span className="block font-bold">{title}</span>
        <span className="block text-sm text-muted-foreground">{desc}</span>
      </span>
    </button>
  );
}
