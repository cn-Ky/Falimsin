import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileScreen } from '../screens/ProfileScreen';
import { FalHistoryScreen } from '../screens/FalHistoryScreen';
import { FalResultScreen } from '../screens/FalResultScreen';
import { ProfileStackParamList } from './types';
import { screenOptions } from './screenOptions';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="FalHistory" component={FalHistoryScreen} options={{ title: 'Fal Geçmişim' }} />
      <Stack.Screen name="FalResult" component={FalResultScreen} options={{ title: 'Fal Yorumu' }} />
    </Stack.Navigator>
  );
}
