import { useCallback, useEffect, useState } from 'react';
import { fetchDailyHoroscope } from '../services/api';
import { DailyHoroscope, ZodiacKey } from '../types/fal';

export function useDailyHoroscope(sign: ZodiacKey | null) {
  const [horoscope, setHoroscope] = useState<DailyHoroscope | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!sign) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDailyHoroscope(sign);
      setHoroscope(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Burç yorumu yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, [sign]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { horoscope, loading, error, reload };
}
