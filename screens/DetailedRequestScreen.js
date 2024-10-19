import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, TextInput, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../constants/Colors';

export default function DetailedRequestScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { requestId } = route.params;

  const [request, setRequest] = useState(null);
  const [status, setStatus] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);
  useEffect(() => {
    const fetchRequestDetails = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem('accessToken');
        const role = await AsyncStorage.getItem('role');

        if (role !== 'admin' && role !== 'staff') {
          throw new Error('For Authorized Access');
        }

        setUserRole(role);

        const response = await axios.get(`http://192.168.1.10:3000/requests/${requestId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setRequest(response.data);
        setStatus(response.data.status);
      } catch (error) {
        console.error('Error fetching request:', error.response?.data || error.message);
        setError('Failed to load request details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchRequestDetails();
  }, [requestId]);

  const handleStatusChange = async (newStatus) => {
    navigation.goBack();
    if (!feedback.trim()) {
      Alert.alert('Feedback Required', 'Please provide feedback before changing the status.');
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('accessToken');
      const response = await axios.patch(`http://192.168.1.10:3000/requests/${requestId}`,
        { status: newStatus, feedback },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRequest(response.data.appointment);
      setStatus(newStatus);
      setShowFeedbackInput(false);
      Alert.alert('Success', `Request ${newStatus} successfully.`);
    } catch (error) {
      console.error(`Error ${newStatus} request:`, error);
      setError(`Failed to ${newStatus} request. Please try again.`);
      Alert.alert('Error', error.response?.data?.error || `Failed to ${newStatus} request. Please try again.`);
    } finally {
      setLoading(false);
    }
  };


  const handleBackPress = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.cobaltblue} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Pressable style={styles.backButton} onPress={handleBackPress} accessibilityLabel="Go back">
        <Ionicons name="arrow-back" size={24} color={Colors.white} />
      </Pressable>

      <Text style={styles.title}>{request?.appointment?.formName}</Text>
      <View style={styles.content}>
        <Text style={styles.label}>Sender: <Text style={styles.text}>{request?.userDetails?.firstName} {request?.userDetails?.lastName}</Text></Text>
        <Text style={styles.label}>Consultation Type: <Text style={styles.text}>{request?.appointment?.formName}</Text></Text>
        <Text style={styles.label}>Reason for Appointment: <Text style={styles.text}>{request?.appointment?.reason || 'N/A'}</Text></Text>
        <Text style={styles.label}>Preferred Appointment Date and Time: <Text style={styles.text}>{new Date(request?.appointment?.timestamp).toLocaleString()}</Text></Text>
        <Text style={styles.label}>Status: <Text style={[styles.text, styles[status]]}>{request?.appointment?.status || 'N/A'}</Text></Text>
        <Text style={styles.label}>Handled By: <Text style={styles.text}>{request?.staffDetails?.firstName} {request?.staffDetails?.lastName || 'Unassigned'}</Text></Text>
        <Text style={styles.label}>Feedback: <Text style={styles.text}>{request?.appointment?.feedback || 'No feedback yet'}</Text></Text>
        <Text style={styles.label}>Made When: <Text style={styles.text}>{new Date(request?.appointment?.timestamp).toLocaleString()}</Text></Text>
      </View>
      {(userRole === 'admin' || userRole === 'staff') && (
        <View style={styles.actionContainer}>
          <View style={styles.buttonContainer}>
            <Pressable
              style={[styles.button, styles.declineButton]}
              onPress={() => setShowFeedbackInput('declined')}
              accessibilityLabel="Decline Request"
            >
              <Text style={styles.buttonText}>Decline</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.approveButton]}
              onPress={() => setShowFeedbackInput('approved')}
              accessibilityLabel="Approve Request"
            >
              <Text style={styles.buttonText}>Approve</Text>
            </Pressable>
          </View>
          {showFeedbackInput && (
            <>
              <TextInput
                style={styles.feedbackInput}
                placeholder="Enter feedback"
                value={feedback}
                onChangeText={setFeedback}
                multiline
              />
              <Pressable
                style={styles.actionButton}
                onPress={() => handleStatusChange(showFeedbackInput)}
                accessibilityLabel="Take Action"
              >
                <Text style={styles.actionButtonText}>Take Action</Text>
              </Pressable>
            </>
          )}
        </View>
      )}
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lgray,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.lgray,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.lgray,
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: Colors.red,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: Colors.cobaltblue,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
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
    marginHorizontal: 5,
  },
  declineButton: {
    backgroundColor: Colors.orange,
  },
  approveButton: {
    backgroundColor: Colors.cobaltblue,
  },
  buttonText: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  pending: {
    color: Colors.cobaltblue,
  },
  approved: {
    color: Colors.green,
  },
  declined: {
    color: Colors.red,
  },
  actionContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  feedbackInput: {
    backgroundColor: Colors.white,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    minHeight: 100,
    textAlignVertical: 'top',
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: Colors.cobaltblue,
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  actionButtonText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});