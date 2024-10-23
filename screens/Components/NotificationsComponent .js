import React, { useState, useEffect } from 'react';
import { View, Text, FlatList } from 'react-native';
import { io } from 'socket.io-client';

const NotificationsComponent = ({ onClose }) => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        // Connect to the WebSocket server
        const socket = io('http://192.168.1.10:3000'); // Replace with your server URL

        // Listen for new notifications
        socket.on('newNotification', (notification) => {
            setNotifications((prev) => [notification, ...prev]);
        });

        // Clean up the socket connection on unmount
        return () => {
            socket.disconnect();
        };
    }, []);

    const renderNotification = ({ item }) => (
        <View>
            <Text>{item.type}</Text>
            <Text>{item.message}</Text>
            <Text>{new Date(item.timestamp).toLocaleString()}</Text>
        </View>
    );

    return (
        <View>
            <FlatList
                data={notifications}
                renderItem={renderNotification}
                keyExtractor={(item) => item.id}
            />
        </View>
    );
};

export default NotificationsComponent;
