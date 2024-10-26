import React, { useState, useEffect, useCallback } from 'react';
import { View, BackHandler, ToastAndroid, StyleSheet, Image, Pressable, Text, Modal, FlatList } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import Banner from '../screens/Components/Banner';
import AnnouncementList from '../screens/Components/AnnouncementList';
import FormModal from '../screens/Components/FormModal';
import ExitDialog from '../screens/Components/ExitDialog';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = 'http://192.168.1.9:3000';

export default function AdminHomeScreen() {
  const navigation = useNavigation();
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', description: '' });
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [backPressCount, setBackPressCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [firstName, setFirstName] = useState('Admin');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

  useEffect(() => {
    fetchUserName();
    fetchNotifications();
    fetchAnnouncements();

    const backAction = () => {
      if (backPressCount === 0) {
        setBackPressCount(1);
        ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
        setTimeout(() => setBackPressCount(0), 2000);
        return true;
      } else if (backPressCount === 1) {
        setShowExitDialog(true);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [backPressCount]);

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [])
  );

  const fetchUserName = async () => {
    try {
      const firstname = await AsyncStorage.getItem('firstname');
      if (firstname !== null) {
        setFirstName(firstname);
      }
    } catch (error) {
      console.error('Error fetching user name:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await axios.get(`${API_URL}/notification`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data);
      // Update the hasUnreadNotifications state
      setHasUnreadNotifications(response.data.some(notif => !notif.isRead));
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      ToastAndroid.show('Failed to load notifications', ToastAndroid.SHORT);
      return [];
    }
  };


  const fetchAnnouncements = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await axios.get(`${API_URL}/admin/posts/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnnouncements(response.data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      ToastAndroid.show('Failed to load announcements', ToastAndroid.SHORT);
    } finally {
      setIsRefreshing(false);
    }
  };

  const addAnnouncement = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      await axios.post(`${API_URL}/admin/posts`, newAnnouncement, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAnnouncements();
      setModalVisible(false);
      setNewAnnouncement({ title: '', description: '' });
    } catch (error) {
      console.error('Error adding announcement:', error);
      ToastAndroid.show('Failed to add announcement', ToastAndroid.SHORT);
    }
  };

  const editAnnouncement = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      await axios.patch(`${API_URL}/posts/edit/${selectedAnnouncement._id}`, newAnnouncement, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAnnouncements();
      setModalVisible(false);
      setSelectedAnnouncement(null);
    } catch (error) {
      console.error('Error editing announcement:', error);
      ToastAndroid.show('Failed to edit announcement', ToastAndroid.SHORT);
    }
  };

  const deleteAnnouncement = async (item) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      await axios.delete(`${API_URL}/posts/delete/${item._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAnnouncements();
    } catch (error) {
      console.error('Error deleting announcement:', error);
      ToastAndroid.show('Failed to delete announcement', ToastAndroid.SHORT);
    }
  };

  const handleCancelExit = () => {
    setShowExitDialog(false);
  };

  const handleConfirmExit = () => {
    BackHandler.exitApp();
  };

  const handleNotificationPress = async () => {
    setShowNotifications(true);
    await fetchNotifications();
  };

  const markNotificationAsRead = async (id) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      await axios.post(`${API_URL}/notification/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Removed fetchNotifications() from here
    } catch (error) {
      console.error('Error marking notification as read:', error);
      ToastAndroid.show('Failed to mark notification as read', ToastAndroid.SHORT);
    }
  };

  const deleteAllNotifications = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      await axios.delete(`${API_URL}/notification/delete-all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      ToastAndroid.show('Failed to delete all notifications', ToastAndroid.SHORT);
    }
  };

  const handleNotificationItemPress = async (notification) => {
    try {
      await markNotificationAsRead(notification._id);

      const token = await AsyncStorage.getItem('accessToken');
      const response = await axios.get(`${API_URL}/notification`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data);

      setShowNotifications(false);

      switch (notification.documentType) {
        case 'Appointment':
        case 'Medical Leave Form':
        case 'Medical Record Request':
        case 'Special Leave Form':
        case 'Telehealth':
          navigation.navigate('DetailedRequestScreen', { requestId: notification.documentId });
          break;
        case 'event':
          navigation.navigate('Events', { eventId: notification.documentId });
          break;
        case 'post':
          navigation.navigate('AnnouncementList', { postId: notification.documentId });
          break;
        default:
          console.warn('Unknown notification type:', notification.documentType);
          ToastAndroid.show('Unable to open this notification', ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error('Error handling notification press:', error);
      ToastAndroid.show('Failed to process notification', ToastAndroid.SHORT);
    }
  };




  const renderNotification = ({ item }) => (
    <Pressable
      style={[styles.notificationItem, item.isRead ? styles.readNotification : styles.unreadNotification]}
      onPress={() => handleNotificationItemPress(item)}
    >
      <Text style={styles.notificationText}>{item.title}</Text>
      <Text style={styles.notificationDate}>{new Date(item.timestamp).toLocaleString()}</Text>
      {!item.isRead && <View style={styles.unreadDot} />}
    </Pressable>
  );

  const markAllNotificationsAsRead = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      await axios.post(`${API_URL}/notification/mark-all-read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update the local state to reflect all notifications as read
      setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));

      ToastAndroid.show('All notifications marked as read', ToastAndroid.SHORT);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      ToastAndroid.show('Failed to mark all notifications as read', ToastAndroid.SHORT);
    }
  };
  const handleModalShow = async () => {
    await fetchNotifications();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>Welcome,</Text>
          <Text style={styles.usernameText}>{firstName}</Text>
        </View>
        <View style={styles.iconContainer}>
          <Pressable onPress={handleNotificationPress} style={styles.notificationIconContainer}>
            <Ionicons
              name="notifications"
              size={24}
              color={Colors.cobaltblue}
              style={styles.notificationIcon}
            />
            {hasUnreadNotifications && <View style={styles.notificationBadge} />}
          </Pressable>
          <Pressable onPress={() => navigation.navigate('AdminProfileScreen')}>
            <Image
              source={require('../assets/default-profile-pic.png')}
              style={styles.profilePic}
            />
          </Pressable>
        </View>
      </View>

      <View style={styles.bannerContainer}>
        <Banner
          title="Welcome to PCU Clinic!"
          subtitle="Have a healthy day :)"
          description="A distinctive Christian University, integrating faith, character and service..."
        />
      </View>

      <ExitDialog
        visible={showExitDialog}
        onCancel={handleCancelExit}
        onConfirm={handleConfirmExit}
      />

      <AnnouncementList
        announcements={announcements}
        isStudent={false}
        onEditPress={(item) => {
          setSelectedAnnouncement(item);
          setNewAnnouncement({ title: item.title, description: item.content });
          setModalVisible(true);
        }}
        onDeletePress={deleteAnnouncement}
        onAddPress={() => {
          setNewAnnouncement({ title: '', description: '' });
          setModalVisible(true);
        }}
        onRefresh={() => {
          setIsRefreshing(true);
          fetchAnnouncements();
        }}
        refreshing={isRefreshing}
      />

      <FormModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setSelectedAnnouncement(null);
        }}
        formFields={[
          {
            placeholder: 'Title',
            value: newAnnouncement.title,
            onChangeText: (text) => setNewAnnouncement({ ...newAnnouncement, title: text })
          },
          {
            placeholder: 'Description',
            value: newAnnouncement.description,
            onChangeText: (text) => setNewAnnouncement({ ...newAnnouncement, description: text }),
            isDescription: true
          },
        ]}
        onSave={selectedAnnouncement ? editAnnouncement : addAnnouncement}
        saveLabel={selectedAnnouncement ? "Update" : "Create"}
        cancelLabel="Dismiss"
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={showNotifications}
        onRequestClose={() => setShowNotifications(false)}
        onShow={handleModalShow}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Notifications</Text>
            <View style={styles.notificationActions}>
              <Pressable
                style={[styles.actionButton, styles.readAllButton]}
                onPress={markAllNotificationsAsRead}
              >
                <Text style={styles.actionButtonText}>Read All</Text>
              </Pressable>
              <Pressable
                style={[styles.actionButton, styles.deleteAllButton]}
                onPress={deleteAllNotifications}
              >
                <Text style={styles.actionButtonText}>Delete All</Text>
              </Pressable>
            </View>
            <FlatList
              data={notifications}
              renderItem={renderNotification}
              keyExtractor={item => item._id}
              style={styles.notificationList}
            />
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => setShowNotifications(false)}
            >
              <Text style={styles.textStyle}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lgray,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lgray,
  },
  welcomeContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: Colors.gray,
  },
  usernameText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.cobaltblue,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationIconContainer: {
    marginRight: 15,
  },
  notificationIcon: {
    padding: 5,
  },
  notificationBadge: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: 'red',
    borderRadius: 6,
    width: 12,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  bannerContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  button: {
    borderRadius: 50,
    padding: 10,
    elevation: 2,
    marginTop: 15,
  },
  buttonClose: {
    backgroundColor: Colors.cobaltblue,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold"
  },
  notificationList: {
    width: '100%',
  },
  notificationItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lgray,
  },
  unreadNotification: {
    backgroundColor: '#e6f3ff',
  },
  readNotification: {
    backgroundColor: 'white',
  },
  notificationText: {
    fontSize: 16,
    marginBottom: 5,
  },
  notificationDate: {
    fontSize: 12,
    color: Colors.gray,
  },
  unreadDot: {
    position: 'absolute',
    right: 10,
    top: '50%',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.cobaltblue,
  },
  notificationActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 15,
  },
  actionButton: {
    padding: 10,
    borderRadius: 50,
    flex: 1,
    marginHorizontal: 5,
  },
  deleteAllButton: {
    backgroundColor: Colors.red,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  readAllButton: {
    backgroundColor: Colors.cobaltblue,
    marginRight: 10,
  },
});