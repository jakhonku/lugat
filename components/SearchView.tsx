"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Search, Loader2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Word } from "@/types";
import { WordCard } from "@/components/WordCard";
import { CategoryChips } from "@/components/CategoryChips";
import { StarBurst } from "@/components/StarBurst";
import { WordCardSkeleton } from "@/components/WordCardSkeleton";

interface Props {
  categories: string[];
}

/** PostgREST `.or()` filterini buzadigan belgilarni tozalaymiz. */
function sanitize(q: string) {
  return q.replace(/[,()%\\]/g, " ").trim();
}

export function SearchView({ categories }: Props) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [results, setResults] = useState<Word[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [burst, setBurst] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasEnv =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const supabase = useRef(hasEnv ? createClient() : null);
  const lastFound = useRef(0);

  // Desktopda avtofokus (mobil klaviaturani majburan ochmaymiz).
  useEffect(() => {
    if (window.matchMedia("(min-width: 768px)").matches) {
      inputRef.current?.focus();
    }
  }, []);

  useEffect(() => {
    const trimmed = sanitize(query);

    // Na qidiruv, na kategoriya tanlangan — natijani tozalaymiz.
    if (!trimmed && !activeCategory) {
      setResults(null);
      setLoading(false);
      return;
    }

    if (!supabase.current) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const handle = setTimeout(async () => {
      let q = supabase.current!
        .from("words")
        .select("*")
        .order("english", { ascending: true })
        .limit(60);

      if (trimmed) {
        q = q.or(`english.ilike.%${trimmed}%,uzbek.ilike.%${trimmed}%`);
      }
      if (activeCategory) {
        q = q.eq("category", activeCategory);
      }

      const { data, error } = await q;
      const rows = error ? [] : (data as Word[]);
      setResults(rows);
      setLoading(false);

      // Yangi natija topilganda yulduzcha portlashi.
      if (rows.length > 0 && trimmed && lastFound.current !== rows.length) {
        setBurst((b) => b + 1);
      }
      lastFound.current = rows.length;
    }, 250);

    return () => clearTimeout(handle);
  }, [query, activeCategory]);

  const showResults = results !== null;

  return (
    <div className="w-full">
      <StarBurst trigger={burst} />

      {/* Qidiruv qutisi */}
      <motion.div
        whileFocus={{ scale: 1.02 }}
        className="relative mx-auto max-w-2xl"
      >
        <motion.div
          animate={{ scale: query ? 1.01 : 1 }}
          className="relative"
        >
          <Search className="pointer-events-none absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={inputRef}
            type="search"
            inputMode="search"
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Inglizcha so'z yozing... masalan: apple 🍎"
            aria-label="Inglizcha so'z qidirish"
            className="h-16 w-full rounded-[1.5rem] border-4 border-primary/30 bg-card pl-14 pr-14 text-lg font-bold shadow-soft outline-none transition-all placeholder:font-semibold placeholder:text-muted-foreground/70 focus:border-primary focus:shadow-[0_0_0_6px_hsl(var(--primary)/0.15)]"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Tozalash"
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-2 text-muted-foreground hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </button>
          ) : null}
        </motion.div>
      </motion.div>

      {/* Kategoriya chiplar */}
      <div className="mx-auto mt-5 max-w-3xl">
        <CategoryChips
          categories={categories}
          active={activeCategory}
          onSelect={(c) =>
            setActiveCategory((prev) => (prev === c ? null : c))
          }
        />
      </div>

      {/* Natijalar */}
      <div className="mx-auto mt-7 max-w-2xl space-y-4">
        {loading && results === null ? (
          <>
            <WordCardSkeleton />
            <WordCardSkeleton />
          </>
        ) : null}

        {showResults && results.length > 0
          ? results.map((word, i) => (
              <WordCard key={word.id} word={word} index={i} />
            ))
          : null}

        {showResults && !loading && results.length === 0 ? (
          <EmptyState />
        ) : null}

        {loading && showResults ? (
          <div className="flex justify-center py-4 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border-2 border-dashed border-border bg-card/70 p-10 text-center"
    >
      <div className="text-6xl">🙈</div>
      <p className="mt-4 text-xl font-extrabold">Bunday so'z topilmadi</p>
      <p className="mt-1 text-muted-foreground">
        Boshqa so'z yozib ko'ring yoki imloni tekshiring!
      </p>
    </motion.div>
  );
}
