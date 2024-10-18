import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Colors from '../../constants/Colors';

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
  
        newEvents[dateString].events.push({ title, start: startDate, end: endDate });
  
        if (currentDate.isSame(startDate)) {
          newEvents[dateString].startingDay = true;
        }
        if (currentDate.isSame(endDate)) {
          newEvents[dateString].endingDay = true;
        }
  
        newEvents[dateString].color = 'green';
        newEvents[dateString].textColor = 'white';
  
        currentDate = currentDate.add(1, 'days');
      }
  
      setEvents(newEvents);
      setTitle('');
      setStartDate('');
      setEndDate('');
    }
  };
  

const AddEventButton = ({ onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.addButton}>
      <Text style={styles.addButtonText}>Add Event</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  addButton: {
    backgroundColor: Colors.cobaltblue,
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    marginVertical: 10,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default AddEventButton;
