import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import Axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
export default function DetailedRequestScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { requestId } = route.params;  // Fetching requestId passed from the previous screen

  const [request, setRequest] = useState(null);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    // Fetch request details from backend using requestId
    const fetchRequestDetails = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');  // Adjust if you're storing the token in a different way

        if (!token) {
          console.error('No authentication token found');
          return;
        }

        const response = await Axios.get(`http://192.168.1.10:3000/requests/${requestId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setRequest(response.data);
        setStatus(response.data.status);
      } catch (error) {
        console.error('Error fetching request:', error.response?.data || error.message);
      }
    };
    fetchRequestDetails();
  }, [requestId]);

  const handleDecline = async () => {
    if (status === 'pending') {
      setStatus('declined');
      try {
        await Axios.put(`http://192.168.1.10:3000/requests/decline/${requestId}`, { status: 'declined' });
      } catch (error) {
        console.error('Error declining request:', error);
      }
    }
  };

  const handleApprove = async () => {
    if (status === 'pending') {
      setStatus('approved');
      try {
        await Axios.put(`http://192.168.1.10:3000/requests/approve/${requestId}`, { status: 'approved' });
      } catch (error) {
        console.error('Error approving request:', error);
      }
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  if (!request) {
    return <Text>Loading...</Text>;  // Show loading message until request data is fetched
  }

  const isPending = status === 'pending';

  return (
    <ScrollView style={styles.container}>
      <Pressable style={styles.backButton} onPress={handleBackPress}>
        <Ionicons name="arrow-back" size={24} color={Colors.white} />
      </Pressable>

      <Text style={styles.title}>{request?.appointment?.formName}</Text>
      <View style={styles.content}>
        <Text style={styles.label}>Sender: <Text style={styles.text}>{request?.userDetails?.firstName} {request?.userDetails?.lastName}</Text></Text>
        <Text style={styles.label}>Consultation Type: <Text style={styles.text}>{request?.appointment?.formName}</Text></Text>
        <Text style={styles.label}>Reason for Appointment: <Text style={styles.text}>{request?.appointment?.reason || 'N/A'}</Text></Text>
        <Text style={styles.label}>Preferred Appointment Date and Time: <Text style={styles.text}>{new Date(request?.appointment?.timestamp).toLocaleString()}</Text></Text>
        <Text style={styles.label}>Status: <Text style={styles.text}>{request?.appointment?.status || 'N/A'}</Text></Text>
        <Text style={styles.label}>HandledBy: <Text style={styles.text}>{request?.staffDetails?.firstName} {request?.staffDetails?.lastName || 'Unassigned'}</Text></Text>
        <Text style={styles.label}>Feedback: <Text style={styles.text}>{request?.appointment?.feedback || 'No feedback yet'}</Text></Text>
        <Text style={styles.label}>Made When: <Text style={styles.text}>{new Date(request?.appointment?.timestamp).toLocaleString()}</Text></Text>
      </View>
      <View style={styles.buttonContainer}>
        <Pressable
          style={[styles.button, !isPending && styles.disabledButton]}
          onPress={handleDecline}
          disabled={!isPending}
        >
          <Text style={styles.buttonText}>Decline Request</Text>
        </Pressable>
        <Pressable
          style={[styles.button, !isPending && styles.disabledButton]}
          onPress={handleApprove}
          disabled={!isPending}
        >
          <Text style={styles.buttonText}>Approve Request</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lgray,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
    backgroundColor: Colors.cobaltblue,
    borderRadius: 20,
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.cobaltblue,
    textAlign: 'center',
    marginTop: 60,
    marginBottom: 20,
  },
  content: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 20,
    margin: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.cobaltblue,
    marginBottom: 10,
  },
  text: {
    fontWeight: 'normal',
    color: 'black',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    backgroundColor: Colors.cobaltblue,
    marginHorizontal: 5,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: Colors.white,
    fontWeight: 'bold',
  },
});
