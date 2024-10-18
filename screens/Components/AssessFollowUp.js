import React, { useState } from 'react';
import { View, TextInput, Pressable, Alert, StyleSheet, TouchableOpacity, Text, Modal } from 'react-native';
import axios from 'axios';

const AddFollowUpButton = ({ assessmentId, onFollowUpAdded }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [followUpComplaints, setFollowUpComplaints] = useState('');
    const [followUpActions, setFollowUpActions] = useState('');

    const handleAddFollowUp = async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            const response = await axios.patch(
                `http://192.168.1.2:3000/medical/assessment/${assessmentId}/followup`,
                {
                    followUpComplaints,
                    followUpActions,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            onFollowUpAdded(response.data);
            setModalVisible(false);
            setFollowUpComplaints('');
            setFollowUpActions('');
            Alert.alert('Success', 'Follow-up added successfully');
        } catch (error) {
            Alert.alert('Error', 'Failed to add follow-up. Please try again.');
        }
    };

    return (
        <View>
            <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
                <Text style={styles.buttonText}>Add Follow-Up</Text>
            </TouchableOpacity>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>Add New Follow-Up</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Follow-Up Complaints"
                            value={followUpComplaints}
                            onChangeText={setFollowUpComplaints}
                            multiline
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Follow-Up Actions"
                            value={followUpActions}
                            onChangeText={setFollowUpActions}
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
                                onPress={handleAddFollowUp}
                            >
                                <Text style={styles.buttonText}>Submit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

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

export default AddFollowUpButton;
