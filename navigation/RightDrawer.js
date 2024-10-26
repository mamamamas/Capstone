import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Animated, Image, ScrollView, Dimensions, TextInput, TouchableWithoutFeedback, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.1.9:3000';

const RightDrawer = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const slideAnim = useState(new Animated.Value(0))[0];
    const screenWidth = Dimensions.get('window').width;

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newImageUri, setNewImageUri] = useState('');
    const [imageData, setImageData] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        fetchUserRole();
        fetchPosters();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageData.length);
        }, 9000);

        return () => clearInterval(interval);
    }, [imageData]);

    const fetchUserRole = async () => {
        try {
            const role = await AsyncStorage.getItem('role');
            setIsAdmin(role === 'admin');
        } catch (error) {
            console.error('Error fetching user role:', error);
        }
    };

    const fetchPosters = async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) {
                throw new Error('No access token found');
            }
            const response = await axios.get(`${API_URL}/poster`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setImageData(response.data);
        } catch (error) {
            console.error('Error fetching posters:', error);
            if (error.response && error.response.status === 401) {
                Alert.alert('Authentication Error', 'Please log in again.');
            } else {
                Alert.alert('Error', 'Failed to fetch posters');
            }
        }
    };

    const addNewItem = async () => {
        if (newTitle && newDescription && newImageUri) {
            try {
                const token = await AsyncStorage.getItem('accessToken');
                if (!token) {
                    throw new Error('No access token found');
                }
                const formData = new FormData();
                formData.append('title', newTitle);
                formData.append('body', newDescription);
                formData.append('image', {
                    uri: newImageUri,
                    type: 'image/jpeg',
                    name: 'poster.jpg',
                });

                const response = await axios.post(`${API_URL}/poster`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                setImageData([...imageData, response.data]);
                setNewTitle('');
                setNewDescription('');
                setNewImageUri('');
                setIsModalVisible(false);
            } catch (error) {
                console.error('Error adding new poster:', error);
                if (error.response && error.response.status === 401) {
                    Alert.alert('Authentication Error', 'Please log in again.');
                } else {
                    Alert.alert('Error', 'Failed to add new poster');
                }
            }
        }
    };

    const deletePoster = async (posterId) => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) {
                throw new Error('No access token found');
            }
            await axios.delete(`${API_URL}/poster/${posterId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            setImageData(imageData.filter(item => item._id !== posterId));
        } catch (error) {
            console.error('Error deleting poster:', error);
            if (error.response && error.response.status === 401) {
                Alert.alert('Authentication Error', 'Please log in again.');
            } else {
                Alert.alert('Error', 'Failed to delete poster');
            }
        }
    };

    const toggleDrawer = () => {
        const toValue = isOpen ? 0 : 1;
        Animated.timing(slideAnim, {
            toValue,
            duration: 300,
            useNativeDriver: true,
        }).start();
        setIsOpen(!isOpen);
    };

    const drawerStyle = {
        transform: [
            {
                translateX: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [screenWidth, screenWidth - 300],
                }),
            },
        ],
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [3, 4],
            quality: 1,
        });

        if (!result.canceled) {
            setNewImageUri(result.assets[0].uri);
        }
    };

    return (
        <View style={styles.container}>
            {children}
            <TouchableOpacity style={styles.toggleButton} onPress={toggleDrawer}>
                <Ionicons name={isOpen ? "chevron-forward" : "chevron-back"} size={24} color="#fff" />
            </TouchableOpacity>

            {isOpen && (
                <TouchableWithoutFeedback onPress={toggleDrawer}>
                    <View style={styles.dimBackground} />
                </TouchableWithoutFeedback>
            )}

            <Animated.View style={[styles.drawer, drawerStyle]}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    {imageData.map((item, index) => (
                        <View key={item._id} style={styles.profileSection}>
                            <Image
                                source={{ uri: item.posterUrl }}
                                style={styles.posterImage}
                                resizeMode="cover"
                            />
                            <Text style={styles.title}>{item.title}</Text>
                            <Text style={styles.profileDescription}>
                                {item.body}
                            </Text>
                            {isAdmin && (
                                <TouchableOpacity style={styles.deleteButton} onPress={() => deletePoster(item._id)}>
                                    <Text style={styles.deleteButtonText}>Delete</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}
                    {isAdmin && (
                        <TouchableOpacity style={styles.addButton} onPress={() => setIsModalVisible(true)}>
                            <Text style={styles.addButtonText}>Add New Poster</Text>
                        </TouchableOpacity>
                    )}
                </ScrollView>
            </Animated.View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Add New Poster</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Title"
                            value={newTitle}
                            onChangeText={setNewTitle}
                        />
                        <TextInput
                            style={[styles.input, styles.descriptionInput]}
                            placeholder="Description"
                            value={newDescription}
                            onChangeText={setNewDescription}
                            multiline
                            numberOfLines={4}
                        />
                        <View style={styles.imageInputContainer}>
                            <TouchableOpacity style={styles.pickImageButton} onPress={pickImage}>
                                <Ionicons name="image-outline" size={24} color="#fff" />
                                <Text style={styles.pickImageText}>
                                    {newImageUri ? 'Change Image' : 'Choose Image'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        {newImageUri && (
                            <Image source={{ uri: newImageUri }} style={styles.imagePreview} resizeMode="cover" />
                        )}
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={[styles.modalButton, styles.submitButton]} onPress={addNewItem}>
                                <Text style={styles.buttonText}>Submit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setIsModalVisible(false)}>
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    toggleButton: {
        position: 'absolute',
        top: '4.5%',
        right: 0,
        backgroundColor: Colors.cobaltblue,
        padding: 10,
        borderTopLeftRadius: 20,
        borderBottomLeftRadius: 20,
        zIndex: 1,
    },
    dimBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 0,
    },
    drawer: {
        position: 'absolute',
        top: '11.2%',
        right: '13%',
        bottom: 0,
        width: 300,
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: -2,
            height: 0,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    profileSection: {
        margin: 15,
        alignItems: 'center',
    },
    posterImage: {
        width: '100%',
        height: 400,
        borderRadius: 10,
        marginBottom: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
    },
    profileDescription: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 10,
    },
    addButton: {
        backgroundColor: Colors.cobaltblue,
        padding: 10,
        borderRadius: 20,
        marginTop: 15,
        marginBottom: 10,
        alignItems: 'center',
        alignSelf: 'center',
        width: '50%',
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    deleteButton: {
        backgroundColor: '#ff6347',
        padding: 8,
        borderRadius: 15,
        marginTop: 10,
    },
    deleteButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        backgroundColor: '#fff',
        margin: 20,
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        width: '100%',
        borderColor: '#ddd',
        borderWidth: 1,
        padding: 10,
        borderRadius: 5,
        marginBottom: 15,
    },
    descriptionInput: {
        height: 100,
        textAlignVertical: 'top',
    },
    imageInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    pickImageButton: {
        backgroundColor: Colors.cobaltblue,
        padding: 10,
        borderRadius: 5,
        flexDirection: 'row',
        alignItems: 'center',
    },
    pickImageText: {
        color: '#fff',
        marginLeft: 10,
    },
    imagePreview: {
        width: 200,
        height: 267,
        marginBottom: 15,
        borderRadius: 5,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalButton: {
        flex: 1,
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    submitButton: {
        backgroundColor: Colors.cobaltblue,
    },
    cancelButton: {
        backgroundColor: '#ccc',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default RightDrawer;