import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Modal, TextInput, Alert, Switch } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
const API_BASE_URL = 'http://192.168.1.9:3000'; // Replace with your actual API base URL

export default function Component({ route }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { userId } = route.params;
  const [profilePic, setProfilePic] = useState(null);
  useEffect(() => {
    fetchProfileData();
    fetchUserName()
  }, [userId]);
  const fetchUserName = async () => {
    try {

      const storedProfilePic = await AsyncStorage.getItem('profilePic');
      if (storedProfilePic) {
        setProfilePic(storedProfilePic);
      } else {
        const userInfo = await GoogleSignin.getCurrentUser();
        if (userInfo) {
          setFirstName(userInfo.user.givenName || 'Student');
          await AsyncStorage.setItem('firstname', userInfo.user.givenName || 'Student');
        }
      }
    } catch (error) {
      console.error('Error fetching user name:', error);
    }
  };
  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) throw new Error('Token not found');

      const response = await axios.get(`${API_BASE_URL}/user/profile/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProfileData(response.data);
    } catch (err) {
      console.error('Error fetching profile data:', err);
      setError('Failed to load profile data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  const handleSave = async (updatedPersonal, updatedMedical) => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const userId = await AsyncStorage.getItem('id');
      if (!token || !userId) throw new Error('User ID or token not found');

      await axios.patch(`${API_BASE_URL}/user/profile/${userId}`, {
        personal: updatedPersonal,
        medical: updatedMedical
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      await fetchProfileData();
      setModalVisible(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (err) {
      console.error('Error updating profile data:', err);
      setLoading(false);
      if (err.response && err.response.status === 403) {
        Alert.alert('Error', 'You are not authorized to update this profile');
      } else {
        Alert.alert('Error', 'Failed to update profile. Please try again.');
      }
    }
  };

  async function fetchFullData(data) {
    if (typeof data === 'string') {
      // If data is just an ID, fetch the full data
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const response = await axios.get(`${API_BASE_URL}/user/data/${data}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        return response.data;
      } catch (error) {
        console.error('Error fetching full data:', error);
        return {};
      }
    }
    return data; // If it's not an ID, return the data as is
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a4789" />
        <Text style={styles.loadingText}>Updating profile data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchProfileData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { personal, medical, education, assessment, immunization } = profileData;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {profilePic ? (
          <Image source={{ uri: profilePic }} style={styles.profilePicture} />
        ) : (
          <View style={styles.profilePicture}>
            <Text style={styles.profileLetter}>{personal?.firstName?.[0] || 'U'}</Text>
          </View>
        )}

        <View style={styles.healthInfo}>
          <HealthMetric label="Weight" value={medical?.weight || 'N/A'} />
          <HealthMetric label="Height" value={medical?.height || 'N/A'} />
          <HealthMetric label="BMI" value={medical?.bmi || 'N/A'} />
        </View>
        <TouchableOpacity style={styles.editButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <InfoSection title="Personal Information" data={personal} />
        <InfoSection title="Education Information" data={education} />
        <InfoSection title="Medical Information" data={medical} />


        {assessment && assessment.length > 0 && (
          <InfoSection title="Assessments" data={assessment[assessment.length - 1]} />
        )}

        {immunization && immunization.length > 0 && (
          <InfoSection title="Immunizations" data={immunization[immunization.length - 1]} />
        )}
      </View>

      <EditModal
        visible={modalVisible}
        personalInfo={personal}
        medicalInfo={medical}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
      />
    </ScrollView>
  );
}

const HealthMetric = ({ label, value }) => (
  <View style={styles.metricContainer}>
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={styles.metricValue}>{value}</Text>
  </View>
);

const InfoSection = ({ title, data }) => (
  <View style={styles.infoSection}>
    <Text style={styles.infoTitle}>{title}</Text>
    <View style={styles.infoContent}>
      {Object.entries(data || {}).map(([key, value]) => (
        <Text key={key} style={styles.infoText}>
          {`${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`}
        </Text>
      ))}
    </View>
  </View>
);

