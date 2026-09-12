// Supabase Edge Function: daily-horoscope
// Günün burç yorumunu döner. Aynı gün + burç için önbellekte kayıt
// varsa direkt onu döner; yoksa Claude API ile üretip kaydeder.
// Deploy: supabase functions deploy daily-horoscope

import { createClient } from 'jsr:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { callClaude, parseJsonResponse } from '../_shared/anthropic.ts';

const VALID_SIGNS = [
  'koc', 'boga', 'ikizler', 'yengec', 'aslan', 'basak',
  'terazi', 'akrep', 'yay', 'oglak', 'kova', 'balik',
];

const SIGN_NAMES: Record<string, string> = {
  koc: 'Koç', boga: 'Boğa', ikizler: 'İkizler', yengec: 'Yengeç',
  aslan: 'Aslan', basak: 'Başak', terazi: 'Terazi', akrep: 'Akrep',
  yay: 'Yay', oglak: 'Oğlak', kova: 'Kova', balik: 'Balık',
};

interface HoroscopeJson {
  genel: string;
  ask: string;
  kariyer: string;
  saglik: string;
  sansli_sayi: number;
  sansli_renk: string;
}

function todayInIstanbul(): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date()); // "YYYY-MM-DD"
}

async function generateHoroscope(sign: string): Promise<HoroscopeJson> {
  const raw = await callClaude({
    system:
      'Sen deneyimli, sıcak ve pozitif bir astrologsun. Türkçe, akıcı ve ' +
      'samimi bir üslupla günlük burç yorumları yazıyorsun. Yanıtın SADECE ' +
      'geçerli bir JSON nesnesi olmalı, başka hiçbir açıklama ekleme.',
    messages: [
      {
        role: 'user',
        content:
          `Bugün için ${SIGN_NAMES[sign]} burcuna özel bir günlük yorum yaz. ` +
          'Şu alanları içeren bir JSON döndür: ' +
          '{"genel": "2-3 cümlelik genel gün yorumu", ' +
          '"ask": "2-3 cümlelik aşk/ilişkiler yorumu", ' +
          '"kariyer": "2-3 cümlelik iş/kariyer yorumu", ' +
          '"saglik": "2-3 cümlelik sağlık/enerji yorumu", ' +
          '"sansli_sayi": 1 ile 99 arası bir tam sayı, ' +
          '"sansli_renk": "Türkçe bir renk adı"}. ' +
          'Genel, klişelerden kaçınan ama olumlu ve motive edici bir ton kullan.',
      },
    ],
    maxTokens: 700,
  });
  return parseJsonResponse<HoroscopeJson>(raw);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sign } = await req.json();
    if (typeof sign !== 'string' || !VALID_SIGNS.includes(sign)) {
      return new Response(JSON.stringify({ error: 'Geçersiz burç.' }), {
        status: 400,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const date = todayInIstanbul();

    const { data: existing } = await supabase
      .from('daily_horoscopes')
      .select('*')
      .eq('sign', sign)
      .eq('date', date)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify(existing), {
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      });
    }

    const generated = await generateHoroscope(sign);

    const { data: saved, error: upsertError } = await supabase
      .from('daily_horoscopes')
      .upsert(
        { sign, date, ...generated },
        { onConflict: 'sign,date' },
      )
      .select('*')
      .single();

    if (upsertError) throw upsertError;

    return new Response(JSON.stringify(saved), {
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Bilinmeyen hata' }),
      { status: 500, headers: { ...corsHeaders, 'content-type': 'application/json' } },
    );
  }
});
