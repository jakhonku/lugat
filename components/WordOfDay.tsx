import type { Word } from "@/types";
import { WordCard } from "@/components/WordCard";
import { Emoji } from "@/components/Emoji";

export function WordOfDay({ word }: { word: Word | null }) {
  if (!word) return null;

  return (
    <section id="kun-sozi" className="mx-auto mt-10 max-w-2xl scroll-mt-24">
      <div className="mb-3 flex items-center justify-center gap-2">
        <Emoji emoji="🌟" className="text-2xl" />
        <h2 className="text-center text-2xl font-extrabold text-purple">
          Kun so'zi
        </h2>
        <Emoji emoji="🌟" className="text-2xl" />
      </div>
      <div className="rounded-[1.75rem] bg-gradient-to-br from-accent/40 via-secondary/20 to-purple/20 p-1.5 shadow-purple">
        <WordCard word={word} featured />
      </div>
    </section>
  );
}
