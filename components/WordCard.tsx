"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { Word } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Emoji } from "@/components/Emoji";
import { PronunciationButton } from "@/components/PronunciationButton";
import { categoryLabel, slugifyWord, cn } from "@/lib/utils";

interface Props {
  word: Word;
  index?: number;
  /** Larger hero layout (used on the word detail page). */
  featured?: boolean;
}

export function WordCard({ word, index = 0, featured = false }: Props) {
  return (
    <motion.article
      initial={{ opacity: 0, scale: 0.9, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
        delay: Math.min(index * 0.05, 0.4),
      }}
      className={cn(
        "relative overflow-hidden rounded-2xl border-2 border-border/60 bg-card p-5 shadow-card",
        featured && "p-6 sm:p-8",
      )}
    >
      <div className="flex items-start gap-4">
        <motion.div
          aria-hidden
          whileHover={{ rotate: [0, -8, 8, 0] }}
          className={cn(
            "flex shrink-0 select-none items-center justify-center rounded-2xl bg-accent/30",
            featured ? "h-24 w-24 text-6xl" : "h-16 w-16 text-4xl",
          )}
        >
          <Emoji emoji={word.emoji ?? "📘"} />
        </motion.div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h2
              className={cn(
                "font-extrabold leading-tight text-foreground",
                featured ? "text-3xl sm:text-4xl" : "text-2xl",
              )}
            >
              {word.english}
            </h2>
            {word.transcription ? (
              <span className="text-base font-semibold text-muted-foreground">
                {word.transcription}
              </span>
            ) : null}
          </div>

          <p
            className={cn(
              "mt-1 font-extrabold text-primary",
              featured ? "text-3xl sm:text-4xl" : "text-2xl",
            )}
          >
            {word.uzbek}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <PronunciationButton text={word.english} label="Tinglash" />
            <Link href={`/category/${encodeURIComponent(word.category)}`}>
              <Badge variant="accent" className="cursor-pointer">
                {categoryLabel(word.category)}
              </Badge>
            </Link>
          </div>
        </div>
      </div>

      {(word.example_en || word.example_uz) && (
        <div className="mt-4 rounded-xl bg-muted/60 p-4">
          {word.example_en ? (
            <p className="flex items-start gap-2 text-base font-semibold text-foreground">
              <span aria-hidden>💬</span>
              <span>{word.example_en}</span>
            </p>
          ) : null}
          {word.example_uz ? (
            <p className="mt-1 pl-7 text-base text-muted-foreground">
              {word.example_uz}
            </p>
          ) : null}
        </div>
      )}

      {!featured && (
        <Link
          href={`/word/${slugifyWord(word.english)}`}
          className="absolute right-4 top-4 text-sm font-bold text-purple hover:underline"
        >
          Batafsil →
        </Link>
      )}
    </motion.article>
  );
}
