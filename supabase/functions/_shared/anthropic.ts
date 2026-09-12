// Basit Anthropic Messages API istemcisi (Deno fetch tabanlı, SDK gerektirmez).

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-5';

interface TextBlock {
  type: 'text';
  text: string;
}

interface ImageBlock {
  type: 'image';
  source: { type: 'base64'; media_type: string; data: string };
}

type ContentBlock = TextBlock | ImageBlock;

interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string | ContentBlock[];
}

export async function callClaude(params: {
  system: string;
  messages: AnthropicMessage[];
  maxTokens?: number;
}): Promise<string> {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY tanımlı değil. `supabase secrets set ANTHROPIC_API_KEY=...` ile ekle.');
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: params.maxTokens ?? 1024,
      system: params.system,
      messages: params.messages,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Claude API hatası (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const textBlock = (data.content ?? []).find((b: any) => b.type === 'text');
  if (!textBlock) throw new Error('Claude yanıtında metin bulunamadı.');
  return textBlock.text as string;
}

/** Claude'dan gelen metni JSON olarak ayrıştırır; ```json çitlerini temizler. */
export function parseJsonResponse<T>(text: string): T {
  const cleaned = text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned) as T;
}
