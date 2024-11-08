import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Dimensions } from 'react-native';
import axios from 'axios';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

export default function TelehealthRequests() {
  const [telehealthRequests, setTelehealthRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const fetchTelehealthRequests = useCallback(async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await axios.get('http://192.168.1.9:3000/requests', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log(response.data);
      setTelehealthRequests(response.data);
    } catch (error) {
      console.error('Error fetching telehealth requests:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchTelehealthRequests();
    }, [fetchTelehealthRequests])
  );

  const handleViewPress = (request) => {
    navigation.navigate('DetailedRequestScreen', { requestId: request._id });
  };

  const renderTableHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={[styles.headerCell, styles.requestColumn]}>Request</Text>
      <Text style={[styles.headerCell, styles.senderColumn]}>Sender</Text>
      <Text style={[styles.headerCell, styles.statusColumn]}>Status</Text>
      <Text style={[styles.headerCell, styles.actionColumn]}>Actions</Text>
      <Text style={[styles.headerCell, styles.dateColumn]}>Date</Text>
      <Text style={[styles.headerCell, styles.handledByColumn]}>Handled by</Text>
      <Text style={[styles.headerCell, styles.feedbackColumn]}>Feedback</Text>
    </View>
  );

  const renderTableRows = () => (
    telehealthRequests.map((request, index) => (
      <View key={index} style={[styles.tableRow, index % 2 === 0 ? styles.evenRow : styles.oddRow]}>
        <Text style={[styles.cell, styles.requestColumn]}>{request.formName}</Text>
        <Text style={[styles.cell, styles.senderColumn]}>
          {request?.userDetails?.firstName && request?.userDetails?.lastName
            ? `${request.userDetails.firstName} ${request.userDetails.lastName}`
            : 'N/A'}
        </Text>
        <Text style={[styles.cell, styles.statusColumn, styles.statusApproved]}>{request.status}</Text>
        <View style={[styles.cell, styles.actionColumn]}>
          <Pressable style={styles.viewButton} onPress={() => handleViewPress(request)}>
            <Text style={styles.viewButtonText}>View</Text>
          </Pressable>
        </View>
        <Text style={[styles.cell, styles.dateColumn]}>{formatDate(request.timestamp)}</Text>
        <Text style={[styles.cell, styles.handledByColumn]}>
          {request.handledBy && request.handledByDetails?.firstName && request.handledByDetails?.lastName
            ? `${request.handledByDetails.firstName} ${request.handledByDetails.lastName}`
            : 'Not assigned'}
        </Text>
        <Text style={[styles.cell, styles.feedbackColumn]}>{request.feedback || 'No feedback'}</Text>
      </View>
    ))
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>View your Telemedicine appointments here.</Text>
      <View style={styles.cardContainer}>
        <Text style={styles.cardTitle}>My Telehealth Requests</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : telehealthRequests.length === 0 ? (
          <Text style={styles.emptyMessage}>No telehealth requests found.</Text>
        ) : (
          <View style={styles.tableContainer}>
            <ScrollView horizontal>
              <View>
                {renderTableHeader()}
                <ScrollView style={styles.tableBody}>
                  {renderTableRows()}
                </ScrollView>
              </View>
            </ScrollView>
          </View>
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
  tableContainer: {
    maxHeight: screenHeight * 0.6,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tableBody: {
    flexGrow: 0,
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
    fontSize: 18,
    fontWeight: '500',
    color: '#757575',
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 10,
  },
});