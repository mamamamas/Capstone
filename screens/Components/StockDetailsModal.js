import React from 'react';
import { View, Text, Modal, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

const StockDetailsModal = ({ visible, onClose, stockItem }) => {
    if (!stockItem) return null;

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>{stockItem.stockItemName}</Text>

                    <View style={styles.totalSection}>
                        <Text style={styles.totalLabel}>Total Current Quantity:</Text>
                        <Text style={styles.totalValue}>{stockItem.totalCurrentQuantity}</Text>
                    </View>

                    <Text style={styles.sectionTitle}>Stock History</Text>

                    <ScrollView style={styles.stockList}>
                        {stockItem.stockDetails.map((detail, index) => (
                            <View key={index} style={styles.stockItem}>
                                <View style={styles.stockRow}>
                                    <Text style={styles.label}>Initial Quantity:</Text>
                                    <Text style={styles.value}>{detail.initialQuantity}</Text>
                                </View>

                                <View style={styles.stockRow}>
                                    <Text style={styles.label}>Current Quantity:</Text>
                                    <Text style={styles.value}>{detail.currentQuantity}</Text>
                                </View>

                                {detail.expirationDate && (
                                    <View style={styles.stockRow}>
                                        <Text style={styles.label}>Expiration Date:</Text>
                                        <Text style={styles.value}>
                                            {formatDate(detail.expirationDate)}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        ))}
                    </ScrollView>

                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
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
        width: '90%',
        maxHeight: '80%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#333',
    },
    totalSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    totalValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
        color: '#444',
    },
    stockList: {
        maxHeight: 400,
    },
    stockItem: {
        backgroundColor: '#f9f9f9',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    stockRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    label: {
        fontSize: 14,
        color: '#666',
    },
    value: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    closeButton: {
        backgroundColor: '#007BFF',
        padding: 15,
        borderRadius: 10,
        marginTop: 20,
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default StockDetailsModal;