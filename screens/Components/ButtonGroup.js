// components/ButtonGroup.js
import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import Colors from '../../constants/Colors';

const ButtonGroup = ({ buttons }) => {
  return (
    <View style={styles.container}>
      {buttons.map((button, index) => (
        <Pressable
          key={index}
          style={[styles.button, button.style]}
          onPress={button.onPress}
        >
          <Text style={styles.buttonText}>{button.text}</Text>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    width: '95%',
  },
  button: {
    backgroundColor: Colors.white,
    borderRadius: 30,
    padding: 10,
    width: '45%',
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 19,
  },
});

export default ButtonGroup;
