import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Pressable, Alert, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const StockDeductionModal = ({ visible, onClose, stockItemId }) => {
    const [deductionAmount, setDeductionAmount] = useState('');

    const handleDeductStock = async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken');

            // Make sure the deduction amount is valid
            const deduction = Number(deductionAmount);
            if (isNaN(deduction) || deduction <= 0) {
                Alert.alert('Invalid input', 'Please enter a valid deduction amount.');
                return;
            }

            // Send deduction request to the backend
            const response = await axios.post(
                'http://192.168.1.9:3000/stocks/deduct',
                { stockItemId, deduction },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.status === 200) {
                Alert.alert('Success', 'Stock deduction applied successfully');
                setDeductionAmount(''); // Reset the input
                onClose(); // Close the modal
            } else {
                Alert.alert('Error', 'Failed to apply stock deduction');
            }
        } catch (error) {
            console.error('Error applying stock deduction:', error);
            Alert.alert('Error', 'Failed to apply stock deduction');
        }
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Deduct Stock</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Enter deduction amount"
                        keyboardType="numeric"
                        value={deductionAmount}
                        onChangeText={setDeductionAmount}
                    />

                    <View style={styles.buttonContainer}>
                        <Pressable style={styles.button} onPress={handleDeductStock}>
                            <Text style={styles.buttonText}>Submit</Text>
                        </Pressable>

                        <Pressable style={[styles.button, { backgroundColor: 'gray' }]} onPress={onClose}>
                            <Text style={styles.buttonText}>Cancel</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: 300,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 20,
        fontSize: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    button: {
        padding: 10,
        backgroundColor: 'blue',
        borderRadius: 5,
        minWidth: 100,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default StockDeductionModal;
