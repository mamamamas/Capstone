// components/Banner.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../../constants/Colors';

const Banner = ({ title, subtitle, description }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    backgroundColor: Colors.cobaltblue,
    width: '95%',
    paddingHorizontal: 30,
    paddingVertical: 20,
    paddingTop: 30,
    paddingBottom: 30,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 27,
    color: Colors.white,
    textAlign: 'justify',
  },
  subtitle: {
    fontWeight: 'bold',
    fontSize: 20,
    color: Colors.white,
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: Colors.white,
    textAlign: 'justify',
  },
});

export default Banner;
