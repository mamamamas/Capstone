import React, { useState } from 'react';
import { View, TextInput, Alert, StyleSheet, TouchableOpacity, Text, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const addImmunization = async (medicalInfoId, vaccine, remarks) => {
    try {
        const token = await AsyncStorage.getItem('accessToken');
        const response = await axios.post(
            'http://192.168.1.10:3000/medical/immunization',
            { medicalInfoId, vaccine, remarks },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    } catch (error) {
        console.error('Error adding immunization:', error);
        throw error;
    }
};

export default function AddImmunization({ medicalInfoId, onImmunizationAdded }) {
    const [modalVisible, setModalVisible] = useState(false);
    const [vaccine, setVaccine] = useState('');
    const [remarks, setRemarks] = useState('');

    const handleAddImmunization = async () => {
        try {
            const newImmunization = await addImmunization(medicalInfoId, vaccine, remarks);
            onImmunizationAdded(newImmunization);
            setModalVisible(false);
            setVaccine('');
            setRemarks('');
            Alert.alert('Success', 'Immunization added successfully');
        } catch (error) {
            Alert.alert('Error', 'Failed to add immunization. Please try again.');
        }
    };

    return (
        <View>
            <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
                <Text style={styles.buttonText}>Add Immunization</Text>
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>Add New Immunization</Text>
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
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.buttonSubmit]}
                                onPress={handleAddImmunization}
                            >
                                <Text style={styles.buttonText}>Submit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#2196F3',
        borderRadius: 20,
        padding: 10,
        elevation: 2,
        marginTop: 10,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
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
    buttonClose: {
        backgroundColor: '#FF3B30',
    },
    buttonSubmit: {
        backgroundColor: '#34C759',
    },
});