import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl, SafeAreaView, Modal, TextInput, Dimensions, Animated, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import moment from 'moment';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BackHandler } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const HOUR_HEIGHT = 60;

const INITIAL_EVENTS = [
  {
    id: '1',
    title: 'Student Vaccination',
    start: '2024-10-28 09:00',
    end: '2024-10-28 11:00',
    color: '#0047AB', // Cobalt Blue
    location: 'School Clinic',
    icon: 'medical',
    maxParticipants: 50,
    forWhom: 'All Students',
    when: '2024-10-28 09:00 - 11:00',
    where: 'School Clinic',
    interested: 45,
    about: 'Annual vaccination program for all students. Please bring your vaccination cards.'
  },
  {
    id: '2',
    title: 'First Aid Training',
    start: '2024-10-28 13:00',
    end: '2024-10-28 15:00',
    color: '#0047AB', // Cobalt Blue
    location: 'Gymnasium',
    icon: 'fitness',
    maxParticipants: 30,
    forWhom: 'Staff',
    when: '2024-10-28 13:00 - 15:00',
    where: 'Gymnasium',
    interested: 25,
    about: 'Mandatory first aid training for all staff members. Learn essential life-saving techniques.'
  },
  {
    id: '3',
    title: 'Health Committee Meeting',
    start: '2024-10-29 10:00',
    end: '2024-10-29 11:00',
    color: '#1565C0',
    location: 'Conference Room',
    icon: 'people',
    maxParticipants: 15,
    forWhom: 'Committee Members',
    when: '2024-10-29 10:00 - 11:00',
    where: 'Conference Room',
    interested: 12,
    about: 'Monthly meeting to discuss and plan health initiatives for the school.'
  },
  {
    id: '4',
    title: 'Annual Health Check-ups',
    start: '2024-10-30 09:00',
    end: '2024-11-01 16:00',
    color: '#0D47A1',
    location: 'School Clinic',
    icon: 'clipboard',
    maxParticipants: 100,
    forWhom: 'All Students and Staff',
    when: '2024-10-30 09:00 - 2024-11-01 16:00',
    where: 'School Clinic',
    interested: 95,
    about: 'Comprehensive health check-ups for all students and staff. Schedule your appointment early.'
  },
  {
    id: '5',
    title: 'Mental Health Seminar',
    start: '2024-11-02 14:00',
    end: '2024-11-02 16:00',
    color: '#2196F3',
    location: 'Auditorium',
    icon: 'brain',
    maxParticipants: 200,
    forWhom: 'All Students',
    when: '2024-11-02 14:00 - 16:00',
    where: 'Auditorium',
    interested: 180,
    about: 'Informative seminar on mental health awareness and coping strategies for students.'
  },
  {
    id: '6',
    title: 'Health and Wellness Workshop',
    start: '2024-11-05 09:00',
    end: '2024-11-07 11:00',
    color: '#64B5F6',
    location: 'School Auditorium',
    icon: 'fitness',
    maxParticipants: 100,
    forWhom: 'All Students and Staff',
    when: '2024-11-05 09:00 - 2024-11-07 11:00',
    where: 'School Auditorium',
    interested: 85,
    about: 'A comprehensive three-day workshop covering various aspects of health and wellness.'
  },
  {
    id: '7',
    title: 'Dental Check-ups',
    start: '2024-11-10 08:00',
    end: '2024-11-12 16:00',
    color: '#1E88E5',
    location: 'School Clinic',
    icon: 'medical',
    maxParticipants: 150,
    forWhom: 'All Students',
    when: '2024-11-10 08:00 - 2024-11-12 16:00',
    where: 'School Clinic',
    interested: 120,
    about: 'Annual dental check-ups for all students. Schedule your appointment early.'
  },
  {
    id: '8',
    title: 'Nutrition Seminar',
    start: '2024-11-15 13:00',
    end: '2024-11-15 15:00',
    color: '#1976D2',
    location: 'Cafeteria',
    icon: 'restaurant',
    maxParticipants: 75,
    forWhom: 'All Students and Staff',
    when: '2024-11-15 13:00 - 15:00',
    where: 'Cafeteria',
    interested: 60,
    about: 'Learn about balanced diets and healthy eating habits from nutrition experts.'
  },
  {
    id: '9',
    title: 'CPR Training',
    start: '2024-11-18 10:00',
    end: '2024-11-19 12:00',
    color: '#1565C0',
    location: 'Gymnasium',
    icon: 'fitness',
    maxParticipants: 40,
    forWhom: 'Staff',
    when: '2024-11-18 10:00 - 2024-11-19 12:00',
    where: 'Gymnasium',
    interested: 35,
    about: 'Two-day CPR training session for all staff members. Learn this life-saving technique.'
  },
];

