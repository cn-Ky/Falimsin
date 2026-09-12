import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { AppTextInput } from '../components/AppTextInput';
import { Card } from '../components/Card';
import { ScreenGradient } from '../components/ScreenGradient';
import { SectionTitle } from '../components/SectionTitle';
import { colors } from '../constants/colors';
import { getZodiacFromDate, getZodiacInfo } from '../constants/zodiac';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { supabase } from '../services/supabase';
import { ProfileStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'Profile'>;

function toIsoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { session } = useAuth();
  const { profile, loading, save } = useProfile(session?.user.id);

  const [displayName, setDisplayName] = useState('');
  const [birthDate, setBirthDate] = useState<Date>(new Date(2000, 0, 1));
  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name ?? '');
      if (profile.birth_date) setBirthDate(new Date(profile.birth_date));
    }
  }, [profile]);

  const previewZodiac = getZodiacFromDate(birthDate);

  async function handleSave() {
    setSaving(true);
    try {
      await save({
        display_name: displayName.trim() || null,
        birth_date: toIsoDate(birthDate),
        zodiac_sign: previewZodiac,
      });
      Alert.alert('Kaydedildi', 'Profilin güncellendi.');
    } catch (err) {
      Alert.alert('Hata', err instanceof Error ? err.message : 'Profil kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  if (loading) {
    return (
      <ScreenGradient>
        <View style={styles.centered}>
          <Text style={styles.muted}>Yükleniyor…</Text>
        </View>
      </ScreenGradient>
    );
  }

  return (
    <ScreenGradient>
      <ScrollView contentContainerStyle={styles.content}>
        <SectionTitle title="Profilim" subtitle={session?.user.email ?? ''} />

        <AppTextInput
          label="İsim"
          placeholder="Nasıl hitap edelim?"
          value={displayName}
          onChangeText={setDisplayName}
        />

        <View>
          <Text style={styles.label}>Doğum Tarihi</Text>
          <AppButton
            title={birthDate.toLocaleDateString('tr-TR')}
            variant="outline"
            onPress={() => setShowPicker(true)}
          />
          {showPicker ? (
            <DateTimePicker
              value={birthDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              maximumDate={new Date()}
              onChange={(_, selected) => {
                setShowPicker(Platform.OS === 'ios');
                if (selected) setBirthDate(selected);
              }}
            />
          ) : null}
          <Text style={styles.zodiacPreview}>
            Burcun: {getZodiacInfo(previewZodiac).symbol} {getZodiacInfo(previewZodiac).name}
          </Text>
        </View>

        <AppButton title="Kaydet" onPress={handleSave} loading={saving} />

        <Card onPress={() => navigation.navigate('FalHistory')}>
          <Text style={styles.linkCardTitle}>📜 Fal Geçmişim</Text>
        </Card>

        <AppButton title="Çıkış Yap" variant="outline" onPress={handleSignOut} />

        <Text style={styles.disclaimer}>
          Falımsın uygulamasındaki tüm yorumlar eğlence amaçlıdır. Uygulama içindeki reklamlar
          Google AdMob tarafından sağlanır.
        </Text>
      </ScrollView>
    </ScreenGradient>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  muted: { color: colors.textMuted },
  label: { color: colors.textMuted, fontSize: 13, fontWeight: '600', marginBottom: 6 },
  zodiacPreview: { color: colors.gold, fontSize: 13, marginTop: 8, fontWeight: '600' },
  linkCardTitle: { color: colors.text, fontSize: 15, fontWeight: '700' },
  disclaimer: { color: colors.textMuted, fontSize: 11, textAlign: 'center', marginTop: 8, lineHeight: 16 },
});
