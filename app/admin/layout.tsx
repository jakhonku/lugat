import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin/AdminNav";

export const metadata: Metadata = {
  title: "Admin — Lug'atcha",
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Tizimga kirmagan (login sahifasi) — faqat kontent ko'rsatamiz.
  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNav email={user.email ?? ""} />
      <div className="container py-8">{children}</div>
    </div>
  );
}
