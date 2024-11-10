import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Modal, TextInput, TouchableOpacity, Platform, Alert, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
export default function EventsScreen() {
  const [events, setEvents] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    who: '',
    when: {
      startTime: new Date(),
      endTime: new Date(new Date().getTime() + 60 * 60 * 1000),
    },
    where: '',
    limit: '',
    about: '',
  });
  const [refreshing, setRefreshing] = useState(false);
  const [attendanceState, setAttendanceState] = useState({});
  const [attendeesModalVisible, setAttendeesModalVisible] = useState(false);
  const [selectedEventAttendees, setSelectedEventAttendees] = useState([]);



  useEffect(() => {
    fetchEvents();
    fetchCurrentUserId();
    loadAttendanceState();
    fetchUserRole();
  }, []);

  const fetchEvents = async () => {
    const token = await AsyncStorage.getItem('accessToken');
    try {
      const response = await axios.get("http://192.168.1.9:3000/event", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching events:", error);
      Alert.alert("Error", "Failed to fetch events. Please try again.");
    }
  };

  const fetchCurrentUserId = async () => {
    const userId = await AsyncStorage.getItem('userId');
    setCurrentUserId(userId);
  };
  const loadAttendanceState = async () => {
    try {
      const savedState = await AsyncStorage.getItem('attendanceState');
      if (savedState) {
        setAttendanceState(JSON.parse(savedState));
      }
    } catch (error) {
      console.error("Error loading attendance state:", error);
    }
  };
  const showAttendeesModal = (attendees) => {
    setSelectedEventAttendees(attendees);
    setAttendeesModalVisible(true);
  };
  useEffect(() => {
    const loadAttendanceState = async () => {
      const savedState = await AsyncStorage.getItem('attendanceState');
      if (savedState) {
        setAttendanceState(JSON.parse(savedState));
      } else {
        // Initialize attendance state based on current user data if AsyncStorage is empty
        const initialState = {};
        events.forEach(event => {
          initialState[event._id] = event.attendees.includes(currentUserId);
        });
        setAttendanceState(initialState);
      }
    };

    loadAttendanceState();
  }, [events, currentUserId]);


  const fetchUserRole = async () => {
    try {
      const role = await AsyncStorage.getItem('role');
      setIsAdmin(role === 'admin');
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };
  const saveAttendanceState = async (newState) => {
    try {
      await AsyncStorage.setItem('attendanceState', JSON.stringify(newState));
    } catch (error) {
      console.error("Error saving attendance state:", error);
    }
  };


  const toggleAttendance = async (eventId) => {
    const token = await AsyncStorage.getItem('accessToken');
    const isCurrentlyAttending = attendanceState[eventId];

    try {
      // Send request to update attendance on the server
      const response = await axios.post(
        `http://192.168.1.9:3000/event/${eventId}/attend`,
        { attend: !isCurrentlyAttending },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Toggle attendance state locally
      const newAttendanceState = {
        ...attendanceState,
        [eventId]: !isCurrentlyAttending,
      };
      setAttendanceState(newAttendanceState);


      setEvents((prevEvents) =>
        prevEvents.map((event) => {
          if (event._id === eventId) {
            const updatedAttendees = isCurrentlyAttending
              ? event.attendees.filter(id => id !== currentUserId)
              : [...event.attendees, currentUserId];

            return { ...event, attendees: updatedAttendees };
          }
          return event;
        })
      );

      // Persist the new attendance state in AsyncStorage
      await AsyncStorage.setItem('attendanceState', JSON.stringify(newAttendanceState));

      Alert.alert("Success", response.data.message);
    } catch (error) {
      console.error("Error toggling attendance:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to update attendance. Please try again."
      );
    }
  };

  const addEvent = async () => {
    const token = await AsyncStorage.getItem('accessToken');
    console.log(token);
    try {
      const response = await axios.post("http://192.168.1.9:3000/event", newEvent, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data);
      setEvents([...events, response.data]);
      setModalVisible(false);
      resetEventForm();
    } catch (error) {
      console.error("Error adding event:", error);
      Alert.alert("Error", "Failed to add event. Please try again.");
    }
  };

  const editEvent = async () => {
    const token = await AsyncStorage.getItem('accessToken');
    try {
      const response = await axios.patch(`http://192.168.1.9:3000/event/${editingEvent._id}`, editingEvent, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEvents(events.map(event => (event._id === editingEvent._id ? response.data : event)));
      setEditingEvent(null);
      setModalVisible(false);
    } catch (error) {
      console.error("Error editing event:", error);
      Alert.alert("Error", "Failed to edit event. Please try again.");
    }
  };

  const deleteEvent = async (eventId, eventTitle) => {
    Alert.alert(
      "Confirm Deletion",
      `Are you sure you want to delete "${eventTitle}"?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: async () => {
            const token = await AsyncStorage.getItem('accessToken');
            try {
              await axios.delete(`http://192.168.1.9:3000/event/${eventId}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              setEvents(events.filter(event => event._id !== eventId));
              Alert.alert("Success", `"${eventTitle}" has been deleted.`);
            } catch (error) {
              console.error("Error deleting event:", error);
              Alert.alert("Error", "Failed to delete event. Please try again.");
            }
          },
          style: "destructive"
        }
      ],
      { cancelable: false }
    );
  };


  const resetEventForm = () => {
    setNewEvent({
      title: '',
      who: '',
      when: {
        startTime: new Date(),
        endTime: new Date(new Date().getTime() + 60 * 60 * 1000),
      },
      where: '',
      limit: '',
      about: '',
    });
  };

  const handleDateTimeChange = (event, selectedDate, type) => {
    const currentDate = selectedDate || (editingEvent ? editingEvent.when[type] : newEvent.when[type]);

    if (editingEvent) {
      setEditingEvent({
        ...editingEvent,
        when: { ...editingEvent.when, [type]: currentDate }
      });
    } else {
      setNewEvent({
        ...newEvent,
        when: { ...newEvent.when, [type]: currentDate }
      });
    }

    if (type === 'startTime') {
      setShowStartDatePicker(Platform.OS === 'ios');
      setShowStartTimePicker(Platform.OS === 'ios');
    } else {
      setShowEndDatePicker(Platform.OS === 'ios');
      setShowEndTimePicker(Platform.OS === 'ios');
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchEvents().then(() => setRefreshing(false));
  }, []);

  const renderEventCard = (event) => (
    <View key={event._id} style={styles.eventCard}>
      <Text style={styles.eventTitle}>{event.title}</Text>

      {isAdmin && (
        <View style={styles.buttonRow}>
          <Pressable style={styles.editButton} onPress={() => {
            setEditingEvent(event);
            setModalVisible(true);
          }}>
            <Text style={styles.editText}>Edit</Text>
          </Pressable>
          <Pressable
            style={styles.deleteButton}
            onPress={() => deleteEvent(event._id, event.title)}
          >
            <Text style={styles.deleteText}>Delete</Text>
          </Pressable>
        </View>
      )}

      <LinearGradient
        colors={['#001f3f', '#001f4f']}
        style={styles.detailsContainer}
      >
        <Text style={styles.detailText}>Who: {event.who}</Text>
        <Text style={styles.detailText}>Start: {new Date(event.when.startTime).toLocaleString()}</Text>
        <Text style={styles.detailText}>End: {new Date(event.when.endTime).toLocaleString()}</Text>
        <Text style={styles.detailText}>Where: {event.where}</Text>
        <Text style={styles.detailText}>Limit: {event.limit}</Text>
        <TouchableOpacity onPress={() => showAttendeesModal(event.attendees)}>
          <Text style={[styles.detailText, styles.clickableText]}>
            Attendees: {event.attendees ? event.attendees.length : 0}
          </Text>
        </TouchableOpacity>
      </LinearGradient>

      <Text style={styles.aboutText}>About: {event.about}</Text>

      {attendanceState && (
        <Pressable
          style={attendanceState[event._id] ? styles.unattendButton : styles.attendButton}
          onPress={() => toggleAttendance(event._id)}
        >
          <Text style={styles.attendText}>
            {attendanceState[event._id] ? 'Uninterested' : 'Interested'}
          </Text>
        </Pressable>
      )}
    </View>
  );

  const renderAttendeesModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={attendeesModalVisible}
      onRequestClose={() => setAttendeesModalVisible(false)}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalViews}>
          <Text style={styles.modalTitlee}>Attendees</Text>
          <ScrollView>
            {selectedEventAttendees.map((attendee, index) => (
              <View key={index} style={styles.attendeeItems}>
                <Text style={styles.attendeeName}>{attendee.firstName} {attendee.lastName}</Text>
                <Text style={styles.attendeeStatus}>{attendee.status}</Text>
              </View>
            ))}
          </ScrollView>
          <Pressable
            style={[styles.buttonClose]}
            onPress={() => setAttendeesModalVisible(false)}
          >
            <Text style={styles.textStyle}>Closes</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );

  const renderEventForm = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              setModalVisible(false);
              setEditingEvent(null);
            }}
          >
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{editingEvent ? 'Edit Event' : 'Add New Event'}</Text>
          <ScrollView style={styles.formScrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Title</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter title"
                value={editingEvent ? editingEvent.title : newEvent.title}
                onChangeText={(text) => editingEvent ? setEditingEvent({ ...editingEvent, title: text }) : setNewEvent({ ...newEvent, title: text })}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Who</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter who"
                value={editingEvent ? editingEvent.who : newEvent.who}
                onChangeText={(text) => editingEvent ? setEditingEvent({ ...editingEvent, who: text }) : setNewEvent({ ...newEvent, who: text })}
              />
            </View>

            <View style={styles.dateTimeContainer}>
              <View style={styles.dateTimeInput}>
                <Text style={styles.inputLabel}>Start Date</Text>
                <TouchableOpacity style={styles.dateTimePicker} onPress={() => setShowStartDatePicker(true)}>
                  <Text>{editingEvent ? new Date(editingEvent.when.startTime).toLocaleDateString() : newEvent.when.startTime.toLocaleDateString()}</Text>
                  <Ionicons name="calendar-outline" size={24} style={{ color: Colors.cobaltblue }} />
                </TouchableOpacity>
              </View>
              <View style={styles.dateTimeInput}>
                <Text style={styles.inputLabel}>Start Time</Text>
                <TouchableOpacity style={styles.dateTimePicker} onPress={() => setShowStartTimePicker(true)}>
                  <Text>{editingEvent ? new Date(editingEvent.when.startTime).toLocaleTimeString() : newEvent.when.startTime.toLocaleTimeString()}</Text>
                  <Ionicons name="time-outline" size={24} style={{ color: Colors.cobaltblue }} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.dateTimeContainer}>
              <View style={styles.dateTimeInput}>
                <Text style={styles.inputLabel}>End Date</Text>
                <TouchableOpacity style={styles.dateTimePicker} onPress={() => setShowEndDatePicker(true)}>
                  <Text>{editingEvent ? new Date(editingEvent.when.endTime).toLocaleDateString() : newEvent.when.endTime.toLocaleDateString()}</Text>
                  <Ionicons name="calendar-outline" size={24} style={{ color: Colors.cobaltblue }} />
                </TouchableOpacity>
              </View>
              <View style={styles.dateTimeInput}>
                <Text style={styles.inputLabel}>End Time</Text>
                <TouchableOpacity style={styles.dateTimePicker} onPress={() => setShowEndTimePicker(true)}>
                  <Text>{editingEvent ? new Date(editingEvent.when.endTime).toLocaleTimeString() : newEvent.when.endTime.toLocaleTimeString()}</Text>
                  <Ionicons name="time-outline" size={24} style={{ color: Colors.cobaltblue }} />
                </TouchableOpacity>
              </View>
            </View>

            {showStartDatePicker && (
              <DateTimePicker
                value={editingEvent ? new Date(editingEvent.when.startTime) : newEvent.when.startTime}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => handleDateTimeChange(event, selectedDate, 'startTime')}
              />
            )}

            {showStartTimePicker && (
              <DateTimePicker
                value={editingEvent ? new Date(editingEvent.when.startTime) : newEvent.when.startTime}
                mode="time"
                is24Hour={true}
                display="default"
                onChange={(event, selectedDate) => handleDateTimeChange(event, selectedDate, 'startTime')}
              />
            )}

            {showEndDatePicker && (
              <DateTimePicker
                value={editingEvent ? new Date(editingEvent.when.endTime) : newEvent.when.endTime}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => handleDateTimeChange(event, selectedDate, 'endTime')}
              />
            )}

            {showEndTimePicker && (
              <DateTimePicker
                value={editingEvent ? new Date(editingEvent.when.endTime) : newEvent.when.endTime}
                mode="time"
                is24Hour={true}
                display="default"
                onChange={(event, selectedDate) => handleDateTimeChange(event, selectedDate, 'endTime')}
              />
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Where</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter location"
                value={editingEvent ? editingEvent.where : newEvent.where}
                onChangeText={(text) => editingEvent ? setEditingEvent({ ...editingEvent, where: text }) : setNewEvent({ ...newEvent, where: text })}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Limit</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter limit"
                keyboardType="numeric"
                value={editingEvent ? editingEvent.limit : newEvent.limit}
                onChangeText={(text) => editingEvent ? setEditingEvent({ ...editingEvent, limit: text }) : setNewEvent({ ...newEvent, limit: text })}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>About</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="Enter description"
                value={editingEvent ? editingEvent.about : newEvent.about}
                onChangeText={(text) => editingEvent ? setEditingEvent({ ...editingEvent, about: text }) : setNewEvent({ ...newEvent, about: text })}
                multiline
              />
            </View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <Pressable
              style={[styles.button, styles.buttonSave]}
              onPress={editingEvent ? editEvent : addEvent}
            >
              <Text style={styles.textStyle}>{editingEvent ? 'Save Changes' : 'Add Event'}</Text>
            </Pressable>
            <Pressable

              style={[styles.button, styles.buttonCancel]}
              onPress={() => {
                setModalVisible(false);
                setEditingEvent(null);
              }}
            >
              <Text style={styles.textStyle}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );


  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text>Read through the event details provided, including the event name, date, time, venue (if physical), and any special instructions.</Text>
      {isAdmin && (
        <Pressable style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonText}>Add Event</Text>
        </Pressable>
      )}
      {renderEventForm()}
      {events.map(renderEventCard)}

      {renderAttendeesModal()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  addButton: {
    backgroundColor: '#3498db',
    padding: 10,
    marginBottom: 20,
    borderRadius: 50,
    alignSelf: 'flex-start',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  eventCard: {
    backgroundColor: '#dcdcdc',
    marginBottom: 20,
    borderRadius: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  eventTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#4b6584',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 10,
  },
  editButton: {
    backgroundColor: 'green',
    padding: 8,
    borderRadius: 50,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: 'red',
    padding: 8,
    borderRadius: 50,
  },
  editText: {
    color: '#fff',
    fontSize: 14,
  },
  deleteText: {
    color: '#fff',
    fontSize: 14,
  },
  detailsContainer: {
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
  },
  detailText: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 5,
  },
  aboutText: {
    fontSize: 14,
    color: '#4b6584',
    marginBottom: 10,
  },
  attendButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 50,
    alignSelf: 'flex-end',
  },
  unattendButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 50,
    alignSelf: 'flex-end',
  },
  attendText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  formScrollView: {
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    borderRadius: 10,
    padding: 15,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  buttonSave: {
    backgroundColor: Colors.cobaltblue,
  },
  buttonCancel: {
    backgroundColor: Colors.orange,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  clickableText: {
    textDecorationLine: 'underline',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  attendeeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  attendeeName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  attendeeStatus: {
    fontSize: 14,
    color: '#666',
  },
  buttonClose: {
    backgroundColor: Colors.cobaltblue,
    borderRadius: 20,
    padding: 10,
    paddingRight: 20,
    paddingLeft: 20,
    elevation: 2,
    marginTop: 15,
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 20,
    zIndex: 1,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dateTimeInput: {
    flex: 1,
    marginRight: 10,
  },
  dateTimePicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});