import type { Word } from "@/types";

/** Deterministic day index since the unix epoch (UTC). */
export function dayIndex(date = new Date()): number {
  const utcDays = Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000,
  );
  return utcDays;
}

/**
 * Pick a stable "word of the day" from a list. The same date always returns the
 * same word (as long as the underlying list is stable), and it advances daily.
 */
export function pickWordOfDay(words: Word[], date = new Date()): Word | null {
  if (!words.length) return null;
  const index = dayIndex(date) % words.length;
  return words[index];
}
