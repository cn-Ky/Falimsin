import { DrawnTarotCard, FalRequest, ZodiacKey } from '../types/fal';

export type HomeStackParamList = {
  Home: undefined;
  HoroscopeDetail: { sign: ZodiacKey };
  FalResult: { request: FalRequest };
};

export type FalStackParamList = {
  FalHub: undefined;
  Tarot: undefined;
  Kahve: undefined;
  Ruya: undefined;
  El: undefined;
  FalResult: { request: FalRequest };
};

export type HoroscopeStackParamList = {
  HoroscopeList: undefined;
  HoroscopeDetail: { sign: ZodiacKey };
};

export type ProfileStackParamList = {
  Profile: undefined;
  FalHistory: undefined;
  FalResult: { request: FalRequest };
};

export type AppTabParamList = {
  AnaSayfa: undefined;
  FalBak: undefined;
  Burclar: undefined;
  Profil: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

// Yardımcı tip: tarot kartı seçim ekranından sonuç ekranına taşınan veri.
export interface TarotSelection {
  cards: DrawnTarotCard[];
}
