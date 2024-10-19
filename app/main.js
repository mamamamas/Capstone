import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Linking } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import your screens
import LoginScreen from '../app/index';
import RegisterScreen from '../app/registration';
import DashboardScreen from '../app/user';
import AdminDasboard from '../app/AdminDasboard';
import AdminPostScreen from '../app/PostScreen';
import ResetScreen from '../app/resetScreen';
import AdminDrawer from '../navigation/AdminDrawer';
import InitialLoginScreen from '../screens/InitialLoginScreen';
import StudentHomeScreen from '../screens/StudentHomeScreen';
import AddScreen from '../app/Add';
import AppNavigator from '../navigation/AppNavigator'
import StudentDetails from '../screens/Components/StudentDetails';
import StudentProfile from '../screens/StudentProfileScreen';
import DetailedRequestScreen from '../screens/DetailedRequestScreen';
import AdminProfileScreen from '../screens/AdminProfileScreen';
import CreateAccount from '../screens/CreateAccountScreen';
import ManageAccountScreen from '../screens/ManageAccountScreen';
const Stack = createNativeStackNavigator();

export default function Main() {
    const [initialRoute, setInitialRoute] = useState('InitialLogin');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            try {
                const [storedRole, token, firstname] = await Promise.all([
                    AsyncStorage.getItem('role'),
                    AsyncStorage.getItem('accessToken'),
                    AsyncStorage.getItem('firstname')
                ]);

                if (!token || !storedRole) {
                    setInitialRoute('AdminDasboard');
                    return;
                }

                if (storedRole === 'admin' || storedRole === 'staff') {
                    setInitialRoute('AdminDasboard');
                } else {
                    setInitialRoute('StudentHome');
                }
            } catch (error) {
                console.error('Error during auto-login:', error);
                setInitialRoute('index');
            } finally {
                setLoading(false);
            }
        };

        checkUser();

        const handleDeepLink = (event) => {
            const url = event.url;
            if (url) {
                const urlParams = new URLSearchParams(url.split('?')[1]);
                const token = urlParams.get('token');
                const roleFromUrl = urlParams.get('role');

                if (token && roleFromUrl) {
                    AsyncStorage.setItem('accessToken', token);
                    AsyncStorage.setItem('role', roleFromUrl);

                    if (roleFromUrl === 'admin' || roleFromUrl === 'Nurse') {
                        setInitialRoute('AdminDasboard');
                    } else {
                        setInitialRoute('user');
                    }
                }
            }
        };

        // Handle deep linking
        Linking.getInitialURL().then((url) => {
            if (url) {
                handleDeepLink({ url });
            }
        });

        const subscription = Linking.addEventListener('url', handleDeepLink);

        return () => {
            subscription.remove();
        };
    }, []);

    if (loading) {
        return <ActivityIndicator size="large" />;
    }

    return (
        <Stack.Navigator initialRouteName={initialRoute}>
            <Stack.Screen name="InitialLogin" component={InitialLoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="AdminDasboard" component={AdminDrawer} options={{ headerShown: false }} />
            <Stack.Screen name="user" component={DashboardScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="registration" component={RegisterScreen} options={{ headerShown: false }} />
            <Stack.Screen name="StudentDetails" component={StudentDetails} options={{ headerShown: false }} />
            <Stack.Screen name="Add" component={AddScreen} />
            <Stack.Screen name="StudentProfileScreen" component={StudentProfile} options={{ title: 'Student Profile', headerShown: true }} />
            <Stack.Screen name="AdminProfileScreen" component={AdminProfileScreen} options={{ title: 'AdminProfileScreen', headerShown: true }} />
            <Stack.Screen name="Create Account" component={CreateAccount} options={{ title: 'Create Account', headerShown: true }} />
            <Stack.Screen name="Manage Account" component={ManageAccountScreen} options={{ title: 'Manage Account', headerShown: true }} />
            <Stack.Screen
                name="AdminHome"
                component={AdminDrawer}
                options={{ title: 'Admin Home', headerShown: false }}
            />
            <Stack.Screen
                name="AppNavigator"
                component={AppNavigator}
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
    );
}