const getRandomColor = () => {
  const currentDate = moment();
  const eventDate = moment(newEvent.start);
  return eventDate.isSame(currentDate, 'day') ? '#0047AB' : '#4169E1'; // Cobalt Blue for current day, Royal Blue for upcoming
};

export default function ScheduleScreen() {
  const [currentDate, setCurrentDate] = useState(moment());
  const [selectedDate, setSelectedDate] = useState(moment());
  const [events, setEvents] = useState([]);
  const [view, setView] = useState('month');
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    start: new Date(),
    end: new Date(moment().add(1, 'hour').toDate()),
    location: '',
    maxParticipants: '',
    forWhom: '',
    when: '',
    where: '',
    interested: '',
    about: '',
  });
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [animatedValue] = useState(new Animated.Value(0));
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (view === 'day') {
          setView('month');
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start();
          return true;
        }
        return false;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [view, animatedValue])
  );

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await fetch('http://192.168.1.9:3000/schedule', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();
      console.log(data);
      if (data.scheduleItems) {
        const currentDate = moment();

        // Filter out past events
        const futureEvents = data.scheduleItems.filter(item => {
          const end = moment(item.end || item.when?.endTime);
          return end.isSameOrAfter(currentDate); // Include events that are still valid today
        });

        setEvents(futureEvents.map((item, index) => ({
          ...item,
          id: item.id || item._id || `event-${index}`, // Ensure there's always an ID
          start: moment(item.start).toDate(),
          end: moment(item.end).toDate(),
          color: item.type === 'requestForm' ? '#4CAF50' : '#1976D2',
          icon: item.type === 'requestForm' ? 'document-text' : 'calendar',
        })));
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  }, []);


  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchEvents();
    } finally {
      setRefreshing(false);
    }
  }, [fetchEvents]);

  const handleAddEvent = useCallback(async () => {
    if (newEvent.title && newEvent.start && newEvent.end) {
      try {
        const response = await fetch('http://192.168.1.9:3000/schedule', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newEvent),
        });
        const result = await response.json();
        if (result.success) {
          fetchEvents(); // Refresh the events list
          setModalVisible(false);
          setNewEvent({
            title: '',
            start: new Date(),
            end: new Date(moment().add(1, 'hour').toDate()),
            // ... (reset other fields)
          });
        } else {
          alert('Failed to add event');
        }
      } catch (error) {
        console.error('Error adding event:', error);
        alert('Failed to add event');
      }
    } else {
      alert('Please fill in all required fields.');
    }
  }, [newEvent, fetchEvents]);
  const getEventStartTime = (event) => {
    if (event.type === 'requestForm') {
      return event.start;
    }
    return event.when?.startTime || event.timestamp;
  };

  const getEventKey = (item) => {
    if (item._id) return item._id;
    if (item.formId) return item.formId;
    if (item.id) return item.id;
    return item.timestamp?.toString() || Math.random().toString();
  };

  const handleDateSelect = useCallback((date) => {
    setSelectedDate(date);
    setView('day');
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);


  const markedDates = useMemo(() => {
    const marked = {};
    events.forEach(event => {
      const startDate = moment(event.when?.startTime || event.start || event.appointmentDate);
      const endDate = moment(event.when?.endTime || event.end || event.appointmentDate);
      const isMultiDay = !startDate.isSame(endDate, 'day');

      for (let date = startDate.clone(); date.isSameOrBefore(endDate, 'day'); date.add(1, 'day')) {
        const dateString = date.format('YYYY-MM-DD');
        if (!marked[dateString]) {
          marked[dateString] = { marked: true, dots: [] };
        }
        marked[dateString].dots.push({
          color: isMultiDay ? '#4169E1' : '#0047AB', // Royal Blue for multi-day, Cobalt Blue for single-day
          isMultiDay: isMultiDay,
          isStart: date.isSame(startDate, 'day'),
          isEnd: date.isSame(endDate, 'day')
        });
      }
    });
    return marked;
  }, [events]);


  const renderMonthView = useCallback(() => {
    const monthStart = currentDate.clone().startOf('month');
    const monthEnd = currentDate.clone().endOf('month');
    const startDate = monthStart.clone().startOf('week');
    const endDate = monthEnd.clone().endOf('week');

    const dateArray = [];
    let day = startDate.clone();

    while (day.isSameOrBefore(endDate)) {
      dateArray.push(day.clone());
      day.add(1, 'day');
    }

    const weeks = [];
    for (let i = 0; i < dateArray.length; i += 7) {
      weeks.push(dateArray.slice(i, i + 7));
    }

    return (
      <View style={styles.monthContainer}>
        <View style={styles.weekDays}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((weekDay, index) => (
            <Text key={index} style={styles.weekDayText}>{weekDay}</Text>
          ))}
        </View>
        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.week}>
            {week.map((date, dateIndex) => {
              const isCurrentMonth = date.month() === currentDate.month();
              const isToday = date.isSame(moment(), 'day');
              const isSelected = date.isSame(selectedDate, 'day');
              const dateString = date.format('YYYY-MM-DD');
              const hasEvents = markedDates && markedDates[dateString]?.marked;

              return (
                <TouchableOpacity
                  key={dateIndex}
                  style={[
                    styles.day,
                    isToday && styles.today,
                    isSelected && styles.selectedDay,
                    !isCurrentMonth && styles.otherMonth,
                  ]}
                  onPress={() => handleDateSelect(date)}
                  accessibilityLabel={`Select ${date.format('MMMM D, YYYY')}`}
                  accessibilityRole="button"
                >
                  <Text style={[
                    styles.dayText,
                    isToday && styles.todayText,
                    isSelected && styles.selectedDayText,
                    !isCurrentMonth && styles.otherMonthText,
                  ]}>
                    {date.format('D')}
                  </Text>
                  {hasEvents && (
                    <View style={styles.eventDotsContainer}>
                      {markedDates[dateString].dots.map((dot, index) => (
                        <View
                          key={index}
                          style={[
                            styles.eventDot,
                            { backgroundColor: dot.color },
                            dot.isMultiDay && styles.multiDayEventDot,
                            dot.isStart && styles.multiDayEventStart,
                            dot.isEnd && styles.multiDayEventEnd
                          ]}
                        />
                      ))}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    );
  }, [currentDate, selectedDate, markedDates, handleDateSelect]);




  const renderDayView = useCallback(() => {
    const normalizedSelectedDate = selectedDate.clone().startOf('day');

    // Filter events for the selected date
    const dayEvents = events.filter(event => {
      const eventStart = moment(event.start || event.when?.startTime).startOf('day');
      const eventEnd = event.end ? moment(event.end).startOf('day') : eventStart; // Use start if no end
      return eventStart.isSame(normalizedSelectedDate, 'day') || eventEnd.isSame(normalizedSelectedDate, 'day');
    });

    // Time slots for each hour of the day
    const timeSlots = Array.from({ length: 24 }, (_, i) => i);

    return (
      <View style={styles.dayViewContainer}>
        <View style={styles.allDayEventsContainer}>
          {dayEvents.filter(event => {
            const eventStart = moment(event.start).startOf('day');
            const eventEnd = event.end ? moment(event.end).startOf('day') : eventStart;
            return eventStart.isSame(normalizedSelectedDate, 'day') && eventStart.isBefore(eventEnd, 'day');
          }).map((event, index) => (
            <View key={index} style={[styles.allDayEvent, { backgroundColor: event.color }]}>
              <Text style={styles.allDayEventTitle}>{event.title}</Text>
              <Text style={styles.allDayEventTime}>
                {moment(event.start).format('MMM D')} - {event.end ? moment(event.end).format('MMM D') : ""}
              </Text>
            </View>
          ))}
        </View>

        <FlatList
          data={timeSlots}
          keyExtractor={(item) => `timeslot-${item}`}
          renderItem={({ item: hour }) => {
            const time = normalizedSelectedDate.clone().hour(hour);

            const eventsAtTime = dayEvents.filter(event => {
              const eventStart = moment(event.start || event.when?.startTime);
              return eventStart.isSame(normalizedSelectedDate, 'day') && eventStart.hour() === hour;
            });

            return (
              <View style={styles.timeSlot}>
                <Text style={styles.timeText}>{time.format('h:mm A')}</Text>
                <View style={styles.eventContainer}>
                  {eventsAtTime.map((event, index) => {
                    const eventStart = moment(event.start || event.when?.startTime);
                    const eventEnd = event.end ? moment(event.end) : eventStart.clone().add(15, 'minutes'); // Default 15 min duration if no end

                    const durationHours = moment.duration(eventEnd.diff(eventStart)).asHours();
                    const height = durationHours * HOUR_HEIGHT;

                    const iconName = event.icon === 'brain' ? 'brain' : (event.icon || 'calendar');
                    const IconComponent = event.icon === 'brain' ? FontAwesome5 : Ionicons;

                    return (
                      <View key={index} style={[
                        styles.event,
                        {
                          backgroundColor: event.color,
                          height: height > 0 ? height : 25,
                          top: (eventStart.minutes() / 60) * HOUR_HEIGHT
                        }
                      ]}>
                        <IconComponent name={iconName} size={16} color="#fff" style={styles.eventIcon} />
                        <View style={styles.eventDetails}>
                          <Text style={styles.eventTitle}>{event.title}</Text>
                          <Text style={styles.eventTime}>
                            {`${eventStart.format('h:mm A')} - ${eventEnd.format('h:mm A')}`}
                          </Text>
                          {event.location && <Text style={styles.eventLocation}>{event.location}</Text>}
                          <Text style={styles.eventParticipants}>Max: {event.limit}</Text>
                          <Text style={styles.eventForWhom}>For: {event.who}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          }}
          contentContainerStyle={styles.dayViewContent}
          initialScrollIndex={6} // Start at a middle time like 6 AM
          getItemLayout={(data, index) => ({
            length: HOUR_HEIGHT,
            offset: HOUR_HEIGHT * index,
            index,
          })}
        />
      </View>
    );
  }, [selectedDate, events]);



  const renderEventList = useCallback(({ item }) => {
    const iconName = item.icon === 'brain' ? 'brain' : (item.icon || 'calendar');
    const IconComponent = item.icon === 'brain' ? FontAwesome5 : Ionicons;
    const isRequestForm = item.type === 'requestForm';

    let startTime, endTime;
    if (isRequestForm) {
      startTime = item.start;
      endTime = item.end;
    } else if (item.when && item.when.startTime && item.when.endTime) {
      startTime = item.when.startTime;
      endTime = item.when.endTime;
    } else {
      startTime = item.timestamp;
      endTime = item.timestamp;
    }

    const isCurrentEvent = moment(startTime).isSameOrBefore(moment(), 'day') &&
      moment(endTime).isSameOrAfter(moment(), 'day');
    const eventColor = isCurrentEvent ? '#0047AB' : '#4169E1'; // Cobalt Blue for current, Royal Blue for upcoming

    return (
      <View style={[styles.eventListItem, { backgroundColor: eventColor }]}>
        <IconComponent name={iconName} size={24} color="#fff" style={styles.eventListIcon} />
        <View style={styles.eventListDetails}>
          <Text style={styles.eventListTitle}>{item.title}</Text>
          <Text style={styles.eventListTime}>
            {moment(startTime).format('MMM D, h:mm A')} - {moment(endTime).format('MMM D, h:mm A')}
          </Text>
          <Text style={styles.eventListLocation}>{item.where || 'N/A'}</Text>
          <Text style={styles.eventListParticipants}>Max Participants: {item.limit || 'N/A'}</Text>
          <Text style={styles.eventListForWhom}>For: {item.who || 'N/A'}</Text>
          {!isRequestForm && <Text style={styles.eventListInterested}>Interested: {item.interested || 'N/A'}</Text>}
          <Text style={styles.eventListAbout}>{item.about || 'No description available'}</Text>
        </View>
      </View>
    );
  }, []);
  const renderAddEventModal = useCallback(() => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <ScrollView contentContainerStyle={styles.modalContent}>
          <Text style={styles.modalTitle}>Add New Event</Text>
          <TextInput
            style={styles.input}
            placeholder="Event Title"
            value={newEvent.title}
            onChangeText={(text) => setNewEvent({ ...newEvent, title: text })}
          />
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowStartDatePicker(true)}
          >
            <Text>{moment(newEvent.start).format('YYYY-MM-DD h:mm A')}</Text>
          </TouchableOpacity>
          {showStartDatePicker && (
            <DateTimePicker
              value={newEvent.start}
              mode="datetime"
              is24Hour={false}
              display="default"
              onChange={(event, selectedDate) => {
                setShowStartDatePicker(Platform.OS === 'ios');
                if (selectedDate)
                  setNewEvent({ ...newEvent, start: selectedDate });
              }}
            />
          )}
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowEndDatePicker(true)}
          >
            <Text>{moment(newEvent.end).format('YYYY-MM-DD h:mm A')}</Text>
          </TouchableOpacity>
          {showEndDatePicker && (
            <DateTimePicker
              value={newEvent.end}
              mode="datetime"
              is24Hour={false}
              display="default"
              onChange={(event, selectedDate) => {
                setShowEndDatePicker(Platform.OS === 'ios');
                if (selectedDate)
                  setNewEvent({ ...newEvent, end: selectedDate });
              }}
            />
          )}
          <TextInput
            style={styles.input}
            placeholder="Location"
            value={newEvent.location}
            onChangeText={(text) => setNewEvent({ ...newEvent, location: text, where: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Max Participants"
            value={newEvent.maxParticipants}
            onChangeText={(text) => setNewEvent({ ...newEvent, maxParticipants: text })}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="For Whom"
            value={newEvent.forWhom}
            onChangeText={(text) => setNewEvent({ ...newEvent, forWhom: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Interested"
            value={newEvent.interested}
            onChangeText={(text) => setNewEvent({ ...newEvent, interested: text })}
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="About"
            value={newEvent.about}
            onChangeText={(text) => setNewEvent({ ...newEvent, about: text })}
            multiline
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, styles.modalButtonPrimary]} onPress={handleAddEvent}>
              <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>Add Event</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  ), [modalVisible, newEvent, handleAddEvent, showStartDatePicker, showEndDatePicker]);

  const renderContent = useCallback(() => {
    const todayEvents = events.filter(event => {
      const startTime = moment(event.when?.startTime || event.start);
      const endTime = moment(event.when?.endTime || event.end);
      return startTime.isSameOrBefore(moment(), 'day') && endTime.isSameOrAfter(moment(), 'day');
    });

    const upcomingEvents = events.filter(event => {
      const startTime = moment(event.when?.startTime || event.start);
      return startTime.isAfter(moment(), 'day');
    });

    // Debug logs to verify the filtered events
    console.log("Today's Events:", todayEvents);
    console.log("Upcoming Events:", upcomingEvents);

    return (
      <>
        <Animated.View style={[styles.monthView, { opacity: monthViewOpacity, display: view === 'month' ? 'flex' : 'none' }]}>
          <View style={styles.monthSelector}>
            <TouchableOpacity onPress={() => setCurrentDate(currentDate.clone().subtract(1, 'month'))}>
              <Ionicons name="chevron-back" size={24} color="#1976D2" />
            </TouchableOpacity>
            <Text style={styles.monthText}>{currentDate.format('MMMM YYYY')}</Text>
            <TouchableOpacity onPress={() => setCurrentDate(currentDate.clone().add(1, 'month'))}>
              <Ionicons name="chevron-forward" size={24} color="#1976D2" />
            </TouchableOpacity>
          </View>
          {renderMonthView()}
          <ScrollView style={styles.plansScrollView}>
            <View style={styles.todayPlan}>
              <Text style={styles.sectionTitle}>Today's plan</Text>
              <FlatList
                data={todayEvents}
                renderItem={renderEventList}
                keyExtractor={item => item._id ? item._id.toString() : item.id.toString()}
                ListEmptyComponent={<Text style={styles.noEventsText}>No events scheduled for today</Text>}
                scrollEnabled={false}
              />
            </View>
            <View style={styles.upcomingPlans}>
              <Text style={styles.sectionTitle}>Upcoming plans</Text>
              <FlatList
                data={upcomingEvents}
                renderItem={renderEventList}
                keyExtractor={item => item._id ? item._id.toString() : item.id.toString()}
                ListEmptyComponent={<Text style={styles.noEventsText}>No upcoming events</Text>}
                scrollEnabled={false}
              />
            </View>
          </ScrollView>
        </Animated.View>

        <Animated.View style={[styles.dayView, { opacity: dayViewOpacity, display: view === 'day' ? 'flex' : 'none' }]}>
          <View style={styles.dayViewHeader}>
            <TouchableOpacity onPress={() => {
              setView('month');
              Animated.timing(animatedValue, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
              }).start();
            }}>
              <Ionicons name="chevron-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.dayViewTitle}>{selectedDate.format('MMMM D, YYYY')}</Text>
          </View>
          <Text style={styles.greeting}>Today is {selectedDate.format('dddd')}</Text>
          {renderDayView()}
        </Animated.View>
      </>
    );
  }, [view, monthViewOpacity, dayViewOpacity, currentDate, selectedDate, events, renderMonthView, renderDayView, renderEventList, animatedValue]);

  const monthViewOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  const dayViewOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>School Clinic Schedule</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={() => {
            setCurrentDate(moment());
            setSelectedDate(moment());
            setView('month');
          }} style={styles.headerButton}>
            <Ionicons name="today-outline" size={24} color="#1E88E5" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={[{ key: 'content' }]}
        renderItem={() => renderContent()}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1976D2']} // Android
            tintColor="#1976D2" // iOS
            title="Pull to refresh" // iOS
            titleColor="#1976D2" // iOS
          />
        }
      />

      {renderAddEventModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 16,
    color: '#1E88E5',
  },
  content: {
    flexGrow: 1,
  },
  monthView: {
    flex: 1,
  },
  dayView: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  monthText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  monthContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 16,
    padding: 8,
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekDayText: {
    color: '#888',
    fontSize: 12,
  },
  week: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  day: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  dayText: {
    fontSize: 14,
  },
  today: {
    backgroundColor: 'rgba(25, 118, 210, 0.5)', // Darker blue (#1976D2) with 50% opacity
    borderRadius: 8,
  },
  todayText: {
    color: '#fff',
  },
  selectedDay: {
    backgroundColor: 'rgba(30, 136, 229, 0.3)',
    borderRadius: 8,
  },
  selectedDayText: {
    color: '#1E88E5',
    fontWeight: 'bold',
  },
  otherMonth: {
    opacity: 0.3,
  },
  otherMonthText: {
    color: '#888',
  },
  eventDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 4,
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 1,
  },
  multiDayEventDot: {
    width: 24,
    height: 4,
    borderRadius: 2,
  },
  multiDayEventStart: {
    borderTopLeftRadius: 2,
    borderBottomLeftRadius: 2,
  },
  multiDayEventEnd: {
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  plansScrollView: {
    flex: 1,
  },
  todayPlan: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  upcomingPlans: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dayViewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  dayViewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  greeting: {
    fontSize: 16,
    color: '#888',
    marginLeft: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  dayViewContent: {
    paddingBottom: 16,
  },
  timeSlot: {
    flexDirection: 'row',
    height: HOUR_HEIGHT,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  timeText: {
    width: 60,
    textAlign: 'right',
    paddingRight: 8,
    color: '#888',
  },
  eventContainer: {
    flex: 1,
    position: 'relative',
  },
  event: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 4,
    borderRadius: 4,
    marginBottom: 2,
    marginRight: 8,
    position: 'absolute',
    left: 0,
    right: 0,
  },
  eventIcon: {
    marginRight: 4,
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    color: '#fff',
    fontWeight: 'bold',
  },
  eventTime: {
    color: '#fff',
    fontSize: 12,
  },
  eventLocation: {
    color: '#fff',
    fontSize: 12,
    fontStyle: 'italic',
  },
  eventParticipants: {
    color: '#fff',
    fontSize: 12,
  },
  eventForWhom: {
    color: '#fff',
    fontSize: 12,
    fontStyle: 'italic',
  },
  eventListItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  eventListIcon: {
    marginRight: 12,
  },
  eventListDetails: {
    flex: 1,
  },
  eventListTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  eventListTime: {
    color: '#fff',
    fontSize: 14,
  },
  eventListLocation: {
    color: '#fff',
    fontSize: 14,
    fontStyle: 'italic',
  },
  eventListParticipants: {
    color: '#fff',
    fontSize: 12,
  },
  eventListForWhom: {
    color: '#fff',
    fontSize: 12,
    fontStyle: 'italic',
  },
  eventListInterested: {
    color: '#fff',
    fontSize: 12,
  },
  eventListAbout: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
  noEventsText: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: SCREEN_WIDTH - 40,
    maxHeight: SCREEN_HEIGHT - 80,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    padding: 8,
    marginBottom: 12,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    padding: 8,
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  modalButtonPrimary: {
    backgroundColor: '#1976D2',
  },
  modalButtonText: {
    color: '#1976D2',
    fontWeight: 'bold',
  },
  modalButtonTextPrimary: {
    color: '#fff',
  },
  dayViewContainer: {
    flex: 1,
  },
  allDayEventsContainer: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  allDayEvent: {
    padding: 4,
    borderRadius: 4,
    marginBottom: 4,
  },
  allDayEventTitle: {
    color: '#fff',
    fontWeight: 'bold',
  },
  allDayEventTime: {
    color: '#fff',
    fontSize: 12,
  },
});