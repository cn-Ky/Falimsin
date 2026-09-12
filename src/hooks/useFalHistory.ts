import { useCallback, useEffect, useState } from 'react';
import { fetchFalHistory } from '../services/api';
import { FalRequest } from '../types/fal';

export function useFalHistory(userId: string | undefined) {
  const [history, setHistory] = useState<FalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!userId) {
      setHistory([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFalHistory(userId);
      setHistory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Geçmiş yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { history, loading, error, reload };
}
