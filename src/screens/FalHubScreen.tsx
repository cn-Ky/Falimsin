import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card } from '../components/Card';
import { ScreenGradient } from '../components/ScreenGradient';
import { SectionTitle } from '../components/SectionTitle';
import { colors } from '../constants/colors';
import { falTypeConfigs } from '../constants/falTypes';
import { FalStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<FalStackParamList, 'FalHub'>;

const ROUTE_BY_TYPE: Record<string, keyof FalStackParamList> = {
  tarot: 'Tarot',
  kahve: 'Kahve',
  ruya: 'Ruya',
  el: 'El',
};

export function FalHubScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <ScreenGradient>
      <ScrollView contentContainerStyle={styles.content}>
        <SectionTitle title="Fal Bak" subtitle="İstediğin zaman istediğin falı seç" />
        <View style={styles.grid}>
          {falTypeConfigs.map((fal) => (
            <Card
              key={fal.key}
              style={styles.item}
              onPress={() => navigation.navigate(ROUTE_BY_TYPE[fal.key] as any)}
            >
              <Text style={styles.emoji}>{fal.emoji}</Text>
              <Text style={styles.title}>{fal.title}</Text>
              <Text style={styles.desc}>{fal.description}</Text>
            </Card>
          ))}
        </View>
      </ScrollView>
    </ScreenGradient>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 12, paddingBottom: 40 },
  grid: { gap: 12 },
  item: { gap: 6 },
  emoji: { fontSize: 30 },
  title: { color: colors.text, fontSize: 17, fontWeight: '700' },
  desc: { color: colors.textMuted, fontSize: 13, lineHeight: 18 },
});
