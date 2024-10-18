import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import moment from 'moment';
import DatePicker from '../Components/DatePicker';
import EventDetailsModal from '../Components/EventDetailsModal'; // Import EventDetailsModal
import AddEventButton from '../Components/AddEventButton'; // Import AddEventButton
import EventActionsModal from '../Components/EventActionsModal'; // Import EventActionsModal
import Colors from '../../constants/Colors';


const ScheduleScreen = () => {
  const [events, setEvents] = useState({});
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [actionsModalVisible, setActionsModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const handleAddEvent = () => {
    if (title && startDate && endDate) {
      if (moment(startDate).isAfter(endDate)) {
        alert("Start date cannot be after end date");
        return;
      }

      let newEvents = { ...events };
      let currentDate = moment(startDate);

      while (currentDate.isSameOrBefore(endDate)) {
        const dateString = currentDate.format('YYYY-MM-DD');
        newEvents[dateString] = newEvents[dateString] || { events: [] };

        newEvents[dateString].events = [...newEvents[dateString].events, {
          id: `${dateString}-${newEvents[dateString].events.length}`,
          title,
          start: startDate,
          end: endDate
        }];

        const eventCount = newEvents[dateString].events.length;
        newEvents[dateString].color = eventCount === 1 ? 'sblue' : eventCount === 2 ? 'mblue' : 'lblue';
        newEvents[dateString].textColor = 'white';

        const prevDate = currentDate.clone().subtract(1, 'days').format('YYYY-MM-DD');
        const nextDate = currentDate.clone().add(1, 'days').format('YYYY-MM-DD');

        // Adjust starting/ending days based on whether adjacent dates have events
        if (!newEvents[prevDate] || newEvents[prevDate].events.length === 0) {
          newEvents[dateString].startingDay = true;
        }

        if (!newEvents[nextDate] || newEvents[nextDate].events.length === 0) {
          newEvents[dateString].endingDay = true;
        }

        currentDate = currentDate.add(1, 'days');
      }

      setEvents(newEvents);
      setTitle('');
      setStartDate('');
      setEndDate('');
    }
  };

  const handleDayPress = (day) => {
    if (events[day.dateString]) {
      setSelectedEvents(events[day.dateString].events);
      setModalVisible(true);
    } else {
      setSelectedEvents([]);
      setModalVisible(false);
    }
  };

  const handleSaveEvent = (updatedEvent) => {
    let updatedEvents = { ...events };
    const dateString = moment(updatedEvent.start).format('YYYY-MM-DD');
    updatedEvents[dateString] = updatedEvents[dateString] || { events: [] };

    const eventIndex = updatedEvents[dateString].events.findIndex((e) => e.title === selectedEvent.title);
    updatedEvents[dateString].events[eventIndex] = updatedEvent;
    setEvents(updatedEvents);
    setActionsModalVisible(false);
  };

  const handleDeleteEvent = () => {
    let updatedEvents = { ...events };
    const dateString = moment(selectedEvent.start).format('YYYY-MM-DD');

    if (updatedEvents[dateString]) {
      updatedEvents[dateString].events = updatedEvents[dateString].events.filter(
        (e) => e.title !== selectedEvent.title
      );

      if (updatedEvents[dateString].events.length === 0) {
        delete updatedEvents[dateString];
      }

      setEvents(updatedEvents);
    }

    setActionsModalVisible(false);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setActionsModalVisible(false);
    setSelectedEvent(null);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Add New Event</Text>

      <TextInput
        style={styles.input}
        placeholder="Add Title"
        value={title}
        onChangeText={setTitle}
      />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <DatePicker date={startDate} setDate={setStartDate} label="Start Date" />
        <DatePicker date={endDate} setDate={setEndDate} label="End Date" />
      </View>


      <AddEventButton onPress={handleAddEvent} />


      <Calendar
        markedDates={Object.keys(events).reduce((acc, date) => {
          const prevDate = moment(date).subtract(1, 'days').format('YYYY-MM-DD');
          const nextDate = moment(date).add(1, 'days').format('YYYY-MM-DD');
          const eventCount = events[date].events.length;

          acc[date] = {
            marked: true,
            color: eventCount === 1 ? Colors.sblue : eventCount === 2 ? Colors.mblue : Colors.cobaltblue,
            textColor: 'white',
            startingDay: !events[prevDate] || events[prevDate].events.length === 0,
            endingDay: !events[nextDate] || events[nextDate].events.length === 0,
          };

          return acc;
        }, {})}
        onDayPress={handleDayPress}
        markingType={'period'}
        theme={{
          selectedDayBackgroundColor: Colors.cobaltblue,
          todayTextColor: Colors.cobaltblue,
          arrowColor: Colors.cobaltblue,
        }}
      />

      <EventDetailsModal
        visible={modalVisible}
        events={selectedEvents}
        onClose={() => setModalVisible(false)}
        onEdit={(event) => {
          setSelectedEvent(event);
          setActionsModalVisible(true);
        }}
      />

      <EventActionsModal
        visible={actionsModalVisible}
        event={selectedEvent}
        onClose={() => setActionsModalVisible(false)}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.lgray,
    padding: 10,
    marginVertical: 5,
    borderRadius: 20,
    backgroundColor: '#fff',
  },
});

export default ScheduleScreen;
