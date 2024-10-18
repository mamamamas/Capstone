import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import Colors from '../../constants/Colors';

const DatePicker = ({ date, setDate, label }) => {
  const [showPicker, setShowPicker] = useState(false);

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || new Date();
    setShowPicker(false);
    setDate(moment(currentDate).format('YYYY-MM-DD'));
  };

  return (
    <View style={styles.container}>
      <Text>{label}</Text>
      <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.dateInput}>
        <Text>{date ? date : 'Select Date'}</Text>
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display="default"
          onChange={onChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,  // Takes up equal space in parent
  },
  dateInput: {
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.lgray,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginVertical: 5,
    width: '100%',
  },
});

export default DatePicker;
