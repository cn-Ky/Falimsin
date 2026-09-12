import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { colors } from '../constants/colors';
import { HomeStack } from './HomeStack';
import { FalStack } from './FalStack';
import { HoroscopeStack } from './HoroscopeStack';
import { ProfileStack } from './ProfileStack';
import { AppTabParamList } from './types';

const Tab = createBottomTabNavigator<AppTabParamList>();

const TAB_ICONS: Record<keyof AppTabParamList, string> = {
  AnaSayfa: '🏠',
  FalBak: '🔮',
  Burclar: '✨',
  Profil: '👤',
};

export function AppStack() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarIcon: () => <Text style={{ fontSize: 20 }}>{TAB_ICONS[route.name as keyof AppTabParamList]}</Text>,
      })}
    >
      <Tab.Screen name="AnaSayfa" component={HomeStack} options={{ title: 'Ana Sayfa' }} />
      <Tab.Screen name="FalBak" component={FalStack} options={{ title: 'Fal Bak' }} />
      <Tab.Screen name="Burclar" component={HoroscopeStack} options={{ title: 'Burçlar' }} />
      <Tab.Screen name="Profil" component={ProfileStack} options={{ title: 'Profil' }} />
    </Tab.Navigator>
  );
}
