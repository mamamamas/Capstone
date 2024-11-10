import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, Alert, RefreshControl } from 'react-native';
import Colors from '../../constants/Colors';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import FormModal from './FormModal';

const API = 'http://192.168.1.9:3000';

export default function AnnouncementList() {
  const [announcements, setAnnouncements] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    fetchUserRole();
    fetchUserId();
    fetchAnnouncements();
  }, []);

  const fetchUserRole = async () => {
    try {
      const role = await AsyncStorage.getItem('role');
      console.log('User role:', role);
      setIsAdmin(role === 'admin');
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const fetchUserId = async () => {
    try {
      const id = await AsyncStorage.getItem('id');
      setUserId(id);
    } catch (error) {
      console.error('Error fetching user ID:', error);
    }
  };

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');
      console.log(`Access token: ${token}`);
      const response = await axios.get(`${API}/post`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sortedAnnouncements = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setAnnouncements(sortedAnnouncements);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      Alert.alert('Error', 'Failed to load announcements');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleAddPress = () => {
    setSelectedAnnouncement(null);
    setTitle('');
    setBody('');
    setIsModalVisible(true);
  };

  const handleEditPress = (announcement) => {
    setSelectedAnnouncement(announcement);
    setTitle(announcement.title);
    setBody(announcement.body);
    setIsModalVisible(true);
  };

  const handleDeletePress = async (announcement) => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this announcement?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('accessToken');
              const response = await axios.post(`${API}/post/delete`, // Change to POST
                { id: announcement._id },
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              console.log(response.data);
              fetchAnnouncements();
            } catch (error) {
              console.error('Error deleting announcement:', error);
              Alert.alert('Error', 'Failed to delete announcement');
            }
          },
        },
      ]
    );
  };
  const handleSave = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (selectedAnnouncement) {
        await axios.put(
          `${API}/post/edit/${selectedAnnouncement._id}`,
          { title, body },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${API}/post`,
          { title, body, author: userId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setIsModalVisible(false);
      fetchAnnouncements();
    } catch (error) {
      console.error('Error saving announcement:', error);
      Alert.alert('Error', 'Failed to save announcement');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View style={styles.itemContent}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.body}</Text>
        <Text style={styles.timestamp}>
          Posted {moment(item.createdAt).fromNow()}
        </Text>
      </View>
      {isAdmin && (
        <View style={styles.buttonContainer}>
          <Pressable style={[styles.button, styles.editButton]} onPress={() => handleEditPress(item)}>
            <Text style={styles.buttonText}>Edit</Text>
          </Pressable>
          <Pressable style={[styles.button, styles.deleteButton]} onPress={() => handleDeletePress(item)}>
            <Text style={styles.buttonText}>Delete</Text>
          </Pressable>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Announcements</Text>
        {isAdmin && (
          <Pressable style={styles.addButton} onPress={handleAddPress}>
            <Text style={styles.addButtonText}>Add</Text>
          </Pressable>
        )}
      </View>
      <FlatList
        data={announcements}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              setIsRefreshing(true);
              fetchAnnouncements();
            }}
          />
        }
      />
      <FormModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        formFields={[
          { placeholder: 'Enter Title', value: title, onChangeText: setTitle },
          { placeholder: 'Enter Body', value: body, onChangeText: setBody, isDescription: true },
        ]}
        onSave={handleSave}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    margin: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: Colors.lgray,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
  },
  addButton: {
    backgroundColor: Colors.lblue,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 50,
  },
  addButtonText: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 15,
  },
  item: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lgray,
    paddingBottom: 15,
  },
  itemContent: {
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  description: {
    color: Colors.gray,
  },
  timestamp: {
    fontSize: 12,
    color: Colors.gray,
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  button: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 10,
  },
  editButton: {
    backgroundColor: Colors.green,
  },
  deleteButton: {
    backgroundColor: Colors.red,
  },
  buttonText: {
    color: Colors.white,
    fontWeight: 'bold',
  },
});