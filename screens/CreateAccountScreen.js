import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Colors from '../constants/Colors';

const CreateAccountScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [educationLevel, setEducationLevel] = useState('');

  const handleCreateAccount = () => {
    // Logic to create account
    console.log('Account created:', { username, password, email, educationLevel });
  };

  const handleClose = () => {
    // Logic to close the screen or navigate back
    console.log('Close pressed');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Staff Account Creation</Text>

      <Text style={styles.label}>Username:</Text>
      <TextInput
        placeholder="Enter username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />

      <Text style={styles.label}>Password:</Text>
      <TextInput
        placeholder="Enter password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <Text style={styles.label}>Email:</Text>
      <TextInput
        placeholder="Enter email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        style={styles.input}
      />

      <Text style={styles.label}>Education Level:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={educationLevel}
          onValueChange={(itemValue) => setEducationLevel(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Select Education Level" value="" />
          <Picker.Item label="High School" value="highSchool" />
          <Picker.Item label="Bachelor's Degree" value="bachelors" />
          <Picker.Item label="Master's Degree" value="masters" />
          <Picker.Item label="Doctorate" value="doctorate" />
        </Picker>
      </View>

      <View style={styles.buttonContainer}>
        <Pressable
          onPress={handleClose}
          style={[styles.button, styles.closeButton]}
        >
          <Text style={styles.buttonText}>Close</Text>
        </Pressable>
        <Pressable
          onPress={handleCreateAccount}
          style={[styles.button, styles.saveButton]}
        >
          <Text style={styles.buttonText}>Save</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.white,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.cobaltblue,
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: Colors.cobaltblue,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.gray,
    borderRadius: 50,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: Colors.gray,
    borderRadius: 50,
    marginBottom: 20,
  },
  picker: {
    height: 50,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    padding: 15,
    borderRadius: 50,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  closeButton: {
    backgroundColor: Colors.gray,
  },
  saveButton: {
    backgroundColor: Colors.green,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreateAccountScreen;