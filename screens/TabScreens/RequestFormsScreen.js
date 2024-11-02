import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, TextInput, Dimensions, Platform, Alert, Image } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const requestForms = [
  {
    title: 'Appointment Request Form',
    description: 'Allows students to request appointments with doctors, nurses, or counselors. It should capture preferred dates, times, and the reason for the visit.',
  },
  {
    title: 'Medical Leave Form',
    description: 'If you require medical leave due to illness or medical reasons, complete the "Medical Leave Form." Provide your personal information, diagnosis (if applicable), expected duration of leave, and any medical certificates or doctor\'s notes.',
  },
  {
    title: 'Medical Record Request/Release Form',
    description: 'Allows students to request or authorize the release of their medical records to another healthcare provider or institution.',
  },
  {
    title: 'Special Leave Form',
    description: 'Request special leave for various reasons such as personal emergencies, family matters, or other exceptional circumstances.',
  },
  {
    title: 'Telehealth Appointment Request Form',
    description: 'Request a telehealth appointment for dental, nursing, or medical consultations.',
  },
];

const allRequests = [
  {
    id: '1',
    request: 'Appointment',
    sender: 'John Doe',
    status: 'pending',
    handledBy: '',
    feedback: '',
    consultationType: 'doctor-consultation',
    reason: 'Annual check-up',
    preferredDateTime: '2024-10-20T14:00:00',
    madeWhen: '2024-10-12T10:15:00'
  },
  {
    id: '2',
    request: 'Medical Leave',
    sender: 'Jane Smith',
    status: 'approved',
    handledBy: 'Dr. Johnson',
    feedback: 'Approved for 3 days',
    consultationType: '',
    reason: 'Flu symptoms',
    preferredDateTime: '',
    madeWhen: '2024-10-11T09:30:00'
  },
  {
    id: '3',
    request: 'Telehealth',
    sender: 'Alice Brown',
    status: 'completed',
    handledBy: 'Nurse Williams',
    feedback: 'Prescription sent',
    consultationType: 'nursing-consultation',
    reason: 'Follow-up on medication',
    preferredDateTime: '2024-10-18T15:30:00',
    madeWhen: '2024-10-10T14:45:00'
  },
  {
    id: '4',
    request: 'Medical Record Release',
    sender: 'Bob Wilson',
    status: 'pending',
    handledBy: '',
    feedback: '',
    consultationType: '',
    reason: 'Transfer to new healthcare provider',
    preferredDateTime: '',
    madeWhen: '2024-10-13T11:20:00'
  },
  {
    id: '5',
    request: 'Special Leave',
    sender: 'Charlie Davis',
    status: 'denied',
    handledBy: 'Admin Thompson',
    feedback: 'Insufficient documentation provided',
    consultationType: '',
    reason: 'Family emergency',
    preferredDateTime: '',
    madeWhen: '2024-10-14T08:50:00'
  }
];

