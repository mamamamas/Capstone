import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import Colors from '../constants/Colors';
import EditAccountModal from '../screens/Components/EditAccountModal';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.1.9:3000/admin'; // Replace with your actual API base URL
const accountTypes = ['JHS', 'SHS', 'College'];

export default function ManageAccountScreen() {
  const navigation = useNavigation();
  const [selectedType, setSelectedType] = useState('JHS');
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  useEffect(() => {
    fetchAccounts(selectedType);
  }, [selectedType]);

  const fetchAccounts = async (educationLevel) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No access token found');
      }

      const response = await axios.get(`${API_BASE_URL}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { educationLevel },
      });

      if (response.data && Array.isArray(response.data)) {
        setAccounts(response.data);
      } else {
        throw new Error('Invalid data received from server');
      }
    } catch (err) {
      console.error('Error fetching accounts:', err);
      setError('Failed to load accounts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderAccountItem = ({ item }) => (
    <View style={styles.accountItem}>
      <Text style={styles.accountName}>{`${item.firstName} ${item.lastName}`}</Text>
      <Pressable
        style={styles.editButton}
        onPress={() => handleEditAccount(item)}
      >
        <Text style={styles.editButtonText}>Edit</Text>
      </Pressable>
    </View>
  );

  const handleEditAccount = async (account) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No access token found');
      }

      const response = await axios.get(`${API_BASE_URL}/account/${account.userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(response.data);
      setSelectedAccount(response.data);
      setIsEditModalVisible(true);
    } catch (err) {
      console.error('Error fetching account details:', err);
      Alert.alert('Error', 'Failed to fetch account details. Please try again.');
    }
  };

  const handleSaveAccount = async (editedAccount) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No access token found');
      }
      console.log(editedAccount)

      // Ensure that editedAccount.user._id is a valid ObjectId
      if (!editedAccount.user._id) {
        throw new Error('Invalid user ID');
      }

      const response = await axios.patch(
        `${API_BASE_URL}/account/${editedAccount.user._id}`,
        {
          email: editedAccount.user.email,
          username: editedAccount.user.username,
          firstname: editedAccount.user.firstname,

          education: editedAccount.education
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data && response.data.user) {
        setAccounts(accounts.map(account =>
          account.userId === editedAccount.user._id ? { ...account, ...response.data.user } : account
        ));
        setIsEditModalVisible(false);
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
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.cobaltblue} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={() => fetchAccounts(selectedType)}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.typeSelector}>
        {accountTypes.map((type) => (
          <Pressable
            key={type}
            style={[
              styles.typeButton,
              selectedType === type && styles.selectedTypeButton,
            ]}
            onPress={() => setSelectedType(type)}
          >
            <Text
              style={[
                styles.typeButtonText,
                selectedType === type && styles.selectedTypeButtonText,
              ]}
            >
              {type}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionTitle}>{selectedType} Staff Accounts</Text>

      <FlatList
        data={accounts}
        renderItem={renderAccountItem}
        keyExtractor={(item) => item.userId}
        style={styles.accountList}
      />

      <EditAccountModal
        isVisible={isEditModalVisible}
        account={selectedAccount}
        onSave={(updatedAccount) => {
          setAccounts(accounts.map(account =>
            account.userId === updatedAccount._id ? { ...account, ...updatedAccount } : account
          ));
          setIsEditModalVisible(false);
        }}
        onClose={() => setIsEditModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.lgray,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.lgray,
  },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  typeButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: Colors.white,
  },
  selectedTypeButton: {
    backgroundColor: Colors.cobaltblue,
  },
  typeButtonText: {
    color: Colors.cobaltblue,
    fontWeight: 'bold',
  },
  selectedTypeButtonText: {
    color: Colors.white,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: Colors.cobaltblue,
  },
  accountList: {
    flex: 1,
  },
  accountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 15,
    borderRadius: 50,
    marginBottom: 10,
  },
  accountName: {
    fontSize: 16,
  },
  editButton: {
    backgroundColor: 'green',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 50,
  },
  editButtonText: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: Colors.cobaltblue,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: Colors.white,
    fontWeight: 'bold',
  },
});