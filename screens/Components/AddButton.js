// components/AnnouncementList.js
import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import Colors from '../../constants/Colors';
import AddButton from './AddButton'; // Import the AddButton component

const AnnouncementList = ({ announcements, onAddPress }) => {
  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View style={styles.itemContent}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description} numberOfLines={3} ellipsizeMode="tail">
          {item.description}
        </Text>
      </View>
    </View>
  );

  const headerComponent = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.header}>Announcements</Text>
      <AddButton onPress={onAddPress} /> {/* Use the AddButton component */}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={announcements}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        ListHeaderComponent={headerComponent}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  listContainer: {
    flexGrow: 1,
  },
  headerContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  item: {
    backgroundColor: Colors.white,
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemContent: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  description: {
    color: Colors.gray,
  },
});

export default AnnouncementList;
