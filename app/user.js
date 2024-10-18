import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API = "http://192.168.1.9:3000";

const DashboardScreen = ({ navigation }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [userData, setUserData] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [loadingUserData, setLoadingUserData] = useState(true);
    const [error, setError] = useState('');
    const [googleId, setGoogleId] = useState('');
    const [name, setName] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = await AsyncStorage.getItem('accessToken');
                const savedGoogleId = await AsyncStorage.getItem('googleId');
                const firstname = await AsyncStorage.getItem('firstname');
                const userId = await AsyncStorage.getItem('id');
                const names = await AsyncStorage.getItem('name');
                setGoogleId(savedGoogleId);
                setName(names);
                console.log('Extracted name:', name);

                if (userId && firstname) {
                    setUserData({ userId, firstname });
                }

                if (googleId && name) {
                    setGoogleId(googleId);
                    setName(name);
                }

                if (!userId) {
                    throw new Error('User ID not found');
                }

                const response = await axios.get(`${API}/user/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setUserData(response.data);
            } catch (err) {
                console.error('Error fetching user data:', err);
                setError('Failed to load user data');
            } finally {
                setLoadingUserData(false);
            }
        };

        const fetchPosts = async () => {
            try {
                const token = await AsyncStorage.getItem('accessToken');
                const response = await axios.get(`${API}/admin/posts/all`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setPosts(response.data);
            } catch (err) {
                console.error('Error fetching posts:', err);
                setError('Failed to load posts');
            } finally {
                setLoadingPosts(false);
            }
        };

        fetchUserData();
        fetchPosts();
    }, []);

    const handleRequest = async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) {
                Alert.alert('Error', 'No access token found');
                return;
            }

            await axios.post(`${API}/req`, {
                title,
                description,
                userId: userData?._id,
                googleId
            }, {
                headers: { Authorization: ` Bearer ${token}` },
            });

            setTitle("");
            setDescription("");
            Alert.alert('Success', 'Request submitted successfully');

            const postsResponse = await axios.get(`${API}/admin/posts`, {
                headers: { Authorization: ` Bearer ${token}` },
            });
            setPosts(postsResponse.data);
        } catch (error) {
            console.error('Error submitting request:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to submit request');
        }
    };

    const renderPost = ({ item }) => (
        <View style={styles.postContainer}>
            <Text style={styles.postTitle}>{item.title}</Text>
            <Text style={styles.postContent}>{item.content}</Text>
            <Text style={styles.postAuthor}>By: {item.author ? item.author.firstname : 'Unknown'}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {loadingUserData ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <>
                    {googleId && name ? (
                        // If logged in via Google and both googleId and name are available
                        <Text style={styles.welcome}>Welcome, {name}!</Text>
                    ) : userData && userData.firstname ? (
                        // If logged in manually and userData is available
                        <Text style={styles.welcome}>Welcome, {userData.firstname}!</Text>
                    ) : (
                        // Fallback if neither Google login nor manual login have valid data
                        <Text style={styles.welcome}>{error || 'No user data available'}</Text>
                    )}

                    {googleId && (
                        <Text style={styles.googleId}>Google ID: {googleId}</Text>
                    )}
                </>
            )}





            <Text style={styles.header}>Request Form</Text>
            <TextInput
                style={styles.input}
                placeholder="Title"
                value={title}
                onChangeText={setTitle}
            />
            <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Description"
                value={description}
                onChangeText={setDescription}
                multiline
            />
            <TouchableOpacity style={styles.button} onPress={handleRequest}>
                <Text style={styles.buttonText}>Submit Request</Text>
            </TouchableOpacity>
            <Text style={styles.header}>Posts</Text>
            {loadingPosts ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <FlatList
                    data={posts}
                    renderItem={renderPost}
                    keyExtractor={item => item._id}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({

    profileContainer: {
        alignItems: 'center', // Center the profile picture and text
    },
    profilePicture: {
        width: 100, // Set the size of the profile picture
        height: 100,
        borderRadius: 50, // Make the image circular
        marginBottom: 10, // Add some space between the image and the welcome text
    },
    // Add new style for Google ID display
    googleId: {
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 10,
        color: '#333',
    },
    // Rest of your styles



    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f8f8f8',
    },
    welcome: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        marginTop: 30
    },
    header: {
        fontSize: 16,
        fontWeight: '600',
        marginVertical: 8,
    },
    input: {
        height: 40,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 8,
        marginBottom: 16,
        backgroundColor: '#fff',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    button: {
        backgroundColor: '#007BFF',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    postContainer: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
        elevation: 2,
    },
    postTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    postContent: {
        fontSize: 14,
        marginBottom: 4,
    },
    postAuthor: {
        fontSize: 12,
        color: '#555',
    },
});

export default DashboardScreen;
