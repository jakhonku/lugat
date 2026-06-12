import { z } from "zod";

export const wordSchema = z.object({
  english: z
    .string()
    .trim()
    .min(1, "Inglizcha so'z majburiy")
    .max(100, "Juda uzun"),
  uzbek: z
    .string()
    .trim()
    .min(1, "O'zbekcha tarjima majburiy")
    .max(200, "Juda uzun"),
  transcription: z.string().trim().max(100).optional().or(z.literal("")),
  example_en: z.string().trim().max(300).optional().or(z.literal("")),
  example_uz: z.string().trim().max(300).optional().or(z.literal("")),
  category: z.string().trim().min(1, "Kategoriya majburiy").max(50),
  emoji: z.string().trim().max(20).optional().or(z.literal("")),
});

export type WordFormValues = z.infer<typeof wordSchema>;

/** Empty string -> null for nullable DB columns. */
export function normalizeWord(values: WordFormValues) {
  const blankToNull = (v?: string) => {
    const t = (v ?? "").trim();
    return t === "" ? null : t;
  };
  return {
    english: values.english.trim(),
    uzbek: values.uzbek.trim(),
    transcription: blankToNull(values.transcription),
    example_en: blankToNull(values.example_en),
    example_uz: blankToNull(values.example_uz),
    category: values.category.trim() || "umumiy",
    emoji: blankToNull(values.emoji),
  };
}
