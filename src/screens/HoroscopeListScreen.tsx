import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card } from '../components/Card';
import { ScreenGradient } from '../components/ScreenGradient';
import { SectionTitle } from '../components/SectionTitle';
import { colors } from '../constants/colors';
import { zodiacSigns } from '../constants/zodiac';
import { HoroscopeStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<HoroscopeStackParamList, 'HoroscopeList'>;

export function HoroscopeListScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <ScreenGradient>
      <ScrollView contentContainerStyle={styles.content}>
        <SectionTitle title="Burçlar" subtitle="Yorumunu görmek istediğin burcu seç" />
        <View style={styles.grid}>
          {zodiacSigns.map((sign) => (
            <Card
              key={sign.key}
              style={styles.item}
              onPress={() => navigation.navigate('HoroscopeDetail', { sign: sign.key })}
            >
              <Text style={styles.symbol}>{sign.symbol}</Text>
              <Text style={styles.name}>{sign.name}</Text>
              <Text style={styles.range}>{sign.dateRange}</Text>
            </Card>
          ))}
        </View>
      </ScrollView>
    </ScreenGradient>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  item: { width: '47%', alignItems: 'center', gap: 4, paddingVertical: 18 },
  symbol: { fontSize: 30, color: colors.gold },
  name: { color: colors.text, fontSize: 15, fontWeight: '700' },
  range: { color: colors.textMuted, fontSize: 11, textAlign: 'center' },
});
