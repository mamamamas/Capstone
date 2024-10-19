import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
export default function TelehealthRequests() {
  const [telehealthRequests, setTelehealthRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  // Function to fetch requests from the backend
  const fetchTelehealthRequests = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await axios.get('http://192.168.1.10:3000/requests/teleHealth', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setTelehealthRequests(response.data);
    } catch (error) {
      console.error('Error fetching telehealth requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelehealthRequests();
  }, []);

  const handleViewPress = (request) => {
    navigation.navigate('DetailedRequestScreen', { requestId: request._id });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>View your Telemedicine appointments here.</Text>
      <View style={styles.cardContainer}>
        <Text style={styles.cardTitle}>My Telehealth Requests</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <ScrollView horizontal>
            <View>
              <View style={styles.tableHeader}>
                <Text style={[styles.headerCell, styles.requestColumn]}>Request</Text>
                <Text style={[styles.headerCell, styles.senderColumn]}>Sender</Text>
                <Text style={[styles.headerCell, styles.statusColumn]}>Status</Text>
                <Text style={[styles.headerCell, styles.actionColumn]}>Actions</Text>
                <Text style={[styles.headerCell, styles.dateColumn]}>Date</Text>
                <Text style={[styles.headerCell, styles.handledByColumn]}>Handled by</Text>
                <Text style={[styles.headerCell, styles.feedbackColumn]}>Feedback</Text>
              </View>
              {telehealthRequests.length === 0 ? (
                <Text style={styles.emptyMessage}>No telehealth requests found.</Text>
              ) : (
                telehealthRequests.map((request, index) => (
                  <View key={index} style={[styles.tableRow, index % 2 === 0 ? styles.evenRow : styles.oddRow]}>
                    <Text style={[styles.cell, styles.requestColumn]}>{request.formName}</Text>
                    <Text style={[styles.cell, styles.senderColumn]}>{request.userId}</Text>
                    <Text style={[styles.cell, styles.statusColumn, styles.statusApproved]}>{request.status}</Text>
                    <View style={[styles.cell, styles.actionColumn]}>
                      <Pressable style={styles.viewButton} onPress={() => handleViewPress(request)}>
                        <Text style={styles.viewButtonText}>View</Text>
                      </Pressable>
                    </View>
                    <Text style={[styles.cell, styles.dateColumn]}>{request.timestamp}</Text>
                    <Text style={[styles.cell, styles.handledByColumn]}>{request.handledByDetails.firstName ? `${request.handledByDetails.firstName} ${request.handledByDetails.lastName}` : 'N/A'}</Text>
                    <Text style={[styles.cell, styles.feedbackColumn]}>{request.feedback}</Text>
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 16,
  },
  headerText: {
    fontSize: 16,
    marginBottom: 16,
    color: '#333',
  },
  cardContainer: {
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerCell: {
    padding: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  evenRow: {
    backgroundColor: '#f9f9f9',
  },
  oddRow: {
    backgroundColor: '#ffffff',
  },
  cell: {
    padding: 12,
    color: '#333',
  },
  statusApproved: {
    color: 'green',
  },
  viewButton: {
    backgroundColor: 'red',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  viewButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  requestColumn: { width: 180 },
  senderColumn: { width: 200 },
  statusColumn: { width: 100 },
  actionColumn: { width: 100 },
  dateColumn: { width: 180 },
  handledByColumn: { width: 120 },
  feedbackColumn: { width: 200, flexShrink: 1, flexGrow: 1 },
  emptyMessage: {
    fontSize: 18, // Slightly larger than regular text
    fontWeight: '500', // Medium weight to make it stand out
    color: '#757575', // Neutral gray color
    textAlign: 'center', // Center horizontally
    marginTop: 20, // Add some vertical spacing
    paddingHorizontal: 10, // Add padding for better readability on small screens
  },
});
