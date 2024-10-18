import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Animated, Image, ScrollView, Dimensions, TextInput, TouchableWithoutFeedback, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import * as ImagePicker from 'expo-image-picker';

const RightDrawer = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const slideAnim = useState(new Animated.Value(0))[0];
    const screenWidth = Dimensions.get('window').width;

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newImageUrl, setNewImageUrl] = useState('');
    const [imageData, setImageData] = useState([
        {
            image: "https://act-upload.hoyoverse.com/event-ugc-hoyowiki/2023/12/18/35428890/ac29c347dea5a0269bedd44ef6362e77_3737393203659539351.png?x-oss-process=image%2Fformat%2Cwebp",
            title: "Sucrose",
            description: "Sucrose is a 4-star Anemo character in Genshin Impact. She is a talented alchemist who specializes in bio-alchemy and often experiments with different substances. Known for her inquisitive nature and dedication to her research, she serves as the assistant to Albedo, the Chief Alchemist of Mondstadt.",
        },
        {
            image: "https://act-upload.hoyoverse.com/event-ugc-hoyowiki/2024/01/05/35428890/d3ad2227481892e394b1a53cefac09ae_1962524665901751429.png",
            title: "Xiangling",
            description: "Xiangling is a 4-star Pyro character in Genshin Impact. She is the Head Chef at the Wanmin Restaurant and runs her restaurant in Liyue. Xiangling is known for her amazing cooking skills and has a passion for discovering new and exciting ingredients.",
        },
        {
            image: "https://act-upload.hoyoverse.com/event-ugc-hoyowiki/2023/12/18/35428890/b6c68d8d858d4d5f9f8393a01580de70_7010774928563025994.png?x-oss-process=image%2Fformat%2Cwebp",
            title: "Zhongli",
            description: "Zhongli is a 5-star Geo character and the former Archon of Liyue. Known for his wisdom and knowledge, he now works as a consultant for the Wangsheng Funeral Parlor.",
        },
        {
            image: "https://act-upload.hoyoverse.com/event-ugc-hoyowiki/2023/12/18/35428890/ed08f020d2fca8d1259f0792017faab6_3531173162730536742.png?x-oss-process=image%2Fformat%2Cwebp",
            title: "Albedo",
            description: "Albedo is a 5-star Geo character and Chief Alchemist of Mondstadt. A brilliant scientist, he is highly respected for his understanding of alchemy and mysteries of the world.",
        },
    ]);

    const addNewItem = () => {
        if (newTitle && newDescription && newImageUrl) {
            setImageData([...imageData, {
                image: newImageUrl,
                title: newTitle,
                description: newDescription,
            }]);
            setNewTitle('');
            setNewDescription('');
            setNewImageUrl('');
            setIsModalVisible(false);
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

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageData.length);
        }, 9000);

        return () => clearInterval(interval);
    }, [imageData]);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setNewImageUrl(result.assets[0].uri);
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
                    <View style={styles.profileSection}>
                        <Image
                            source={{ uri: imageData[currentImageIndex].image }}
                            style={styles.posterImage}
                        />
                        <Text style={styles.title}>{imageData[currentImageIndex].title}</Text>
                        <Text style={styles.profileDescription}>
                            {imageData[currentImageIndex].description}
                        </Text>
                        <TouchableOpacity style={styles.addButton} onPress={() => setIsModalVisible(true)}>
                            <Text style={styles.addButtonText}>Add</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.divider} />
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
                        <Text style={styles.modalTitle}>Add New Item</Text>
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
                            <TextInput
                                style={[styles.input, styles.imageUrlInput]}
                                placeholder="Image URL"
                                value={newImageUrl}
                                onChangeText={setNewImageUrl}
                            />
                            <TouchableOpacity style={styles.pickImageButton} onPress={pickImage}>
                                <Ionicons name="image-outline" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
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
        height: 180,
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
    divider: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginVertical: 10,
    },
    addButton: {
        backgroundColor: Colors.cobaltblue,
        padding: 10,
        borderRadius: 20,
        marginTop: 15,
        marginBottom: 10,
        alignItems: 'center',
        width: '30%',
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
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
    imageUrlInput: {
        flex: 1,
        marginRight: 10,
    },
    pickImageButton: {
        backgroundColor: Colors.cobaltblue,
        padding: 10,
        borderRadius: 50,

    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalButton: {
        flex: 1,
        padding: 10,
        borderRadius: 50,
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