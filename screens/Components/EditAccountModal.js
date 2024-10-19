import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Modal, Pressable } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Colors from '../../constants/Colors';

export default function EditAccountModal({ isVisible, account, onSave, onClose }) {
  const [editedAccount, setEditedAccount] = useState(account || {});

  useEffect(() => {
    setEditedAccount(account || {});
  }, [account]);

  const handleSave = () => {
    onSave(editedAccount);
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Edit Account</Text>
          
          <Text style={styles.label}>Username:</Text>
          <TextInput
            style={styles.input}
            value={editedAccount.username}
            onChangeText={(text) => setEditedAccount({...editedAccount, username: text})}
          />
          
          <Text style={styles.label}>Password:</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            placeholder="Enter new password"
            onChangeText={(text) => setEditedAccount({...editedAccount, password: text})}
          />
          
          <Text style={styles.label}>Email:</Text>
          <TextInput
            style={styles.input}
            value={editedAccount.email}
            onChangeText={(text) => setEditedAccount({...editedAccount, email: text})}
          />
          
          <Text style={styles.label}>Department:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={editedAccount.department}
              onValueChange={(itemValue) => setEditedAccount({...editedAccount, department: itemValue})}
              style={styles.picker}
            >
              <Picker.Item label="JHS" value="JHS" />
              <Picker.Item label="SHS" value="SHS" />
              <Picker.Item label="College" value="College" />
            </Picker>
          </View>
          
          <View style={styles.buttonContainer}>
            <Pressable style={[styles.button, styles.closeButton]} onPress={onClose}>
              <Text style={styles.buttonText}>Close</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.saveButton]} onPress={handleSave}>
              <Text style={styles.buttonText}>Save</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
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
    borderRadius: 50,
    padding: 20,
    width: '80%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: Colors.cobaltblue,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: Colors.cobaltblue,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.lgray,
    borderRadius: 50,
    padding: 10,
    marginBottom: 15,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: Colors.lgray,
    borderRadius: 50,
    marginBottom: 20,
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
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    width: '45%',
  },
  closeButton: {
    backgroundColor: Colors.lgray,
    borderRadius: 50,
  },
  saveButton: {
    backgroundColor: 'green',
    borderRadius: 50,
  },
  buttonText: {
    color: Colors.white,
    fontWeight: 'bold',
  },
});