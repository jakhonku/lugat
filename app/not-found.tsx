import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="text-7xl">🙈</div>
      <h1 className="mt-4 text-3xl font-extrabold">Sahifa topilmadi</h1>
      <p className="mt-2 text-muted-foreground">
        Kechirasiz, bu sahifa mavjud emas.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex h-12 items-center rounded-2xl bg-primary px-6 font-bold text-primary-foreground shadow-soft active:scale-95"
      >
        Bosh sahifaga qaytish
      </Link>
    </main>
  );
}
