import React, { useRef, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions, Animated, ActivityIndicator } from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import ImageCarousel from './Components/ImageCarousel';
import Colors from '../constants/Colors';

const { height } = Dimensions.get('window');

const images = [
  require('../assets/medpic10.png'),
  require('../assets/medpic1.png'),
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

const InitialLoginScreen = ({ navigation }) => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '613395138398-an9mnugc70qov6v7mee7i9musciqcrhl.apps.googleusercontent.com',
      offlineAccess: true,
      forceCodeForRefreshToken: true,
      scopes: ['email', 'profile'],
    });
  }, []);
  const storeUserData = async (id, accessToken, role, firstname, username, profilePic) => {
    try {
      await AsyncStorage.setItem('id', id);
      await AsyncStorage.setItem('accessToken', accessToken);
      await AsyncStorage.setItem('role', role);
      await AsyncStorage.setItem('firstname', firstname || 'Student');
      await AsyncStorage.setItem('username', username);
      await AsyncStorage.setItem('profilePic', profilePic); // Save profile picture URL

      console.log('User data stored successfully');
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };


  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await GoogleSignin.hasPlayServices();

      // Clear the cached Google account to prompt account selection
      await GoogleSignin.signOut();

      const userInfo = await GoogleSignin.signIn(); // Attempting Google Sign-In
      console.log("User Info:", userInfo);

      // Extract the ID token from the response
      const idToken = userInfo.data.idToken; // Access the ID token directly

      if (idToken) {
        const response = await axios.post('http://192.168.1.9:3000/login/auth/google', {
          token: idToken,
        });

        console.log("Backend Response:", response.data);

        if (response.data.success) {
          const { token, role, firstname, username, id, profilePic } = response.data;

          // Store user data in AsyncStorage
          await storeUserData(id, token, role, firstname, username, profilePic);



          navigation.navigate('StudentHome'); // Navigate to the StudentHome screen
        } else {
          setError('Backend authentication failed');
        }
      } else {
        setError("Failed to retrieve ID Token");
      }
    } catch (error) {
      console.error('Google login error:', error);

      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        setError('Google Sign-In was cancelled');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        setError('Google Sign-In operation is in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setError('Play services not available or outdated');
      } else {
        setError('An error occurred during Google login');
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <View style={styles.loginContainer}>
      <ImageCarousel images={loopedImages} scrollX={scrollX} />

      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Welcome to</Text>
          <Text style={[styles.title, { fontWeight: 'bold' }]}>Saulus</Text>
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <Pressable
          style={[styles.button, { backgroundColor: Colors.white }]}
          onPress={handleGoogleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.cobaltblue} />
          ) : (
            <Text style={[styles.buttonText, { color: 'black' }]}>Login with Google</Text>
          )}
        </Pressable>
        <Pressable
          style={styles.button}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonText}>Login as Admin</Text>
        </Pressable>
      </View>
    </View>
  );
};

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
    height: '60%',
    position: 'absolute',
    bottom: 0,
  },
  title: {
    fontSize: 60,
    color: Colors.white,
    width: '100%',
    textAlign: 'center',
  },
  button: {
    backgroundColor: Colors.cobaltblue,
    padding: 10,
    marginHorizontal: 50,
    borderRadius: 20,
    marginBottom: 20,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  titleContainer: {
    marginBottom: 40,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default InitialLoginScreen;
