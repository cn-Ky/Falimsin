import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../constants/colors';
import { HomeScreen } from '../screens/HomeScreen';
import { HoroscopeDetailScreen } from '../screens/HoroscopeDetailScreen';
import { FalResultScreen } from '../screens/FalResultScreen';
import { HomeStackParamList } from './types';
import { screenOptions } from './screenOptions';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="HoroscopeDetail" component={HoroscopeDetailScreen} options={{ title: 'Burç Yorumu' }} />
      <Stack.Screen name="FalResult" component={FalResultScreen} options={{ title: 'Fal Yorumu' }} />
    </Stack.Navigator>
  );
}
