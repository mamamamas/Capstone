import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, Pressable, Modal, Button, Alert, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Importing the icon library
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';

const StockList = ({
  stock,
  handleNewQuantityChange,
  handleExpirationDateChange,
  calculateStockStatus,
  isEditing,
  setModalVisible,
  setSelectedStockItem,
}) => {
  const [datePickerVisible, setDatePickerVisible] = useState(null);
  const [tempDate, setTempDate] = useState(null);

  // Deduction modal states
  const [deductionModalVisible, setDeductionModalVisible] = useState(false);
  const [deductionAmount, setDeductionAmount] = useState('');
  const [selectedItem, setSelectedItem] = useState(null); // Selected stock item for deduction
  const [stockToDelete, setStockToDelete] = useState([]); // Track items to delete


  const renderItem = ({ item, index }) => {
    const initialQuantity = item.initialQuantity || 0;
    const currentQuantity = item.totalCurrentQuantity || 0;
    const stockStatus = calculateStockStatus(initialQuantity, currentQuantity);
    const isLowStock = stockStatus === 'Restock' || stockStatus === 'Out of Stock';

    const isValidDate = (dateString) => {
      return dateString && dateString !== '-' && !isNaN(Date.parse(dateString));
    };

    let statusColor;
    if (stockStatus === 'Out of Stock') {
      statusColor = 'red';
    } else if (stockStatus === 'Restock') {
      statusColor = 'orange';
    } else {
      statusColor = 'green';
    }

    const handleDatePress = () => {
      const currentDate = isValidDate(item.expirationDate) ? new Date(item.expirationDate) : new Date();
      setTempDate(currentDate);
      setDatePickerVisible(index);
    };

    const handleDateChange = (event, selectedDate) => {
      setDatePickerVisible(null);
      if (selectedDate) {
        handleExpirationDateChange(index, selectedDate.toISOString().split('T')[0]);
      }
    };
    const handleDeleteStock = (stockItemId, index) => {
      // Ask for confirmation before deletion
      Alert.alert(
        "Confirm Delete",
        "Are you sure you want to delete this stock item?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Delete",
            onPress: async () => {
              try {
                const token = await AsyncStorage.getItem('accessToken');
                await axios.post('http://192.168.1.2:3000/stocks/edit', {
                  stockDeletion: [{ stockItemId }], // Sending stockItemId for deletion
                }, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                Alert.alert("Deleted", "Stock item deleted successfully.");
                // Update local state to reflect deletion
                setStockToDelete(prevStock => prevStock.filter((item, idx) => idx !== index)); // Remove item from the state
              } catch (error) {
                console.error('Error deleting stock item:', error);
                const errorMessage = error.response?.data?.error || 'Failed to delete stock item.';
                Alert.alert('Error', errorMessage);
              }
            },
          },
        ],
        { cancelable: false }
      );
    };

    const openDeductionModal = () => {
      setSelectedItem(item); // Set the selected stock item for deduction
      setDeductionModalVisible(true); // Open the deduction modal
    };

    return (
      <Pressable onPress={() => openDeductionModal()}>
        <View style={[styles.itemRow(isLowStock), isLowStock && { backgroundColor: statusColor === 'red' ? '#ffcccc' : '#fff' }]}>
          <Text style={styles.productName}>{item.stockItemName}</Text>

          {isEditing ? (
            <TextInput
              placeholder="Qty"
              value={item.newQuantity || ''}
              onChangeText={(value) => handleNewQuantityChange(index, value)}
              keyboardType="numeric"
              style={styles.textInput}
            />
          ) : (
            <Text style={styles.textDisplay}>{item.totalCurrentQuantity || '0'}</Text>
          )}

          {isEditing ? (
            <Pressable onPress={handleDatePress} style={styles.textInput}>
              <Text>{isValidDate(item.expirationDate) ? item.expirationDate : 'Set Date'}</Text>
            </Pressable>
          ) : (
            <Text style={styles.textDisplay}>{isValidDate(item.expirationDate) ? item.expirationDate : 'N/A'}</Text>
          )}

          {datePickerVisible === index && (
            <DateTimePicker
              value={tempDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}

          <Text style={[styles.statusText(isLowStock), { color: statusColor }]}>
            {stockStatus}
          </Text>

          {/* Modify the Deduct button to delete stock */}
          {isEditing ? (
            <Pressable style={styles.deductButton} onPress={() => handleDeleteStock(item.stockItemId, index)}>
              <Icon name="delete" size={25} color="red" />
            </Pressable>
          ) : (
            <Pressable style={styles.deductButton} onPress={openDeductionModal}>
              <Icon name="edit" size={25} color="blue" />
            </Pressable>
          )}
        </View>
      </Pressable>
    );
  };

  const handleDeduction = async () => {
    if (!deductionAmount || isNaN(deductionAmount)) {
      Alert.alert("Invalid Input", "Please enter a valid deduction amount.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem('accessToken');

      const response = await axios.post(
        'http://192.168.1.2:3000/stocks/deduct', // Update with your backend URL
        {
          stockItemId: selectedItem.stockItemId, // Use the selected item for deduction
          deduction: parseInt(deductionAmount),  // Convert to number
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        Alert.alert('Success', 'Stock deduction applied successfully');
        // Optionally, refresh the stock list or update the UI accordingly
      } else {
        Alert.alert('Error', 'Failed to apply stock deduction');
      }
    } catch (error) {
      console.error('Error applying stock deduction:', error);
      Alert.alert('Error', 'Failed to apply stock deduction');
    }

    setDeductionModalVisible(false); // Close the modal after deduction
    setDeductionAmount(''); // Clear the input
  };

  return (
    <View>
      {stock.length === 0 ? (
        <Text style={styles.emptyMessage}>No stock items available.</Text>
      ) : (
        <FlatList
          data={stock}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 10 }}
        />
      )}

      {/* Deduction Modal */}
      <Modal
        visible={deductionModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDeductionModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Deduct Stock</Text>
            <TextInput
              placeholder="Enter deduction amount"
              keyboardType="numeric"
              value={deductionAmount}
              onChangeText={(value) => setDeductionAmount(value)}
              style={styles.textInput}
            />
            <TouchableOpacity style={styles.button} onPress={handleDeduction}>
              <Text style={styles.buttonText}>Deduct</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setDeductionModalVisible(false)}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  itemRow: (isLowStock) => ({
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    backgroundColor: isLowStock ? '#ffe6e6' : 'transparent',
  }),
  productName: {
    width: 120,
    fontSize: 14,
    paddingHorizontal: 5,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  textInput: {
    width: 120,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    textAlign: 'center',
    marginHorizontal: 5,
    backgroundColor: '#f9f9f9',
  },
  textDisplay: {
    width: 120,
    textAlign: 'center',
    fontSize: 14,
    paddingHorizontal: 5,
  },
  statusText: (isLowStock) => ({
    width: 120,
    textAlign: 'center',
    color: isLowStock ? 'red' : 'green',
    fontWeight: 'bold',
    paddingHorizontal: 5,
  }),
  deductButton: {
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  emptyMessage: {
    textAlign: 'center',
    fontSize: 16,
    color: 'gray',
    padding: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#ff4d4d',
  },
});

export default StockList;
