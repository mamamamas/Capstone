import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, Alert } from 'react-native';
import axios from 'axios'; // For API calls
import StockList from './Components/StockList';
import styles from './Components/StockScreenStyles';
import AsyncStorage from "@react-native-async-storage/async-storage";
import AddStockModal from './Components/AddStockModal';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Importing the icon library
const tabs = ['Medicine', 'Supplies', 'Equipment'];

const StockScreen = () => {
  const [selectedTab, setSelectedTab] = useState('Medicine'); // Changed to match API category names
  const [isEditing, setIsEditing] = useState(false);
  const [stock, setStock] = useState([]);
  const [emptyMessage, setEmptyMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStock, setFilteredStock] = useState([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [stockToDelete, setStockToDelete] = useState([]); // Track items to delete

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');

        // Fetch data based on the selected tab (Medicine, Supplies, Equipment)
        const response = await axios.get(`http://192.168.1.2:3000/stocks/${selectedTab}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const stockData = response.data.map(item => ({
          stockItemId: item.stockItemId,
          stockItemName: item.stockItemName,
          newQuantity: item.newStockQty ? item.newStockQty.toString() : '',
          expirationDate: item.newStockExp ? item.newStockExp.toString() : '',
          totalCurrentQuantity: item.totalCurrentQuantity,
          status: item.status,
        }));

        setStock(stockData);


        if (stockData.length === 0) {
          setEmptyMessage(`No stock items found for the category: ${selectedTab}.`);
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setEmptyMessage(`No stock items found for the category: ${selectedTab}.`);
        } else {
          console.error('Error fetching stock data:', error);
        }
      }
    };

    fetchStockData();
  }, [selectedTab]); // Ensure this runs when the selected tab changes

  useEffect(() => {
    // Filter stock based on the search term
    const filterStock = () => {
      if (searchTerm === '') {
        setFilteredStock(stock); // Show all if search term is empty
      } else {
        const filtered = stock.filter(product =>
          product.stockItemName.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredStock(filtered);
      }
    };

    filterStock();
  }, [searchTerm, stock]); // Run the filtering whenever stock or searchTerm changes
  const handleDeleteStock = (stockItemId) => {
    setStockToDelete((prev) => [...prev, stockItemId]);
  };

  const handleAddStock = (newStock) => {
    // Here you would typically add the new stock to your backend
    // For now, we'll just show an alert
    Alert.alert('Stock Added', `Added ${newStock.quantity} to ${newStock.category} with expiry date ${newStock.expiryDate}`);
    setIsAddModalVisible(false);
  };

  const handleTabChange = (tab) => {
    // Clear the stock before fetching new data for the selected tab
    setStock([]); // This clears the stock list when changing tabs

    setSelectedTab(tab);
    setIsEditing(false);
    setEmptyMessage(''); // Reset the empty message too
  };
  const handleSearch = (text) => {
    setSearchTerm(text);
    onSearch(text); // Call the parent component's search function
  };
  const handleInputChange = (index, value, field) => {
    setStock(stock.map((product, i) =>
      i === index ? { ...product, [field]: value } : product
    ));
  };

  const calculateStockStatus = (initialQty, currentQty) => {
    const currentQuantity = parseFloat(currentQty); // Ensure currentQty is a float
    <Pressable style={styles.deleteButton} onPress={() => handleDeleteStock(item.stockItemId)}>
      <Icon name="delete" size={25} color="red" />
    </Pressable>



    // Handle cases based on current quantity
    if (currentQuantity === 0) {

      return 'Out of Stock';
    } else if (currentQuantity <= initialQty * 0.1) {

      return 'Out of Stock'; // Add this condition to handle low stock
    } else if (currentQuantity <= initialQty * 0.5) {

      return 'Restock';
    }

    console.log('Stock status: In Stock');
    return 'In Stock';
  };
  const handleSaveChanges = async () => {
    try {
      // Prepare the stock updates
      const stockUpdate = stock.map(item => {
        // Prepare an object for the updates
        const update = {
          stockItemId: item.stockItemId,
        };

        // Only add quantity if it's provided
        if (item.newQuantity) {
          update.quantity = Number(item.newQuantity); // Ensure quantity is a number
        }

        // Only add expirationDate if it's provided and not empty
        if (item.expirationDate) {
          update.expirationDate = formatDate(item.expirationDate); // Format if necessary
        }

        return update; // Return the update object
      }).filter(item => Object.keys(item).length > 1); // Filter out items without updates

      // Log the stock update data before sending
      console.log('Stock update data:', stockUpdate);

      // Check if there's anything to update
      if (stockUpdate.length === 0) {
        Alert.alert('No changes detected', 'Please update at least one item.');
        return; // Prevent sending an empty array
      }

      const token = await AsyncStorage.getItem('accessToken');

      // Send the POST request with the correct headers
      await axios.post('http://192.168.1.2:3000/stocks/edit', {
        stockUpdate,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      Alert.alert('Changes Saved', 'Your stock changes have been saved.');
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving stock changes:', error);
      // Provide a more descriptive error message
      const errorMessage = error.response && error.response.data.error
        ? error.response.data.error
        : 'Failed to save stock changes.';
      Alert.alert('Error', errorMessage);
    }
  };

  const formatDate = (date) => {
    // Assuming 'date' is a JavaScript Date object or valid date string
    const isoDate = new Date(date).toISOString().split('T')[0]; // Ensures 'YYYY-MM-DD' format
    return isoDate;
  };




  const renderTabButton = (tab) => (
    <Pressable
      key={tab}
      style={[styles.tabButton, selectedTab === tab && styles.activeTab]}
      onPress={() => handleTabChange(tab)}
    >
      <Text style={[styles.tabText, selectedTab === tab && styles.activeTabText]}>
        {tab.charAt(0).toUpperCase() + tab.slice(1)}
      </Text>
    </Pressable>
  );

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
            onPress={() => setIsEditing((prev) => !prev)}
          >
            <Text style={styles.actionButtonText}>
              {isEditing ? 'Stop Editing' : 'Edit Stocks'}
            </Text>
          </Pressable>
        </View>
        <SearchInput
          placeholder={selectedTab}
          searchTerm={searchTerm}
          onSearch={setSearchTerm} // Update the search term state directly
        />
      </View>

      <ScrollView horizontal>
        <View>
          <View style={styles.headerRow}>
            {['Product Name', 'Current Quantity', 'Expiration Date', 'Status', 'Action'].map((header) => (
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



};

const ActionButton = ({ title }) => (
  <Pressable style={styles.actionButton}>
    <Text style={styles.actionButtonText}>{title}</Text>
  </Pressable>
);


const SearchInput = ({ placeholder, searchTerm, onSearch }) => (
  <TextInput
    style={styles.searchInput}
    placeholder={`Search ${placeholder.charAt(0).toUpperCase() + placeholder.slice(1)}`}
    value={searchTerm}
    onChangeText={onSearch} // Call the parent's search function directly
  />
);

export default StockScreen;
