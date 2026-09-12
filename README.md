# Falımsın 🔮

Trogworks Studio için geliştirilen, React Native (Expo) + Supabase tabanlı
fullstack fal & astroloji uygulaması.

## Özellikler

- **Günlük burç yorumu** — 12 burç için Claude API ile üretilip günde bir kez
  önbelleğe alınan (aynı gün tekrar üretilmeyen) genel/aşk/kariyer/sağlık
  yorumları + şanslı sayı & renk.
- **Fal Bak** — kullanıcı istediği zaman istediği falı seçer:
  - 🔮 **Tarot** — 21 kartlık bir açılımdan 3 kart seç (geçmiş/şimdi/gelecek),
    Claude kartları birlikte yorumlar.
  - ☕ **Kahve falı** — fincan fotoğrafı yükle, Claude görseli inceleyip yorumlar.
  - 🌙 **Rüya tabiri** — rüyanı yaz, sembolik yorumunu al.
  - 🖐️ **El falı** — avuç içi fotoğrafı yükle, çizgilerin yorumlanır.
- **Fal geçmişi** — geçmiş falların Profil sekmesinden tekrar okunabilir.
- **Kimlik doğrulama** — Supabase Auth (e-posta/şifre), kayıt sırasında
  doğum tarihinden otomatik burç hesaplama.
- **Reklam** — AdMob banner alanı (gerçek reklamlar için bkz. aşağıdaki not).

## Mimari

```
falımsın/
├── App.tsx, index.ts          Expo giriş noktası
├── src/
│   ├── components/            Ortak UI bileşenleri (buton, kart, gradient...)
│   ├── constants/              Renkler, burç verisi, tarot destesi, fal tipleri
│   ├── hooks/                  useAuth, useProfile, useDailyHoroscope, ...
│   ├── navigation/              Alt sekme + her sekme için stack navigator
│   ├── screens/                 Tüm ekranlar (auth/ altında login & kayıt)
│   ├── services/                supabase client + api.ts (Edge Function çağrıları)
│   └── types/                    Paylaşılan TS tipleri + Supabase DB tipleri
└── supabase/
    ├── migrations/0001_init.sql  Tablolar, RLS politikaları, storage bucket
    └── functions/
        ├── daily-horoscope/      Günlük burç yorumu üretir/önbellekler
        ├── fal-yorumu/           Tarot/kahve/rüya/el falı yorumlarını üretir
        └── _shared/               CORS + Anthropic API yardımcıları
```

**Neden Edge Function?** Claude API anahtarı asla mobil uygulamaya
gömülmemeli. Tüm AI çağrıları sunucu tarafında (Supabase Edge Functions,
Deno) çalışır; uygulama yalnızca `supabase.functions.invoke(...)` ile bu
fonksiyonları çağırır ve kullanıcının oturum token'ı otomatik olarak eklenir.

## Kurulum

### 1) Bağımlılıklar

```bash
npm install
npx expo install --fix   # Expo SDK 57 ile tam uyumlu sürümleri kilitler
```

> Not: `package.json`'daki sürümler elle seçildi; `expo install --fix`
> çalıştırman, bu ortamda internet erişimi olmadan üretildiği için önemli.

### 2) Supabase projesi

1. [supabase.com](https://supabase.com) üzerinde yeni bir proje oluştur.
2. **SQL Editor**'e girip `supabase/migrations/0001_init.sql` dosyasının
   içeriğini çalıştır (tabloları, RLS politikalarını ve `fal-images`
   storage bucket'ını oluşturur).
3. Proje ayarlarından `Project URL` ve `anon public` anahtarını al, bunları
   `.env` dosyasına yaz (`.env.example`'ı kopyala).
4. E-posta doğrulamasını geliştirme aşamasında kapatmak istersen:
   **Authentication > Providers > Email > Confirm email**'i kapat (aksi
   halde kayıt sonrası profil bilgileri ilk girişe kadar kaydolmaz).

### 3) Edge Functions

```bash
npm install -g supabase   # Supabase CLI
supabase login
supabase link --project-ref <proje-ref-buraya>

# Claude API anahtarını sunucu tarafına gizli değişken olarak ekle
supabase secrets set ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxx

supabase functions deploy daily-horoscope
supabase functions deploy fal-yorumu
```

`SUPABASE_URL`, `SUPABASE_ANON_KEY` ve `SUPABASE_SERVICE_ROLE_KEY` Edge
Function ortamında Supabase tarafından otomatik sağlanır; ekstra bir şey
yapmana gerek yok.

### 4) Uygulamayı çalıştır

```bash
npx expo start
```

Expo Go ile açabilirsin; **AdMob banner'ları Expo Go'da görünmez** (native
modül gerektirir). Gerçek reklamları test etmek için:

```bash
npx expo run:android   # ya da run:ios
# veya bir EAS development build oluştur
```

`app.json` içindeki AdMob App ID'leri şu an Google'ın herkese açık **test**
ID'leridir. Yayına almadan önce kendi AdMob hesabından gerçek App ID ve
Banner Unit ID'lerini alıp hem `app.json`'ı hem de
`src/components/BannerAdSlot.tsx` içindeki `unitId` değerini güncelle.

## Devam Eden / Bilinçli Bırakılan Noktalar

- **Sürüm numaraları**: `package.json`'daki paket sürümleri bu ortamda
  internet erişimi olmadan seçildi; `npx expo install --fix` ile
  doğrulanmalı.
- **Claude model adı**: Edge Function'lar `claude-sonnet-5` kullanıyor
  (`supabase/functions/_shared/anthropic.ts`). Anthropic konsolundaki
  güncel model listesine göre değiştirebilirsin.
- **Tarot destesi**: 78 kart da mevcut (Majör + Minör Arkana), ancak minör
  kartların anahtar kelimeleri suit bazında genelleştirildi — asıl yorumu
  zaten Claude ürettiği için bu bir sorun teşkil etmiyor.
- **AdMob**: Native modül eklendi ama gerçek reklam birimleri senin AdMob
  hesabınla eşleştirilmeli (yukarı bakınız).
- **Görsel/asset dosyaları**: `assets/` klasöründeki icon/splash dosyaları
  değiştirilmedi; kendi marka görsellerinle değiştirmen gerekir.
