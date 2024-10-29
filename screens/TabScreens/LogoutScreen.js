import React, { useEffect, useState } from 'react';
import { View, Text, Modal, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const LogoutScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const logout = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');

        if (!token) {
          alert('Logout Failed: No access token found.');
          setIsLoading(false);
          return;
        }

        const response = await axios.post('http://192.168.1.9:3000/user/logout', {}, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200) {
          await AsyncStorage.removeItem('accessToken');
          await AsyncStorage.removeItem('role');
          await AsyncStorage.removeItem('firstname');
          await AsyncStorage.removeItem('id');
          navigation.replace('InitialLogin');
        } else {
          alert('Logout Failed: ' + response.data.message);
        }
      } catch (err) {
        alert('Logout Failed: An error occurred during logout.');
      } finally {
        setIsLoading(false);
      }
    };

    logout();
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Modal for Loading */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={isLoading}
        onRequestClose={() => { }}
      >
        <View style={styles.modalBackground}>
          <View style={styles.activityIndicatorWrapper}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text>Logging out...</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default LogoutScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  activityIndicatorWrapper: {
    backgroundColor: '#FFFFFF',
    height: 100,
    width: 150,
    borderRadius: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});
