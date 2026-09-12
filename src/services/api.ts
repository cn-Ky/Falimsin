import { supabase } from './supabase';
import {
  DailyHoroscope,
  DrawnTarotCard,
  FalRequest,
  FalType,
  Profile,
  ZodiacKey,
} from '../types/fal';

/**
 * Günün burç yorumunu getirir. Supabase Edge Function tarafında,
 * o gün için önbellekte kayıt varsa direkt onu döner; yoksa Claude API
 * ile üretip `daily_horoscopes` tablosuna yazar. Böylece aynı burç için
 * günde sadece bir kez AI çağrısı yapılır.
 */
export async function fetchDailyHoroscope(sign: ZodiacKey): Promise<DailyHoroscope> {
  const { data, error } = await supabase.functions.invoke<DailyHoroscope>('daily-horoscope', {
    body: { sign },
  });
  if (error) throw error;
  if (!data) throw new Error('Burç yorumu alınamadı.');
  return data;
}

interface SubmitFalBase {
  type: FalType;
  question?: string;
}

interface SubmitTarotFal extends SubmitFalBase {
  type: 'tarot';
  cards: DrawnTarotCard[];
}

interface SubmitDreamFal extends SubmitFalBase {
  type: 'ruya';
  dreamText: string;
}

interface SubmitImageFal extends SubmitFalBase {
  type: 'kahve' | 'el';
  imagePath: string;
}

export type SubmitFalPayload = SubmitTarotFal | SubmitDreamFal | SubmitImageFal;

/**
 * Bir fal isteğini Edge Function'a gönderir; fonksiyon Claude API ile
 * yorumu üretir, `fal_requests` tablosuna kaydeder ve sonucu döner.
 */
export async function submitFalRequest(payload: SubmitFalPayload): Promise<FalRequest> {
  const { data, error } = await supabase.functions.invoke<FalRequest>('fal-yorumu', {
    body: payload,
  });
  if (error) throw error;
  if (!data) throw new Error('Fal yorumu alınamadı.');
  return data;
}

/** Kahve/el falı için seçilen fotoğrafı kullanıcıya özel bir klasöre yükler. */
export async function uploadFalImage(
  userId: string,
  fileUri: string,
  falType: 'kahve' | 'el',
): Promise<string> {
  const response = await fetch(fileUri);
  const arrayBuffer = await response.arrayBuffer();
  const extension = fileUri.split('.').pop()?.toLowerCase() ?? 'jpg';
  const path = `${userId}/${falType}-${Date.now()}.${extension}`;

  const { error } = await supabase.storage.from('fal-images').upload(path, arrayBuffer, {
    contentType: `image/${extension === 'jpg' ? 'jpeg' : extension}`,
    upsert: false,
  });
  if (error) throw error;
  return path;
}

export async function fetchFalHistory(userId: string): Promise<FalRequest[]> {
  const { data, error } = await supabase
    .from('fal_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateProfile(
  userId: string,
  changes: Partial<Pick<Profile, 'display_name' | 'birth_date' | 'zodiac_sign'>>,
): Promise<void> {
  const { error } = await supabase.from('profiles').update(changes).eq('id', userId);
  if (error) throw error;
}
