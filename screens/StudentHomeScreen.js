import React, { useState, useEffect } from 'react';
import { View, BackHandler, ToastAndroid, StyleSheet, Image, Pressable, Text, Modal, FlatList } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
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

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

const StudentHomeContent = ({ navigation }) => {
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [backPressCount, setBackPressCount] = useState(0);
  const [notifications, setNotifications] = useState([
    { id: '1', message: 'Your telehealth request has been approved!', date: '10/11/2024', time: '3:29:16 PM', isRead: false },
    { id: '2', message: 'New health tip available: Staying Hydrated', date: '10/11/2024', time: '12:24:28 AM', isRead: false },
    { id: '3', message: 'Reminder: Flu shot clinic tomorrow', date: '10/10/2024', time: '5:28:47 PM', isRead: true },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
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

    setAnnouncements([
      {
        id: '1',
        title: 'Free Medical Exams for Students',
        description: 'The University Health Services is offering free medical check-ups for all students. This includes basic health assessments, blood pressure checks, and more. Walk-ins welcome! Please bring your student ID. Prioritize your health and get your check-up today!',
        date: '2024-09-04',
        time: '10:00 AM'
      },
      {
        id: '2',
        title: 'University Vaccination Drive: Stay Protected, Stay Healthy!',
        description: 'The University Health Services is organizing a free vaccination campaign to ensure the safety and well-being of our students, staff, and faculty. This is part of our ongoing commitment to a healthy campus community. For any inquiries or additional information, please visit the events page. Let\'s work together to keep our campus safe and healthy. Get vaccinated today!',
        date: '2024-09-10',
        time: '09:00 AM'
      }
    ]);

    return () => backHandler.remove();
  }, [backPressCount]);

  const handleCancelExit = () => {
    setShowExitDialog(false);
  };

  const handleConfirmExit = () => {
    BackHandler.exitApp();
  };

  const handleNotificationPress = () => {
    setShowNotifications(true);
  };

  const markNotificationAsRead = (id) => {
    setNotifications(notifications.map(notif =>
      notif.id === id ? { ...notif, isRead: true } : notif
    ));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
  };

  const deleteAllNotifications = () => {
    setNotifications([]);
  };

  const hasUnreadNotifications = notifications.some(notif => !notif.isRead);

  const renderNotification = ({ item }) => (
    <Pressable
      style={[styles.notificationItem, item.isRead ? styles.readNotification : styles.unreadNotification]}
      onPress={() => markNotificationAsRead(item.id)}
    >
      <Text style={styles.notificationText}>{item.message}</Text>
      <Text style={styles.notificationDate}>{`${item.date}, ${item.time}`}</Text>
      {!item.isRead && <View style={styles.unreadDot} />}
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>Welcome,</Text>
          <Text style={styles.usernameText}>Student Name</Text>
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
          <Pressable onPress={() => navigation.navigate('StudentProfileScreen')}>
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

      <AnnouncementList
        announcements={announcements}
        isStudent={true}
        onItemPress={(item) => {
          console.log('Viewing announcement:', item);
        }}
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
              keyExtractor={item => item.id}
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