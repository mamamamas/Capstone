import React, { useState, useEffect } from 'react';
import { View, BackHandler, ToastAndroid, RefreshControl } from 'react-native';
import Colors from '../constants/Colors';
import Banner from './Components/Banner';
import AnnouncementList from './Components/AnnouncementList';
import FormModal from './Components/FormModal';
import ExitDialog from './Components/ExitDialog';
import UserWelcome from './Components/UserWelcome';

const AdminHomeScreen = ({ navigation }) => {
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', description: '', date: '', time: '', image: null });
  const [modalVisible, setModalVisible] = useState(false);
  const [backPressCount, setBackPressCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false); // Add refreshing state

  useEffect(() => {
    const backAction = () => {
      if (backPressCount === 0) {
        setBackPressCount(1);
        ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
        setTimeout(() => setBackPressCount(0), 2000); // Reset counter after 2 seconds
        return true;
      } else if (backPressCount === 1) {
        setShowExitDialog(true);
        return true;
      }
      return false; // Handle default back action
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    // Sample data for announcements
    setAnnouncements([{ title: 'Sample Title', description: 'Sample announcement', date: '2024-09-04', time: '10:00 AM', image: null }]);

    return () => backHandler.remove();
  }, [backPressCount]);

  const addAnnouncement = () => {
    setAnnouncements([...announcements, newAnnouncement]);
    setNewAnnouncement({ title: '', description: '', date: '', time: '', image: null });
    setModalVisible(false);
  };

  const handleCancelExit = () => {
    setShowExitDialog(false);
  };

  const handleConfirmExit = () => {
    BackHandler.exitApp(); // Exit the app
  };

  // Refresh handler
  const onRefresh = () => {
    setRefreshing(true);

    // Simulate an API call to fetch new data
    setTimeout(() => {
      setAnnouncements([{ title: 'Updated Title', description: 'New announcement data', date: '2024-09-05', time: '12:00 PM', image: null }]);
      setRefreshing(false);
    }, 2000); // Simulate 2-second delay for fetching data
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.lgray }}>

      <UserWelcome
        username="Mark Durana"
        profilePicture={null}
        onProfilePress={() => navigation.navigate('AdminProfileScreen')} // Navigate to Admin Profile Screen
      />
      <Banner
        title="Welcome to PCU Clinic!"
        subtitle="Have a healthy day :)"
        description="A distinctive Christian University, integrating faith, character and service..."
      />

      <ExitDialog
        visible={showExitDialog}
        onCancel={handleCancelExit}
        onConfirm={handleConfirmExit}
      />

      <AnnouncementList
        announcements={announcements}
        onAddPress={() => setModalVisible(true)}
        onItemPress={(item) => setSelectedAnnouncement(item)}
        refreshing={refreshing} // Pass the refreshing state to AnnouncementList
        onRefresh={onRefresh} // Pass the onRefresh function to AnnouncementList
      />

      <FormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        formFields={[
          {
            placeholder: 'Title',
            value: newAnnouncement.title,
            onChangeText: (text) => setNewAnnouncement({ ...newAnnouncement, title: text })
          },
          {
            placeholder: 'Descriptions',
            value: newAnnouncement.description,
            onChangeText: (text) => setNewAnnouncement({ ...newAnnouncement, description: text }),
            isDescription: true // Add this to apply the larger height
          },
          // Additional fields here...
        ]}
        onSave={addAnnouncement}
        saveLabel="Create"
        cancelLabel="Dismiss"
      />
    </View>
  );
};

export default AdminHomeScreen;
