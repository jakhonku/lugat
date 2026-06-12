"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LayoutDashboard, BookA, Upload, LogOut, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Boshqaruv", icon: LayoutDashboard, exact: true },
  { href: "/admin/words", label: "So'zlar", icon: BookA },
  { href: "/admin/import", label: "Import / Eksport", icon: Upload },
];

export function AdminNav({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 border-b-2 border-border bg-card/95 backdrop-blur">
      <div className="container flex h-16 items-center gap-4">
        <Link href="/admin" className="flex items-center gap-2 font-extrabold">
          <span className="text-2xl">📚</span>
          <span className="hidden sm:inline">Culturelex admin</span>
        </Link>

        <nav className="ml-2 flex items-center gap-1 overflow-x-auto">
          {LINKS.map((link) => {
            const Icon = link.icon;
            const active = link.exact
              ? pathname === link.href
              : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex h-10 items-center gap-1.5 whitespace-nowrap rounded-xl px-3 text-sm font-bold transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden md:inline">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="hidden items-center gap-1 text-sm font-bold text-muted-foreground hover:text-foreground sm:flex"
          >
            Saytni ko&apos;rish <ExternalLink className="h-4 w-4" />
          </Link>
          <span className="hidden text-sm text-muted-foreground lg:inline">
            {email}
          </span>
          <button
            type="button"
            onClick={signOut}
            className="flex h-10 items-center gap-1.5 rounded-xl border-2 border-border px-3 text-sm font-bold hover:bg-muted"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Chiqish</span>
          </button>
        </div>
      </div>
    </header>
  );
}
