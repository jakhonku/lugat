"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/", label: "Bosh sahifa", icon: Home },
  { href: "/categories", label: "Kategoriyalar", icon: LayoutGrid },
  { href: "/#kun-sozi", label: "Kun so'zi", icon: Sparkles },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Asosiy navigatsiya"
      className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-border bg-card/95 backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const base = item.href.split("#")[0] || "/";
          const active = item.href.includes("#")
            ? false // hash-anchor (masalan /#kun-sozi) — alohida sahifa emas
            : base === "/"
              ? pathname === "/"
              : pathname.startsWith(base);
          return (
            <li key={item.label} className="flex-1">
              <Link
                href={item.href}
                className={cn(
                  "flex min-h-[56px] flex-col items-center justify-center gap-0.5 py-2 text-xs font-bold transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="h-6 w-6" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
