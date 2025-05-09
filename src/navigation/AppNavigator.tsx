import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MainTabs from './MainTabs';
import CycleCountNavigator from '../screens/CycleCount';
import { Tag, InventoryScreen } from '../screens';
import { TagsProvider } from '../context/TagsContext';

const Stack = createStackNavigator();

const AppNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MainTabs" component={MainTabs} />
    <Stack.Screen name="Tag" component={Tag} />
    <Stack.Screen name="InventoryScreen" component={InventoryScreen} />
    <Stack.Screen name="CycleCount">
      {() => (
        <TagsProvider>
          <CycleCountNavigator />
        </TagsProvider>
      )}
    </Stack.Screen>
  </Stack.Navigator>
);

export default AppNavigator;
