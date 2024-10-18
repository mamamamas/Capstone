import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, FlatList, StyleSheet, Alert, RefreshControl, ActivityIndicator } from 'react-native';
import Colors from '../../constants/Colors';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import AnnouncementOptions from './AnnouncementOptions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import FormModal from './FormModal';
import moment from 'moment';
import CustomAlert from './CustomAlert';

const AnnouncementList = () => {
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isModalVisible, setModalVisible] = useState(false); // Manage modal visibility
  const [isEditing, setIsEditing] = useState(false); // Track whether it's edit mode
  const [refreshing, setRefreshing] = useState(false); // State to manage refreshing
  const [loadingUserData, setLoadingUserData] = useState(true);
  const [name, setName] = useState('');
  const [googleId, setGoogleId] = useState('');
  const [userData, setUserData] = useState(null);

  const API = 'http://192.168.1.10:3000';

  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const savedGoogleId = await AsyncStorage.getItem('googleId');
      const firstname = await AsyncStorage.getItem('firstname');
      const username = await AsyncStorage.getItem('username');
      const userId = await AsyncStorage.getItem('id');
      const names = await AsyncStorage.getItem('name');
      setGoogleId(savedGoogleId);
      setName(names);
      console.log('username name:', userId);

      if (userId && firstname) {
        setUserData({ userId, firstname });
      }

      if (!userId) {
        throw new Error('User ID not found');
      }

      const response = await axios.get(`${API}/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUserData(response.data);
    } catch (err) {
      console.error('Error fetching user datass:', err);
      setError('Failed to load user data');
    } finally {
      setLoadingUserData(false);
    }
  };

  const fetchPosts = async () => {
    setRefreshing(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await axios.get(`${API}/admin/posts/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sortedPosts = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setAnnouncements(sortedPosts);
    } catch (err) {
      if (err.response === undefined) {
        Alert.alert(
          'Network Error',
          'Please check your internet connection and try again.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Retry',
              onPress: () => fetchPosts(),
            },
          ]
        );
      } else {
        console.error('Error fetching posts:', err);
        setError('Failed to load posts');
      }
    } finally {
      setLoadingPosts(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchPosts();
  }, []);
  const handlePost = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await axios.post(`${API}/admin/posts`, {
        title,
        content,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 201) {
        Alert.alert('Success', 'Post created successfully');
        fetchPosts(); // Refresh the posts list
        setModalVisible(false); // Close modal after successful post
        setTitle(''); // Clear the input fields
        setContent('');
      } else {
        Alert.alert('Error', 'Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', error.response?.data?.message || 'Something went wrong');
    }
  };

  const handleOptionPress = (announcement) => {
    setSelectedAnnouncement(announcement);
    setOptionsModalVisible(true);
  };

  const handleCloseModal = () => {
    setOptionsModalVisible(false);
  };

  const handleEdit = () => {
    if (selectedAnnouncement) {
      setTitle(selectedAnnouncement.title);
      setContent(selectedAnnouncement.content);
      setIsEditing(true);
      setModalVisible(true);
    } else {
      console.error('Error editing post: selectedAnnouncement is null');
    }
    handleCloseModal();
  };

  const handleUpdatePost = async () => {
    if (!selectedAnnouncement) {
      console.error('Error updating post: selectedAnnouncement is null');
      return;
    }
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await axios.patch(`${API}/posts/edit/${selectedAnnouncement._id}`, {
        title,
        content,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        Alert.alert('Success', 'Post updated successfully');
        fetchPosts();
        setModalVisible(false);
        setIsEditing(false);
        setTitle('');
        setContent('');
      } else {
        Alert.alert('Error', 'Failed to update post');
      }
    } catch (error) {
      console.error('Error updating post:', error);
      Alert.alert('Error', error.response?.data?.message || 'Something went wrong');
    }
  };
  const handleRefresh = () => {
    fetchPosts(); // Fetch posts when refreshing
  };

  const handleDeletePost = async (postId) => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure to delete this post?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('accessToken');
              const response = await axios.delete(`${API}/posts/delete/${postId}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              if (response.status === 200) {
                Alert.alert('Success', 'Post successfully deleted', [
                  {
                    text: 'OK',
                    onPress: () => {
                      setOptionsModalVisible(false);
                      fetchPosts();
                    },
                  },
                ]);
              } else {
                Alert.alert('Error', 'Failed to delete post', [
                  {
                    text: 'OK',
                    onPress: () => setOptionsModalVisible(false),
                  },
                ]);
              }
            } catch (error) {
              console.error('Error deleting post:', error);
              Alert.alert('Error', error.response?.data?.message || 'Something went wrong', [
                {
                  text: 'OK',
                  onPress: () => setOptionsModalVisible(false),
                },
              ]);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const renderItem = ({ item }) => {
    const timeAgo = moment(item.createdAt).fromNow();
    const isNew = moment(item.createdAt).isAfter(moment().subtract(1, 'hour'));

    return (
      <View style={styles.item}>
        <View style={styles.itemContent}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.content}</Text>
          <Text style={styles.postAuthor}>By: {item.author ? item.author.firstname : 'Unknown'}</Text>
          <Text style={[styles.timestamp, isNew ? styles.newLabel : {}]}>
            Posted {timeAgo} {isNew ? ' (New)' : ''}
          </Text>
        </View>
        <Pressable onPress={() => handleOptionPress(item)}>
          <MaterialIcons name="more-vert" size={24} color={Colors.black} />
        </Pressable>
      </View>
    );
  };

  const welcome = () => (
    <View>
      {loadingUserData ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          {googleId && name ? (
            // If logged in via Google and both googleId and name are available
            <Text style={styles.welcome}>[Profile Picture] Welcome, {name}!</Text>
          ) : userData && userData.username ? (
            // If logged in manually and userData is available
            <Text style={styles.welcome}>[Profile Picture] Welcome, {userData.firstname}!</Text>
          ) : (
            // Fallback if neither Google login nor manual login have valid data
            <Text style={styles.welcome}>{error || 'No user data available'}</Text>
          )}

          {googleId && (
            <Text style={styles.googleId}>Google ID: {googleId}</Text>
          )}
        </>
      )}

    </View>
  );

  const headerComponent = () => (

    <View style={styles.headerContainer}>
      <Text style={styles.header}>Announcements</Text>
      <Pressable onPress={() => setModalVisible(true)} style={styles.add}>
        <FontAwesome
          style={{ marginTop: 11, marginRight: 0, color: "#2a6199" }}
          name="plus-square-o"
          size={24}
        />
      </Pressable>
    </View>
  );

  return (

    <View style={styles.container}>
      <View style={styles.welcomes}>{welcome()}</View>
      <View style={styles.headerSection}>{headerComponent()}</View>
      <FlatList
        data={announcements}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
      />

      <FormModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        formFields={[
          {
            placeholder: 'Enter Title',
            value: title,
            onChangeText: setTitle,
          },
          {
            placeholder: 'Enter Content',
            value: content,
            onChangeText: setContent,
            isDescription: true,
          },
        ]}
        onSave={isEditing ? handleUpdatePost : handlePost}
      />

      {selectedAnnouncement && (
        <AnnouncementOptions
          visible={optionsModalVisible}
          onClose={handleCloseModal}
          onEdit={handleEdit}
          onDelete={() => handleDeletePost(selectedAnnouncement._id)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  headerSection: {
    marginBottom: 20,
  },
  listSection: {
    flex: 1,
  },
  listContainer: {
    flexGrow: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  item: {
    backgroundColor: Colors.white,
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemContent: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 10,
  },
  description: {
    color: Colors.gray,
  },
  addButton: {
    backgroundColor: Colors.cobaltblue,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 15,
  },
  addButtonText: {
    color: Colors.white,
    fontSize: 16,
  },
  postAuthor: {
    marginTop: 15,
    fontSize: 15,
    fontWeight: 'bold',
    color: '#555',
    marginVertical: 5,
  },
  add: {
    marginLeft: 10,
    marginBottom: 5,
  },
  timestamp: {
    fontSize: 12,
    color: 'gray',
    marginTop: 5,
  },
  newLabel: {
    color: '#34C759',
  },
  welcome: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 10
  },
  welcomes: {
    left: 25
  }

});

export default AnnouncementList;