const EditModal = ({ visible, personalInfo, medicalInfo, onClose, onSave }) => {
  const [editedPersonal, setEditedPersonal] = useState(personalInfo || {});
  const [editedMedical, setEditedMedical] = useState(medicalInfo || {});
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    setEditedPersonal(personalInfo || {});
    setEditedMedical(medicalInfo || {});
  }, [personalInfo, medicalInfo]);

  const handlePersonalChange = (key, value) => {
    setEditedPersonal(prev => ({ ...prev, [key]: value }));
  };

  const handleMedicalChange = (key, value) => {
    setEditedMedical(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(editedPersonal, editedMedical);
  };

  const renderPersonalFields = () => {
    const fields = [
      { key: 'firstName', label: 'First Name' },
      { key: 'lastName', label: 'Last Name' },
      { key: 'sex', label: 'Sex', type: 'picker', options: ['Male', 'Female', 'Other'] },
      { key: 'civilStatus', label: 'Civil Status', type: 'picker', options: ['Single', 'Married', 'Divorced', 'Widowed'] },
      { key: 'dateOfBirth', label: 'Birthdate', type: 'date' },
      { key: 'address', label: 'Address' },
      { key: 'telNo', label: 'Tel. No.' },
      { key: 'religion', label: 'Religion' },
      { key: 'guardian', label: 'Guardian' },
      { key: 'guardianAddress', label: 'Guardian\'s Address' },
      { key: 'guardianTelNo', label: 'Guardian\'s Number' },
    ];

    return fields.map(field => (
      <View key={field.key} style={styles.inputContainer}>
        <Text style={styles.inputLabel}>{field.label}:</Text>
        {field.type === 'picker' ? (
          <Picker
            selectedValue={editedPersonal[field.key]}
            onValueChange={(value) => handlePersonalChange(field.key, value)}
            style={styles.picker}
          >
            {field.options.map(option => (
              <Picker.Item key={option} label={option} value={option} />
            ))}
          </Picker>
        ) : field.type === 'date' ? (
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <Text style={styles.dateText}>
              {editedPersonal.dateOfBirth ? new Date(editedPersonal.dateOfBirth).toDateString() : 'Select Date'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TextInput
            style={styles.input}
            value={editedPersonal[field.key]?.toString() || ''}
            onChangeText={(text) => handlePersonalChange(field.key, text)}
            placeholder={field.label}
          />
        )}
      </View>
    ));
  };

  const renderMedicalFields = () => {
    const stringFields = [
      'respiratory', 'digestive', 'nervous', 'excretory', 'endocrine',
      'circulatory', 'skeletal', 'muscular', 'reproductive', 'lymphatic',
      'allergy', 'specificAllergy'
    ];

    const booleanFields = ['smoking', 'drinking'];

    return (
      <>
        {stringFields.map(field => (
          <View key={field} style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{field.charAt(0).toUpperCase() + field.slice(1)}:</Text>
            <TextInput
              style={styles.input}
              value={editedMedical[field]?.toString() || ''}
              onChangeText={(text) => handleMedicalChange(field, text)}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            />
          </View>
        ))}
        {booleanFields.map(field => (
          <View key={field} style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{field.charAt(0).toUpperCase() + field.slice(1)}:</Text>
            <Switch
              value={editedMedical[field] === true}
              onValueChange={(value) => handleMedicalChange(field, value)}
            />
          </View>
        ))}
      </>
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <ScrollView>
            <Text style={styles.modalTitle}>Edit Personal Information</Text>
            {renderPersonalFields()}

            <Text style={styles.modalTitle}>Edit Medical Information</Text>
            {renderMedicalFields()}
          </ScrollView>
          <View style={styles.modalButtons}>
            <TouchableOpacity style={[styles.button, styles.buttonClose]} onPress={onClose}>
              <Text style={styles.textStyle}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.buttonSave]} onPress={handleSave}>
              <Text style={styles.textStyle}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {showDatePicker && (
        <DateTimePicker
          value={editedPersonal.dateOfBirth ? new Date(editedPersonal.dateOfBirth) : new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              handlePersonalChange('dateOfBirth', selectedDate.toISOString());
            }
          }}
        />
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  header: {
    backgroundColor: '#1a4789',
    padding: 20,
    alignItems: 'center',
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#8e44ad',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileLetter: {
    fontSize: 48,
    color: 'white',
    fontWeight: 'bold',
  },
  healthInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  metricContainer: {
    alignItems: 'center',
  },
  metricLabel: {
    color: 'white',
    fontSize: 16,
  },
  metricValue: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  editButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  editButtonText: {
    color: 'white',
    fontSize: 14,
  },
  content: {
    padding: 15,
  },
  infoSection: {
    backgroundColor: 'white',
    marginBottom: 15,
    padding: 15,
    borderRadius: 10,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoContent: {
    flexDirection: 'column',
  },
  infoText: {
    fontSize: 14,
    marginBottom: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#1a4789',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#1a4789',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1a4789',
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    minWidth: 100,
  },
  buttonClose: {
    backgroundColor: '#ff6347',
  },
  buttonSave: {
    backgroundColor: '#1a4789',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});