import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const grades = {
  JHS: ['Grade 7', '8', '9', '10'],
  SHS: ['11', '12'],
  College: ['1st Year', '2nd Year', '3rd Year', '4th Year'],
};

const GradePicker = ({ selectedCategory, selectedGrade, onSelectGrade }) => {
  return (
    <View style={styles.pickerContainer}>
      <Picker
        selectedValue={selectedGrade}
        onValueChange={(itemValue) => onSelectGrade(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label={`Select ${selectedCategory} Grade`} value={null} />
        {grades[selectedCategory].map((grade) => (
          <Picker.Item key={grade} label={grade} value={grade} />
        ))}
      </Picker>
    </View>
  );
};

const styles = StyleSheet.create({
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 90,
    padding: 1,
    marginBottom: 10,
  },
  picker: {
    width: '100%',
  },
});

export default GradePicker;
