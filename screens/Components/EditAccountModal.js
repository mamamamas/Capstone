import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Modal,
  Pressable,
  Animated,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Feather } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Assuming Colors is imported from your constants
import Colors from '../../constants/Colors';

const API_BASE_URL = 'http://192.168.1.15:3000/admin'; // Replace with your actual API base URL

export default function EditAccountModal({ isVisible, account, onSave, onClose }) {
  const [editedAccount, setEditedAccount] = useState({
    user: {
      _id: '',
      username: '',
      email: '',
      firstname: '',
      password: '',
    },
    education: {
      educationLevel: '',
    },
  });
  const [animation] = useState(new Animated.Value(0));

  useEffect(() => {
    if (account) {
      setEditedAccount({
        user: {
          _id: account.user._id || '',
          username: account.user.username || '',
          email: account.user.email || '',
          firstname: account.user.firstname || '',
          password: '',
        },
        education: {
          educationLevel: account.education.educationLevel || '',
        },
      });
    }
  }, [account]);

  useEffect(() => {
    Animated.timing(animation, {
      toValue: isVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isVisible]);

  const handleChange = (key, value, section = 'user') => {
    setEditedAccount(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const handleSaveAccount = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No access token found');
      }

      if (!editedAccount.user._id) {
        throw new Error('Invalid user ID');
      }

      const response = await axios.patch(
        `${API_BASE_URL}/account/${editedAccount.user._id}`,
        {
          email: editedAccount.user.email,
          username: editedAccount.user.username,
          firstname: editedAccount.user.firstname,
          password: editedAccount.user.password, // Only send if changed
          education: editedAccount.education
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data && response.data.user) {
        onSave(response.data.user);
        onClose();
        Alert.alert('Success', 'Account updated successfully');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Error updating account:', err);
      if (err.response && err.response.data && err.response.data.error) {
        Alert.alert('Error', err.response.data.error);
      } else {
        Alert.alert('Error', 'Failed to update account. Please try again.');
      }
    }
  };

  if (!account) return null;

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="none"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalBackground}
      >
        <Animated.View
          style={[
            styles.modalContent,
            {
              opacity: animation,
              transform: [
                {
                  translateY: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [300, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <Text style={styles.modalTitle}>Edit Account</Text>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <Feather name="x" size={24} color={Colors.cobaltblue} />
              </Pressable>
            </View>

            <InputField
              label="Username"
              value={editedAccount.user.username}
              onChangeText={(text) => handleChange('username', text)}
              icon="user"
            />

            <InputField
              label="Email"
              value={editedAccount.user.email}
              onChangeText={(text) => handleChange('email', text)}
              icon="mail"
            />


            <InputField
              label="Password"
              value={editedAccount.user.password}
              placeholder="Enter new password"
              onChangeText={(text) => handleChange('password', text)}
              icon="lock"
              secureTextEntry
            />

            <Text style={styles.label}>Education Level</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={editedAccount.education.educationLevel}
                onValueChange={(itemValue) => handleChange('educationLevel', itemValue, 'education')}
                style={styles.picker}
              >
                <Picker.Item label="JHS" value="JHS" />
                <Picker.Item label="SHS" value="SHS" />
                <Picker.Item label="College" value="College" />
              </Picker>
            </View>

            <View style={styles.buttonContainer}>
              <Pressable style={[styles.button, styles.closeButton]} onPress={onClose}>
                <Text style={[styles.buttonText, { color: Colors.cobaltblue }]}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.button, styles.saveButton]} onPress={handleSaveAccount}>
                <Text style={styles.buttonText}>Save Changes</Text>
              </Pressable>
            </View>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// Custom InputField component for consistent styling
function InputField({ label, value, onChangeText, icon, secureTextEntry = false, placeholder = '' }) {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <Feather name={icon} size={20} color={Colors.cobaltblue} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          placeholder={placeholder}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '90%',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.cobaltblue,
  },
  closeButton: {
    padding: 5,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: Colors.cobaltblue,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.lgray,
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: Colors.lgray,
    borderRadius: 10,
    marginBottom: 20,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '48%',
  },
  closeButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.cobaltblue,
  },
  saveButton: {
    backgroundColor: Colors.cobaltblue,
  },
  buttonText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});