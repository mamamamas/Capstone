import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, Alert } from 'react-native';
import axios from 'axios';
import StockList from './Components/StockList';
import styles from './Components/StockScreenStyles';
import AsyncStorage from "@react-native-async-storage/async-storage";
import AddStockModal from './Components/AddStockModal';
import Icon from 'react-native-vector-icons/MaterialIcons';

const tabs = ['Medicine', 'Supplies', 'Equipment'];

const StockScreen = () => {
  const [selectedTab, setSelectedTab] = useState('Medicine');
  const [isEditing, setIsEditing] = useState(false);
  const [stock, setStock] = useState([]);
  const [emptyMessage, setEmptyMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStock, setFilteredStock] = useState([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [stockToDelete, setStockToDelete] = useState([]);

  // Memoize fetchStockData to prevent unnecessary re-creations
  const fetchStockData = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await axios.get(`http://192.168.1.9:3000/stocks/${selectedTab}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const stockData = response.data.map(item => ({
        stockItemId: item.stockItemId,
        stockItemName: item.stockItemName,
        newQuantity: item.newStockQty ? item.newStockQty.toString() : '',
        totalCurrentQuantity: item.totalCurrentQuantity,
        status: item.status,
        category: item.category,
        stockDetails: item.stockDetails,
      }));

      setStock(stockData);
      setEmptyMessage(stockData.length === 0 ? `No stock items found for the category: ${selectedTab}.` : '');
    } catch (error) {
      console.error('Error fetching stock data:', error);
      setEmptyMessage(`Error fetching stock items for the category: ${selectedTab}.`);
    }
  }, [selectedTab]);

  useEffect(() => {
    fetchStockData();
  }, [fetchStockData]);

  useEffect(() => {
    const filtered = searchTerm === ''
      ? stock
      : stock.filter(product => product.stockItemName.toLowerCase().includes(searchTerm.toLowerCase()));
    setFilteredStock(filtered);
  }, [searchTerm, stock]);

  const handleDeleteStock = useCallback((stockItemId) => {
    setStockToDelete(prev => [...prev, stockItemId]);
  }, []);

  const handleAddStock = useCallback((newStock) => {
    Alert.alert('Stock Added', `Added ${newStock.quantity} to ${newStock.category} with expiry date ${newStock.expiryDate}`);
    setIsAddModalVisible(false);
    fetchStockData(); // Refresh the stock list after adding new stock
  }, [fetchStockData]);

  const handleTabChange = useCallback((tab) => {
    setSelectedTab(tab);
    setIsEditing(false);
    setEmptyMessage('');
    setStock([]); // Clear the stock before fetching new data
  }, []);

  const handleInputChange = useCallback((index, value, field) => {
    setStock(prevStock => prevStock.map((product, i) =>
      i === index ? { ...product, [field]: value } : product
    ));
  }, []);

  const calculateStockStatus = useCallback((initialQty, currentQty) => {
    const currentQuantity = parseFloat(currentQty);
    if (currentQuantity === 0 || currentQuantity <= initialQty * 0.1) {
      return 'Out of Stock';
    } else if (currentQuantity <= initialQty * 0.5) {
      return 'Restock';
    }
    return 'In Stock';
  }, []);

  const handleSaveChanges = useCallback(async () => {
    try {
      const stockUpdate = stock
        .filter(item => item.newQuantity || item.expirationDate)
        .map(item => ({
          stockItemId: item.stockItemId,
          ...(item.newQuantity && { quantity: Number(item.newQuantity) }),
          ...(item.expirationDate && { expirationDate: new Date(item.expirationDate).toISOString().split('T')[0] }),
        }));

      if (stockUpdate.length === 0) {
        Alert.alert('No changes detected', 'Please update at least one item.');
        return;
      }

      const token = await AsyncStorage.getItem('accessToken');
      await axios.post('http://192.168.1.9:3000/stocks/edit', { stockUpdate }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Alert.alert('Changes Saved', 'Your stock changes have been saved.');
      setIsEditing(false);
      fetchStockData(); // Refresh the stock list after saving changes
    } catch (error) {
      console.error('Error saving stock changes:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to save stock changes.');
    }
  }, [stock, fetchStockData]);

  const renderTabButton = useCallback((tab) => (
    <Pressable
      key={tab}
      style={[styles.tabButton, selectedTab === tab && styles.activeTab]}
      onPress={() => handleTabChange(tab)}
    >
      <Text style={[styles.tabText, selectedTab === tab && styles.activeTabText]}>
        {tab.charAt(0).toUpperCase() + tab.slice(1)}
      </Text>
    </Pressable>
  ), [selectedTab, handleTabChange]);

  return (
    <View style={styles.container}>
      <View style={styles.tabSection}>{tabs.map(renderTabButton)}</View>

      <View style={styles.topSection}>
        <View style={styles.buttonContainer}>
          <Pressable
            style={styles.actionButton}
            onPress={() => setIsAddModalVisible(true)}
          >
            <Text style={styles.actionButtonText}>Add Stocks</Text>
          </Pressable>
          <Pressable
            style={styles.actionButton}
            onPress={() => setIsEditing(prev => !prev)}
          >
            <Text style={styles.actionButtonText}>
              {isEditing ? 'Stop Editing' : 'Edit Stocks'}
            </Text>
          </Pressable>
        </View>
        <SearchInput
          placeholder={selectedTab}
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
        />
      </View>

      <ScrollView horizontal>
        <View>
          <View style={styles.headerRow}>
            {['Product Name', 'Current Quantity', isEditing && 'Expiration', 'Status', 'Action']
              .filter(Boolean)
              .map((header) => (
                <Text key={header} style={styles.headerText}>{header}</Text>
              ))}
          </View>

          <StockList
            stock={filteredStock}
            handleNewQuantityChange={(index, value) => handleInputChange(index, value, 'newQuantity')}
            handleExpirationDateChange={(index, value) => handleInputChange(index, value, 'expirationDate')}
            calculateStockStatus={calculateStockStatus}
            isEditing={isEditing}
            emptyMessage={emptyMessage}
            handleDeleteStock={handleDeleteStock}
            refreshStockData={fetchStockData}
          />
        </View>
      </ScrollView>

      {isEditing && (
        <View style={styles.saveButtonContainer}>
          <Pressable onPress={handleSaveChanges} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </Pressable>
        </View>
      )}

      <AddStockModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onAdd={handleAddStock}
      />
    </View>
  );
}

const SearchInput = ({ placeholder, searchTerm, onSearch }) => (
  <TextInput
    style={styles.searchInput}
    placeholder={`Search ${placeholder.charAt(0).toUpperCase() + placeholder.slice(1)}`}
    value={searchTerm}
    onChangeText={onSearch}
  />
);

export default StockScreen;