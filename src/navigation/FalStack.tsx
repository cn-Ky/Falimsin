import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FalHubScreen } from '../screens/FalHubScreen';
import { TarotScreen } from '../screens/TarotScreen';
import { KahveFaliScreen } from '../screens/KahveFaliScreen';
import { RuyaTabiriScreen } from '../screens/RuyaTabiriScreen';
import { ElFaliScreen } from '../screens/ElFaliScreen';
import { FalResultScreen } from '../screens/FalResultScreen';
import { FalStackParamList } from './types';
import { screenOptions } from './screenOptions';

const Stack = createNativeStackNavigator<FalStackParamList>();

export function FalStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="FalHub" component={FalHubScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Tarot" component={TarotScreen} options={{ title: 'Tarot Falı' }} />
      <Stack.Screen name="Kahve" component={KahveFaliScreen} options={{ title: 'Kahve Falı' }} />
      <Stack.Screen name="Ruya" component={RuyaTabiriScreen} options={{ title: 'Rüya Tabiri' }} />
      <Stack.Screen name="El" component={ElFaliScreen} options={{ title: 'El Falı' }} />
      <Stack.Screen name="FalResult" component={FalResultScreen} options={{ title: 'Fal Yorumu' }} />
    </Stack.Navigator>
  );
}
