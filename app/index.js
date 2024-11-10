import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Image, TextInput, Alert, Linking, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Colors from '../constants/Colors';
import ImageCarousel from '../screens/Components/ImageCarousel';
import * as Font from 'expo-font';
const images = [
    require('../assets/medpic2.png'),
    require('../assets/medpic3.png'),
    require('../assets/medpic4.png'),
    require('../assets/medpic5.png'),
    require('../assets/medpic6.png'),
    require('../assets/medpic7.png'),
    require('../assets/medpic8.png'),
    require('../assets/medpic9.png'),
    require('../assets/medpic10.png'),
];
const loopedImages = [...images, ...images, ...images, ...images];

export default function AdminLoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const scrollX = useRef(new Animated.Value(0)).current;
    const [fontLoaded, setFontLoaded] = useState(false);

    useEffect(() => {
        async function loadFont() {
            await Font.loadAsync({
                'pcufont': require('../assets/fonts/pcufont.ttf'),
            });
            setFontLoaded(true);
        }
        loadFont();
    }, []);

    if (!fontLoaded) {
        return null; // Or a loading indicator
    }
    const storeUserData = async (userData) => {
        try {
            const { id, accessToken, role, firstname, username, pfp } = userData;
            await AsyncStorage.setItem('id', id);
            await AsyncStorage.setItem('accessToken', accessToken);
            await AsyncStorage.setItem('role', role);
            await AsyncStorage.setItem('firstname', firstname);
            await AsyncStorage.setItem('username', username);
            if (pfp) {
                await AsyncStorage.setItem('profilePic', pfp);
            }
            console.log('User data saved', { firstname, pfp });
        } catch (error) {
            console.error('Error saving user data:', error);
        }
    };

    const handleSubmit = async () => {
        try {
            await AsyncStorage.removeItem('googleId');
            await AsyncStorage.removeItem('name');

            const response = await axios.post('http://192.168.1.9:3000/user/login', {
                email,
                password,
            });

            if (response.status === 200) {
                const userData = response.data;
                console.log('Login successful:', userData);
                Alert.alert('Success', 'Login successful!');

                await storeUserData(userData);

                if (userData.role === 'admin' || userData.role === 'staff') {
                    navigation.navigate('AdminDasboard');
                } else if (userData.role === 'student' || userData.role === 'user') {
                    navigation.navigate('StudentHome');
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



    return (
        <View style={styles.loginContainer}>
            <ImageCarousel images={loopedImages} scrollX={scrollX} blurRadius={10} />

            <View style={styles.container}>
                <Image source={require('../assets/pcuLogo.png')} style={styles.logo} resizeMode="contain" />
                <Text style={styles.Text}>Philippine Christian University</Text>

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


            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    loginContainer: {
        flex: 1,
    },
    container: {
        borderTopLeftRadius: 70,
        borderTopRightRadius: 70,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(64, 64, 64, 0.9)',
        width: '100%',
        height: '90%',
        position: 'absolute',
        bottom: 0,
    },
    button: {
        backgroundColor: Colors.cobaltblue,
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
        color: Colors.white,
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
        marginLeft: 25,
        marginTop: 15,
        marginBottom: 10,
    },
    input: {
        backgroundColor: Colors.white,
        borderRadius: 10,
        height: 50,
        width: '90%',
        paddingHorizontal: 10,
        marginBottom: 20,
    },
});