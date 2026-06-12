// words-data.mjs dan supabase/seed.sql faylini hosil qiladi.
// Ishlatish: node scripts/generate-seed-sql.mjs
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { words } from "./words-data.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

const esc = (v) =>
  v === null || v === undefined ? "null" : `'${String(v).replace(/'/g, "''")}'`;

const rows = words
  .map(
    (w) =>
      `  (${esc(w.english)}, ${esc(w.uzbek)}, ${esc(w.transcription)}, ${esc(
        w.example_en,
      )}, ${esc(w.example_uz)}, ${esc(w.category)}, ${esc(w.emoji)})`,
  )
  .join(",\n");

const sql = `-- =============================================================
-- Culturelex — boshlang'ich so'zlar (${words.length} ta)
-- 0001_init.sql dan KEYIN ishga tushiring.
-- Qayta ishga tushirsangiz, avval shu so'zlarni o'chirib, qaytadan qo'shadi.
-- =============================================================

delete from public.words
where english in (${words.map((w) => esc(w.english)).join(", ")});

insert into public.words (english, uzbek, transcription, example_en, example_uz, category, emoji) values
${rows};
`;

writeFileSync(join(__dirname, "..", "supabase", "seed.sql"), sql, "utf8");
console.log(`✅ supabase/seed.sql hosil qilindi (${words.length} ta so'z).`);
