import Link from "next/link";

export const metadata = { title: "Oflayn — Culturelex" };

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="text-7xl">📡</div>
      <h1 className="mt-4 text-3xl font-extrabold">Internet yo&apos;q</h1>
      <p className="mt-2 max-w-sm text-muted-foreground">
        Hozir oflayndasiz. Avval ko&apos;rgan so&apos;zlaringiz keshdan
        ko&apos;rinishi mumkin. Internet qaytganda hamma narsa ishlaydi!
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex h-12 items-center rounded-2xl bg-primary px-6 font-bold text-primary-foreground shadow-soft active:scale-95"
      >
        Qayta urinish
      </Link>
    </main>
  );
}
