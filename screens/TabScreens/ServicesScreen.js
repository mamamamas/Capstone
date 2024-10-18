// screens/TabScreens/ServicesScreen.js
import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import Colors from '../../constants/Colors';

const ServicesScreen = () => {
  return (
    <ScrollView contentContainerStyle={styles.contentContainer}>
      <Image
        source={require('../../assets/medpic1.png')}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.textContainer}>
        <Text style={[styles.text, { fontWeight: 'bold', marginBottom: 10, fontSize: 20 }]}>
          General Consultation
        </Text>
        <Text style={styles.text}>
          Provides medical assessment and advice for common health concerns such as colds, headaches, and minor injuries.
        </Text>
      </View>

      <Image
        source={require('../../assets/medpic2.png')}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.textContainer}>
        <Text style={[styles.text, { fontWeight: 'bold', marginBottom: 10, fontSize: 20 }]}>
          First Aid Treatment
        </Text>
        <Text style={styles.text}>
          Immediate care for minor injuries like cuts, bruises, or sprains, ensuring students receive prompt attention.
        </Text>
      </View>

      <Image
        source={require('../../assets/medpic3.png')}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.textContainer}>
        <Text style={[styles.text, { fontWeight: 'bold', marginBottom: 10, fontSize: 20 }]}>
          Health Screening
        </Text>
        <Text style={styles.text}>
          Routine checks for vision, hearing, and other health indicators to ensure early detection of potential issues.
        </Text>
      </View>


      <Image
        source={require('../../assets/medpic4.png')}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.textContainer}>
        <Text style={[styles.text, { fontWeight: 'bold', marginBottom: 10, fontSize: 20 }]}>
          Immunization Programs
        </Text>
        <Text style={styles.text}>
          Administering vaccines to protect students and staff against preventable diseases, following school or government guidelines.
        </Text>
      </View>

      <Image
        source={require('../../assets/medpic5.png')}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.textContainer}>
        <Text style={[styles.text, { fontWeight: 'bold', marginBottom: 10, fontSize: 20 }]}>
          Health Record Maintenance
        </Text>
        <Text style={styles.text}>
          Keeping detailed medical records for each student, ensuring confidentiality and providing updated health information as needed.
        </Text>
      </View>


      <Image
        source={require('../../assets/medpic6.png')}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.textContainer}>
        <Text style={[styles.text, { fontWeight: 'bold', marginBottom: 10, fontSize: 20 }]}>
          Medication Administration
        </Text>
        <Text style={styles.text}>
          Administering prescribed medications to students during school hours as per physician’s orders, ensuring proper dosage and safety.
        </Text>
      </View>


      <Image
        source={require('../../assets/medpic7.png')}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.textContainer}>
        <Text style={[styles.text, { fontWeight: 'bold', marginBottom: 10, fontSize: 20 }]}>
          Referrals to Specialists
        </Text>
        <Text style={styles.text}>
          Coordination with external healthcare providers for cases that require specialized medical attention or further investigation.
        </Text>
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: Colors.lgray,
    paddingVertical: 20, // Optional padding for spacing
  },
  textContainer: {
    width: '95%',
    backgroundColor: Colors.cobaltblue,
    padding: 15,
    paddingBottom: 30,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    marginBottom: 20, // Space between sections

  },
  text: {
    fontSize: 15,
    color: Colors.white,
    textAlign: 'justify',
  },
  image: {
    width: '95%',
    height: 200,
    marginBottom: -10,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
});

export default ServicesScreen;
