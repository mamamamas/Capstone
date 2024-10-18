// StudentList.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const StudentList = ({ students, onStudentSelect }) => {
  if (students.length === 0) {
    return <Text>No students found</Text>;
  }

  return (
    <View style={styles.container}>
      {students.map((student) => (
        <TouchableOpacity
          key={student.id}
          style={styles.item}
          onPress={() => onStudentSelect(student)}
        >
          <Text style={styles.name}>{student.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },
  item: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    marginBottom: 5,
    borderRadius: 5,
  },
  name: {
    fontSize: 16,
  },
});

export default StudentList;
