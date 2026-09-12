import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HoroscopeListScreen } from '../screens/HoroscopeListScreen';
import { HoroscopeDetailScreen } from '../screens/HoroscopeDetailScreen';
import { HoroscopeStackParamList } from './types';
import { screenOptions } from './screenOptions';

const Stack = createNativeStackNavigator<HoroscopeStackParamList>();

export function HoroscopeStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="HoroscopeList" component={HoroscopeListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="HoroscopeDetail" component={HoroscopeDetailScreen} options={{ title: 'Burç Yorumu' }} />
    </Stack.Navigator>
  );
}
