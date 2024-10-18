import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const CoursePicker = ({ selectedCourse, courseOptions, onSelectCourse }) => {
  return (
    <View style={styles.pickerContainer}>
      <Picker
        selectedValue={selectedCourse}
        onValueChange={(itemValue) => onSelectCourse(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Select Course" value={null} />
        {courseOptions.map((course) => (
          <Picker.Item key={course} label={course} value={course} />
        ))}
      </Picker>
    </View>
  );
};

const styles = StyleSheet.create({
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
  },
  picker: {
    width: '100%',
  },
});

export default CoursePicker;
