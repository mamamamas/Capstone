import React, { useState, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Image, TextInput, Animated } from 'react-native';
import Colors from '../constants/Colors';
import ImageCarousel from './Components/ImageCarousel';

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

const AdminLoginScreen = ({ navigation }) => {
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleLogin = () => {
    navigation.replace('AdminHome');
  };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.loginContainer}>
      {/* Pass blurRadius prop here */}
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

        <Pressable style={[styles.button, { marginTop: 10 }]} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </Pressable>

        <Text style={[styles.buttonText, { color: Colors.white }]}>or</Text>

        <Pressable
          style={[styles.button, { backgroundColor: Colors.cobaltblue, marginTop: 10 }]}
          onPress={handleLogin}
        >
          <Text style={[styles.buttonText, { color: Colors.white }]}>Login with Google</Text>
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
    height: '90%',
    position: 'absolute',
    bottom: 0,
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
    marginLeft: 40,
    marginTop: 20,
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

export default AdminLoginScreen;
