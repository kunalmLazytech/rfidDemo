import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CycleCount from './screens/CycleCount';
import CycleCountDetails from './screens/CycleCountDetails';
import AreaScreen from './screens/AreaScreen';
import LocationScreen from './screens/LocationScreen';
import ItemDetailScreen from './screens/ItemDetailScreen';
import QuantityScreen from './screens/QuantityScreen';
import ReviewScreen from './screens/ReviewScreen';

const Stack = createStackNavigator();

export default function CycleCountNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AreaScreen" component={AreaScreen} />
      <Stack.Screen name="CycleCount" component={CycleCount} />
      <Stack.Screen name="CycleCountDetails" component={CycleCountDetails} />
      <Stack.Screen name="LocationScreen" component={LocationScreen} />
      <Stack.Screen name="ItemDetailScreen" component={ItemDetailScreen} />
      <Stack.Screen name="QuantityScreen" component={QuantityScreen} />
      <Stack.Screen name="ReviewScreen" component={ReviewScreen} />
    </Stack.Navigator>
  );
}
