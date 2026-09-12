import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { colors } from '../constants/colors';

export const screenOptions: NativeStackNavigationOptions = {
  headerStyle: { backgroundColor: colors.background },
  headerTintColor: colors.text,
  headerTitleStyle: { fontWeight: '700' },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: colors.background },
};
