import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Colors from '../constants/Colors';
import EditAccountModal from '../screens/Components/EditAccountModal';

const accountTypes = ['JHS', 'SHS', 'College'];

export default function ManageAccountScreen() {
  const navigation = useNavigation();
  const [selectedType, setSelectedType] = useState('JHS');
  const [accounts, setAccounts] = useState([
    { id: '1', name: 'N/A N/A', type: 'JHS', username: 'jhs1', email: 'jhs1@school.com', department: 'JHS' },
    { id: '2', name: 'N/A N/A', type: 'JHS', username: 'jhs2', email: 'jhs2@school.com', department: 'JHS' },
    { id: '3', name: 'John Doe', type: 'SHS', username: 'shs1', email: 'shs1@school.com', department: 'SHS' },
    { id: '4', name: 'Jane Smith', type: 'College', username: 'college1', email: 'college1@school.com', department: 'College' },
  ]);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const filteredAccounts = accounts.filter(account => account.type === selectedType);

  const renderAccountItem = ({ item }) => (
    <View style={styles.accountItem}>
      <Text style={styles.accountName}>{item.name}</Text>
      <Pressable 
        style={styles.editButton} 
        onPress={() => handleEditAccount(item)}
      >
        <Text style={styles.editButtonText}>Edit</Text>
      </Pressable>
    </View>
  );

  const handleEditAccount = (account) => {
    setSelectedAccount(account);
    setIsEditModalVisible(true);
  };

  const handleSaveAccount = (editedAccount) => {
    setAccounts(accounts.map(account => 
      account.id === editedAccount.id ? editedAccount : account
    ));
    setIsEditModalVisible(false);
  };

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
        data={filteredAccounts}
        renderItem={renderAccountItem}
        keyExtractor={(item) => item.id}
        style={styles.accountList}
      />

      <EditAccountModal
        isVisible={isEditModalVisible}
        account={selectedAccount}
        onSave={handleSaveAccount}
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
});