"use client";

import * as XLSX from "xlsx";
import { EXCEL_COLUMNS, type Word, type WordInput } from "@/types";

/** A parsed row from an imported sheet (raw, before validation). */
export interface ParsedRow {
  english: string;
  uzbek: string;
  transcription: string;
  example_en: string;
  example_uz: string;
  category: string;
  emoji: string;
}

const str = (v: unknown) => (v === undefined || v === null ? "" : String(v).trim());

/** Read an .xlsx/.csv file into normalized rows keyed by EXCEL_COLUMNS. */
export async function parseWorkbook(file: File): Promise<ParsedRow[]> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  if (!sheet) return [];

  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
  });

  // Sarlavhalarni moslashuvchan o'qiymiz (katta-kichik harf, bo'sh joy farqsiz).
  return json.map((raw) => {
    const lookup = (key: string) => {
      const found = Object.keys(raw).find(
        (k) => k.trim().toLowerCase() === key,
      );
      return found ? str(raw[found]) : "";
    };
    return {
      english: lookup("english"),
      uzbek: lookup("uzbek"),
      transcription: lookup("transcription"),
      example_en: lookup("example_en"),
      example_uz: lookup("example_uz"),
      category: lookup("category"),
      emoji: lookup("emoji"),
    };
  });
}

/** Convert a parsed row into a DB-ready WordInput (blank -> null). */
export function rowToWordInput(row: ParsedRow): WordInput {
  const blank = (v: string) => (v.trim() === "" ? null : v.trim());
  return {
    english: row.english.trim(),
    uzbek: row.uzbek.trim(),
    transcription: blank(row.transcription),
    example_en: blank(row.example_en),
    example_uz: blank(row.example_uz),
    category: row.category.trim() || "umumiy",
    emoji: blank(row.emoji),
  };
}

function downloadBlob(data: Uint8Array, filename: string) {
  const blob = new Blob([data as BlobPart], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Export all words to an .xlsx file. */
export function exportWordsToXlsx(words: Word[], filenameSuffix = "") {
  const rows = words.map((w) => ({
    english: w.english,
    uzbek: w.uzbek,
    transcription: w.transcription ?? "",
    example_en: w.example_en ?? "",
    example_uz: w.example_uz ?? "",
    category: w.category,
    emoji: w.emoji ?? "",
  }));

  const ws = XLSX.utils.json_to_sheet(rows, { header: [...EXCEL_COLUMNS] });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "words");

  const date = new Date().toISOString().slice(0, 10);
  const suffix = filenameSuffix ? `-${filenameSuffix}` : "";
  const out = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  downloadBlob(new Uint8Array(out), `culturelex-words-${date}${suffix}.xlsx`);
}

/** Download a 3-row sample template so admins know the expected columns. */
export function downloadTemplate() {
  const sample = [
    {
      english: "apple",
      uzbek: "olma",
      transcription: "[ˈæp.əl]",
      example_en: "I eat a red apple.",
      example_uz: "Men qizil olma yeyman.",
      category: "mevalar",
      emoji: "🍎",
    },
    {
      english: "cat",
      uzbek: "mushuk",
      transcription: "[kæt]",
      example_en: "The cat is sleeping.",
      example_uz: "Mushuk uxlayapti.",
      category: "hayvonlar",
      emoji: "🐱",
    },
    {
      english: "red",
      uzbek: "qizil",
      transcription: "[red]",
      example_en: "The apple is red.",
      example_uz: "Olma qizil.",
      category: "ranglar",
      emoji: "🔴",
    },
  ];

  const ws = XLSX.utils.json_to_sheet(sample, { header: [...EXCEL_COLUMNS] });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "namuna");
  const out = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  downloadBlob(new Uint8Array(out), "culturelex-namuna.xlsx");
}
