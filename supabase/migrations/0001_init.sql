-- =============================================================
-- Lug'atcha — boshlang'ich migration
-- Supabase SQL Editor'da to'liq ishga tushiring.
-- =============================================================

-- Fuzzy / trigram qidiruv uchun kengaytma
create extension if not exists pg_trgm;

-- So'zlar jadvali
create table if not exists public.words (
  id uuid primary key default gen_random_uuid(),
  english text not null,
  uzbek text not null,
  transcription text,
  example_en text,
  example_uz text,
  category text not null default 'umumiy',
  emoji text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indekslar
create index if not exists words_english_trgm_idx
  on public.words using gin (english gin_trgm_ops);
create index if not exists words_uzbek_trgm_idx
  on public.words using gin (uzbek gin_trgm_ops);
create index if not exists words_category_idx
  on public.words (category);

-- Inglizcha so'z bo'yicha tez qidiruv uchun (import dedup shunga tayanadi).
-- Bu UNIQUE emas: "orange" (apelsin / to'q sariq) kabi omonimlarga ruxsat beriladi.
create index if not exists words_english_lower_idx
  on public.words (lower(english));

-- updated_at ni avtomatik yangilash
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists words_set_updated_at on public.words;
create trigger words_set_updated_at
  before update on public.words
  for each row execute function public.set_updated_at();

-- =============================================================
-- Row Level Security
-- =============================================================
alter table public.words enable row level security;

-- Hamma uchun o'qish (public)
drop policy if exists "words_select_public" on public.words;
create policy "words_select_public"
  on public.words for select
  to anon, authenticated
  using (true);

-- Faqat tizimga kirgan (admin) foydalanuvchilar yozishi mumkin
drop policy if exists "words_insert_authenticated" on public.words;
create policy "words_insert_authenticated"
  on public.words for insert
  to authenticated
  with check (true);

drop policy if exists "words_update_authenticated" on public.words;
create policy "words_update_authenticated"
  on public.words for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "words_delete_authenticated" on public.words;
create policy "words_delete_authenticated"
  on public.words for delete
  to authenticated
  using (true);
