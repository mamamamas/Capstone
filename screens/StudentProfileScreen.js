import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, PermissionsAndroid, ActivityIndicator, Modal, TextInput, Alert, Switch, Button, Pressable } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons'; // or any icon library you're using
import { GoogleSignin } from '@react-native-google-signin/google-signin';
const API_BASE_URL = 'http://192.168.1.9:3000'; // Replace with your actual API base URL
import * as ImagePicker from 'expo-image-picker';
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

  const requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: "Camera Permission",
          message: "App needs access to your camera.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );

      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false; // Handle the error appropriately
    }
  };


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

      const user = response.data;

      console.log('Fetched user data:', JSON.stringify(response.data, null, 2));

      if (user.personal && user.personal.dateOfBirth) {
        user.personal.dateOfBirth = formatDate(user.personal.dateOfBirth);
        console.log("Formatted Date of Birth:", user.personal.dateOfBirth);
      } else {
        console.error("Date of Birth is undefined or null");
      }


      setProfileData(user);


      if (user.pfp) {
        setProfilePic(user.pfp);
        await AsyncStorage.setItem('profilePic', user.pfp);
      }


      if (user.personal && user.personal.firstName) {
        await AsyncStorage.setItem('firstname', user.personal.firstName);
      }
    } catch (err) {
      console.error('Error fetching profile data:', err);
      setError('Failed to load profile data. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('en-US', options);

    return formattedDate;
  }


  const pickImage = async () => {
    const hasPermission = await requestCameraPermission(); // Request camera permission
    if (!hasPermission) {
      Alert.alert("Permission denied", "You need to allow camera access to use this feature.");
      return; // Exit if permission is not granted
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    console.log(result);
    if (!result.canceled && result.assets && result.assets.length > 0) {
      // Correctly extract the URI
      const uri = result.assets[0].uri; // Get the URI from the assets array
      uploadImage(uri); // Pass the correct URI to uploadImage
    } else {
      console.log("Image selection was canceled or no image was selected.");
    }
  };


  const uploadImage = async (uri) => {
    const formData = new FormData();
    formData.append("image", {
      uri,
      name: `photo.jpg`,
      type: `image/jpeg`, // Ensure the correct MIME type
    });

    console.log("Uploading image with URI:", uri); // Log the URI

    try {
      const token = await AsyncStorage.getItem('accessToken');
      console.log("Token:", token); // Log the token
      const response = await axios.post(`${API_BASE_URL}/user/profile/${userId}/photo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Upload Response:", response.data); // Log the full response
      setProfilePic(response.data.pfp);
    } catch (error) {
      console.error("Error uploading image:", error.message);
      if (error.response) {
        console.error("Response data:", error.response.data); // Log the response data
        console.error("Response status:", error.response.status); // Log the response status
      } else {
        console.error("Error details:", error); // Log any additional error details
      }
    }
  };
  console.log(userId)
  const handleSave = async (updatedPersonal, updatedMedical, updatedEducation) => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const userId = await AsyncStorage.getItem('id');
      if (!token || !userId) throw new Error('User ID or token not found');

      await axios.patch(`${API_BASE_URL}/user/profiles/${userId}`, {
        personal: updatedPersonal,
        medical: updatedMedical,
        education: updatedEducation  // Add education data here
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

  console.log(personal)

  const filterSensitiveInfo = (data) => {
    if (!data) return {};
    const filtered = { ...data };
    delete filtered._id;
    delete filtered.userId;
    delete filtered.timestamp;
    delete filtered.__v;
    return filtered;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profilePictureContainer}>
          {profilePic ? (
            <Image source={{ uri: profilePic }} style={styles.profilePicture} />
          ) : (
            <View style={styles.profilePicture}>
              <Text style={styles.profileLetter}>U</Text>
            </View>
          )}
          <Pressable style={styles.changeProfilePictureButton} onPress={pickImage}>
            <Ionicons name="camera" size={24} color="white" />
          </Pressable>
        </View>
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
        <InfoSection title="Personal Information" data={filterSensitiveInfo(personal)} />
        <InfoSection title="Education Information" data={filterSensitiveInfo(education)} isEducation />
        <InfoSection title="Medical Information" data={filterSensitiveInfo(medical)} isMedical />


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
const personalLabelMapping = {
  firstName: 'First Name',
  lastName: 'Last Name',
  age: 'Age',
  dateOfBirth: 'Date of Birth',
  sex: 'Gender',
  civilStatus: 'Civil Status',
  address: 'Address',
  religion: 'Religion',
  telNo: 'Telephone Number',
  guardian: 'Guardian Name',
  guardianAddress: 'Guardian Address',
  guardianTelNo: 'Guardian Telephone Number',
};
const educationLabelMapping = {
  educationLevel: 'Education Level',
  yearlvl: 'Year Level',
  section: 'Section',
  department: 'Department',
  strand: 'Strand',
  course: 'Course',
  schoolYear: 'School Year',
};

const medicalLabelMapping = {
  respiratory: 'Respiratory System',
  digestive: 'Digestive System',
  nervous: 'Nervous System',
  excretory: 'Excretory System',
  endocrine: 'Endocrine System',
  circulatory: 'Circulatory System',
  skeletal: 'Skeletal System',
  muscular: 'Muscular System',
  reproductive: 'Reproductive System',
  lymphatic: 'Lymphatic System',
  psychological: 'Psychological State',
  specifyPsychological: 'Specify Psychological Condition',
  smoking: 'Smoking Status',
  drinking: 'Drinking Status',
  allergy: 'Allergy Information',
  specificAllergy: 'Specific Allergy',
  eyes: 'Eyes Examination',
  ear: 'Ear Examination',
  nose: 'Nose Examination',
  throat: 'Throat Examination',
  tonsils: 'Tonsils Examination',
  teeth: 'Teeth Examination',
  tongue: 'Tongue Examination',
  neck: 'Neck Examination',
  thyroids: 'Thyroid Examination',
  cervicalGlands: 'Cervical Glands Examination',
  chest: 'Chest Examination',
  contour: 'Chest Contour',
  heart: 'Heart Examination',
  rate: 'Heart Rate',
  rhythm: 'Heart Rhythm',
  bp: 'Blood Pressure',
  height: 'Height',
  weight: 'Weight',
  bmi: 'Body Mass Index',
  lungs: 'Lung Examination',
  abdomen: 'Abdomen Examination',
  ABcontour: 'Abdominal Contour',
  liver: 'Liver Examination',
  spleen: 'Spleen Examination',
  kidneys: 'Kidneys Examination',
  extremities: 'Extremities Examination',
  upperExtremities: 'Upper Extremities Examination',
  lowerExtremities: 'Lower Extremities Examination',
  bloodChemistry: 'Blood Chemistry',
  cbc: 'Complete Blood Count',
  urinalysis: 'Urinalysis',
  fecalysis: 'Fecalysis',
  chestXray: 'Chest X-ray',
  others: 'Other Observations',
};


const HealthMetric = ({ label, value }) => (
  <View style={styles.metricContainer}>
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={styles.metricValue}>{value}</Text>
  </View>
);

const InfoSection = ({ title, data, isMedical = false }) => (
  <View style={styles.infoSection}>
    <Text style={styles.infoTitle}>{title}</Text>
    <View style={styles.infoContent}>
      {Object.entries(data || {}).map(([key, value]) => (
        <Text key={key} style={styles.infoText}>
          {`${(isMedical ? medicalLabelMapping[key] : personalLabelMapping[key]) || key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`}
        </Text>
      ))}
    </View>
  </View>
);



const EditModal = ({ visible, personalInfo, medicalInfo, educationInfo, onClose, onSave }) => {
  const [editedPersonal, setEditedPersonal] = useState(personalInfo || {});
  const [editedMedical, setEditedMedical] = useState(medicalInfo || {});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [editedEducation, setEditedEducation] = useState(educationInfo || {});
  useEffect(() => {
    setEditedPersonal(personalInfo || {});
    setEditedMedical(medicalInfo || {});
  }, [personalInfo, medicalInfo]);

  const handlePersonalChange = (key, value) => {
    setEditedPersonal(prev => ({ ...prev, [key]: value }));
  };
  const handleEducationChange = (key, value) => {
    setEditedEducation(prev => ({ ...prev, [key]: value }));
  };

  const handleMedicalChange = (key, value) => {
    setEditedMedical(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(editedPersonal, editedMedical, editedEducation);
  };

  const renderEducationFields = () => {
    const educationLevel = editedEducation.educationLevel;

    return (
      <>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Education Level:</Text>
          <Picker
            selectedValue={educationLevel}
            onValueChange={(value) => handleEducationChange('educationLevel', value)}
            style={styles.picker}
          >
            <Picker.Item label="Select" value="" />
            <Picker.Item label="JHS" value="JHS" />
            <Picker.Item label="SHS" value="SHS" />
            <Picker.Item label="College" value="College" />
          </Picker>
        </View>

        {educationLevel && (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Year Level:</Text>
            <Picker
              selectedValue={editedEducation.yearlvl}
              onValueChange={(value) => handleEducationChange('yearlvl', value)}
              style={styles.picker}
            >
              <Picker.Item label="Select" value="" />
              {educationLevel === 'JHS' && ['Grade 7', '8', '9', '10'].map(year => (
                <Picker.Item key={year} label={year} value={year} />
              ))}
              {educationLevel === 'SHS' && ['Grade 11', '12'].map(year => (
                <Picker.Item key={year} label={year} value={year} />
              ))}
              {educationLevel === 'College' && ['1', '2', '3', '4'].map(year => (
                <Picker.Item key={year} label={year} value={year} />
              ))}
            </Picker>
          </View>
        )}

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Section:</Text>
          <Picker
            selectedValue={editedEducation.section}
            onValueChange={(value) => handleEducationChange('section', value)}
            style={styles.picker}
          >
            <Picker.Item label="Select" value="" />
            {['A', 'B', 'C', 'D', "STEM 11-1"].map(section => (
              <Picker.Item key={section} label={section} value={section} />
            ))}
          </Picker>
        </View>

        {educationLevel === 'College' && (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Department:</Text>
            <Picker
              selectedValue={editedEducation.department}
              onValueChange={(value) => handleEducationChange('department', value)}
              style={styles.picker}
            >
              <Picker.Item label="Select" value="" />
              {["CBAA", "CHTM", "COI", "CET", "CCJ", "COE", "CASSW", "CNAH"].map(dept => (
                <Picker.Item key={dept} label={dept} value={dept} />
              ))}
            </Picker>
          </View>
        )}

        {educationLevel === 'SHS' && (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Strand:</Text>
            <Picker
              selectedValue={editedEducation.strand}
              onValueChange={(value) => handleEducationChange('strand', value)}
              style={styles.picker}
            >
              <Picker.Item label="Select" value="" />
              {["STEM", "HUMMS", "ABM", "TVL-ICT", "TVL-HE"].map(strand => (
                <Picker.Item key={strand} label={strand} value={strand} />
              ))}
            </Picker>
          </View>
        )}

        {educationLevel === 'College' && (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Course:</Text>
            <Picker
              selectedValue={editedEducation.course}
              onValueChange={(value) => handleEducationChange('course', value)}
              style={styles.picker}
            >
              <Picker.Item label="Select" value="" />
              {[
                "BSBA", "BSA", "BSREM", "BSCA", "BSHM", "BSTM", "ACLM",
                "BSIT", "BSCS", "BSCpE", "BMMA", "BSCE", "BSEE", "BSECE",
                "BSIE", "BS Criminology", "BECE", "BEE", "BPE", "BSE",
                "BA Psychology", "BA Broadcasting", "BA Political Science",
                "BS Social Work", "BSN", "BSND"
              ].map(course => (
                <Picker.Item key={course} label={course} value={course} />
              ))}
            </Picker>
          </View>
        )}

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>School Year:</Text>
          <TextInput
            style={styles.input}
            value={editedEducation.schoolYear || ''}
            onChangeText={(text) => handleEducationChange('schoolYear', text)}
            placeholder="Enter School Year"
          />
        </View>
      </>
    );
  };


  const renderPersonalFields = () => {
    const fields = [
      { key: 'firstName', label: 'First Name' },
      { key: 'lastName', label: 'Last Name' },
      { key: 'sex', label: 'Sex', type: 'picker', options: ['Male', 'Female', 'Other'] },
      { key: 'civil Status', label: 'Civil Status', type: 'picker', options: ['Single', 'Married', 'Divorced', 'Widowed'] },
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

            <Text style={styles.modalTitle}>Edit Education Information</Text>
            {renderEducationFields()}

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
    marginTop: 20,
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
  profilePictureContainer: {
    position: 'relative', // Make this position relative to allow absolute positioning of the icon
    alignItems: 'center', // Center the content
    justifyContent: 'center',
  },
  profilePicture: {
    width: 100, // Adjust the size as needed
    height: 100,
    borderRadius: 50, // Make it circular
  },
  profileLetter: {
    fontSize: 40, // Size of the letter
    color: 'white', // Text color
    textAlign: 'center',
    lineHeight: 100, // Center the text vertically
  },
  changeProfilePictureButton: {
    position: 'absolute',
    bottom: 10, // Position it slightly above the bottom of the profile picture
    right: 10, // Position it on the right side
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background for the button
    borderRadius: 20,
    padding: 5, // Add some padding
  },
});
