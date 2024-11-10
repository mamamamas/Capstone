import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, Pressable, Modal, Alert, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';
import Colors from '../../constants/Colors';

const StockList = ({
  stock,
  handleNewQuantityChange,
  handleExpirationDateChange,
  calculateStockStatus,
  isEditing,
  refreshStockData,
  setModalVisible,
  setSelectedStockItem,
}) => {
  const [datePickerVisible, setDatePickerVisible] = useState(null);
  const [tempDate, setTempDate] = useState(null);
  const [deductionModalVisible, setDeductionModalVisible] = useState(false);
  const [deductionAmount, setDeductionAmount] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [stockToDelete, setStockToDelete] = useState([]);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedStockDetails, setSelectedStockDetails] = useState(null);

  const InfoItem = ({ label, value }) => (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}:</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );

  const handleDateChange = (event, selectedDate) => {
    const currentIndex = datePickerVisible;
    setDatePickerVisible(null);
    if (selectedDate && currentIndex !== null) {
      handleExpirationDateChange(currentIndex, selectedDate.toISOString().split('T')[0]);
    }
  };

  const handleRowPress = (item) => {
    console.log("Selected item with details:", JSON.stringify(item, null, 2));
    setSelectedStockDetails(item);
    setDetailsModalVisible(true);
  };

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

    const handleDeleteStock = (stockItemId, index) => {
      Alert.alert(
        "Confirm Delete",
        "Are you sure you want to delete this stock item?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            onPress: async () => {
              try {
                const token = await AsyncStorage.getItem('accessToken');
                await axios.post('http://192.168.1.9:3000/stocks/edit', {
                  stockDeletion: [{ stockItemId }],
                }, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                refreshStockData();
                Alert.alert("Deleted", "Stock item deleted successfully.");
                setStockToDelete(prevStock => prevStock.filter((item, idx) => idx !== index));
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
      setSelectedItem(item);
      setDeductionModalVisible(true);
    };

    return (
      <TouchableOpacity onPress={() => handleRowPress(item)}>
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
          {isEditing && (
            <Pressable onPress={handleDatePress} style={styles.dateInput}>
              <Text>{item.expirationDate || 'Set Date'}</Text>
            </Pressable>
          )}
          <Text style={[styles.statusText(isLowStock), { color: statusColor }]}>
            {stockStatus}
          </Text>
          {isEditing ? (
            <Pressable style={styles.deductButton} onPress={() => handleDeleteStock(item.stockItemId, index)}>
              <Icon name="delete" size={25} color="red" />
            </Pressable>
          ) : (
            <Pressable style={styles.deductButton} onPress={openDeductionModal}>
              <Icon name="remove-circle-outline" size={24} color="red" />
            </Pressable>
          )}
        </View>
      </TouchableOpacity>
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
        'http://192.168.1.9:3000/stocks/deduct',
        {
          stockItemId: selectedItem.stockItemId,
          deduction: parseInt(deductionAmount),
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
        refreshStockData();
      } else {
        Alert.alert('Error', 'Failed to apply stock deduction');
      }
    } catch (error) {
      console.error('Error applying stock deduction:', error);
      Alert.alert('Error', 'Failed to apply stock deduction');
    }

    setDeductionModalVisible(false);
    setDeductionAmount('');
  };

  const StockDetailsModal = ({ visible, onClose, stockDetails }) => {
    if (!visible || !stockDetails) return null;

    const sortedStockDetails = stockDetails.stockDetails
      ? [...stockDetails.stockDetails].sort((a, b) => new Date(a.expirationDate) - new Date(b.expirationDate))
      : [];

    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{stockDetails.stockItemName}</Text>
            <ScrollView style={styles.scrollView}>
              <View style={styles.infoSection}>
                <InfoItem label="Total Current Quantity" value={stockDetails.totalCurrentQuantity} />
                <InfoItem label="Category" value={stockDetails.category} />
                <InfoItem label="Status" value={stockDetails.status} />
              </View>
              <Text style={styles.sectionTitle}>Stock Details:</Text>
              {sortedStockDetails.length > 0 ? (
                sortedStockDetails.map((detail, index) => (
                  <View key={index} style={styles.detailItem}>
                    <InfoItem label="Initial Quantity" value={detail.initialQuantity} />
                    <InfoItem label="Current Quantity" value={detail.currentQuantity} />
                    <InfoItem
                      label="Expiration Date"
                      value={new Date(detail.expirationDate).toLocaleDateString()}
                    />
                  </View>
                ))
              ) : (
                <Text style={styles.noDataText}>No stock details available.</Text>
              )}
            </ScrollView>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
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

      {datePickerVisible !== null && (
        <DateTimePicker
          value={tempDate || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      <Modal
        visible={deductionModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setDeductionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deductionModalContent}>
            <View style={styles.modalHeader}>
              <Icon name="remove-circle-outline" size={24} color="red" />
              <Text style={styles.deductionModalTitle}>Deduct Stock</Text>
            </View>
            <TextInput
              placeholder="Enter deduction amount"
              keyboardType="numeric"
              value={deductionAmount}
              onChangeText={setDeductionAmount}
              style={styles.deductionTextInput}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={[styles.deductionButton, styles.cancelButton]} onPress={() => setDeductionModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deductionButton} onPress={handleDeduction}>
                <Text style={styles.deductionButtonText}>Deduct</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <StockDetailsModal
        visible={detailsModalVisible}
        onClose={() => setDetailsModalVisible(false)}
        stockDetails={selectedStockDetails}
      />
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
  dateInput: {
    width: 120,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 15,
    textAlign: 'center',
    marginHorizontal: 5,
    backgroundColor: '#f9f9f9',
  },
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
    textAlign: 'center',
    backgroundColor: Colors.cobaltblue,
    borderRadius: 10,
    padding: 10
  },
  scrollView: {
    marginBottom: 20,
  },
  infoSection: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 10,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  detailItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: Colors.orange,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    alignSelf: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deductionModalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  deductionModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  deductionTextInput: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  deductionButton: {
    flex: 1,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    backgroundColor: Colors.cobaltblue,
  },
  cancelButton: {
    backgroundColor: Colors.orange,
  },
  cancelButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: 'bold',
  },
  deductionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default StockList;