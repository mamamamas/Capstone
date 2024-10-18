import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import InitialLoginScreen from '../screens/InitialLoginScreen';
import AdminLoginScreen from '../screens/AdminLoginScreen';
import StudentLoginScreen from '../screens/StudentLoginScreen';
import AdminDrawer from './AdminDrawer'; // Drawer navigator
import StudentHomeScreen from '../screens/StudentHomeScreen';
import retrieveUserData from '../app/retrieveUserData ';
import DetailedRequestScreen from '../screens/DetailedRequestScreen'; // Add this import
const Stack = createNativeStackNavigator();

const AppNavigator = () => {

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="InitialLogin">
        <Stack.Screen
          name="InitialLogin"
          component={InitialLoginScreen}
          options={{ title: 'Login Options', headerShown: false }}
        />
        <Stack.Screen
          name="AdminLogin"
          component={AdminLoginScreen}
          options={{ title: 'Admin Login', headerShown: false }}
        />
        <Stack.Screen
          name="StudentLogin"
          component={StudentLoginScreen}
          options={{ title: 'Student Login', headerShown: false }}
        />
        <Stack.Screen
          name="AdminHome"
          component={AdminDrawer} // Use AdminDrawer for admin home
          options={{ title: 'Admin Home', headerShown: false }}
        />
        <Stack.Screen
          name="StudentHome"
          component={StudentHomeScreen}
          options={{ title: 'Student Home', headerShown: false }}
        />
        <Stack.Screen
          name="DetailedRequestScreen"
          component={DetailedRequestScreen}
          options={{ title: 'Request Details' }}
        />

      </Stack.Navigator>

    </NavigationContainer>
  );
};

export default AppNavigator;
