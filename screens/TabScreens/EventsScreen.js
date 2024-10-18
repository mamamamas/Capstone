import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Modal, TextInput, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';

const EventsScreen = ({ isAdmin }) => {
  const [events, setEvents] = useState([
    {
      id: 1,
      title: 'Bakuna',
      who: 'All',
      when: new Date('2024-10-06T12:24:00'),
      where: 'Gym',
      limit: '2',
      interested: '1',
      about: 'scascas',
      userInterested: true,
    },
    {
      id: 2,
      title: 'Vaccine',
      who: 'All',
      when: new Date('2024-10-04T09:45:00'),
      where: 'Gym',
      limit: 'None',
      interested: '3',
      about: 'asdasd',
      userInterested: false,
    },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    who: '',
    when: new Date(),
    where: '',
    limit: '',
    interested: '0',
    about: '',
  });

  const toggleInterest = (eventId) => {
    setEvents(events.map(event =>
      event.id === eventId
        ? { ...event, userInterested: !event.userInterested, interested: event.userInterested ? String(Number(event.interested) - 1) : String(Number(event.interested) + 1) }
        : event
    ));
  };

  const addEvent = () => {
    setEvents([...events, { ...newEvent, id: events.length + 1, userInterested: false }]);
    setNewEvent({
      title: '',
      who: '',
      when: new Date(),
      where: '',
      limit: '',
      interested: '0',
      about: '',
    });
    setModalVisible(false);
  };

  const editEvent = () => {
    setEvents(events.map(event =>
      event.id === editingEvent.id ? editingEvent : event
    ));
    setEditingEvent(null);
    setModalVisible(false);
  };

  const deleteEvent = (eventId) => {
    setEvents(events.filter(event => event.id !== eventId));
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || (editingEvent ? editingEvent.when : newEvent.when);
    setShowDatePicker(Platform.OS === 'ios');
    if (editingEvent) {
      setEditingEvent({ ...editingEvent, when: currentDate });
    } else {
      setNewEvent({ ...newEvent, when: currentDate });
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || (editingEvent ? editingEvent.when : newEvent.when);
    setShowTimePicker(Platform.OS === 'ios');
    if (editingEvent) {
      const newDate = new Date(editingEvent.when);
      newDate.setHours(currentTime.getHours());
      newDate.setMinutes(currentTime.getMinutes());
      setEditingEvent({ ...editingEvent, when: newDate });
    } else {
      const newDate = new Date(newEvent.when);
      newDate.setHours(currentTime.getHours());
      newDate.setMinutes(currentTime.getMinutes());
      setNewEvent({ ...newEvent, when: newDate });
    }
  };

  const renderEventCard = (event) => (
    <View key={event.id} style={styles.eventCard}>
      <Text style={styles.eventTitle}>{event.title}</Text>

      {isAdmin && (
        <View style={styles.buttonRow}>
          <Pressable style={styles.editButton} onPress={() => {
            setEditingEvent(event);
            setModalVisible(true);
          }}>
            <Text style={styles.editText}>Edit</Text>
          </Pressable>
          <Pressable style={styles.deleteButton} onPress={() => deleteEvent(event.id)}>
            <Text style={styles.deleteText}>Delete</Text>
          </Pressable>
        </View>
      )}

      <LinearGradient
        colors={['#001f3f', '#001f4f']}
        style={styles.detailsContainer}
      >
        <Text style={styles.detailText}>Who: {event.who}</Text>
        <Text style={styles.detailText}>When: {event.when.toLocaleString()}</Text>
        <Text style={styles.detailText}>Where: {event.where}</Text>
        <Text style={styles.detailText}>Limit: {event.limit}</Text>
        <Text style={styles.detailText}>Interested: {event.interested}</Text>
      </LinearGradient>

      <Text style={styles.aboutText}>About: {event.about}</Text>

      {!isAdmin && (
        <Pressable
          style={event.userInterested ? styles.uninterestedButton : styles.interestedButton}
          onPress={() => toggleInterest(event.id)}
        >
          <Text style={styles.interestedText}>
            {event.userInterested ? 'Uninterested' : 'Interested'}
          </Text>
        </Pressable>
      )}
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
        <ScrollView
          style={styles.formScrollView}
          showsVerticalScrollIndicator={false}
        >
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
            <Text style={styles.inputLabel}>Date:</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <TextInput
                style={styles.input}
                placeholder="Select date"
                value={editingEvent ? editingEvent.when.toLocaleDateString() : newEvent.when.toLocaleDateString()}
                editable={false}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Time:</Text>
            <TouchableOpacity onPress={() => setShowTimePicker(true)}>
              <TextInput
                style={styles.input}
                placeholder="Select time"
                value={editingEvent ? editingEvent.when.toLocaleTimeString() : newEvent.when.toLocaleTimeString()}
                editable={false}
              />
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={editingEvent ? editingEvent.when : newEvent.when}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={editingEvent ? editingEvent.when : newEvent.when}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={handleTimeChange}
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
            <Text style={styles.inputLabel}>Interested:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter number of interested"
              value={editingEvent ? editingEvent.interested : newEvent.interested}
              onChangeText={(text) => editingEvent ? setEditingEvent({ ...editingEvent, interested: text }) : setNewEvent({ ...newEvent, interested: text })}
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
    >
      {isAdmin && (
        <Pressable style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      )}

      {events.map(renderEventCard)}
      {renderEventForm()}
    </ScrollView>
  );
};

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
  interestedButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 50,
    alignSelf: 'flex-end',
  },
  uninterestedButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 50,
    alignSelf: 'flex-end',
  },
  interestedText: {
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

export default EventsScreen;