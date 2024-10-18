import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';

const CategorySelector = ({ selectedCategory, onSelectCategory }) => {
  return (
    <View style={styles.buttonContainer}>
      {['JHS', 'SHS', 'College'].map((category) => (
        <Pressable
          key={category}
          style={[
            styles.pressable,
            selectedCategory === category && styles.selectedPressable
          ]}
          onPress={() => onSelectCategory(category)}
        >
          <Text style={styles.pressableText}>{category}</Text>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  pressable: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#d3d3d3',
  },
  selectedPressable: {
    backgroundColor: '#1E90FF',
  },
  pressableText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default CategorySelector;
