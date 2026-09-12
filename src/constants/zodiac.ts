import { ZodiacKey } from '../types/fal';

export interface ZodiacInfo {
  key: ZodiacKey;
  name: string;
  symbol: string;
  element: 'Ateş' | 'Toprak' | 'Hava' | 'Su';
  dateRange: string;
  // Month is 1-12. Range may wrap across year end (Oglak).
  start: { month: number; day: number };
  end: { month: number; day: number };
}

export const zodiacSigns: ZodiacInfo[] = [
  { key: 'koc', name: 'Koç', symbol: '♈', element: 'Ateş', dateRange: '21 Mart - 19 Nisan', start: { month: 3, day: 21 }, end: { month: 4, day: 19 } },
  { key: 'boga', name: 'Boğa', symbol: '♉', element: 'Toprak', dateRange: '20 Nisan - 20 Mayıs', start: { month: 4, day: 20 }, end: { month: 5, day: 20 } },
  { key: 'ikizler', name: 'İkizler', symbol: '♊', element: 'Hava', dateRange: '21 Mayıs - 20 Haziran', start: { month: 5, day: 21 }, end: { month: 6, day: 20 } },
  { key: 'yengec', name: 'Yengeç', symbol: '♋', element: 'Su', dateRange: '21 Haziran - 22 Temmuz', start: { month: 6, day: 21 }, end: { month: 7, day: 22 } },
  { key: 'aslan', name: 'Aslan', symbol: '♌', element: 'Ateş', dateRange: '23 Temmuz - 22 Ağustos', start: { month: 7, day: 23 }, end: { month: 8, day: 22 } },
  { key: 'basak', name: 'Başak', symbol: '♍', element: 'Toprak', dateRange: '23 Ağustos - 22 Eylül', start: { month: 8, day: 23 }, end: { month: 9, day: 22 } },
  { key: 'terazi', name: 'Terazi', symbol: '♎', element: 'Hava', dateRange: '23 Eylül - 22 Ekim', start: { month: 9, day: 23 }, end: { month: 10, day: 22 } },
  { key: 'akrep', name: 'Akrep', symbol: '♏', element: 'Su', dateRange: '23 Ekim - 21 Kasım', start: { month: 10, day: 23 }, end: { month: 11, day: 21 } },
  { key: 'yay', name: 'Yay', symbol: '♐', element: 'Ateş', dateRange: '22 Kasım - 21 Aralık', start: { month: 11, day: 22 }, end: { month: 12, day: 21 } },
  { key: 'oglak', name: 'Oğlak', symbol: '♑', element: 'Toprak', dateRange: '22 Aralık - 19 Ocak', start: { month: 12, day: 22 }, end: { month: 1, day: 19 } },
  { key: 'kova', name: 'Kova', symbol: '♒', element: 'Hava', dateRange: '20 Ocak - 18 Şubat', start: { month: 1, day: 20 }, end: { month: 2, day: 18 } },
  { key: 'balik', name: 'Balık', symbol: '♓', element: 'Su', dateRange: '19 Şubat - 20 Mart', start: { month: 2, day: 19 }, end: { month: 3, day: 20 } },
];

export function getZodiacInfo(key: ZodiacKey): ZodiacInfo {
  const info = zodiacSigns.find((z) => z.key === key);
  if (!info) throw new Error(`Unknown zodiac key: ${key}`);
  return info;
}

/** Burç bir doğum tarihinden hesaplanır (yıl önemsiz, sadece gün/ay). */
export function getZodiacFromDate(date: Date): ZodiacKey {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  for (const sign of zodiacSigns) {
    const { start, end } = sign;
    if (start.month === end.month) {
      if (month === start.month && day >= start.day && day <= end.day) return sign.key;
      continue;
    }
    if (start.month > end.month) {
      // wraps around new year (Oglak: Dec 22 - Jan 19)
      if ((month === start.month && day >= start.day) || (month === end.month && day <= end.day)) {
        return sign.key;
      }
      continue;
    }
    if (
      (month === start.month && day >= start.day) ||
      (month === end.month && day <= end.day) ||
      (month > start.month && month < end.month)
    ) {
      return sign.key;
    }
  }
  // Fallback, should not happen
  return 'koc';
}
