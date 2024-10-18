import React from 'react';
import { View, Text, ScrollView, StyleSheet, Image } from 'react-native';
import Colors from '../constants/Colors'

const AboutUsScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.staffContainer}>
        {/* Health Services Director */}
        <View style={styles.staffCard}>
          <Image source={require('../assets/1.jpg')} style={styles.avatar} />
          <View>
            <Text style={styles.title}>Director, Health Services</Text>
            <Text style={styles.name}>Wesley C. VINLUAN, MD</Text>
          </View>
        </View>

        {/* Health Services Coordinator */}
        <View style={styles.staffCard}>
          <Image source={require('../assets/2.jpg')} style={styles.avatar} />
          <View>
            <Text style={styles.title}>COORDINATOR, Health Services</Text>
            <Text style={styles.name}>Archel Antonio, RN</Text>
          </View>
        </View>

        {/* Section Header - Medical */}
        <Text style={styles.sectionHeader}>MEDICAL</Text>

        {/* Medical Staff */}
        <View style={styles.staffCard}>
          <Image source={require('../assets/3.jpg')} style={styles.avatar} />
          <View>
            <Text style={styles.title}>MD, MBA, DPCON</Text>
            <Text style={styles.name}>Robert Joseph G. Rubio</Text>
          </View>
        </View>
        <View style={styles.staffCard}>
          <Image source={require('../assets/4.jpg')} style={styles.avatar} />
          <View>
            <Text style={styles.title}>Neill Elvin D. HAYAG</Text>
            <Text style={styles.name}>MD</Text>
          </View>
        </View>


        {/* Section Header - Dental */}
        <Text style={styles.sectionHeader}>DENTAL</Text>

        {/* Dental Staff */}
        <View style={styles.staffCard}>
          <Image source={require('../assets/5.jpg')} style={styles.avatar} />
          <View>
            <Text style={styles.title}>Jomariezen Talag - Amar </Text>
            <Text style={styles.name}>DMD</Text>
          </View>
        </View>
        <View style={styles.staffCard}>
          <Image source={require('../assets/6.jpg')} style={styles.avatar} />
          <View>
            <Text style={styles.title}>Rolando C. Herrera</Text>
            <Text style={styles.name}>DMD, MPM</Text>
          </View>
        </View>
        {/* Add more dental staff here */}
      </View>

      <Text style={[styles.sectionHeader, { marginTop: -10 }]}>MEDICAL</Text>

      {/* Medical Staff */}
      <View style={styles.staffCard}>
        <Image source={require('../assets/7.jpg')} style={styles.avatar} />
        <View>
          <Text style={styles.title}>Joli Anne R. Rioflorido</Text>
          <Text style={styles.name}>RN, SHS Nurse</Text>
        </View>
      </View>
      <View style={styles.staffCard}>
        <Image source={require('../assets/8.jpg')} style={styles.avatar} />
        <View>
          <Text style={styles.title}>Sheryl Abigail R. GarGar</Text>
          <Text style={styles.name}>Elementary Nurse</Text>
        </View>
      </View>
      <View style={styles.staffCard}>
        <Image source={require('../assets/9.jpg')} style={styles.avatar} />
        <View>
          <Text style={styles.title}>Erika Camille M. Calma</Text>
          <Text style={styles.name}>SHS Nurse</Text>
        </View>
      </View>
      <View style={styles.staffCard}>
        <Image source={require('../assets/10.jpg')} style={styles.avatar} />
        <View>
          <Text style={styles.title}>Arianne Mae C. Antonio, RN</Text>
          <Text style={styles.name}>College Nurse</Text>
        </View>
      </View>
      <View style={styles.staffCard}>
        <Image source={require('../assets/11.jpg')} style={styles.avatar} />
        <View>
          <Text style={styles.title}>Ronaldo P. Desagon</Text>
          <Text style={styles.name}>RN SHS Nurse</Text>
        </View>
      </View>
      <View style={styles.staffCard}>
        <Image source={require('../assets/12.jpg')} style={styles.avatar} />
        <View>
          <Text style={styles.title}>Guendylyn P. Cueno</Text>
          <Text style={styles.name}>College Nurse</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#F0F0F0',
  },
  staffContainer: {
    marginBottom: 20,
  },
  staffCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cobaltblue,
    borderRadius: 70,
    padding: 15,
    marginVertical: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  title: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  name: {
    color: '#FFFFFF',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginVertical: 10,
  },
});

export default AboutUsScreen;
