import { RouteProp, useRoute } from '@react-navigation/native';
import { ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { Card } from '../components/Card';
import { ScreenGradient } from '../components/ScreenGradient';
import { colors } from '../constants/colors';
import { getFalTypeConfig } from '../constants/falTypes';
import { FalStackParamList } from '../navigation/types';

type Rt = RouteProp<FalStackParamList, 'FalResult'>;

export function FalResultScreen() {
  const { params } = useRoute<Rt>();
  const { request } = params;
  const config = getFalTypeConfig(request.type);

  async function handleShare() {
    if (!request.result) return;
    try {
      await Share.share({ message: `${config.title} yorumum:\n\n${request.result}` });
    } catch {
      // kullanıcı paylaşımı iptal etti, sorun değil
    }
  }

  return (
    <ScreenGradient>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.emoji}>{config.emoji}</Text>
          <Text style={styles.title}>{config.title}</Text>
          <Text style={styles.summary}>{request.input_summary}</Text>
        </View>

        {request.status === 'error' ? (
          <Card>
            <Text style={styles.errorText}>
              Yorum üretilirken bir sorun oluştu. Lütfen tekrar dener misin?
            </Text>
          </Card>
        ) : (
          <Card>
            <Text style={styles.result}>{request.result}</Text>
          </Card>
        )}

        {request.result ? (
          <AppButton title="Paylaş" variant="outline" onPress={handleShare} />
        ) : null}
      </ScrollView>
    </ScreenGradient>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  header: { alignItems: 'center', gap: 4 },
  emoji: { fontSize: 40 },
  title: { color: colors.text, fontSize: 22, fontWeight: '800' },
  summary: { color: colors.textMuted, fontSize: 13, textAlign: 'center' },
  result: { color: colors.text, fontSize: 15, lineHeight: 24 },
  errorText: { color: colors.error, fontSize: 14 },
});
