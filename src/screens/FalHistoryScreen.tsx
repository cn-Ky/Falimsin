import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { Card } from '../components/Card';
import { ScreenGradient } from '../components/ScreenGradient';
import { SectionTitle } from '../components/SectionTitle';
import { colors } from '../constants/colors';
import { getFalTypeConfig } from '../constants/falTypes';
import { useAuth } from '../hooks/useAuth';
import { useFalHistory } from '../hooks/useFalHistory';
import { ProfileStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'FalHistory'>;

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function FalHistoryScreen() {
  const navigation = useNavigation<Nav>();
  const { session } = useAuth();
  const { history, loading } = useFalHistory(session?.user.id);

  return (
    <ScreenGradient>
      <View style={styles.content}>
        <SectionTitle title="Fal Geçmişim" subtitle={`${history.length} kayıt`} />
        {loading ? (
          <ActivityIndicator color={colors.gold} style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={history}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ gap: 12, paddingBottom: 40 }}
            ListEmptyComponent={<Text style={styles.empty}>Henüz fal baktırmadın.</Text>}
            renderItem={({ item }) => {
              const config = getFalTypeConfig(item.type as any);
              return (
                <Card onPress={() => navigation.navigate('FalResult', { request: item })}>
                  <Text style={styles.itemTitle}>{config.emoji} {config.title}</Text>
                  <Text style={styles.itemSummary} numberOfLines={2}>{item.input_summary}</Text>
                  <Text style={styles.itemDate}>{formatDate(item.created_at)}</Text>
                </Card>
              );
            }}
          />
        )}
      </View>
    </ScreenGradient>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, padding: 20 },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: 40 },
  itemTitle: { color: colors.text, fontSize: 15, fontWeight: '700' },
  itemSummary: { color: colors.textMuted, fontSize: 13, marginTop: 4 },
  itemDate: { color: colors.textMuted, fontSize: 11, marginTop: 6 },
});
