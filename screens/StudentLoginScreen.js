import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Image, TextInput } from 'react-native';
import Colors from '../constants/Colors';
const StudentLoginScreen = ({ navigation }) => {
  const handleLogin = () => {
    // Navigate to Student Home Screen after login
    navigation.replace('StudentHome');
  };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.loginContainer}>
      <View style={styles.container}>
        <Image source={require('../assets/pcuLogo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.Text}>
          Philippine Christian University
        </Text>

        <Text style={styles.inputLabel}>Email</Text>
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
          <Text style={styles.buttonText}>login</Text>
        </Pressable>

        <Text style={[styles.buttonText, { color: Colors.white }]}>or</Text>

        <Pressable style={[styles.button, { backgroundColor: Colors.cobaltblue, marginTop: 10 }]} onPress={handleLogin}>
          <Text style={[styles.buttonText, { color: Colors.white }]}>login with google</Text>
        </Pressable>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  loginContainer: {
    flex: 1,
    backgroundColor: Colors.cobaltblue, // Use the correct color from Colors
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  container: {
    borderTopLeftRadius: 70, // Top-left corner radius
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
    width: '30%', // Adjust this value to make the image smaller
    aspectRatio: 1.5, // Adjust this value if needed to match the image's natural proportions
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

export default StudentLoginScreen;
