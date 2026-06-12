"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Email yoki parol noto'g'ri. Qayta urinib ko'ring.");
      setLoading(false);
      return;
    }

    router.replace("/admin");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border-2 border-border bg-card p-8 shadow-card">
        <div className="text-center">
          <div className="text-5xl">🔐</div>
          <h1 className="mt-3 text-2xl font-extrabold">Admin paneli</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Lug&apos;atcha boshqaruv paneliga kiring
          </p>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Parol</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error ? (
            <p className="rounded-xl bg-destructive/10 px-4 py-2 text-sm font-semibold text-destructive">
              {error}
            </p>
          ) : null}

          <Button type="submit" className="w-full" disabled={loading} size="lg">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Kirish"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm font-bold text-muted-foreground hover:text-foreground"
          >
            ← Bosh sahifaga qaytish
          </Link>
        </div>
      </div>
    </main>
  );
}
