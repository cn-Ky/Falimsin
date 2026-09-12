-- Falımsın: temel şema
-- Bu dosyayı Supabase SQL Editor'de çalıştırabilir ya da
-- `supabase db push` ile uygulayabilirsin.

-- 1) PROFILES ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  birth_date date,
  zodiac_sign text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Kullanıcı kendi profilini görebilir"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Kullanıcı kendi profilini güncelleyebilir"
  on public.profiles for update
  using (auth.uid() = id);

-- Yeni kullanıcı kaydolduğunda otomatik boş profil satırı oluştur.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2) DAILY HOROSCOPES (AI önbelleği) --------------------------------------
create table if not exists public.daily_horoscopes (
  id uuid primary key default gen_random_uuid(),
  sign text not null,
  date date not null,
  genel text not null,
  ask text not null,
  kariyer text not null,
  saglik text not null,
  sansli_sayi int not null,
  sansli_renk text not null,
  created_at timestamptz not null default now(),
  unique (sign, date)
);

alter table public.daily_horoscopes enable row level security;

-- Herkes günün burç yorumunu okuyabilir; yazma işlemi sadece
-- Edge Function'ın kullandığı service role ile yapılır (RLS'yi atlar).
create policy "Herkes günlük burç yorumlarını okuyabilir"
  on public.daily_horoscopes for select
  using (true);

-- 3) FAL REQUESTS ----------------------------------------------------------
create table if not exists public.fal_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('tarot', 'kahve', 'ruya', 'el')),
  input_summary text not null,
  image_path text,
  result text,
  status text not null default 'pending' check (status in ('pending', 'completed', 'error')),
  created_at timestamptz not null default now()
);

alter table public.fal_requests enable row level security;

-- Kullanıcı yalnızca kendi fal geçmişini görebilir.
-- Ekleme/güncelleme yalnızca Edge Function'ın service role'ü ile yapılır,
-- bu yüzden authenticated rol için insert/update policy'si tanımlanmadı.
create policy "Kullanıcı kendi fallarını görebilir"
  on public.fal_requests for select
  using (auth.uid() = user_id);

create index if not exists fal_requests_user_id_idx on public.fal_requests (user_id, created_at desc);

-- 4) STORAGE: fal-images bucket -------------------------------------------
insert into storage.buckets (id, name, public)
values ('fal-images', 'fal-images', false)
on conflict (id) do nothing;

create policy "Kullanıcı kendi fal fotoğrafını yükleyebilir"
  on storage.objects for insert
  with check (
    bucket_id = 'fal-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Kullanıcı kendi fal fotoğrafını görebilir"
  on storage.objects for select
  using (
    bucket_id = 'fal-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
