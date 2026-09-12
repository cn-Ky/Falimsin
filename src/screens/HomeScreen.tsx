import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { BannerAdSlot } from '../components/BannerAdSlot';
import { Card } from '../components/Card';
import { SectionTitle } from '../components/SectionTitle';
import { ScreenGradient } from '../components/ScreenGradient';
import { colors } from '../constants/colors';
import { falTypeConfigs } from '../constants/falTypes';
import { getZodiacInfo } from '../constants/zodiac';
import { useAuth } from '../hooks/useAuth';
import { useDailyHoroscope } from '../hooks/useDailyHoroscope';
import { useProfile } from '../hooks/useProfile';
import { HomeStackParamList } from '../navigation/types';

const gunAdlari = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
const ayAdlari = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

function bugununTarihi() {
  const now = new Date();
  return `${gunAdlari[now.getDay()]}, ${now.getDate()} ${ayAdlari[now.getMonth()]}`;
}

type Nav = NativeStackNavigationProp<HomeStackParamList, 'Home'>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const rootNavigation = navigation.getParent();
  const { session } = useAuth();
  const userId = session?.user.id;
  const { profile, loading: profileLoading } = useProfile(userId);
  const sign = profile?.zodiac_sign ?? null;
  const { horoscope, loading: horoscopeLoading } = useDailyHoroscope(sign as any);

  return (
    <ScreenGradient>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.greeting}>Merhaba{profile?.display_name ? `, ${profile.display_name}` : ''} ✨</Text>
        <Text style={styles.date}>{bugununTarihi()}</Text>

        {!profileLoading && !sign ? (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Burcunu öğrenelim</Text>
            <Text style={styles.cardBody}>
              Günlük yorumunu görebilmek için profilinden doğum tarihini ekle.
            </Text>
            <AppButton
              title="Profili tamamla"
              onPress={() => rootNavigation?.navigate('Profil' as never)}
              style={{ marginTop: 12 }}
            />
          </Card>
        ) : null}

        {sign ? (
          <Card
            style={styles.card}
            onPress={() => navigation.navigate('HoroscopeDetail', { sign: sign as any })}
          >
            <Text style={styles.cardTitle}>
              {getZodiacInfo(sign as any).symbol} {getZodiacInfo(sign as any).name} · Bugün
            </Text>
            {horoscopeLoading ? (
              <Text style={styles.cardBody}>Yıldızlar okunuyor…</Text>
            ) : (
              <Text style={styles.cardBody} numberOfLines={3}>
                {horoscope?.genel ?? 'Yorum yüklenemedi, tekrar dene.'}
              </Text>
            )}
            <Text style={styles.link}>Detaylı yorumu gör →</Text>
          </Card>
        ) : null}

        <SectionTitle title="Fal Bak" subtitle="Ne öğrenmek istersin?" />
        <View style={styles.grid}>
          {falTypeConfigs.map((fal) => (
            <Card
              key={fal.key}
              style={styles.gridItem}
              onPress={() => rootNavigation?.navigate('FalBak' as never)}
            >
              <Text style={styles.gridEmoji}>{fal.emoji}</Text>
              <Text style={styles.gridTitle}>{fal.title}</Text>
            </Card>
          ))}
        </View>

        <BannerAdSlot />
      </ScrollView>
    </ScreenGradient>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  greeting: { color: colors.text, fontSize: 24, fontWeight: '800' },
  date: { color: colors.textMuted, fontSize: 14, marginTop: -8 },
  card: { gap: 6 },
  cardTitle: { color: colors.text, fontSize: 17, fontWeight: '700' },
  cardBody: { color: colors.textMuted, fontSize: 14, lineHeight: 20 },
  link: { color: colors.gold, fontSize: 13, fontWeight: '700', marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridItem: { width: '47%', alignItems: 'center', gap: 6, paddingVertical: 20 },
  gridEmoji: { fontSize: 32 },
  gridTitle: { color: colors.text, fontSize: 14, fontWeight: '700', textAlign: 'center' },
});
