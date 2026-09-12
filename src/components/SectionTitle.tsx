import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';

interface Props {
  title: string;
  subtitle?: string;
}

export function SectionTitle({ title, subtitle }: Props) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 4, marginBottom: 12 },
  title: { color: colors.text, fontSize: 22, fontWeight: '800' },
  subtitle: { color: colors.textMuted, fontSize: 14 },
});
