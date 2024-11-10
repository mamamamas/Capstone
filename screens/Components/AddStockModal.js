import React, { useState } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Colors from '../../constants/Colors';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AddStockModal({ visible, onClose, onAdd }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Medicine');
  const [isLoading, setIsLoading] = useState(false);

  const handleAdd = async () => {
    if (!name) {
      Alert.alert('Validation Error', 'Please enter a stock name');
      return;
    }

    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await axios.post('http://192.168.1.9:3000/stocks/item', {
        addItemName: name,
        category,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
      );

      if (response.status === 200) {

        onAdd(response.data);
        onClose();
      } else {
        Alert.alert('Error', 'Failed to add stock item');
      }
    } catch (error) {
      console.error('Error adding stock item:', error);
      Alert.alert('Error', 'Failed to add stock item');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <ScrollView style={styles.scrollView}>
            <Text style={styles.modalTitle}>Add Stock</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Stock Name</Text>
              <TextInput
                style={styles.input}
                onChangeText={setName}
                value={name}
                placeholder="Enter stock name"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Category</Text>
              <Picker
                selectedValue={category}
                style={styles.picker}
                onValueChange={(itemValue) => setCategory(itemValue)}
              >
                <Picker.Item label="Medicine" value="Medicine" />
                <Picker.Item label="Supplies" value="Supplies" />
                <Picker.Item label="Equipment" value="Equipment" />
              </Picker>
            </View>

            <View style={styles.buttonContainer}>
              <Pressable
                style={[styles.addButton, isLoading && styles.disabledButton]}
                onPress={handleAdd}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>{isLoading ? 'Adding...' : 'Add'}</Text>
              </Pressable>
              <Pressable style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.buttonText}>Cancel</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '80%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  scrollView: {
    width: '100%',
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.cobaltblue,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 5,
    color: Colors.cobaltblue,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: '#f9f9f9',
  },
  picker: {
    width: '100%',
    height: 50,
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
  },
  dateButton: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
  },
  dateButtonText: {
    fontSize: 16,
    color: Colors.cobaltblue,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  addButton: {
    backgroundColor: Colors.cobaltblue,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 50,
  },
  cancelButton: {
    backgroundColor: 'red',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 50,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
});