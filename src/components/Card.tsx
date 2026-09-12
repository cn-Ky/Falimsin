import { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../constants/colors';

interface Props {
  style?: ViewStyle;
  onPress?: () => void;
}

export function Card({ children, style, onPress }: PropsWithChildren<Props>) {
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.card, style, pressed && styles.pressed]}
      >
        {children}
      </Pressable>
    );
  }
  return <Pressable style={[styles.card, style]}>{children}</Pressable>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.85 },
});
