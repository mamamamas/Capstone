import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

// Departments for college
const departments = ['COI', 'CHTM', 'CBAA'];

const DepartmentPicker = ({ selectedDepartment, onSelectDepartment }) => {
  return (
    <View style={styles.pickerContainer}>
      <Picker
        selectedValue={selectedDepartment}
        onValueChange={(itemValue) => onSelectDepartment(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Select Department" value={null} />
        {departments.map((department) => (
          <Picker.Item key={department} label={department} value={department} />
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

export default DepartmentPicker;
