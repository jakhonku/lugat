import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getWordsByCategory } from "@/lib/queries";
import { categoryLabel } from "@/lib/utils";
import { WordCard } from "@/components/WordCard";
import { BottomNav } from "@/components/BottomNav";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
}: {
  params: { name: string };
}) {
  const category = decodeURIComponent(params.name);
  const words = await getWordsByCategory(category);

  return (
    <main className="min-h-screen pb-28 md:pb-12">
      <div className="container pt-8">
        <Link
          href="/categories"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Kategoriyalar
        </Link>

        <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">
          {categoryLabel(category)}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {words.length} ta so&apos;z
        </p>

        <div className="mx-auto mt-6 max-w-2xl space-y-4">
          {words.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-border bg-card/70 p-10 text-center">
              <div className="text-5xl">📭</div>
              <p className="mt-3 text-lg font-extrabold">
                Bu kategoriyada so&apos;z yo&apos;q
              </p>
            </div>
          ) : (
            words.map((word, i) => (
              <WordCard key={word.id} word={word} index={i} />
            ))
          )}
        </div>
      </div>
      <BottomNav />
    </main>
  );
}
