// screens/TabScreens/ServicesScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Colors from '../../constants/Colors';

const HealthTipsScreen = () => {
  return (
    <ScrollView contentContainerStyle={styles.contentContainer}>
     
     
      <View style={styles.textContainer}>
        <Text style={[styles.text, { fontWeight: 'bold', marginBottom: 10, fontSize: 20}]}>
        Simple Health Tips for a Better Lifestyle
        </Text>
        <Text style={styles.text}> 
        Adopting healthy habits can improve both your physical and mental well-being. These tips are easy to integrate into your daily routine and will help you maintain a balanced and energized life.
        </Text>
      </View>
      <View style = {{width: '80%', marginBottom: 12,}}>
      <Text style={[styles.text, {color: Colors.cobaltblue, fontSize: 12,}]}> 
      Staying consistent with these small changes is key to long-term benefits. Even a few minutes of focused effort every day can lead to noticeable improvements over time.
        </Text>
      </View>
     
     
      <View style={styles.textContainer}>
        <Text style={[styles.text, { fontWeight: 'bold', marginBottom: 10 , fontSize: 20}]}>
        Stay Hydrated
        </Text>
        <Text style={[styles.text, {fontWeight: 'bold',}]}>
        What to Do: 
       
        </Text>
        <Text style={styles.text}>
        Drink at least 8 glasses of water daily.
       
        </Text>
        <Text style={[styles.text, {fontWeight: 'bold', marginTop: 10}]}>
        Why it matters: 
       
        </Text>
        <Text style={styles.text}>
        Water helps your body function optimally and keeps your energy levels stable.
       
        </Text>
      </View>

      <View style={styles.textContainer}>
        <Text style={[styles.text, { fontWeight: 'bold', marginBottom: 10 , fontSize: 20}]}>
        Eat Balanced Meals
        </Text>
        <Text style={[styles.text, {fontWeight: 'bold',}]}>
        What to Do: 
       
        </Text>
        <Text style={styles.text}>
        Include fruits, vegetables, lean proteins, whole grains, and healthy fats in your meals.
       
        </Text>
        <Text style={[styles.text, {fontWeight: 'bold', marginTop: 10}]}>
        Why it matters: 
       
        </Text>
        <Text style={styles.text}>
        A balanced diet supports overall health, provides necessary nutrients, and boosts immunity.
        </Text>
      </View>

      <View style={styles.textContainer}>
        <Text style={[styles.text, { fontWeight: 'bold', marginBottom: 10 , fontSize: 20}]}>
        Exercise Regularly
        </Text>
        <Text style={[styles.text, {fontWeight: 'bold',}]}>
        What to Do: 
       
        </Text>
        <Text style={styles.text}>
        Engage in at least 30 minutes of physical activity like walking, yoga, or strength training most days of the week.
       
        </Text>
        <Text style={[styles.text, {fontWeight: 'bold', marginTop: 10}]}>
        Why it matters: 
       
        </Text>
        <Text style={styles.text}>
        Regular exercise improves cardiovascular health, strengthens muscles, and lifts your mood.
        </Text>
      </View>

      <View style={styles.textContainer}>
        <Text style={[styles.text, { fontWeight: 'bold', marginBottom: 10 , fontSize: 20}]}>
        Get Enough Sleep
        </Text>
        <Text style={[styles.text, {fontWeight: 'bold',}]}>
        What to Do: 
       
        </Text>
        <Text style={styles.text}>
        Aim for 7-9 hours of quality sleep every night.
       
        </Text>
        <Text style={[styles.text, {fontWeight: 'bold', marginTop: 10}]}>
        Why it matters: 
       
        </Text>
        <Text style={styles.text}>
        Sleep helps repair your body, boosts memory, and keeps your immune system strong.
        </Text>
      </View>

      <View style={styles.textContainer}>
        <Text style={[styles.text, { fontWeight: 'bold', marginBottom: 10 , fontSize: 20}]}>
        Manage Stress
        </Text>
        <Text style={[styles.text, {fontWeight: 'bold',}]}>
        What to Do: 
       
        </Text>
        <Text style={styles.text}>
        Practice mindfulness, deep breathing, or take regular breaks to unwind.
       
        </Text>
        <Text style={[styles.text, {fontWeight: 'bold', marginTop: 10}]}>
        Why it matters: 
       
        </Text>
        <Text style={styles.text}>
        Reducing stress improves mental health, enhances productivity, and helps prevent burnout.
        </Text>
      </View>

      <View style={styles.textContainer}>
        <Text style={[styles.text, { fontWeight: 'bold', marginBottom: 10 , fontSize: 20}]}>
        Maintain Good Hygiene
        </Text>
        <Text style={[styles.text, {fontWeight: 'bold',}]}>
        What to Do: 
       
        </Text>
        <Text style={styles.text}>
        Wash your hands regularly, brush and floss your teeth daily, and shower consistently.
        </Text>
        <Text style={[styles.text, {fontWeight: 'bold', marginTop: 10}]}>
        Why it matters: 
       
        </Text>
        <Text style={styles.text}>
        Good hygiene habits help prevent infections and maintain general well-being.
        </Text>
      </View>

      <View style={styles.textContainer}>
        <Text style={[styles.text, { fontWeight: 'bold', marginBottom: 10 , fontSize: 20}]}>
        Limit Screen Time
        </Text>
        <Text style={[styles.text, {fontWeight: 'bold',}]}>
        What to Do: 
       
        </Text>
        <Text style={styles.text}>
        Take breaks from screens every 30-60 minutes and reduce device use before bed.
        </Text>
        <Text style={[styles.text, {fontWeight: 'bold', marginTop: 10}]}>
        Why it matters: 
       
        </Text>
        <Text style={styles.text}>
        It helps reduce eye strain, improves posture, and supports better sleep.
        </Text>
      </View>


      <View style={styles.textContainer}>
        <Text style={[styles.text, { fontWeight: 'bold', marginBottom: 10 , fontSize: 20}]}>
        Get Regular Checkups
        </Text>
        <Text style={[styles.text, {fontWeight: 'bold',}]}>
        What to Do: 
       
        </Text>
        <Text style={styles.text}>
        Schedule routine health checkups and screenings.
        </Text>
        <Text style={[styles.text, {fontWeight: 'bold', marginTop: 10}]}>
        Why it matters: 
       
        </Text>
        <Text style={styles.text}>
        Early detection of health issues can help prevent more serious conditions.
        </Text>
      </View>

      <View style={styles.textContainer}>
        <Text style={[styles.text, { fontWeight: 'bold', marginBottom: 10 , fontSize: 20}]}>
        Build Strong Relationships

        </Text>
        <Text style={[styles.text, {fontWeight: 'bold',}]}>
        What to Do: 
       
        </Text>
        <Text style={styles.text}>
        Spend time with family and friends, or engage in social activities.
        </Text>
        <Text style={[styles.text, {fontWeight: 'bold', marginTop: 10}]}>
        Why it matters: 
       
        </Text>
        <Text style={styles.text}>
        Healthy social connections are important for mental and emotional well-being.
        </Text>
      </View>

      <View style={styles.textContainer}>
        <Text style={[styles.text, { fontWeight: 'bold', marginBottom: 10 , fontSize: 20}]}>
        Avoid Harmful Habits
        </Text>
        <Text style={[styles.text, {fontWeight: 'bold',}]}>
        What to Do: 
       
        </Text>
        <Text style={styles.text}>
        Quit smoking and drink alcohol in moderation.
        </Text>
        <Text style={[styles.text, {fontWeight: 'bold', marginTop: 10}]}>
        Why it matters: 
       
        </Text>
        <Text style={styles.text}>
        Smoking and excessive drinking have long-term negative effects on your heart, lungs, and liver.
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
    padding: 20,
    paddingBottom: 30,
    borderRadius: 50,
    marginBottom: 20, // Space between sections
    
  },
  text: {
    fontSize: 15,
    color: Colors.white,
    textAlign: 'justify',
  },
 
});

export default HealthTipsScreen;
