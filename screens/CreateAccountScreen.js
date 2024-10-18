import { View, Text, TextInput, Pressable } from 'react-native';
import React, { useState } from 'react';

const CreateAccountScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleCreateAccount = () => {
    // Logic to create account
    console.log('Account created:', username, password);
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 10 }}>Create New Account</Text>
      
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginBottom: 10 }}
      />
      
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginBottom: 20 }}
      />
      
      <Pressable
        onPress={handleCreateAccount}
        style={{ padding: 10, backgroundColor: '#0047AB', borderRadius: 8, alignItems: 'center' }}
      >
        <Text style={{ color: '#fff' }}>Create Account</Text>
      </Pressable>
    </View>
  );
};

export default CreateAccountScreen;
