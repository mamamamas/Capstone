import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const SectionPicker = ({ selectedCategory, selectedSection, sectionOptions, onSelectSection }) => {
  return (
    <View style={styles.pickerContainer}>
      <Picker
        selectedValue={selectedSection}
        onValueChange={(itemValue) => onSelectSection(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Select Section" value={null} />
        {sectionOptions.map((section) => (
          <Picker.Item key={section} label={section} value={section} />
        ))}
      </Picker>
    </View>
  );
};

const styles = StyleSheet.create({
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 50,
    padding: 1,
  },
  picker: {
    width: '100%',
  },
});

export default SectionPicker;