export default function Component() {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [formData, setFormData] = useState({});
  const [allRequestsModalVisible, setAllRequestsModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentDateField, setCurrentDateField] = useState(null);
  const [allRequests, setAllRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);
  useFocusEffect(
    useCallback(() => {
      setModalVisible(false);
      setSelectedForm(null);
      setFormData({});
      setAllRequestsModalVisible(false);
      setShowDatePicker(false);
      setShowTimePicker(false);
      setSelectedImage(null);
      setCurrentDateField(null);
      checkUserRole();
    }, [])
  );

  const checkUserRole = async () => {
    try {
      const role = await AsyncStorage.getItem('role');
      setUserRole(role);
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };
  const fetchAllRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await axios.get('http://192.168.1.15:3000/requests/admin', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllRequests(response.data);
    } catch (err) {
      setError('Failed to fetch requests. Please try again.');
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (allRequestsModalVisible && (userRole === 'admin' || userRole === 'staff')) {
      fetchAllRequests();
    }
  }, [allRequestsModalVisible, userRole]);

  const handleSubmit = async () => {
    if (!isFormValid()) {
      Alert.alert(
        "Incomplete Form",
        "Please fill in all required fields before submitting.",
        [{ text: "OK" }]
      );
      return;
    }

    try {
      const token = await AsyncStorage.getItem('accessToken');
      let response;

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      };

      const formDataToSend = new FormData();

      switch (selectedForm.title) {
        case 'Appointment Request Form':
          formDataToSend.append('appointmentDate', formData.date.toISOString());
          formDataToSend.append('reason', formData.reason);
          response = await axios.post(
            'http://192.168.1.15:3000/requests/appointment',
            formDataToSend,
            config
          );
          break;
        case 'Medical Leave Form':
          formDataToSend.append('leave[startDate]', formData.startDate.toISOString());
          formDataToSend.append('leave[endDate]', formData.endDate.toISOString());
          formDataToSend.append('reason', formData.reason);
          if (selectedImage) {
            formDataToSend.append('image', {
              uri: selectedImage.uri,
              type: 'image/jpeg',
              name: 'medical_certificate.jpg'
            });
          }
          response = await axios.post(
            'http://192.168.1.15:3000/requests/medical-leave',
            formDataToSend,
            config
          );
          break;
        case 'Medical Record Request/Release Form':
          formDataToSend.append('releaseMedRecordto', formData.releaseTo);
          formDataToSend.append('reason', formData.purpose);
          if (selectedImage) {
            formDataToSend.append('image', {
              uri: selectedImage.uri,
              type: 'image/jpeg',
              name: 'supporting_document.jpg'
            });
          }
          response = await axios.post(
            'http://192.168.1.15:3000/requests/medical-recordR',
            formDataToSend,
            config
          );
          break;
        case 'Special Leave Form':
          formDataToSend.append('leave[startDate]', formData.startDate.toISOString());
          formDataToSend.append('leave[endDate]', formData.endDate.toISOString());
          formDataToSend.append('reason', formData.leaveType);
          formDataToSend.append('additionalReason', formData.additionalInfo || '');
          response = await axios.post(
            'http://192.168.1.15:3000/requests/special-leave',
            formDataToSend,
            config
          );
          break;
        case 'Telehealth Appointment Request Form':
          console.log(formData.reason);
          formDataToSend.append('appointmentDate', formData.date.toISOString());
          formDataToSend.append('reason', formData.reason);
          formDataToSend.append('telehealthType', formData.consultationType);
          response = await axios.post(
            'http://192.168.1.15:3000/requests/telehealth',
            {
              appointmentDate: formData.date.toISOString(),
              reason: formData.reason,
              telehealthType: formData.consultationType,
            },
            config
          );
          break;
        default:
          throw new Error('Unknown form type');
      }

      if (response.status === 200) {
        Alert.alert(
          "Success",
          "Your request has been submitted successfully.",
          [{ text: "OK" }]
        );
        setModalVisible(false);
        resetForm();
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      Alert.alert(
        "Error",
        error.response?.data || "An error occurred while submitting your request. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  const handleCancel = () => {
    setModalVisible(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({});
    setSelectedImage(null);
    setCurrentDateField(null);
  };

  const openModal = (form) => {
    setSelectedForm(form);
    setModalVisible(true);
  };

  const openDetailedView = (request) => {
    setAllRequestsModalVisible(false);
    navigation.navigate('DetailedRequestScreen', { requestId: request._id });
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate && currentDateField) {
      setFormData({ ...formData, [currentDateField]: selectedDate });
    }
    setCurrentDateField(null);
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setFormData({ ...formData, time: selectedTime });
    }
  };

  const showDatePickerForField = (fieldName) => {
    setCurrentDateField(fieldName);
    setShowDatePicker(true);
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "You need to grant camera roll permissions to upload an image.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
      setFormData({ ...formData, image: result.assets[0] });
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setFormData({ ...formData, image: null });
  };

  const renderImagePreview = () => {
    if (!selectedImage) return null;

    return (
      <View style={styles.imagePreviewContainer}>
        <Image source={{ uri: selectedImage.uri }} style={styles.imagePreview} />
        <Pressable onPress={removeImage} style={styles.removeImageButton}>
          <Ionicons name="close" size={20} color={Colors.white} />
        </Pressable>
      </View>
    );
  };

  const isFormValid = () => {
    if (!selectedForm) return false;

    switch (selectedForm.title) {
      case 'Appointment Request Form':
      case 'Telehealth Appointment Request Form':
        return (
          formData.date &&
          formData.time &&
          formData.reason &&
          (selectedForm.title !== 'Telehealth Appointment Request Form' || formData.consultationType)
        );
      case 'Medical Leave Form':
        return (
          formData.reason &&
          formData.startDate &&
          formData.endDate &&
          selectedImage
        );
      case 'Special Leave Form':
        return (
          formData.leaveType &&
          formData.startDate &&
          formData.endDate &&
          (formData.leaveType !== 'other' || formData.otherReason)
        );
      case 'Medical Record Request/Release Form':
        return (
          formData.releaseTo &&
          formData.purpose &&
          selectedImage
        );
      default:
        return false;
    }
  };

  const renderFormFields = () => {
    if (!selectedForm) return null;

    switch (selectedForm.title) {
      case 'Appointment Request Form':
      case 'Telehealth Appointment Request Form':
        return (
          <>
            <Text style={styles.label}>Preferred Appointment Date:</Text>
            <Pressable onPress={() => showDatePickerForField('date')} style={styles.dateInput}>
              <Text>{formData.date ? formData.date.toLocaleDateString() : 'Select Date'}</Text>
            </Pressable>

            <Text style={styles.label}>Preferred Appointment Time:</Text>
            <Pressable onPress={() => setShowTimePicker(true)} style={styles.dateInput}>
              <Text>{formData.time ? formData.time.toLocaleTimeString() : 'Select Time'}</Text>
            </Pressable>

            <Text style={styles.label}>
              {selectedForm.title === 'Telehealth Appointment Request Form'
                ? 'Reason for Telehealth Consultation:'
                : 'Reason for Appointment:'}
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter reason for appointment"
              value={formData.reason}
              onChangeText={(text) => setFormData({ ...formData, reason: text })}
              multiline
            />

            {selectedForm.title === 'Telehealth Appointment Request Form' && (
              <>
                <Text style={styles.label}>Consultation Type:</Text>
                <Picker
                  selectedValue={formData.consultationType}
                  onValueChange={(value) => setFormData({ ...formData, consultationType: value })}
                  style={styles.picker}
                >
                  <Picker.Item label="Select a consultation type" value="" />
                  <Picker.Item label="Dental Consultation" value="dental" />
                  <Picker.Item label="Nursing Consultation" value="nursing" />
                  <Picker.Item label="Medical Consultation" value="medical" />
                </Picker>
              </>
            )}
          </>
        );

      case 'Medical Leave Form':
        return (
          <>
            <Text style={styles.label}>Reason for Medical Leave/Diagnosis:</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter reason for leave"
              value={formData.reason}
              onChangeText={(text) => setFormData({ ...formData, reason: text })}
              multiline
            />

            <Text style={styles.label}>Expected Duration of Leave (Start - End):</Text>
            <View style={styles.dateRangeContainer}>
              <Pressable onPress={() => showDatePickerForField('startDate')} style={styles.dateRangeInput}>
                <Text>{formData.startDate ? formData.startDate.toLocaleDateString() : 'Start Date'}</Text>
              </Pressable>
              <Text style={styles.dateRangeSeparator}>to</Text>
              <Pressable onPress={() => showDatePickerForField('endDate')} style={styles.dateRangeInput}>
                <Text>{formData.endDate ? formData.endDate.toLocaleDateString() : 'End Date'}</Text>
              </Pressable>
            </View>

            <Text style={styles.label}>Upload Medical Certificate/Doctor's Note:</Text>
            <View style={styles.imageUploadContainer}>
              <Pressable style={styles.uploadButton} onPress={pickImage}>
                <Text style={styles.uploadButtonText}>
                  {selectedImage ? 'Change Image' : 'Choose Image'}
                </Text>
              </Pressable>
              {renderImagePreview()}
            </View>
          </>
        );

      case 'Special Leave Form':
        return (
          <>
            <Text style={styles.label}>Reason for Special Leave:</Text>
            <Picker
              selectedValue={formData.leaveType}
              onValueChange={(value) => setFormData({ ...formData, leaveType: value })}
              style={styles.picker}
            >
              <Picker.Item label="Select a reason" value="" />
              <Picker.Item label="Maternity Leave" value="maternity" />
              <Picker.Item label="Bereavement Leave" value="bereavement" />
              <Picker.Item label="Other (Please specify)" value="other" />
            </Picker>

            {formData.leaveType === 'other' && (
              <TextInput
                style={styles.textInput}
                placeholder="Please specify the reason"
                value={formData.otherReason}
                onChangeText={(text) => setFormData({ ...formData, otherReason: text })}

              />
            )}

            <Text style={styles.label}>Additional Information (if applicable):</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter additional information"
              value={formData.additionalInfo}
              onChangeText={(text) => setFormData({ ...formData, additionalInfo: text })}
              multiline
            />

            <Text style={styles.label}>Duration of Leave (Start - End):</Text>
            <View style={styles.dateRangeContainer}>
              <Pressable onPress={() => showDatePickerForField('startDate')} style={styles.dateRangeInput}>
                <Text>{formData.startDate ? formData.startDate.toLocaleDateString() : 'Start Date'}</Text>
              </Pressable>
              <Text style={styles.dateRangeSeparator}>to</Text>
              <Pressable onPress={() => showDatePickerForField('endDate')} style={styles.dateRangeInput}>
                <Text>{formData.endDate ? formData.endDate.toLocaleDateString() : 'End Date'}</Text>
              </Pressable>
            </View>
          </>
        );

      case 'Medical Record Request/Release Form':
        return (
          <>
            <Text style={styles.label}>Release Medical Records To (Doctor/Clinic):</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter doctor or clinic name"
              value={formData.releaseTo}
              onChangeText={(text) => setFormData({ ...formData, releaseTo: text })}
            />

            <Text style={styles.label}>Purpose of Request:</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter purpose of request"
              value={formData.purpose}
              onChangeText={(text) => setFormData({ ...formData, purpose: text })}
              multiline
            />

            <Text style={styles.label}>Upload Supporting Documents:</Text>
            <View style={styles.imageUploadContainer}>
              <Pressable style={styles.uploadButton} onPress={pickImage}>
                <Text style={styles.uploadButtonText}>
                  {selectedImage ? 'Change Image' : 'Choose Image'}
                </Text>
              </Pressable>
              {renderImagePreview()}
            </View>
          </>
        );

      default:
        return null;
    }
  };
  return (
    <ScrollView contentContainerStyle={styles.contentContainer}>
      <Text style={styles.headerText}>
        Fill out the appropriate form based on your situation.
      </Text>
      <Text style={styles.warningText}>
        Fabricating information or providing false details can lead to consequences and may impact your credibility and trustworthiness.
      </Text>

      {(userRole === 'admin' || userRole === 'staff') && (
        <Pressable
          style={styles.viewRequestsButton}
          onPress={() => setAllRequestsModalVisible(true)}
        >
          <Text style={styles.viewRequestsButtonText}>
            View All Requests
          </Text>
        </Pressable>
      )}

      {requestForms.map((form, index) => (
        <View key={index} style={styles.formContainer}>
          <Text style={styles.formTitle}>{form.title}</Text>
          <Text style={styles.formDescription}>{form.description}</Text>
          <Pressable
            style={styles.submitFormButton}
            onPress={() => openModal(form)}
          >
            <Text style={styles.submitFormButtonText}>Submit a Form</Text>
          </Pressable>
        </View>
      ))}

      <Modal
        transparent={true}
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            {selectedForm && (
              <>
                <Text style={styles.modalTitle}>{selectedForm.title}</Text>
                <Text style={styles.modalDescription}>{selectedForm.description}</Text>

                {renderFormFields()}

                <View style={styles.buttonRow}>
                  <Pressable style={[styles.modalButton, styles.submitButton]} onPress={handleSubmit}>
                    <Text style={styles.modalButtonText}>Submit</Text>
                  </Pressable>
                  <Pressable style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        transparent={true}
        animationType="slide"
        visible={allRequestsModalVisible}
        onRequestClose={() => setAllRequestsModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.allRequestsModalContainer}>
            <Text style={styles.allRequestsModalTitle}>All Requests Forms</Text>
            {loading ? (
              <Text style={styles.loadingText}>Loading...</Text>
            ) : error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : (
              <ScrollView style={styles.tableContainer}>
                <ScrollView horizontal>
                  <View>
                    <View style={styles.tableHeader}>
                      <Text style={[styles.tableHeaderCell, { width: SCREEN_WIDTH * 0.3 }]}>Request</Text>
                      <Text style={[styles.tableHeaderCell, { width: SCREEN_WIDTH * 0.3 }]}>Sender</Text>
                      <Text style={[styles.tableHeaderCell, { width: SCREEN_WIDTH * 0.2 }]}>Status</Text>
                      <Text style={[styles.tableHeaderCell, { width: SCREEN_WIDTH * 0.2 }]}>Actions</Text>
                      <Text style={[styles.tableHeaderCell, { width: SCREEN_WIDTH * 0.3 }]}>Handled By</Text>
                      <Text style={[styles.tableHeaderCell, { width: SCREEN_WIDTH * 0.4 }]}>Feedback</Text>
                    </View>
                    {allRequests.map((request, index) => (
                      <View key={index} style={styles.tableRow}>
                        <Text style={[styles.tableCell, { width: SCREEN_WIDTH * 0.3 }]}>{request.formName}</Text>
                        <Text style={[styles.tableCell, { width: SCREEN_WIDTH * 0.3 }]}>{`${request.sentBy.firstName} ${request.sentBy.lastName}`}</Text>
                        <Text style={[styles.tableCell, { width: SCREEN_WIDTH * 0.2, color: request.status === 'approved' ? 'green' : request.status === 'denied' ? 'red' : 'orange' }]}>{request.status}</Text>
                        <View style={[styles.tableCellView, { width: SCREEN_WIDTH * 0.2 }]}>
                          <Pressable style={styles.viewButton} onPress={() => openDetailedView(request)}>
                            <Text style={styles.viewButtonText}>View</Text>
                          </Pressable>
                        </View>
                        <Text style={[styles.tableCell, { width: SCREEN_WIDTH * 0.3 }]}>{request.handledByDetails.firstName ? `${request.handledByDetails.firstName} ${request.handledByDetails.lastName}` : 'N/A'}</Text>
                        <Text style={[styles.tableCell, { width: SCREEN_WIDTH * 0.4 }]}>{request.feedback || 'N/A'}</Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </ScrollView>
            )}
            <Pressable
              style={styles.closeButton}
              onPress={() => setAllRequestsModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {showDatePicker && (
        <DateTimePicker
          value={formData[currentDateField] || new Date()}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={formData.time || new Date()}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={onTimeChange}
        />
      )}
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  contentContainer: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: Colors.lgray,
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  headerText: {
    fontSize: 16,
    color: Colors.cobaltblue,
    marginBottom: 10,
    textAlign: 'center',
  },
  warningText: {
    fontSize: 14,
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
  },
  viewRequestsButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 20,
    alignSelf: 'stretch',
  },
  viewRequestsButtonText: {
    fontSize: 16,
    color: Colors.white,
    fontWeight: 'bold',
  },
  formContainer: {
    width: '100%',
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.cobaltblue,
    marginBottom: 10,
  },
  formDescription: {
    fontSize: 14,
    color: 'black',
    marginBottom: 15,
  },
  submitFormButton: {
    backgroundColor: Colors.cobaltblue,
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  submitFormButtonText: {
    fontSize: 14,
    color: Colors.white,
    fontWeight: 'bold',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.cobaltblue,
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 14,
    color: 'black',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.cobaltblue,
    alignSelf: 'flex-start',
    marginBottom: 5,
  },
  dateInput: {
    width: '100%',
    height: 40,
    borderColor: Colors.cobaltblue,
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    justifyContent: 'center',
  },
  dateRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dateRangeInput: {
    flex: 1,
    height: 40,
    borderColor: Colors.cobaltblue,
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    justifyContent: 'center',
  },
  dateRangeSeparator: {
    marginHorizontal: 10,
  },
  textInput: {
    width: '100%',
    height: 100,
    borderColor: Colors.cobaltblue,
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  submitButton: {
    backgroundColor: Colors.cobaltblue,
  },
  cancelButton: {
    backgroundColor: '#ff6347',
  },
  modalButtonText: {
    fontSize: 16,
    color: Colors.white,
    fontWeight: 'bold',
  },
  allRequestsModalContainer: {
    width: '95%',
    height: '80%',
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 10,
  },
  allRequestsModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.cobaltblue,
    marginBottom: 20,
    textAlign: 'center',
  },
  tableContainer: {
    flex: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray,
    paddingBottom: 10,
    marginBottom: 10,
  },
  tableHeaderCell: {
    fontWeight: 'bold',
    color: Colors.cobaltblue,
    paddingHorizontal: 5,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.lgray,
    paddingVertical: 10,
  },
  tableCell: {
    paddingHorizontal: 5,
  },
  tableCellView: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewButton: {
    backgroundColor: Colors.cobaltblue,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  viewButtonText: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: Colors.gray,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignSelf: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  picker: {
    width: '100%',
    height: 40,
    borderColor: Colors.cobaltblue,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
  },
  imageUploadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadButton: {
    backgroundColor: Colors.cobaltblue,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginRight: 10,
  },
  uploadButtonText: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  imagePreviewContainer: {
    position: 'relative',
    marginLeft: 10,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 5,
  },
  removeImageButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: Colors.cobaltblue,
    borderRadius: 12,
    padding: 2,
  },
});