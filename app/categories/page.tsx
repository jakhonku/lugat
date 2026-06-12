import Link from "next/link";
import { getCategories } from "@/lib/queries";
import { categoryLabel } from "@/lib/utils";
import { BottomNav } from "@/components/BottomNav";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

const CHIP_COLORS = [
  "bg-primary/15 border-primary/40",
  "bg-secondary/20 border-secondary/50",
  "bg-purple/15 border-purple/40",
  "bg-accent/30 border-accent/60",
];

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <main className="min-h-screen pb-28 md:pb-12">
      <div className="container pt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Bosh sahifa
        </Link>

        <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">
          Kategoriyalar 🗂️
        </h1>
        <p className="mt-1 text-muted-foreground">
          Mavzuni tanlab, so&apos;zlarni o&apos;rganing!
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {categories.map((category, i) => (
            <Link
              key={category}
              href={`/category/${encodeURIComponent(category)}`}
              className={`flex min-h-[96px] flex-col justify-end rounded-2xl border-2 p-4 text-lg font-extrabold shadow-card transition-transform hover:-translate-y-1 active:scale-95 ${
                CHIP_COLORS[i % CHIP_COLORS.length]
              }`}
            >
              {categoryLabel(category)}
            </Link>
          ))}
        </div>
      </div>
      <BottomNav />
    </main>
  );
}
