import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '@modules/AuthContext';
import { StatusBar, View, ActivityIndicator } from 'react-native';
import LoginScreen from '../screens/Login/LoginScreen';
import AppNavigator from './AppNavigator';
import globalStyles from '@styles/globalStyles';

const Stack = createStackNavigator();

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={globalStyles.containerCenter}>
        <ActivityIndicator size="large" color="#0059c9" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <Stack.Screen name="MainApp" component={AppNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppContent;
