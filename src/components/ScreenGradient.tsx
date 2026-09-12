import { PropsWithChildren } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { gradients } from '../constants/colors';

interface Props {
  style?: ViewStyle;
}

export function ScreenGradient({ children, style }: PropsWithChildren<Props>) {
  return (
    <LinearGradient colors={gradients.cosmic} style={styles.fill}>
      <SafeAreaView style={[styles.fill, style]}>{children}</SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
