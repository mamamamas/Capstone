// StockModal.js
import React from 'react';
import { Modal, View, Text, Button, StyleSheet } from 'react-native';

const StockModal = ({ visible, onClose, stockData }) => {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.title}>Stock Data</Text>
                    {/* Replace the following with your actual stock data visualization */}
                    {stockData ? (
                        <Text>{JSON.stringify(stockData, null, 2)}</Text>
                    ) : (
                        <Text>No Data Available</Text>
                    )}
                    <Button title="Close" onPress={onClose} />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        width: '80%',
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        elevation: 5,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
});

export default StockModal;
