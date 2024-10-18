import React, { useState, useEffect } from 'react';
import { View, TextInput, Alert, StyleSheet, TouchableOpacity, Text, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const updateImmunization = async (immunizationId, vaccine, remarks) => {
    try {
        const token = await AsyncStorage.getItem('accessToken');
        console.log('Updating immunization with ID:', immunizationId);
        const response = await axios.patch(
            `http://192.168.1.10:3000/medical/immunization/${immunizationId}`,
            { vaccine, remarks },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('Update response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error updating immunization:', error.response?.data || error.message);
        throw error;
    }
};

export default function EditImmunization({ immunization, onImmunizationUpdated, onCloseModal }) {
    const [modalVisible, setModalVisible] = useState(true);
    const [vaccine, setVaccine] = useState(immunization.vaccine);
    const [remarks, setRemarks] = useState(immunization.remarks);

    useEffect(() => {
        setVaccine(immunization.vaccine);
        setRemarks(immunization.remarks);
    }, [immunization]);

    const handleUpdateImmunization = async () => {
        try {
            if (!immunization._id) {
                throw new Error('Immunization ID is undefined');
            }
            const updatedImmunization = await updateImmunization(immunization._id, vaccine, remarks);
            onImmunizationUpdated(updatedImmunization);
            handleCloseModal();
            Alert.alert('Success', 'Immunization updated successfully');
        } catch (error) {
            console.error('Error in handleUpdateImmunization:', error);
            Alert.alert('Error', 'Failed to update immunization. Please try again.');
        }
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        onCloseModal();
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={handleCloseModal}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>Edit Immunization</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Vaccine"
                        value={vaccine}
                        onChangeText={setVaccine}
                        multiline
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Remarks"
                        value={remarks}
                        onChangeText={setRemarks}
                        multiline
                    />
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.buttonClose]}
                            onPress={handleCloseModal}
                        >
                            <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.buttonSubmit]}
                            onPress={handleUpdateImmunization}
                        >
                            <Text style={styles.buttonText}>Update</Text>
                        </TouchableOpacity>
                    </View>
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
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '80%',
    },
    modalTitle: {
        marginBottom: 15,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
    },
    input: {
        height: 40,
        width: '100%',
        margin: 12,
        borderWidth: 1,
        padding: 10,
        borderRadius: 5,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 20,
    },
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    buttonClose: {
        backgroundColor: '#FF3B30',
    },
    buttonSubmit: {
        backgroundColor: '#34C759',
    },
});