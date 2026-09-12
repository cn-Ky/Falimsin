import { useState } from 'react';
import { submitFalRequest, uploadFalImage } from '../services/api';
import { FalRequest } from '../types/fal';

/**
 * Kahve falı ve el falı ekranlarının ortak akışı: fotoğrafı Storage'a
 * yükle, ardından fal-yorumu Edge Function'ını çağır.
 */
export function useImageFalSubmit(userId: string | undefined, falType: 'kahve' | 'el') {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(imageUri: string, question?: string): Promise<FalRequest> {
    if (!userId) throw new Error('Oturum bulunamadı, lütfen tekrar giriş yap.');
    setSubmitting(true);
    setError(null);
    try {
      const imagePath = await uploadFalImage(userId, imageUri, falType);
      const request = await submitFalRequest({ type: falType, imagePath, question });
      return request;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Fal gönderilemedi, tekrar dener misin?';
      setError(message);
      throw err;
    } finally {
      setSubmitting(false);
    }
  }

  return { submit, submitting, error };
}
