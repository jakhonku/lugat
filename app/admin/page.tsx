import Link from "next/link";
import { getAdminStats } from "@/lib/queries";
import { categoryLabel } from "@/lib/utils";
import { Emoji } from "@/components/Emoji";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookA, FolderTree, Clock, Plus, Upload } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const stats = await getAdminStats();

  const cards = [
    {
      label: "Jami so'zlar",
      value: stats.total,
      icon: BookA,
      color: "bg-primary/15 text-primary",
    },
    {
      label: "Kategoriyalar",
      value: stats.categories,
      icon: FolderTree,
      color: "bg-secondary/20 text-secondary",
    },
    {
      label: "Oxirgi qo'shilganlar",
      value: stats.recent.length,
      icon: Clock,
      color: "bg-purple/15 text-purple",
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold">Boshqaruv paneli 👋</h1>
          <p className="text-muted-foreground">
            Culturelex so&apos;zlar bazasini boshqaring.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/words"
            className="inline-flex h-11 items-center gap-1.5 rounded-2xl bg-primary px-4 font-bold text-primary-foreground shadow-soft active:scale-95"
          >
            <Plus className="h-5 w-5" /> So&apos;z qo&apos;shish
          </Link>
          <Link
            href="/admin/import"
            className="inline-flex h-11 items-center gap-1.5 rounded-2xl border-2 border-border px-4 font-bold hover:bg-muted"
          >
            <Upload className="h-5 w-5" /> Import
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label}>
              <CardContent className="flex items-center gap-4 p-5">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl ${card.color}`}
                >
                  <Icon className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-3xl font-extrabold">{card.value}</p>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <h2 className="mt-10 text-xl font-extrabold">Oxirgi qo&apos;shilgan so&apos;zlar</h2>
      <div className="mt-4 space-y-2">
        {stats.recent.length === 0 ? (
          <p className="rounded-2xl border-2 border-dashed border-border bg-card p-6 text-center text-muted-foreground">
            Hali so&apos;z qo&apos;shilmagan. Birinchi so&apos;zni qo&apos;shing!
          </p>
        ) : (
          stats.recent.map((word) => (
            <div
              key={word.id}
              className="flex items-center gap-3 rounded-2xl border-2 border-border bg-card p-3"
            >
              <span className="text-2xl">
                <Emoji emoji={word.emoji ?? "📘"} />
              </span>
              <span className="font-extrabold">{word.english}</span>
              <span className="text-muted-foreground">— {word.uzbek}</span>
              <Badge variant="accent" className="ml-auto">
                {categoryLabel(word.category)}
              </Badge>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
