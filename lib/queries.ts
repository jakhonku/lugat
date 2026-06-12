import "server-only";
import { createClient } from "@/lib/supabase/server";
import { pickWordOfDay } from "@/lib/wordOfDay";
import { CATEGORIES, type Word } from "@/types";

/** True when Supabase env vars are present (so we can render before setup). */
export function hasSupabaseEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/** Distinct categories present in the DB, ordered with known ones first. */
export async function getCategories(): Promise<string[]> {
  if (!hasSupabaseEnv()) return [...CATEGORIES];
  const supabase = createClient();
  const { data, error } = await supabase.from("words").select("category");
  if (error || !data) return [...CATEGORIES];

  const found = new Set(data.map((r) => r.category as string));
  const known = CATEGORIES.filter((c) => found.has(c));
  const extra = [...found].filter((c) => !CATEGORIES.includes(c as never)).sort();
  return [...known, ...extra];
}

/** Deterministic "word of the day". */
export async function getWordOfDay(): Promise<Word | null> {
  if (!hasSupabaseEnv()) return null;
  const supabase = createClient();
  const { count } = await supabase
    .from("words")
    .select("*", { count: "exact", head: true });

  if (!count) return null;

  // Kun indeksi bo'yicha offset (kuniga bitta barqaror so'z).
  const { data } = await supabase
    .from("words")
    .select("*")
    .order("created_at", { ascending: true })
    .order("id", { ascending: true });

  return pickWordOfDay((data ?? []) as Word[]);
}

export async function getWordBySlug(english: string): Promise<Word | null> {
  if (!hasSupabaseEnv()) return null;
  const supabase = createClient();
  const { data } = await supabase
    .from("words")
    .select("*")
    .ilike("english", english)
    .limit(1)
    .maybeSingle();
  return (data as Word) ?? null;
}

export async function getWordsByCategory(category: string): Promise<Word[]> {
  if (!hasSupabaseEnv()) return [];
  const supabase = createClient();
  const { data } = await supabase
    .from("words")
    .select("*")
    .eq("category", category)
    .order("english", { ascending: true });
  return (data as Word[]) ?? [];
}

export interface AdminStats {
  total: number;
  categories: number;
  recent: Word[];
}

export async function getAdminStats(): Promise<AdminStats> {
  if (!hasSupabaseEnv()) return { total: 0, categories: 0, recent: [] };
  const supabase = createClient();

  const [{ count }, { data: catRows }, { data: recent }] = await Promise.all([
    supabase.from("words").select("*", { count: "exact", head: true }),
    supabase.from("words").select("category"),
    supabase
      .from("words")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const categories = new Set((catRows ?? []).map((r) => r.category as string));

  return {
    total: count ?? 0,
    categories: categories.size,
    recent: (recent as Word[]) ?? [],
  };
}
