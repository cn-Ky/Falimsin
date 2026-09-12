import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { AppButton } from '../../components/AppButton';
import { AppTextInput } from '../../components/AppTextInput';
import { ScreenGradient } from '../../components/ScreenGradient';
import { colors } from '../../constants/colors';
import { getZodiacFromDate } from '../../constants/zodiac';
import { supabase } from '../../services/supabase';
import { AuthStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'SignUp'>;

function parseTurkishDate(input: string): Date | null {
  // Beklenen format: GG.AA.YYYY (örn. 05.03.1998)
  const match = input.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!match) return null;
  const [, dd, mm, yyyy] = match;
  const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export function SignUpScreen() {
  const navigation = useNavigation<Nav>();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [birthDateText, setBirthDateText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignUp() {
    setError(null);
    if (!email.trim() || !password) {
      setError('E-posta ve şifreni gir.');
      return;
    }
    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalı.');
      return;
    }
    const birthDate = birthDateText.trim() ? parseTurkishDate(birthDateText.trim()) : null;
    if (birthDateText.trim() && !birthDate) {
      setError('Doğum tarihini GG.AA.YYYY formatında gir (örn. 05.03.1998).');
      return;
    }

    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });
    if (signUpError) {
      setLoading(false);
      setError(signUpError.message);
      return;
    }

    const userId = data.user?.id;
    if (userId) {
      // E-posta onayı açıksa henüz oturum olmayabilir; bu durumda profil
      // güncellemesi RLS tarafından reddedilir ve kullanıcı ilk girişte
      // Profil sekmesinden bu bilgileri tekrar girebilir. Sessizce yut.
      try {
        await supabase
          .from('profiles')
          .update({
            display_name: displayName.trim() || null,
            birth_date: birthDate ? birthDate.toISOString().slice(0, 10) : null,
            zodiac_sign: birthDate ? getZodiacFromDate(birthDate) : null,
          })
          .eq('id', userId);
      } catch {
        // no-op, bkz. üstteki not
      }
    }
    setLoading(false);
  }

  return (
    <ScreenGradient>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Aramıza Katıl</Text>
          <Text style={styles.subtitle}>Falımsın'da hesabını oluştur</Text>

          <AppTextInput label="İsim" placeholder="Adın" value={displayName} onChangeText={setDisplayName} />
          <AppTextInput
            label="E-posta"
            placeholder="ornek@mail.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <AppTextInput
            label="Şifre"
            placeholder="En az 6 karakter"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <AppTextInput
            label="Doğum Tarihi (opsiyonel)"
            placeholder="GG.AA.YYYY"
            value={birthDateText}
            onChangeText={setBirthDateText}
            keyboardType="numbers-and-punctuation"
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <AppButton title="Kayıt Ol" onPress={handleSignUp} loading={loading} />
          <AppButton title="Zaten hesabın var mı? Giriş yap" variant="outline" onPress={() => navigation.navigate('Login')} />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 24, gap: 14, paddingBottom: 40 },
  title: { color: colors.text, fontSize: 26, fontWeight: '800', textAlign: 'center' },
  subtitle: { color: colors.textMuted, fontSize: 14, textAlign: 'center', marginBottom: 10 },
  error: { color: colors.error, fontSize: 13, textAlign: 'center' },
});
