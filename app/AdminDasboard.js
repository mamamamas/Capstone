import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, Button } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AdminDashboard = ({ navigation }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const token = await AsyncStorage.getItem('accessToken');
                if (!token) {
                    Alert.alert('Error', 'No access token found');
                    setLoading(false);
                    return;
                }

                const response = await axios.get('http://192.168.1.9:3000/user/requests', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.status === 200) {
                    setRequests(response.data);
                } else {
                    Alert.alert('Error', 'Failed to fetch requests');
                }

                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
                console.error('Error fetching requests:', err);
            }
        };

        fetchRequests();
    }, []);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.center}>
                <Text>Error: {error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Requests</Text>
            <FlatList
                data={requests}
                keyExtractor={(item) => item._id} // Use _id for the key
                renderItem={({ item }) => (
                    <View style={styles.requestItem}>
                        <Text style={styles.title}>{item.title}</Text>
                        <Text style={styles.description}>{item.description}</Text>
                        <Text style={styles.user}>
                            {/* If the request was made by a Google user, show their Google name. 
                    Otherwise, fallback to the manually logged-in user's firstname and lastname */}
                            Requested by: {item.User?.googleName || `${item.User?.firstname || 'Unknown'} ${item.User?.lastname || ''}`}
                        </Text>
                    </View>
                )}
            />

            <Button
                title="Go to Another Screen"
                onPress={() => navigation.navigate('PostScreen')} // Change 'AnotherScreen' to the actual screen name
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        fontSize: 24,
        marginBottom: 16,
        textAlign: 'center',
    },
    requestItem: {
        marginBottom: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    description: {
        fontSize: 16,
        marginVertical: 8,
    },
    user: {
        fontSize: 14,
        color: '#555',
    },
});

export default AdminDashboard;
