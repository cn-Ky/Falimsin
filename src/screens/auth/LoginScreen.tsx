import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../../components/AppButton';
import { AppTextInput } from '../../components/AppTextInput';
import { ScreenGradient } from '../../components/ScreenGradient';
import { colors } from '../../constants/colors';
import { supabase } from '../../services/supabase';
import { AuthStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError(null);
    if (!email.trim() || !password) {
      setError('E-posta ve şifreni gir.');
      return;
    }
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (signInError) {
      setError(
        signInError.message === 'Invalid login credentials'
          ? 'E-posta veya şifre hatalı.'
          : signInError.message,
      );
    }
  }

  return (
    <ScreenGradient>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <Text style={styles.logo}>🔮</Text>
          <Text style={styles.title}>Falımsın</Text>
          <Text style={styles.subtitle}>Yıldızlar seni bekliyor</Text>

          <View style={styles.form}>
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
              placeholder="••••••••"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <AppButton title="Giriş Yap" onPress={handleLogin} loading={loading} />
            <AppButton
              title="Hesabın yok mu? Kayıt ol"
              variant="outline"
              onPress={() => navigation.navigate('SignUp')}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flex: 1, padding: 24, justifyContent: 'center', gap: 6 },
  logo: { fontSize: 56, textAlign: 'center' },
  title: { color: colors.text, fontSize: 30, fontWeight: '800', textAlign: 'center' },
  subtitle: { color: colors.textMuted, fontSize: 14, textAlign: 'center', marginBottom: 24 },
  form: { gap: 14 },
  error: { color: colors.error, fontSize: 13, textAlign: 'center' },
});
