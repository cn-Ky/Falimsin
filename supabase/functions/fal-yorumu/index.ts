// Supabase Edge Function: fal-yorumu
// Tarot, kahve falı, rüya tabiri ve el falı isteklerini tek noktadan
// karşılar: Claude API ile yorumu üretir, fal_requests tablosuna
// kaydeder ve sonucu döner.
// Deploy: supabase functions deploy fal-yorumu

import { createClient } from 'jsr:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { callClaude } from '../_shared/anthropic.ts';

interface DrawnTarotCard {
  card: { name: string; arcana: 'major' | 'minor'; keywords: string[] };
  reversed: boolean;
  position: number;
}

type Body =
  | { type: 'tarot'; cards: DrawnTarotCard[]; question?: string }
  | { type: 'ruya'; dreamText: string; question?: string }
  | { type: 'kahve' | 'el'; imagePath: string; question?: string };

const POSITION_LABELS = ['Geçmiş', 'Şimdi', 'Gelecek'];

const SYSTEM_PROMPTS: Record<string, string> = {
  tarot:
    'Sen deneyimli, sezgisel bir tarot falcısısın. Türkçe, sıcak ve akıcı ' +
    'bir dille yorum yapıyorsun. Verilen kartları pozisyonlarına ' +
    '(geçmiş/şimdi/gelecek) göre birlikte yorumla, kartlar arasında bir ' +
    'anlatı kur. Yanıtın eğlence amaçlı olduğunu unutma; iddialı sağlık, ' +
    'hukuk veya finansal kararlar dayatma. 4-6 paragraf yaz.',
  kahve:
    'Sen deneyimli bir kahve falcısısın. Fotoğraftaki fincandaki telve ' +
    'şekillerini, sembolleri ve desenleri Türkçe, sıcak ve akıcı bir dille ' +
    'yorumluyorsun. Gördüğün şekillere dair yaratıcı ama tutarlı bir ' +
    'anlatı kur. Eğlence amaçlı olduğunu unutma. 3-5 paragraf yaz.',
  el:
    'Sen deneyimli bir el falcısısın (kiromansi). Fotoğraftaki avuç içi ' +
    'çizgilerini (yaşam çizgisi, kalp çizgisi, akıl çizgisi vb.) Türkçe, ' +
    'sıcak ve akıcı bir dille yorumluyorsun. Eğlence amaçlı olduğunu ' +
    'unutma. 3-5 paragraf yaz.',
  ruya:
    'Sen deneyimli bir rüya tabircisisin. Anlatılan rüyadaki sembolleri ' +
    'Türkçe, sıcak ve akıcı bir dille yorumluyorsun, sembollerin olası ' +
    'anlamlarını günlük hayatla ilişkilendiriyorsun. Eğlence amaçlı ' +
    'olduğunu unutma. 3-5 paragraf yaz.',
};

function buildTarotPrompt(cards: DrawnTarotCard[], question?: string) {
  const cardLines = cards
    .map((c) => {
      const label = POSITION_LABELS[c.position - 1] ?? `${c.position}. kart`;
      return `${label}: ${c.card.name}${c.reversed ? ' (ters)' : ''} — anahtar kelimeler: ${c.card.keywords.join(', ')}`;
    })
    .join('\n');
  const questionLine = question ? `\nDanışanın sorusu: "${question}"` : '';
  return `Açılan kartlar:\n${cardLines}${questionLine}\n\nBu açılımı danışana yorumla.`;
}

function summarizeInput(body: Body): string {
  if (body.type === 'tarot') {
    return body.cards.map((c) => `${c.card.name}${c.reversed ? ' (ters)' : ''}`).join(', ');
  }
  if (body.type === 'ruya') {
    return body.dreamText.length > 140 ? `${body.dreamText.slice(0, 140)}…` : body.dreamText;
  }
  return body.question ? `Fotoğraf + soru: ${body.question}` : 'Fotoğraf yüklendi';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Oturum bulunamadı.' }), {
        status: 401,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      });
    }

    // Kullanıcıyı doğrulamak için anon key + gelen Authorization header'ı kullan.
    const authClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const {
      data: { user },
      error: userError,
    } = await authClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Oturum doğrulanamadı.' }), {
        status: 401,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      });
    }

    // Veritabanı yazma / storage okuma işlemleri için service role.
    const db = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const body = (await req.json()) as Body;
    const inputSummary = summarizeInput(body);
    const imagePath = body.type === 'kahve' || body.type === 'el' ? body.imagePath : null;

    let result: string;
    let status: 'completed' | 'error' = 'completed';

    try {
      if (body.type === 'tarot') {
        result = await callClaude({
          system: SYSTEM_PROMPTS.tarot,
          messages: [{ role: 'user', content: buildTarotPrompt(body.cards, body.question) }],
          maxTokens: 1200,
        });
      } else if (body.type === 'ruya') {
        const questionLine = body.question ? `\nEk soru: "${body.question}"` : '';
        result = await callClaude({
          system: SYSTEM_PROMPTS.ruya,
          messages: [{ role: 'user', content: `Rüya: ${body.dreamText}${questionLine}` }],
          maxTokens: 1000,
        });
      } else {
        // kahve | el — fotoğrafı storage'dan indirip Claude'a görsel olarak yolla
        const { data: fileData, error: downloadError } = await db.storage
          .from('fal-images')
          .download(body.imagePath);
        if (downloadError || !fileData) {
          throw new Error('Fotoğraf indirilemedi, tekrar yüklemeyi dener misin?');
        }
        const arrayBuffer = await fileData.arrayBuffer();
        const base64 = btoa(
          new Uint8Array(arrayBuffer).reduce((acc, byte) => acc + String.fromCharCode(byte), ''),
        );
        const mediaType = fileData.type || 'image/jpeg';
        const questionLine = body.question ? `Danışanın sorusu: "${body.question}"` : '';

        result = await callClaude({
          system: SYSTEM_PROMPTS[body.type],
          messages: [
            {
              role: 'user',
              content: [
                { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
                {
                  type: 'text',
                  text: `Bu fotoğrafı yorumla. ${questionLine}`.trim(),
                },
              ],
            },
          ],
          maxTokens: 1200,
        });
      }
    } catch (aiError) {
      console.error('Claude çağrısı başarısız:', aiError);
      result = aiError instanceof Error ? aiError.message : 'Yorum üretilemedi.';
      status = 'error';
    }

    const { data: saved, error: insertError } = await db
      .from('fal_requests')
      .insert({
        user_id: user.id,
        type: body.type,
        input_summary: inputSummary,
        image_path: imagePath,
        result: status === 'completed' ? result : null,
        status,
      })
      .select('*')
      .single();

    if (insertError) throw insertError;

    return new Response(JSON.stringify(saved), {
      status: status === 'completed' ? 200 : 502,
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
