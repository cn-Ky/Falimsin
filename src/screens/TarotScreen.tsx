import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { AppTextInput } from '../components/AppTextInput';
import { Card } from '../components/Card';
import { ScreenGradient } from '../components/ScreenGradient';
import { SectionTitle } from '../components/SectionTitle';
import { colors } from '../constants/colors';
import { shuffleDeck } from '../constants/tarotDeck';
import { submitFalRequest } from '../services/api';
import { DrawnTarotCard } from '../types/fal';
import { FalStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<FalStackParamList, 'Tarot'>;
const SPREAD_SIZE = 21; // masaya açılan kart sayısı
const CARDS_TO_PICK = 3; // geçmiş - şimdi - gelecek

const POSITION_LABELS = ['Geçmiş', 'Şimdi', 'Gelecek'];

export function TarotScreen() {
  const navigation = useNavigation<Nav>();
  const spread = useMemo(() => shuffleDeck().slice(0, SPREAD_SIZE), []);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [question, setQuestion] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const selectedCards: DrawnTarotCard[] = selectedIds.map((id, index) => {
    const card = spread.find((c) => c.id === id)!;
    return { card, reversed: Math.random() < 0.35, position: index + 1 };
  });

  function toggleCard(id: string) {
    if (selectedIds.includes(id)) return;
    if (selectedIds.length >= CARDS_TO_PICK) return;
    setSelectedIds((prev) => [...prev, id]);
  }

  async function handleSubmit() {
    if (selectedIds.length < CARDS_TO_PICK) return;
    setSubmitting(true);
    try {
      const request = await submitFalRequest({
        type: 'tarot',
        cards: selectedCards,
        question: question.trim() || undefined,
      });
      navigation.navigate('FalResult', { request });
      setSelectedIds([]);
      setQuestion('');
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
          title="Tarot Falı"
          subtitle={`${CARDS_TO_PICK} kart seç · ${selectedIds.length}/${CARDS_TO_PICK}`}
        />

        {selectedIds.length > 0 ? (
          <View style={styles.selectedRow}>
            {selectedCards.map((sc, i) => (
              <View key={sc.card.id} style={styles.selectedCard}>
                <Text style={styles.selectedLabel}>{POSITION_LABELS[i]}</Text>
                <Text style={styles.selectedName}>{sc.card.name}</Text>
                {sc.reversed ? <Text style={styles.reversedTag}>Ters</Text> : null}
              </View>
            ))}
          </View>
        ) : null}

        <AppTextInput
          label="Sormak istediğin bir şey var mı? (opsiyonel)"
          placeholder="Örn: İş hayatımda neler beni bekliyor?"
          value={question}
          onChangeText={setQuestion}
          multiline
        />

        <View style={styles.grid}>
          {spread.map((card) => {
            const isSelected = selectedIds.includes(card.id);
            return (
              <Card
                key={card.id}
                onPress={() => toggleCard(card.id)}
                style={[styles.cardBack, isSelected && styles.cardBackSelected] as any}
              >
                <Text style={styles.cardBackEmoji}>{isSelected ? '✨' : '🂠'}</Text>
              </Card>
            );
          })}
        </View>

        {submitting ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={colors.gold} />
            <Text style={styles.loadingText}>Kartlar yorumlanıyor…</Text>
          </View>
        ) : (
          <AppButton
            title="Falımı Yorumla"
            onPress={handleSubmit}
            disabled={selectedIds.length < CARDS_TO_PICK}
          />
        )}
      </ScrollView>
    </ScreenGradient>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  selectedRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  selectedCard: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 2,
  },
  selectedLabel: { color: colors.gold, fontSize: 11, fontWeight: '700' },
  selectedName: { color: colors.text, fontSize: 13, fontWeight: '600' },
  reversedTag: { color: colors.error, fontSize: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  cardBack: { width: 52, height: 78, alignItems: 'center', justifyContent: 'center', padding: 0 },
  cardBackSelected: { borderColor: colors.gold, borderWidth: 2 },
  cardBackEmoji: { fontSize: 22 },
  loadingRow: { flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: colors.textMuted },
});
