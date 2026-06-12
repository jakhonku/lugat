import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Normalize a word for URL slugs and case-insensitive lookups. */
export function slugifyWord(english: string): string {
  return english.trim().toLowerCase().replace(/\s+/g, "-");
}

export function unslugifyWord(slug: string): string {
  return decodeURIComponent(slug).replace(/-/g, " ").trim();
}

/** Pretty Uzbek category labels (fallback: the raw value capitalised). */
export const CATEGORY_LABELS: Record<string, string> = {
  umumiy: "Umumiy",
  hayvonlar: "Hayvonlar 🐾",
  mevalar: "Mevalar 🍓",
  ranglar: "Ranglar 🎨",
  maktab: "Maktab 🏫",
  oila: "Oila 👨‍👩‍👧",
  raqamlar: "Raqamlar 🔢",
};

export function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category.charAt(0).toUpperCase() + category.slice(1);
}
