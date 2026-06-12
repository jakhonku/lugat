"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Download,
  ArrowUpDown,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { exportWordsToXlsx } from "@/lib/excel";
import { categoryLabel } from "@/lib/utils";
import { Emoji } from "@/components/Emoji";
import type { Word } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { WordFormDialog } from "@/components/admin/WordFormDialog";
import { Skeleton } from "@/components/ui/skeleton";

const PAGE_SIZE = 10;
const ALL = "__all__";

type SortColumn = "english" | "uzbek" | "category" | "created_at";

export function WordsManager({ initialCategories }: { initialCategories: string[] }) {
  const [words, setWords] = useState<Word[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState<string>(ALL);
  const [sortColumn, setSortColumn] = useState<SortColumn>("created_at");
  const [sortAsc, setSortAsc] = useState(false);
  const [categories, setCategories] = useState<string[]>(initialCategories);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Word | null>(null);
  const [deleting, setDeleting] = useState<Word | null>(null);
  const [deletePending, setDeletePending] = useState(false);

  // Debounce qidiruv
  useEffect(() => {
    const h = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(0);
    }, 300);
    return () => clearTimeout(h);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    let q = supabase
      .from("words")
      .select("*", { count: "exact" })
      .order(sortColumn, { ascending: sortAsc })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

    if (debouncedSearch) {
      const safe = debouncedSearch.replace(/[,()%\\]/g, " ");
      q = q.or(`english.ilike.%${safe}%,uzbek.ilike.%${safe}%`);
    }
    if (category !== ALL) {
      q = q.eq("category", category);
    }

    const { data, count, error } = await q;
    if (error) {
      toast.error("Yuklashda xatolik: " + error.message);
    } else {
      setWords((data as Word[]) ?? []);
      setTotal(count ?? 0);
    }
    setLoading(false);
  }, [page, debouncedSearch, category, sortColumn, sortAsc]);

  useEffect(() => {
    load();
  }, [load]);

  // Kategoriyalar ro'yxatini yangilab turish
  const refreshCategories = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.from("words").select("category");
    if (data) {
      const set = new Set(data.map((r) => r.category as string));
      setCategories([...set].sort());
    }
  }, []);

  function toggleSort(col: SortColumn) {
    if (sortColumn === col) {
      setSortAsc((a) => !a);
    } else {
      setSortColumn(col);
      setSortAsc(true);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeletePending(true);
    const supabase = createClient();
    const { error } = await supabase.from("words").delete().eq("id", deleting.id);
    setDeletePending(false);
    if (error) {
      toast.error("O'chirishda xatolik: " + error.message);
      return;
    }
    toast.success("So'z o'chirildi 🗑️");
    setDeleting(null);
    // Agar sahifadagi oxirgi element o'chsa, oldingi sahifaga o'tamiz.
    if (words.length === 1 && page > 0) setPage((p) => p - 1);
    else load();
  }

  async function handleExport() {
    const supabase = createClient();
    let q = supabase.from("words").select("*").order("english");
    if (category !== ALL) q = q.eq("category", category);
    const { data, error } = await q;
    if (error || !data) {
      toast.error("Eksport xatosi");
      return;
    }
    exportWordsToXlsx(data as Word[], category !== ALL ? category : "");
    toast.success(`${data.length} ta so'z eksport qilindi 📥`);
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold">So&apos;zlar</h1>
          <p className="text-muted-foreground">Jami {total} ta so&apos;z</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-5 w-5" /> Excelga eksport
          </Button>
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-5 w-5" /> So&apos;z qo&apos;shish
          </Button>
        </div>
      </div>

      {/* Filtrlar */}
      <div className="mt-5 flex flex-wrap gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Qidirish (inglizcha yoki o'zbekcha)..."
            className="pl-10"
          />
        </div>
        <Select
          value={category}
          onValueChange={(v) => {
            setCategory(v);
            setPage(0);
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Barcha kategoriyalar</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {categoryLabel(c)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Jadval */}
      <div className="mt-5 rounded-2xl border-2 border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Emoji</TableHead>
              <SortableHead label="Inglizcha" active={sortColumn === "english"} asc={sortAsc} onClick={() => toggleSort("english")} />
              <SortableHead label="O'zbekcha" active={sortColumn === "uzbek"} asc={sortAsc} onClick={() => toggleSort("uzbek")} />
              <TableHead className="hidden md:table-cell">Transkripsiya</TableHead>
              <SortableHead label="Kategoriya" active={sortColumn === "category"} asc={sortAsc} onClick={() => toggleSort("category")} />
              <TableHead className="text-right">Amal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6}>
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : words.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  Hech narsa topilmadi 🙈
                </TableCell>
              </TableRow>
            ) : (
              words.map((word) => (
                <TableRow key={word.id}>
                  <TableCell className="text-2xl">
                    <Emoji emoji={word.emoji ?? "📘"} />
                  </TableCell>
                  <TableCell className="font-extrabold">{word.english}</TableCell>
                  <TableCell>{word.uzbek}</TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {word.transcription ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="accent">{categoryLabel(word.category)}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        aria-label="Tahrirlash"
                        onClick={() => {
                          setEditing(word);
                          setFormOpen(true);
                        }}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-border hover:bg-muted"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="O'chirish"
                        onClick={() => setDeleting(word)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-destructive/30 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginatsiya */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {page + 1} / {totalPages} sahifa
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0 || loading}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            <ChevronLeft className="h-4 w-4" /> Oldingi
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages - 1 || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            Keyingi <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Qo'shish / Tahrirlash */}
      <WordFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        word={editing}
        categories={categories}
        onSaved={() => {
          load();
          refreshCategories();
        }}
      />

      {/* O'chirishni tasdiqlash */}
      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>So&apos;zni o&apos;chirasizmi?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deleting?.english}</strong> — {deleting?.uzbek} butunlay
              o&apos;chiriladi. Bu amalni ortga qaytarib bo&apos;lmaydi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={deletePending}
            >
              {deletePending ? <Loader2 className="h-5 w-5 animate-spin" /> : "O'chirish"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function SortableHead({
  label,
  active,
  asc,
  onClick,
}: {
  label: string;
  active: boolean;
  asc: boolean;
  onClick: () => void;
}) {
  return (
    <TableHead>
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1 font-extrabold hover:text-foreground"
      >
        {label}
        <ArrowUpDown
          className={`h-3.5 w-3.5 ${active ? "text-primary" : "opacity-40"} ${
            active && asc ? "rotate-180" : ""
          }`}
        />
      </button>
    </TableHead>
  );
}
