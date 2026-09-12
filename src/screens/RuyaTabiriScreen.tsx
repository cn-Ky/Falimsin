import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { AppTextInput } from '../components/AppTextInput';
import { ScreenGradient } from '../components/ScreenGradient';
import { SectionTitle } from '../components/SectionTitle';
import { colors } from '../constants/colors';
import { submitFalRequest } from '../services/api';
import { FalStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<FalStackParamList, 'Ruya'>;
const MIN_LENGTH = 15;

export function RuyaTabiriScreen() {
  const navigation = useNavigation<Nav>();
  const [dreamText, setDreamText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (dreamText.trim().length < MIN_LENGTH) return;
    setSubmitting(true);
    try {
      const request = await submitFalRequest({ type: 'ruya', dreamText: dreamText.trim() });
      navigation.navigate('FalResult', { request });
      setDreamText('');
    } catch (err) {
      Alert.alert('Bir şeyler ters gitti', err instanceof Error ? err.message : 'Tekrar dener misin?');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScreenGradient>
      <ScrollView contentContainerStyle={styles.content}>
        <SectionTitle
          title="Rüya Tabiri 🌙"
          subtitle="Gördüğün rüyayı olabildiğince ayrıntılı anlat"
        />

        <AppTextInput
          placeholder="Rüyamda... (kimler vardı, neler oldu, nasıl hissettin?)"
          value={dreamText}
          onChangeText={setDreamText}
          multiline
          numberOfLines={8}
          style={styles.textArea}
        />
        <Text style={styles.hint}>
          {dreamText.trim().length < MIN_LENGTH
            ? `En az ${MIN_LENGTH} karakter yaz (${dreamText.trim().length}/${MIN_LENGTH})`
            : 'Anlatım yeterli uzunlukta ✓'}
        </Text>

        {submitting ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={colors.gold} />
            <Text style={styles.loadingText}>Semboller yorumlanıyor…</Text>
          </View>
        ) : (
          <AppButton
            title="Rüyamı Yorumla"
            onPress={handleSubmit}
            disabled={dreamText.trim().length < MIN_LENGTH}
          />
        )}
      </ScrollView>
    </ScreenGradient>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 14, paddingBottom: 40 },
  textArea: { minHeight: 160, textAlignVertical: 'top' },
  hint: { color: colors.textMuted, fontSize: 12 },
  loadingRow: { flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: colors.textMuted },
});
