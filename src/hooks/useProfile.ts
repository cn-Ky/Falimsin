import { useCallback, useEffect, useState } from 'react';
import { fetchProfile, updateProfile } from '../services/api';
import { Profile } from '../types/fal';

export function useProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProfile(userId);
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Profil yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const save = useCallback(
    async (changes: Partial<Pick<Profile, 'display_name' | 'birth_date' | 'zodiac_sign'>>) => {
      if (!userId) return;
      await updateProfile(userId, changes);
      await reload();
    },
    [userId, reload],
  );

  return { profile, loading, error, reload, save };
}
