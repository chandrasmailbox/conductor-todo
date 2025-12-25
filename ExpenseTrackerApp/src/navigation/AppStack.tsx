import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';

export type AppStackParamList = {
  Home: undefined;
  // Add other main app screens here later
};

const AppStack = createStackNavigator<AppStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <AppStack.Navigator screenOptions={{ headerShown: false }}>
      <AppStack.Screen name="Home" component={HomeScreen} />
    </AppStack.Navigator>
  );
};

export default AppNavigator;