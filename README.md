# Lug'atcha 📚

Bolalar uchun inglizcha–o'zbekcha lug'at (PWA). Next.js 14 (App Router) + Supabase.

- Qidiruv, kategoriyalar, "kun so'zi", talaffuz (Web Speech)
- Admin panel: so'zlar CRUD, Excel import/eksport (Supabase Auth bilan himoyalangan)
- PWA: o'rnatish va offline rejim (service worker)

## Texnologiyalar

Next.js · React · TypeScript · Tailwind CSS · Supabase (Postgres + Auth) · Framer Motion

---

## Lokalda ishga tushirish

```bash
npm install
cp .env.example .env.local   # va kalitlarni to'ldiring (pastga qarang)
npm run dev
```

`http://localhost:3000` da ochiladi.

## Muhit o'zgaruvchilari (Environment variables)

| O'zgaruvchi | Kerakmi | Tavsif |
|-------------|---------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL (Dashboard → Project Settings → API) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase `anon` public key |
| `SUPABASE_SERVICE_ROLE_KEY` | faqat `npm run seed` uchun | `service_role` kaliti — **maxfiy**, hech qachon kodga/git'ga qo'shmang |

> Haqiqiy kalitlar faqat `.env.local` da bo'ladi (u `.gitignore` da). `.env.example` da faqat namuna qiymatlar turadi.

## Supabase'ni sozlash (bir martalik)

1. `supabase/migrations/0001_init.sql` ni Supabase **SQL Editor** da ishga tushiring (jadval + RLS).
2. Boshlang'ich so'zlarni yuklash: `npm run seed` (`.env.local` da `SUPABASE_SERVICE_ROLE_KEY` bo'lsin).
3. Admin foydalanuvchini Supabase **Authentication → Users** da yarating (email + parol). Login `/admin/login` da.

---

## Vercel'ga deploy

> Eslatma: `NEXT_PUBLIC_*` o'zgaruvchilar build paytida kodga joylashadi — shuning uchun ular Vercel'da **build'dan oldin** o'rnatilgan bo'lishi shart.

### A yo'li — Git + Vercel Dashboard (tavsiya etiladi)

1. Loyihani GitHub'ga push qiling (pastdagi "Git" bo'limiga qarang).
2. [vercel.com/new](https://vercel.com/new) → repo'ni import qiling. Framework avtomatik **Next.js** deb aniqlanadi.
3. **Environment Variables** bo'limiga yuqoridagi o'zgaruvchilarni qo'shing (Production + Preview).
4. **Deploy** ni bosing.

### B yo'li — Vercel CLI

```bash
npm i -g vercel
vercel            # birinchi marta: loyihani bog'lash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel --prod     # production deploy
```

### Git (agar hali bo'lmasa)

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main
```

`.env.local` `.gitignore` da bo'lgani uchun maxfiy kalitlar push qilinmaydi.
