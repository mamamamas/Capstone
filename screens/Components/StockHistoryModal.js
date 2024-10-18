import React from 'react';
import { Modal, View, Text, Button, StyleSheet } from 'react-native';

const StockDetailModal = ({ visible, onClose, stockItem }) => {
    return (
        <Modal visible={visible} animationType="slide">
            <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Stock Details</Text>
                {stockItem && (
                    <View>
                        <Text>Stock Item ID: {stockItem.stockItemId}</Text>
                        <Text>Initial Quantity: {stockItem.initialQuantity}</Text>
                        <Text>Current Quantity: {stockItem.currentQuantity}</Text>
                        <Text>Expiration Date: {stockItem.expirationDate}</Text>
                        <Text>Timestamp: {stockItem.timestamp}</Text>
                    </View>
                )}
                <Button title="Close" onPress={onClose} />
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
});

export default StockDetailModal;
