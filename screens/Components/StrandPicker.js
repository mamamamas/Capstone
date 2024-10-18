import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const strands = ['ABM', 'HUMSS', 'STEM'];

const StrandPicker = ({ selectedStrand, onSelectStrand }) => {
  return (
    <View style={styles.pickerContainer}>
      <Picker
        selectedValue={selectedStrand}
        onValueChange={(itemValue) => onSelectStrand(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Select Strand" value={null} />
        {strands.map((strand) => (
          <Picker.Item key={strand} label={strand} value={strand} />
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
    marginBottom: 10
  },
  picker: {
    width: '100%',
  },
});

export default StrandPicker;
