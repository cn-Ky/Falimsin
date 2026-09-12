import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { AppTextInput } from '../components/AppTextInput';
import { ScreenGradient } from '../components/ScreenGradient';
import { SectionTitle } from '../components/SectionTitle';
import { colors } from '../constants/colors';
import { useAuth } from '../hooks/useAuth';
import { useImageFalSubmit } from '../hooks/useImageFalSubmit';
import { FalStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<FalStackParamList, 'Kahve'>;

export function KahveFaliScreen() {
  const navigation = useNavigation<Nav>();
  const { session } = useAuth();
  const { submit, submitting } = useImageFalSubmit(session?.user.id, 'kahve');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [question, setQuestion] = useState('');

  async function pickImage(fromCamera: boolean) {
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('İzin gerekli', 'Fotoğraf seçmek için izin vermen gerekiyor.');
      return;
    }
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.7, allowsEditing: true })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.7, allowsEditing: true, mediaTypes: ['images'] });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  }

  async function handleSubmit() {
    if (!imageUri) return;
    try {
      const request = await submit(imageUri, question.trim() || undefined);
      navigation.navigate('FalResult', { request });
      setImageUri(null);
      setQuestion('');
    } catch (err) {
      Alert.alert('Bir şeyler ters gitti', err instanceof Error ? err.message : 'Tekrar dener misin?');
    }
  }

  return (
    <ScreenGradient>
      <ScrollView contentContainerStyle={styles.content}>
        <SectionTitle
          title="Kahve Falı ☕"
          subtitle="Fincanın telve şekillerini net görecek şekilde bir fotoğraf yükle"
        />

        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.preview} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>Henüz fotoğraf seçilmedi</Text>
          </View>
        )}

        <View style={styles.row}>
          <AppButton title="Galeriden Seç" variant="outline" onPress={() => pickImage(false)} style={styles.rowButton} />
          <AppButton title="Fotoğraf Çek" variant="outline" onPress={() => pickImage(true)} style={styles.rowButton} />
        </View>

        <AppTextInput
          label="Merak ettiğin bir konu var mı? (opsiyonel)"
          placeholder="Örn: Aşk hayatım hakkında ne görüyorsun?"
          value={question}
          onChangeText={setQuestion}
          multiline
        />

        {submitting ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={colors.gold} />
            <Text style={styles.loadingText}>Telveler okunuyor…</Text>
          </View>
        ) : (
          <AppButton title="Falımı Yorumla" onPress={handleSubmit} disabled={!imageUri} />
        )}
      </ScrollView>
    </ScreenGradient>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  preview: { width: '100%', height: 260, borderRadius: 16 },
  placeholder: {
    height: 200,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: { color: colors.textMuted },
  row: { flexDirection: 'row', gap: 10 },
  rowButton: { flex: 1 },
  loadingRow: { flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: colors.textMuted },
});
