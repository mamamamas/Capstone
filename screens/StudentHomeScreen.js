import React, { useState, useEffect, useCallback } from 'react';
import { View, BackHandler, ToastAndroid, StyleSheet, Image, Pressable, Text, Modal, FlatList } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Colors from '../constants/Colors';
import Banner from '../screens/Components/Banner';
import AnnouncementList from '../screens/Components/AnnouncementList';
import ExitDialog from '../screens/Components/ExitDialog';
import LocationScreen from './LocationScreen';
import AboutUsScreen from './AboutUsScreen';
import EventsScreen from './TabScreens/EventsScreen';
import HealthTipsScreen from './TabScreens/HealthTipsScreen';
import RequestFormsScreen from './TabScreens/RequestFormsScreen';
import TelemedScreen from './TabScreens/TelemedScreen';
import CustomDrawerContent from '../screens/Components/CustomDrawerContent';
import RightDrawer from '../navigation/RightDrawer';
import ServicesScreen from './TabScreens/ServicesScreen';
import ScheduleScreen from './TabScreens/ScheduleScreen';
import LogoutScreen from './TabScreens/LogoutScreen';
import StudentProfileScreen from './StudentProfileScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();
const API_URL = 'http://192.168.1.9:3000';

const StudentHomeContent = ({ navigation }) => {
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [backPressCount, setBackPressCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [firstName, setFirstName] = useState('Student');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
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
      const storedFirstName = await AsyncStorage.getItem('firstname');
      const storedProfilePic = await AsyncStorage.getItem('profilePic');
      if (storedFirstName) {
        setFirstName(storedFirstName);
        setProfilePic(storedProfilePic);
      } else {
        const userInfo = await GoogleSignin.getCurrentUser();
        if (userInfo) {
          setFirstName(userInfo.user.givenName || 'Student');
          await AsyncStorage.setItem('firstname', userInfo.user.givenName || 'Student');
        }
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
      setHasUnreadNotifications(response.data.some(notif => !notif.isRead));
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      ToastAndroid.show('Failed to load notifications', ToastAndroid.SHORT);
      return [];
    }
  };

  const fetchAnnouncements = async () => {
    setIsRefreshing(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await axios.get(`${API_URL}/admin/posts/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const sortedAnnouncements = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setAnnouncements(sortedAnnouncements);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      ToastAndroid.show('Failed to load announcements', ToastAndroid.SHORT);
    } finally {
      setIsRefreshing(false);
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
          <Pressable
            onPress={async () => {
              const userId = await AsyncStorage.getItem('id');
              navigation.navigate('StudentProfileScreen', { userId });
            }}
          >
            <Image
              source={profilePic ? { uri: profilePic } : require('../assets/default-profile-pic.png')}
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

      <AnnouncementList
        announcements={announcements}
        isStudent={true}
        onItemPress={(item) => {
          console.log('Viewing announcement:', item);
        }}
        onRefresh={() => {
          setIsRefreshing(true);
          fetchAnnouncements();
        }}
        refreshing={isRefreshing}
      />

      <ExitDialog
        visible={showExitDialog}
        onCancel={handleCancelExit}
        onConfirm={handleConfirmExit}
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
};

const HomeTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Location') {
            iconName = focused ? 'location' : 'location-outline';
          } else if (route.name === 'About Us') {
            iconName = focused ? 'information-circle' : 'information-circle-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.cobaltblue,
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={StudentHomeContent} options={{ headerShown: false }} />
      <Tab.Screen name="Location" component={LocationScreen} />
      <Tab.Screen name="About Us" component={AboutUsScreen} />
    </Tab.Navigator>
  );
};

const StudentHomeScreen = () => {
  return (
    <RightDrawer>
      <Drawer.Navigator
        initialRouteName="HomeTabs"
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          drawerStyle: {
            backgroundColor: '#fff',
            borderTopRightRadius: 20,
            borderBottomRightRadius: 20,
            width: 250,
          },
          headerShown: true,
          drawerActiveTintColor: '#1f65ff',
          drawerInactiveTintColor: '#333',
        }}
      >
        <Drawer.Screen
          name="HomeTabs"
          component={HomeTabs}
          options={{
            drawerLabel: 'Home',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="Services"
          component={ServicesScreen}
          options={{
            drawerLabel: 'Services',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="briefcase-outline" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="Schedule"
          component={ScheduleScreen}
          options={{
            drawerLabel: 'Schedule',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="calendar-outline" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="Telemed"
          component={TelemedScreen}
          options={{
            drawerLabel: 'Telemed',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="medkit-outline" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="Forms"
          component={RequestFormsScreen}
          options={{
            drawerLabel: 'Forms',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="newspaper-outline" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="Events"
          component={EventsScreen}
          options={{
            drawerLabel: 'Events',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="calendar-outline" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="Health"
          component={HealthTipsScreen}
          options={{
            drawerLabel: 'Health',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="heart-outline" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="Logout"
          component={LogoutScreen}
          options={{
            drawerLabel: 'Logout',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="exit-outline" size={size} color={color} />
            ),
          }}
        />
      </Drawer.Navigator>
    </RightDrawer>
  );
};

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
  readAllButton: {
    backgroundColor: Colors.cobaltblue,
  },
  deleteAllButton: {
    backgroundColor: Colors.red,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default StudentHomeScreen;