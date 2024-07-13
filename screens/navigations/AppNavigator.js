import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import App from '../../App';
import LayoutScreen from '../LayoutScreen';
import FilterScreen from '../FilterScreen';


const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={App} options={{ headerShown: false }} />
        <Stack.Screen name="Layout" component={LayoutScreen} />
        <Stack.Screen name="FilterScreen" component={FilterScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

