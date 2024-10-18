import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import Colors from '../../constants/Colors';

const UserWelcome = ({ username = "Admin", profilePicture = null, onProfilePress }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome, {username}!</Text>
      <Pressable onPress={onProfilePress}>
        <Image
          source={profilePicture ? { uri: profilePicture } : require('../../assets/1.jpg')} // Fallback to placeholder if no profile picture
          style={styles.profileImage}
        />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.lgray,
  },
  welcomeText: {
    fontSize: 18,
    color: Colors.darkGray,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});

export default UserWelcome;
