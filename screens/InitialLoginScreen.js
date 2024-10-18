// InitialLoginScreen.js
import React, { useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions, Animated } from 'react-native';
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
  const scrollX = useRef(new Animated.Value(0)).current; // Create scrollX for animation

  return (
    <View style={styles.loginContainer}>
      <ImageCarousel images={loopedImages} scrollX={scrollX} />

      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Welcome to</Text>
          <Text style={[styles.title, { fontWeight: 'bold' }]}>Saulus</Text>
        </View>
        <Pressable
          style={[styles.button, { backgroundColor: Colors.white }]}
          onPress={() => navigation.navigate('StudentLogin')}
        >
          <Text style={[styles.buttonText, { color: 'black' }]}>Login as Student</Text>
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
});

export default InitialLoginScreen;
