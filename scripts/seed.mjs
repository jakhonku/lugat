// Supabase'ga 100+ boshlang'ich so'zni yuklaydigan skript.
//
// Ishlatish:
//   1) .env.local faylida NEXT_PUBLIC_SUPABASE_URL va SUPABASE_SERVICE_ROLE_KEY bo'lsin
//   2) npm run seed
//
// Eslatma: service_role kaliti RLS'ni chetlab o'tadi — uni faqat shu yerda ishlating.

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { words } from "./words-data.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

// .env.local ni qo'lda o'qiymiz (qo'shimcha paketsiz).
function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    try {
      const content = readFileSync(join(__dirname, "..", file), "utf8");
      for (const line of content.split("\n")) {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
        if (match && !process.env[match[1]]) {
          process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
        }
      }
    } catch {
      /* fayl yo'q — e'tiborsiz qoldiramiz */
    }
  }
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "❌ NEXT_PUBLIC_SUPABASE_URL yoki SUPABASE_SERVICE_ROLE_KEY topilmadi (.env.local).",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

async function main() {
  console.log(`🌱 ${words.length} ta so'z yuklanmoqda...`);

  // Idempotent bo'lishi uchun: avval shu inglizcha so'zlarni o'chiramiz, keyin qo'shamiz.
  const englishList = words.map((w) => w.english);
  const { error: delError } = await supabase
    .from("words")
    .delete()
    .in("english", englishList);

  if (delError) {
    console.error("❌ Eski yozuvlarni o'chirishda xatolik:", delError.message);
    process.exit(1);
  }

  const { error } = await supabase.from("words").insert(words);

  if (error) {
    console.error("❌ Xatolik:", error.message);
    process.exit(1);
  }

  const { count } = await supabase
    .from("words")
    .select("*", { count: "exact", head: true });

  console.log(`✅ Tayyor! Bazada jami ${count} ta so'z bor.`);
}

main();
