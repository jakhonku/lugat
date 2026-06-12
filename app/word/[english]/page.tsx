import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { getWordBySlug } from "@/lib/queries";
import { unslugifyWord } from "@/lib/utils";
import { WordCard } from "@/components/WordCard";
import { BottomNav } from "@/components/BottomNav";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { english: string };
}): Promise<Metadata> {
  const word = await getWordBySlug(unslugifyWord(params.english));
  if (!word) return { title: "So'z topilmadi — Culturelex" };
  return {
    title: `${word.english} — ${word.uzbek} | Culturelex`,
    description: `${word.english} (${word.transcription ?? ""}) o'zbekcha: ${word.uzbek}.`,
  };
}

export default async function WordPage({
  params,
}: {
  params: { english: string };
}) {
  const word = await getWordBySlug(unslugifyWord(params.english));
  if (!word) notFound();

  return (
    <main className="min-h-screen pb-28 md:pb-12">
      <div className="container max-w-2xl pt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Bosh sahifa
        </Link>

        <div className="mt-6">
          <WordCard word={word} featured />
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex h-12 items-center rounded-2xl bg-secondary px-6 font-bold text-secondary-foreground shadow-mint active:scale-95"
          >
            🔍 Boshqa so&apos;z qidirish
          </Link>
        </div>
      </div>
      <BottomNav />
    </main>
  );
}
