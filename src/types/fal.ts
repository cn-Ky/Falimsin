export type ZodiacKey =
  | 'koc'
  | 'boga'
  | 'ikizler'
  | 'yengec'
  | 'aslan'
  | 'basak'
  | 'terazi'
  | 'akrep'
  | 'yay'
  | 'oglak'
  | 'kova'
  | 'balik';

export type FalType = 'tarot' | 'kahve' | 'ruya' | 'el';

export interface DailyHoroscope {
  sign: ZodiacKey;
  date: string; // YYYY-MM-DD
  genel: string;
  ask: string;
  kariyer: string;
  saglik: string;
  sansli_sayi: number;
  sansli_renk: string;
}

export interface TarotCard {
  id: string;
  name: string;
  arcana: 'major' | 'minor';
  keywords: string[];
}

export interface DrawnTarotCard {
  card: TarotCard;
  reversed: boolean;
  position: number;
}

export interface FalRequest {
  id: string;
  user_id: string;
  type: FalType;
  input_summary: string;
  image_path: string | null;
  result: string | null;
  status: 'pending' | 'completed' | 'error';
  created_at: string;
}

export interface Profile {
  id: string;
  display_name: string | null;
  birth_date: string | null; // YYYY-MM-DD
  zodiac_sign: ZodiacKey | null;
  created_at: string;
}
