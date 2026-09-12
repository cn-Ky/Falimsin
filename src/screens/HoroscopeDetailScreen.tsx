import { RouteProp, useRoute } from '@react-navigation/native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card } from '../components/Card';
import { ScreenGradient } from '../components/ScreenGradient';
import { colors } from '../constants/colors';
import { getZodiacInfo } from '../constants/zodiac';
import { useDailyHoroscope } from '../hooks/useDailyHoroscope';
import { HoroscopeStackParamList } from '../navigation/types';

type Rt = RouteProp<HoroscopeStackParamList, 'HoroscopeDetail'>;

const BOLUMLER: { key: 'genel' | 'ask' | 'kariyer' | 'saglik'; title: string; emoji: string }[] = [
  { key: 'genel', title: 'Genel', emoji: '✨' },
  { key: 'ask', title: 'Aşk', emoji: '❤️' },
  { key: 'kariyer', title: 'Kariyer', emoji: '💼' },
  { key: 'saglik', title: 'Sağlık', emoji: '🌿' },
];

export function HoroscopeDetailScreen() {
  const { params } = useRoute<Rt>();
  const info = getZodiacInfo(params.sign);
  const { horoscope, loading, error, reload } = useDailyHoroscope(params.sign);

  return (
    <ScreenGradient>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.symbol}>{info.symbol}</Text>
          <Text style={styles.name}>{info.name}</Text>
          <Text style={styles.meta}>{info.dateRange} · {info.element} elementi</Text>
        </View>

        {loading ? <Text style={styles.loading}>Yıldızlar okunuyor…</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {horoscope && !loading
          ? BOLUMLER.map((b) => (
              <Card key={b.key} style={styles.card}>
                <Text style={styles.cardTitle}>{b.emoji} {b.title}</Text>
                <Text style={styles.cardBody}>{horoscope[b.key]}</Text>
              </Card>
            ))
          : null}

        {horoscope && !loading ? (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>🍀 Bugünün Şansı</Text>
            <Text style={styles.cardBody}>
              Şanslı sayın {horoscope.sansli_sayi}, şanslı renk {horoscope.sansli_renk}.
            </Text>
          </Card>
        ) : null}
      </ScrollView>
    </ScreenGradient>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 14, paddingBottom: 40 },
  header: { alignItems: 'center', gap: 4, marginBottom: 8 },
  symbol: { fontSize: 48, color: colors.gold },
  name: { color: colors.text, fontSize: 24, fontWeight: '800' },
  meta: { color: colors.textMuted, fontSize: 13 },
  loading: { color: colors.textMuted, textAlign: 'center' },
  error: { color: colors.error, textAlign: 'center' },
  card: { gap: 6 },
  cardTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  cardBody: { color: colors.textMuted, fontSize: 14, lineHeight: 20 },
});
