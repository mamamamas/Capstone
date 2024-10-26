import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';

const StudentListDisplay = ({ level, department, strand, gradeLevel, section }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchStudents = async () => {
      const token = await AsyncStorage.getItem('accessToken');
      try {
        setLoading(true);
        const response = await axios.get('http://192.168.1.9:3000/medical', {
          params: {
            educationLevel: level,
            yearlvl: gradeLevel,
            strand: strand || undefined,
            course: department || '',
            section,
          },
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(response.data);
        setStudents(response.data);
      } catch (err) {
        console.error('Error fetching students:', err);
        setError('Failed to load students');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [level, department, strand, gradeLevel, section]);

  const handlePress = (userId) => {
    navigation.navigate('StudentDetails', { userId });
  };

  if (loading) {
    return <Text style={styles.loadingText}>Loading...</Text>;
  }

  if (error) {
    return <Text style={styles.errorText}>{error}</Text>;
  }

  return (
    <View style={styles.container}>
      {students.length > 0 ? (
        <FlatList
          data={students}
          keyExtractor={(item) => item.personal.userId}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handlePress(item.personal.userId)}>
              <View style={styles.studentCard}>
                <Text style={styles.studentName}>
                  {item.personal.firstName} {item.personal.lastName}
                </Text>
                <Text style={styles.studentYear}>Year Level: {item.yearlvl}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <Text style={styles.noStudentsText}>No students found for the selected criteria.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f4f4',
  },
  studentCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 25,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  studentName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  studentYear: {
    fontSize: 16,
    fontWeight: '400',
    color: '#666',
  },
  noStudentsText: {
    fontSize: 18,
    color: '#ff5252',
    textAlign: 'center',
    marginTop: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#007AFF',
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#ff5252',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default StudentListDisplay;