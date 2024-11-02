import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Modal, TextInput, TouchableOpacity, Platform, Alert, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

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


  useEffect(() => {
    fetchEvents();
    fetchCurrentUserId();
    loadAttendanceState();
    fetchUserRole();
  }, []);

  const fetchEvents = async () => {
    const token = await AsyncStorage.getItem('accessToken');
    try {
      const response = await axios.get("http://192.168.1.15:3000/event", {
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

  const fetchUserRole = async () => {
    try {
      const role = await AsyncStorage.getItem('role');
      setIsAdmin(role === 'admin' || role === "staff"); // Set true only if the role is 'admin'
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
    try {
      const response = await axios.post(`http://192.168.1.15:3000/event/${eventId}/attend`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const newAttendanceState = {
        ...attendanceState,
        [eventId]: !attendanceState[eventId]
      };

      setAttendanceState(newAttendanceState);
      await saveAttendanceState(newAttendanceState);

      setEvents(events.map(event => {
        if (event._id === eventId) {
          const updatedAttendees = event.attendees || [];
          if (updatedAttendees.includes(currentUserId)) {
            return { ...event, attendees: updatedAttendees.filter(id => id !== currentUserId) };
          } else {
            return { ...event, attendees: [...updatedAttendees, currentUserId] };
          }
        }
        return event;
      }));

      Alert.alert("Success", response.data.message);
    } catch (error) {
      console.error("Error toggling attendance:", error);
      Alert.alert("Error", error.response?.data?.message || "Failed to update attendance. Please try again.");
    }
  };

  const addEvent = async () => {
    const token = await AsyncStorage.getItem('accessToken');
    console.log(token);
    try {
      const response = await axios.post("http://192.168.1.15:3000/event", newEvent, {
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
      const response = await axios.patch(`http://192.168.1.15:3000/event/${editingEvent._id}`, editingEvent, {
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
              await axios.delete(`http://192.168.1.15:3000/event/${eventId}`, {
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
        <Text style={styles.detailText}>Attendees: {event.attendees ? event.attendees.length : 0}</Text>
      </LinearGradient>

      <Text style={styles.aboutText}>About: {event.about}</Text>


      <Pressable
        style={attendanceState[event._id] ? styles.unattendButton : styles.attendButton}
        onPress={() => toggleAttendance(event._id)}
      >
        <Text style={styles.attendText}>
          {attendanceState[event._id] ? 'Uninterested' : 'Interested'}
        </Text>
      </Pressable>

    </View>
  );

  const renderEventForm = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalView}>
        <ScrollView style={styles.formScrollView} showsVerticalScrollIndicator={false}>
          <Text style={styles.modalTitle}>{editingEvent ? 'Edit Event' : 'Add New Event'}</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Title:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter title"
              value={editingEvent ? editingEvent.title : newEvent.title}
              onChangeText={(text) => editingEvent ? setEditingEvent({ ...editingEvent, title: text }) : setNewEvent({ ...newEvent, title: text })}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Who:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter who"
              value={editingEvent ? editingEvent.who : newEvent.who}
              onChangeText={(text) => editingEvent ? setEditingEvent({ ...editingEvent, who: text }) : setNewEvent({ ...newEvent, who: text })}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Start Date:</Text>
            <TouchableOpacity onPress={() => setShowStartDatePicker(true)}>
              <TextInput
                style={styles.input}
                placeholder="Select start date"
                value={editingEvent ? new Date(editingEvent.when.startTime).toLocaleDateString() : newEvent.when.startTime.toLocaleDateString()}
                editable={false}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Start Time:</Text>
            <TouchableOpacity onPress={() => setShowStartTimePicker(true)}>
              <TextInput
                style={styles.input}
                placeholder="Select start time"
                value={editingEvent ? new Date(editingEvent.when.startTime).toLocaleTimeString() : newEvent.when.startTime.toLocaleTimeString()}
                editable={false}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>End Date:</Text>
            <TouchableOpacity onPress={() => setShowEndDatePicker(true)}>
              <TextInput
                style={styles.input}
                placeholder="Select end date"
                value={editingEvent ? new Date(editingEvent.when.endTime).toLocaleDateString() : newEvent.when.endTime.toLocaleDateString()}
                editable={false}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>End Time:</Text>
            <TouchableOpacity onPress={() => setShowEndTimePicker(true)}>
              <TextInput
                style={styles.input}
                placeholder="Select end time"
                value={editingEvent ? new Date(editingEvent.when.endTime).toLocaleTimeString() : newEvent.when.endTime.toLocaleTimeString()}
                editable={false}
              />
            </TouchableOpacity>
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
            <Text style={styles.inputLabel}>Where:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter location"
              value={editingEvent ? editingEvent.where : newEvent.where}
              onChangeText={(text) => editingEvent ? setEditingEvent({ ...editingEvent, where: text }) : setNewEvent({ ...newEvent, where: text })}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Limit:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter limit"
              value={editingEvent ? editingEvent.limit : newEvent.limit}
              onChangeText={(text) => editingEvent ? setEditingEvent({ ...editingEvent, limit: text }) : setNewEvent({ ...newEvent, limit: text })}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>About:</Text>
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

      {events.map(renderEventCard)}
      {renderEventForm()}
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
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  formScrollView: {
    flex: 1,
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    width: '100%',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    flex: 1,
    marginHorizontal: 5,
  },
  buttonSave: {
    backgroundColor: '#2196F3',
  },
  buttonCancel: {
    backgroundColor: '#f44336',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});