import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { Home, Inventory, Po, Notifications, Settings } from '../screens';

const Tab = createBottomTabNavigator();

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color, size }) => {
        const icons = {
          Home: ['home-outline', 'home'],
          Inventory: ['cube-outline', 'cube'],
          Po: ['document-text-outline', 'document-text'],
          Notifications: ['notifications-outline', 'notifications'],
          Settings: ['settings-outline', 'settings'],
        };
        const [outline, filled] = icons[route.name];
        return <IonIcon name={focused ? filled : outline} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#0059c9',
      tabBarInactiveTintColor: '#777',
    })}
  >
    <Tab.Screen name="Home" component={Home} />
    <Tab.Screen name="Inventory" component={Inventory} />
    <Tab.Screen name="Po" component={Po} />
    <Tab.Screen name="Notifications" component={Notifications} />
    <Tab.Screen name="Settings" component={Settings} />
  </Tab.Navigator>
);

export default MainTabs;
