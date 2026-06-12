export interface Word {
  id: string;
  english: string;
  uzbek: string;
  transcription: string | null;
  example_en: string | null;
  example_uz: string | null;
  category: string;
  emoji: string | null;
  created_at: string;
  updated_at: string;
}

/** Shape used when creating / importing a word (no server-generated fields). */
export interface WordInput {
  english: string;
  uzbek: string;
  transcription?: string | null;
  example_en?: string | null;
  example_uz?: string | null;
  category?: string | null;
  emoji?: string | null;
}

export const CATEGORIES = [
  "umumiy",
  "hayvonlar",
  "mevalar",
  "ranglar",
  "maktab",
  "oila",
  "raqamlar",
] as const;

export type Category = (typeof CATEGORIES)[number] | string;

/** Excel/import column order shared by template, import parser and export. */
export const EXCEL_COLUMNS = [
  "english",
  "uzbek",
  "transcription",
  "example_en",
  "example_uz",
  "category",
  "emoji",
] as const;
