import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Image, TextInput, Alert, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
// import Realm from 'realm';
import Colors from '../constants/Colors';
// import { AppProvider, RealmProvider, useApp } from '@realm/react';

export default function AdminLoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    // const app = useApp();

    // const validationForm = () => {
    //     let errors = {};
    //     const emailRegex = /\S+@pcu.edu.ph$/;

    //     if (!email) errors.email = "Email is required";
    //     if (!password) errors.password = "Password is required";
    //     if (!emailRegex.test(email))
    //         errors.email = "Invalid email format. Please use your PCU email";

    //     return Object.keys(errors).length === 0;
    // };

    const storeUserData = async (id, accessToken, role, firstname) => {
        try {
            await AsyncStorage.setItem('id', id);
            await AsyncStorage.setItem('accessToken', accessToken);
            await AsyncStorage.setItem('role', role);
            await AsyncStorage.setItem('firstname', firstname);
            await AsyncStorage.setItem('username', username);
            console.log('User data saved', firstname);
        } catch (error) {
            console.error('Error saving user data:', error);
        }
    };

    const handleSubmit = async () => {

        try {
            await AsyncStorage.removeItem('googleId');
            await AsyncStorage.removeItem('name');

            const response = await axios.post('http://192.168.1.2:3000/user/login', {
                email,
                password,
            });

            if (response.status === 200) {
                const { id, accessToken, role, firstname } = response.data;
                console.log('Login successful:', { id, email, role });
                Alert.alert('Success', 'Login successful!');

                // const credentials = Realm.Credentials.jwt(accessToken);
                // await app.logIn(credentials);

                await storeUserData(id, accessToken, role, firstname);

                if (role === 'admin' || role === 'staff') {
                    navigation.navigate('StudentHome');
                } else if (role === 'user') {
                    navigation.navigate('user');
                }

                setEmail('');
                setPassword('');
            } else {
                Alert.alert('Error', 'Login failed. Please try again.');
            }
        } catch (error) {
            console.error('Error during login:', error);
            const errorMessage = error.response?.data?.message || 'Unable to connect to the server. Please check your internet connection and try again.';
            Alert.alert('Login Error', errorMessage);
            setEmail('');
            setPassword('');
        }

    };

    const handleGoogleLogin = async () => {
        try {
            // Open the Google login URL
            Linking.openURL('https://d697-103-129-124-2.ngrok-free.app/auth/google');
        } catch (error) {
            console.error('Error during Google login:', error);
            Alert.alert('Google Login Error', 'Unable to start Google login process.');
        }
    };

    useEffect(() => {
        const handleRedirect = async (event) => {
            const url = event.url;
            if (url && url.startsWith('https://d697-103-129-124-2.ngrok-free.app/auth/success')) {
                try {
                    // Extract token and googleId from the URL
                    const urlParams = new URLSearchParams(url.split('?')[1]);
                    const token = urlParams.get('token');
                    const googleId = urlParams.get('googleId');

                    if (token) {
                        // Store both token and googleId (if available) simultaneously
                        await Promise.all([
                            AsyncStorage.setItem('accessToken', token),
                            googleId ? AsyncStorage.setItem('googleId', googleId) : null,
                        ]);

                        // Navigate to the user dashboard
                        navigation.navigate('user');
                    } else {
                        Alert.alert('Error', 'Failed to retrieve access token.');
                    }
                } catch (error) {
                    console.error('Error handling redirect:', error);
                    Alert.alert('Redirect Error', 'Failed to handle the redirect.');
                }
            }
        };

        // Add listener for incoming app URLs
        const subscription = Linking.addListener('url', handleRedirect);

        // Clean up the event listener on component unmount
        return () => {
            subscription.remove();
        };
    }, [navigation]);

    return (
        <View style={styles.loginContainer}>
            <View style={styles.container}>
                <Image
                    source={require('../assets/pcuLogo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <Text style={styles.Text}>
                    Philippine Christian University
                </Text>

                <Text style={styles.inputLabel}>Admin</Text>
                <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    placeholderTextColor="#ccc"
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <Text style={styles.inputLabel}>Password</Text>
                <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    placeholderTextColor="#ccc"
                    secureTextEntry={true}
                    autoCapitalize="none"
                />

                <Pressable style={[styles.button, { marginTop: 10 }]} onPress={handleSubmit}>
                    <Text style={styles.buttonText}>Login</Text>
                </Pressable>

                <Text style={[styles.buttonText, { color: Colors.white }]}>or</Text>

                <Pressable style={[styles.button, { backgroundColor: Colors.cobaltblue, marginTop: 10 }]} onPress={handleGoogleLogin}>
                    <Text style={[styles.buttonText, { color: Colors.white }]}>Login with Google</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    loginContainer: {
        flex: 1,
        backgroundColor: Colors.cobaltblue,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    container: {
        borderTopLeftRadius: 70,
        borderTopRightRadius: 70,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(64, 64, 64, 0.7)',
        width: '100%',
        height: '90%',
    },
    button: {
        backgroundColor: Colors.white,
        padding: 10,
        marginHorizontal: 50,
        borderRadius: 10,
        marginBottom: 20,
        width: '60%',
        alignItems: 'center',
    },
    logo: {
        width: '30%',
        aspectRatio: 1.5,
        height: '30%',
    },
    buttonText: {
        color: Colors.black,
        fontSize: 16,
        fontWeight: 'bold',
    },
    Text: {
        color: Colors.white,
        fontSize: 40,
        fontFamily: 'pcufont',
        textAlign: 'center',
    },
    inputLabel: {
        color: Colors.white,
        fontSize: 18,
        alignSelf: 'flex-start',
        marginLeft: '10%',
        marginBottom: 5,
    },
    input: {
        backgroundColor: Colors.white,
        color: Colors.black,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        width: '80%',
        marginBottom: 20,
        fontSize: 16,
        alignSelf: 'center',
    },
});