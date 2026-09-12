import { FalType } from '../types/fal';

export interface FalTypeConfig {
  key: FalType;
  title: string;
  emoji: string;
  description: string;
  needsImage: boolean;
}

export const falTypeConfigs: FalTypeConfig[] = [
  {
    key: 'tarot',
    title: 'Tarot Falı',
    emoji: '🔮',
    description: 'Kartları karıştır, 3 kart seç, geçmiş-şimdi-gelecek yorumunu al.',
    needsImage: false,
  },
  {
    key: 'kahve',
    title: 'Kahve Falı',
    emoji: '☕',
    description: 'Fincanının fotoğrafını yükle, telve şekillerini yorumlayalım.',
    needsImage: true,
  },
  {
    key: 'ruya',
    title: 'Rüya Tabiri',
    emoji: '🌙',
    description: 'Gördüğün rüyayı anlat, sembollerin anlamını öğren.',
    needsImage: false,
  },
  {
    key: 'el',
    title: 'El Falı',
    emoji: '🖐️',
    description: 'Avuç içinin net bir fotoğrafını yükle, çizgilerini okuyalım.',
    needsImage: true,
  },
];

export function getFalTypeConfig(key: FalType): FalTypeConfig {
  const config = falTypeConfigs.find((c) => c.key === key);
  if (!config) throw new Error(`Unknown fal type: ${key}`);
  return config;
}
