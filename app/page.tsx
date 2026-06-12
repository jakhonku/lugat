import { getCategories, getWordOfDay } from "@/lib/queries";
import { SearchView } from "@/components/SearchView";
import { WordOfDay } from "@/components/WordOfDay";
import { BottomNav } from "@/components/BottomNav";
import { InstallPrompt } from "@/components/InstallPrompt";
import { Emoji } from "@/components/Emoji";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, wordOfDay] = await Promise.all([
    getCategories(),
    getWordOfDay(),
  ]);

  return (
    <main className="min-h-screen pb-28 md:pb-12">
      <div className="container pt-8 sm:pt-12">
        {/* Hero */}
        <header className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
            Lug&apos;atcha{" "}
            <span className="inline-block animate-pop-in">
              <Emoji emoji="📚" />
            </span>
          </h1>
          <p className="mt-3 text-lg font-semibold text-muted-foreground sm:text-xl">
            Inglizcha so&apos;zlarni o&apos;rganamiz!
          </p>
        </header>

        {/* Qidiruv */}
        <div className="mt-8">
          <SearchView categories={categories} />
        </div>

        {/* Kun so'zi */}
        <WordOfDay word={wordOfDay} />

        {/* Pastki taglik */}
        <footer className="mt-16 pb-4 text-center text-sm text-muted-foreground">
          <p>Lug&apos;atcha — bolalar uchun inglizcha-o&apos;zbekcha lug&apos;at 💛</p>
        </footer>
      </div>

      <InstallPrompt />
      <BottomNav />
    </main>
  );
}
