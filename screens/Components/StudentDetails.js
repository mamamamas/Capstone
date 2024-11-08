import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, Pressable, Modal, TextInput, Image, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../../constants/Colors';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
const InfoItem = ({ label, value }) => (
    <View style={styles.infoContainer}>
        <Text style={styles.infoLabel}>{label}:</Text>
        <Text style={styles.infoValue}>{typeof value === 'object' ? JSON.stringify(value) : value || 'N/A'}</Text>
    </View>
);

const SectionCard = ({ title, children, onAdd, isFollowUp }) => (
    <View style={styles.card}>
        <View style={styles.cardHeader}>
            {!isFollowUp && onAdd && (
                <Pressable onPress={onAdd} style={styles.addButton}>
                    <Text style={styles.addButtonText}>Add</Text>
                </Pressable>
            )}
            <Text style={styles.cardTitle}>{title}</Text>
        </View>
        {children}
    </View>
);

const TableHeader = ({ columns }) => (
    <View style={styles.tableHeader}>
        {columns.map((column, index) => (
            <Text key={index} style={styles.tableHeaderText}>{column}</Text>
        ))}
        <Text style={[styles.tableHeaderText, styles.actionColumn]}>Actions</Text>
    </View>
);

const Table = ({ headers, data, onEdit, isFollowUp }) => {


    if (!data || !Array.isArray(data) || data.length === 0) {
        return <Text style={styles.noDataText}>No data available</Text>;
    }

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
                <TableHeader columns={headers} />
                {data.map((rowData, index) => (
                    <TableRow
                        key={index}
                        data={Object.values(rowData)}
                        onEdit={() => onEdit(index)}
                        isFollowUp={isFollowUp}
                    />
                ))}
            </View>
        </ScrollView>
    );
};

const TableRow = ({ data, onEdit, isFollowUp }) => {
    // Check if data is undefined or not an array
    if (!data || !Array.isArray(data)) {
        console.error('Invalid data prop passed to TableRow:', data);
        return null; // Or you could return a placeholder row
    }

    return (
        <View style={styles.tableRow}>
            {data.map((item, index) => (
                <Text key={index} style={styles.tableRowText}>
                    {item !== null && item !== undefined ? item.toString() : 'N/A'}
                </Text>
            ))}
            <View style={[styles.actionContainer, styles.actionColumn]}>
                <Pressable onPress={() => onEdit(data)} style={styles.iconButton}>
                    <Ionicons name="pencil" size={18} color={Colors.primary} />
                </Pressable>
            </View>
        </View>
    );
};

const AddEditModal = ({ visible, onClose, onSave, title, fields, initialValues = {} }) => {
    const [values, setValues] = useState(initialValues);
    const [isDirty, setIsDirty] = useState(false);

    // Only update values when the modal becomes visible
    useEffect(() => {
        if (visible) {
            setValues(initialValues);
            setIsDirty(false);
        }
    }, [visible]); // Dependency only on `visible`

    const handleChange = (key, text) => {
        setValues(prevValues => ({ ...prevValues, [key]: text }));
        setIsDirty(true);
    };

    const handleSave = () => {
        onSave(values);
        setIsDirty(false);
        onClose();
    };

    const handleClose = () => {
        if (isDirty) {
            console.warn('Unsaved changes will be lost');
        }
        setIsDirty(false);
        onClose();
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={handleClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>{title}</Text>
                    <ScrollView style={styles.modalScrollView}>
                        {fields.map((field, index) => (
                            <View key={field.key} style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>{field.label}:</Text>
                                <TextInput
                                    style={styles.largerInput}
                                    onChangeText={(text) => handleChange(field.key, text)}
                                    value={values[field.key] || ''}
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                    accessibilityLabel={field.label}
                                />
                            </View>
                        ))}
                    </ScrollView>
                    <View style={styles.buttonContainer}>
                        <Pressable
                            style={[styles.button, styles.buttonClose]}
                            onPress={handleClose}
                            accessibilityLabel="Close modal"
                        >
                            <Text style={styles.buttonTextClose}>Close</Text>
                        </Pressable>
                        <Pressable
                            style={[styles.button, styles.buttonAdd]}
                            onPress={handleSave}
                            accessibilityLabel="Save changes"
                        >
                            <Text style={styles.buttonTextAdd}>Save</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const EditProfileModal = ({ visible, onClose, student, onSave }) => {
    const [editedStudent, setEditedStudent] = useState({
        personal: {},
        education: {},
        medical: {}
    });

    useEffect(() => {
        if (visible && student) {
            setEditedStudent({
                personal: { ...student.personal },
                education: { ...student.education },
                medical: { ...student.medical }
            });
        }
    }, [visible, student]);

    const handleChange = (section, key, value) => {
        if (section !== 'personal') { // prevent changes to personal information
            setEditedStudent(prev => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [key]: value
                }
            }));
        }
    };

    const handleSave = () => {
        onSave(editedStudent);
        onClose();
    };

    const renderField = (section, key, label, editable = true, type = 'text') => (
        <View key={`${section}-${key}`} style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{label}:</Text>
            {editable ? (
                type === 'boolean' ? (
                    <Switch
                        value={editedStudent[section][key]}
                        onValueChange={(value) => handleChange(section, key, value)}
                    />
                ) : type === 'date' ? (
                    <DateTimePicker
                        value={new Date(editedStudent[section][key])}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                            handleChange(section, key, selectedDate.toISOString());
                        }}
                    />
                ) : (
                    <TextInput
                        style={styles.input}
                        onChangeText={(text) => handleChange(section, key, text)}
                        value={editedStudent[section][key]?.toString() || ''}
                        editable={section !== 'personal'} // make personal fields non-editable
                    />
                )
            ) : (
                <Text style={styles.nonEditableText}>
                    {editedStudent[section][key]?.toString() || 'N/A'}
                </Text>
            )}
        </View>
    );

    const personalFields = [
        { key: 'firstName', label: 'First Name' },
        { key: 'lastName', label: 'Last Name' },
        { key: 'sex', label: 'Sex' },
        { key: 'civilStatus', label: 'Civil Status' },
        { key: 'dateOfBirth', label: 'Birthdate', type: 'date' },
        { key: 'address', label: 'Address' },
        { key: 'telNo', label: 'Tel. No.' },
        { key: 'religion', label: 'Religion' },
        { key: 'guardian', label: 'Guardian' },
        { key: 'guardianAddress', label: "Guardian's Address" },
        { key: 'guardianTelNo', label: "Guardian's Number" },
        { key: 'yearlvl', label: 'Education Level' },
        { key: 'grade', label: 'Grade/Year' },
        { key: 'section', label: 'Section' },
    ];

    const educationFields = [
        { key: 'yearlvl', label: 'Education Level' },
        { key: 'grade', label: 'Grade/Year' },
        { key: 'section', label: 'Section' },
    ];

    const medicalFields = [
        { key: 'respiratory', label: 'Respiratory' },
        { key: 'digestive', label: 'Digestive' },
        { key: 'nervous', label: 'Nervous' },
        { key: 'excretory', label: 'Excretory' },
        { key: 'endocrine', label: 'Endocrine' },
        { key: 'circulatory', label: 'Circulatory' },
        { key: 'skeletal', label: 'Skeletal' },
        { key: 'muscular', label: 'Muscular' },
        { key: 'reproductive', label: 'Reproductive' },
        { key: 'lymphatic', label: 'Lymphatic' },
        { key: 'psychological', label: 'Psychological' },
        { key: 'smoking', label: 'Do you smoke?', type: 'boolean' },
        { key: 'drinking', label: 'Do you drink?', type: 'boolean' },
        { key: 'allergy', label: 'Allergy?' },
        { key: 'eyes', label: 'Eyes' },
        { key: 'ear', label: 'Ear' },
        { key: 'nose', label: 'Nose' },
        { key: 'throat', label: 'Throat' },
        { key: 'tonsils', label: 'Tonsils' },
        { key: 'teeth', label: 'Teeth' },
        { key: 'tongue', label: 'Tongue' },
        { key: 'neck', label: 'Neck' },
        { key: 'thyroids', label: 'Thyroid' },
        { key: 'cervicalGlands', label: 'Cervical Glands' },
        { key: 'chest', label: 'Chest' },
        { key: 'contour', label: 'Contour' },
        { key: 'heart', label: 'Heart' },
        { key: 'rate', label: 'Rate' },
        { key: 'rhythm', label: 'Rhythm' },
        { key: 'bp', label: 'BP' },
        { key: 'height', label: 'Height' },
        { key: 'weight', label: 'Weight' },
        { key: 'bmi', label: 'BMI' },
        { key: 'lungs', label: 'Lungs' },
        { key: 'abdomen', label: 'Abdomen' },
        { key: 'liver', label: 'Liver' },
        { key: 'spleen', label: 'Spleen' },
        { key: 'kidneys', label: 'Kidneys' },
        { key: 'extremities', label: 'Extremities' },
        { key: 'upperExtremities', label: 'Upper Extremities' },
        { key: 'lowerExtremities', label: 'Lower Extremities' },
        { key: 'bloodChemistry', label: 'Blood Chemistry' },
        { key: 'cbc', label: 'CBC' },
        { key: 'urinalysis', label: 'Urinalysis' },
        { key: 'fecalysis', label: 'Fecalysis' },
        { key: 'chestXray', label: 'Chest X-ray Findings' },
        { key: 'others', label: 'Other Procedures' },
    ];

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>Edit Profile</Text>
                    <ScrollView style={styles.modalScrollView}>
                        <Text style={styles.sectionTitle}>Personal Information</Text>
                        {personalFields.map(field => renderField('personal', field.key, field.label, false, field.type))}

                        <Text style={styles.sectionTitle}>Education Information</Text>
                        {educationFields.map(field => renderField('education', field.key, field.label, false, field.type))}

                        <Text style={styles.sectionTitle}>Medical Information</Text>
                        {medicalFields.map(field => renderField('medical', field.key, field.label, true, field.type))}
                    </ScrollView>
                    <View style={styles.buttonContainer}>
                        <Pressable
                            style={[styles.button, styles.buttonClose]}
                            onPress={onClose}
                        >
                            <Text style={styles.buttonTextClose}>Close</Text>
                        </Pressable>
                        <Pressable
                            style={[styles.button, styles.buttonAdd]}
                            onPress={handleSave}
                        >
                            <Text style={styles.buttonTextAdd}>Save</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
};


const ScanBMIModal = ({ visible, onClose, onSave, initialValues = {} }) => {
    const [values, setValues] = useState(initialValues);
    const [isScanning, setIsScanning] = useState(false);

    useEffect(() => {
        setValues(initialValues);
    }, [initialValues]);

    const handleSave = () => {
        onSave(values);
        onClose();
    };

    const handleScan = async () => {
        setIsScanning(true);
        try {
            const response = await fetch(`http://192.168.1.9:3000/weight/bmi`);
            const data = await response.json();
            if (data.weight && data.height && data.bmi) {
                setValues({
                    weight: data.weight.toString(),
                    height: data.height.toString(),
                    bmi: data.bmi.toString()
                });
            } else {
                Alert.alert('Error', 'Failed to get weight, height, and BMI data');
            }
        } catch (error) {
            console.error('Error scanning BMI:', error);
            Alert.alert('Error', 'Failed to scan BMI. Please try again.');
        } finally {
            setIsScanning(false);
        }
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
                    <Text style={styles.modalTitle}>Scan BMI</Text>
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Height (cm):</Text>
                        <TextInput
                            style={styles.input}
                            value={values.height}
                            editable={false}
                            placeholder="Height will be scanned"
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Weight (kg):</Text>
                        <TextInput
                            style={styles.input}
                            value={values.weight}
                            editable={false}
                            placeholder="Weight will be scanned"
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>BMI:</Text>
                        <TextInput
                            style={styles.input}
                            value={values.bmi}
                            editable={false}
                            placeholder="BMI will be calculated"
                        />
                    </View>
                    <View style={styles.buttonContainer}>
                        <Pressable
                            style={[styles.button, styles.buttonClose]}
                            onPress={onClose}
                        >
                            <Text style={styles.buttonTextClose}>Close</Text>
                        </Pressable>
                        <Pressable
                            style={[styles.button, styles.buttonScan]}
                            onPress={handleScan}
                            disabled={isScanning}
                        >
                            <Text style={styles.buttonTextScan}>{isScanning ? 'Scanning...' : 'Scan BMI'}</Text>
                        </Pressable>
                        <Pressable
                            style={[styles.button, styles.buttonAdd]}
                            onPress={handleSave}
                        >
                            <Text style={styles.buttonTextAdd}>Save</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
};
export default function StudentDetailsScreen({ route }) {
    const { userId } = route.params;
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showArchiveModal, setShowArchiveModal] = useState(false);
    const [archiveData, setArchiveData] = useState(null);
    const [isAddAssessmentModalVisible, setIsAddAssessmentModalVisible] = useState(false);
    const [isAddFollowUpModalVisible, setIsAddFollowUpModalVisible] = useState(false);
    const [isAddImmunizationModalVisible, setIsAddImmunizationModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [isEditProfileModalVisible, setIsEditProfileModalVisible] = useState(false);
    const [isScanBMIModalVisible, setIsScanBMIModalVisible] = useState(false);
    const [newAssessment, setNewAssessment] = useState(null);
    const [editingAssessment, setEditingAssessment] = useState(null);
    const [isEditAssessmentModalVisible, setIsEditAssessmentModalVisible] = useState(false);
    const [shouldRefreshFollowUps, setShouldRefreshFollowUps] = useState(false);
    const [assessmentId, setAssessmentId] = useState(null);
    const [profile, setprofile] = useState(null);

    useEffect(() => {
        fetchUserDetails();
        updateStudentRecordWithGoogleData();
    }, [userId]);

    const fetchGoogleProfileData = async () => {
        try {
            const userInfo = await GoogleSignin.getCurrentUser();
            if (userInfo) {
                const profileData = {
                    firstName: userInfo.user.givenName,
                    lastName: userInfo.user.familyName,
                    email: userInfo.user.email,
                    profilePic: userInfo.user.photo,
                };
                return profileData;
            } else {
                throw new Error('Google user not logged in');
            }
        } catch (error) {
            console.error('Error fetching Google profile data:', error);
            return null;
        }
    };
    const updateStudentRecordWithGoogleData = async () => {
        const googleProfileData = await fetchGoogleProfileData();
        if (!googleProfileData) return;

        try {
            const token = await AsyncStorage.getItem('accessToken');
            const response = await axios.post(
                `http://192.168.1.9:3000/login/updateProfile`,
                { ...googleProfileData, userId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 200) {
                console.log('Student profile updated successfully:', response.data);
                // Optionally fetch updated profile data and set it in your state
                setUserData(response.data);
            } else {
                console.error('Failed to update student profile');
            }
        } catch (error) {
            console.error('Error updating student profile:', error);
        }
    };



    const fetchUserDetails = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) {
                throw new Error('No access token found');
            }

            const response = await axios.get(`http://192.168.1.9:3000/user/profile/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 200 && response.data) {
                console.log('Fetched user data:', JSON.stringify(response.data, null, 2));
                setUserData(response.data);
            } else {
                throw new Error('Unexpected response from server');
            }
        } catch (err) {
            console.error('Failed to load user details', err);
            setError('Failed to load user details');
        } finally {
            setLoading(false);
        }
    };


    const fetchArchiveData = async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) {
                throw new Error('No access token found');
            }

            const response = await axios.get(`http://192.168.1.9:3000/archive/${userId}/immunization`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log('Archive data response:', response.data);

            setArchiveData(response.data);
            setShowArchiveModal(true);
        } catch (err) {
            console.error('Error fetching archive data:', err);
            setError(err.response?.data?.error || 'Failed to load archive data');
            Alert.alert('Error', 'Failed to load archive data. Please try again.');
        }
    };



    const handleAddFollowUp = (assessmentId) => {
        setSelectedAssessmentId(assessmentId);
        setIsAddFollowUpModalVisible(true);
    };

    const handleAddImmunization = () => {
        setEditingItem(null);
        setIsAddImmunizationModalVisible(true);
        if (userData && userData.assessment) {
            console.log("ean", userData.immunization[0]?.medicalInfoId); // Optional chaining to avoid errors
        } else {
            console.log('userData or assessments are undefined');
        }
    };
    const handleAddAssessment = () => {
        setEditingAssessment(null);
        setIsAddAssessmentModalVisible(true);
        setIsEditAssessmentModalVisible(false);

        if (userData && userData.assessment) {
            console.log("ean", userData.assessment[0]?.medicalInfoId); // Optional chaining to avoid errors
        } else {
            console.log('userData or assessments are undefined');
        }
    };


    const handleEditAssessment = (index) => {
        const selectedAssessment = userData.assessment[index];
        const followUpAssessment = selectedAssessment.followUps; // Access follow-ups from the selected assessment
        console.log('Selected Assessment:', selectedAssessment);
        console.log('Selected FollowUp Assessment:', followUpAssessment);
        setEditingAssessment(selectedAssessment);
        setIsEditAssessmentModalVisible(true);
        setIsAddAssessmentModalVisible(false);
    };



    const handleSaveAssessment = async (newAssessment) => {
        const token = await AsyncStorage.getItem('accessToken');
        try {
            let response;
            const medicalInfoId = userData.assessment[0]?.medicalInfoId || userData.medical?._id;

            // Check if medicalInfoId is available
            if (!medicalInfoId) {
                console.log('No medicalInfoId available');
                Alert.alert('Error', 'No medical information ID available to save the assessment.');
                return;
            }

            if (editingAssessment) {
                // Update existing assessment
                const { medicalInfoId, originalDocument, ...updateData } = newAssessment;
                response = await axios.patch(
                    `http://192.168.1.9:3000/medical/assessment/${editingAssessment._id}`,
                    updateData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (response.status === 200) {
                    setUserData(prevData => ({
                        ...prevData,
                        assessment: prevData.assessment.map(item =>
                            item._id === editingAssessment._id ? response.data : item
                        )
                    }));
                    console.log('Assessment updated successfully');
                } else {
                    throw new Error('Unexpected response status');
                }
            } else {
                // Create new assessment
                response = await axios.post(
                    `http://192.168.1.9:3000/medical/assessment`,
                    {
                        ...newAssessment,
                        medicalInfoId
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (response.status === 201 || response.status === 200) {
                    const createdAssessment = response.data;

                    setUserData(prevData => ({
                        ...prevData,
                        assessment: [...prevData.assessment, createdAssessment]
                    }));

                    // Automatically create an empty follow-up row after assessment is added
                    await axios.post(
                        `http://192.168.1.9:3000/medical/assessment/${createdAssessment._id}/followup`,
                        { followUpComplaints: "", followUpActions: "", date: "" },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );

                    console.log('New assessment and follow-up added successfully');
                } else {
                    throw new Error('Unexpected response status');
                }
            }

            setIsAddAssessmentModalVisible(false);
            setIsEditAssessmentModalVisible(false);
            setEditingAssessment(null);
        } catch (error) {
            console.error('Error saving assessment:', error.response ? error.response.data : error.message);
            Alert.alert('Error', `Failed to save assessment: ${error.response ? error.response.data.error : error.message}`);
        }
    };

    if (loading) {
        return <View><Text>Loading...</Text></View>;
    }

    if (error) {
        return <View><Text>Error: {error}</Text></View>;
    }

    const handleSaveFollowUp = async (newFollowUp) => {
        if (!assessmentId && !editingItem) {
            Alert.alert('Error', 'No assessment selected for new follow-up.');
            return;
        }

        try {
            const token = await AsyncStorage.getItem('accessToken');
            const url = assessmentId
                ? `http://192.168.1.9:3000/medical/assessment/${assessmentId}/followup`
                : `http://192.168.1.9:3000/medical/assessment/${userData.assessment[0]._id}/followup`;

            const response = await axios.patch(
                url,
                newFollowUp,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const updatedAssessment = response.data.updatedAssessment;

            setUserData(prevUserData => ({
                ...prevUserData,
                assessment: prevUserData.assessment.map(assessment =>
                    assessment._id === updatedAssessment._id ? updatedAssessment : assessment
                )
            }));

            setIsAddFollowUpModalVisible(false);
            setEditingItem(null);
            setAssessmentId(null);
            Alert.alert('Success', 'Follow-up saved successfully.', [
                {
                    text: 'OK',
                    onPress: () => {
                        fetchUserDetails(); // Refresh user data and assessments
                    },
                },
            ]);
        } catch (error) {
            console.error('Error saving follow-up:', error);
            if (error.response) {
                Alert.alert('Error', `Failed to save follow-up: ${error.response.data.error || 'Server error'}`);
            } else if (error.request) {
                Alert.alert('Error', 'No response from server. Please check your network connection.');
            } else {
                Alert.alert('Error', `Unexpected error: ${error.message}`);
            }
        }
    };
    console.log(userData.pfp)

    const handleSaveImmunization = async (newImmunization) => {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) {
            Alert.alert('Error', 'You must be logged in to perform this action.');
            return;
        }

        try {
            let response;
            const baseUrl = 'http://192.168.1.9:3000/medical';

            if (editingItem !== null) {
                // Access the immunization ID directly from editingItem
                const immunizationId = editingItem._id;
                const { medicalInfoId, ...updateData } = newImmunization;

                console.log("Immunization ID:", immunizationId); // Log the immunization ID

                response = await axios.patch(
                    `${baseUrl}/immunization/${immunizationId}`,
                    updateData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                // Update state with the edited immunization
                setUserData(prevData => ({
                    ...prevData,
                    immunization: prevData.immunization.map((item) =>
                        item._id === immunizationId ? response.data : item // Compare by _id instead of index
                    )
                }));
                Alert.alert('Success', 'Follow-up saved successfully.', [
                    {
                        text: 'OK',
                        onPress: () => {
                            fetchUserDetails(); // Refresh user data and assessments
                        },
                    },
                ]);
            } else {
                response = await axios.post(
                    `${baseUrl}/immunization`,
                    {
                        ...newImmunization,
                        medicalInfoId: userData.assessment[0]?.medicalInfoId || userData.medicalInfo._id
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                // Add new immunization to state
                setUserData(prevData => ({
                    ...prevData,
                    immunization: [...prevData.immunization, response.data]
                }));
            }

            setEditingItem(null);
            setIsAddImmunizationModalVisible(false);
        } catch (error) {
            console.error('Error saving immunization:', error.response?.data || error.message);
            Alert.alert('Error', `Failed to save immunization: ${error.response?.data?.error || error.message}`);
        }
    };


    const handleEdit = (type, index) => {
        // Log the data and index for debugging
        const assessments = userData.assessment;
        const immunizations = userData.immunization; // Assuming this is where your immunization data is stored

        console.log("Assessments:", assessments);
        console.log("Immunizations:", immunizations);
        console.log("Index passed:", index);

        // Handle the immunization case
        if (type === "Immunizations Administered") {
            // Check if the index is valid
            if (immunizations && index >= 0 && index < immunizations.length) {
                const immunization = immunizations[index];

                // Ensure the immunization exists
                if (immunization) {
                    console.log("Selected Immunization:", immunization);
                    setEditingItem(immunization); // Set the selected immunization for editing
                    setIsAddImmunizationModalVisible(true);
                } else {
                    console.error("Immunization not found at the provided index.");
                }
            } else {
                console.error("Immunization index out of range.");
            }
            return; // Return early to avoid running the assessment logic
        }

        // Existing logic for handling assessments
        if (assessments && index >= 0 && index < assessments.length) {
            const assessment = assessments[index];
            const followUp = assessment.followUps;

            console.log("Selected Assessment: ", assessment);
            console.log("Editing Follow-Up: ", followUp);

            setAssessmentId(assessment._id); // This is where the error may occur if assessment is undefined

            if (followUp) {
                setEditingItem({
                    followUpComplaints: followUp.followUpComplaints,
                    followUpActions: followUp.followUpActions,
                });
            } else {
                console.error("No follow-up data found.");
            }

            setIsAddFollowUpModalVisible(true);
        } else {
            console.error("Assessment index out of range.");
        }


        // Open the correct modal based on the type
        switch (type) {
            case "Follow-Up":
                setIsAddFollowUpModalVisible(true);
                break;
            case "Immunizations Administered":
                setIsAddImmunizationModalVisible(true);
                break;
            default:
                console.error("Unknown type:", type);
                break;
        }
    };




    console.log(userId)

    const handleSaveProfile = async (updatedStudent) => {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) {
            Alert.alert('Error', 'You must be logged in to update your profile.');
            return;
        }

        try {
            const response = await axios.patch(`http://192.168.1.9:3000/user/profiles/${userId}`, updatedStudent, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status === 200 && response.data) {
                setUserData(prevData => {
                    const newData = {
                        ...prevData,
                        ...response.data
                    };

                    return newData;
                });
                setIsEditProfileModalVisible(false);
                Alert.alert('Success', 'Profile updated successfully');
                // Fetch user details again to confirm the update
                await fetchUserDetails();
            } else {
                throw new Error('Unexpected response from server');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            let errorMessage = 'Failed to update profile. Please try again.';
            if (error.response) {
                console.log('Error response:', error.response.data);
                errorMessage = error.response.data.error || errorMessage;
            } else if (error.request) {
                console.log('No response received:', error.request);
                errorMessage = 'No response from server. Please check your connection.';
            } else {
                console.log('Error', error.message);
                errorMessage = error.message;
            }
            Alert.alert('Error', errorMessage);
        }
    };
    const handleSaveBMI = async (bmiData) => {
        const token = await AsyncStorage.getItem('accessToken');
        try {
            const response = await axios.put(`http://192.168.1.9:3000/weight/${userId}/bmi`, bmiData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUserData(prevData => ({
                ...prevData,
                medical: {
                    ...prevData.medical,
                    height: bmiData.height,
                    weight: bmiData.weight,
                    bmi: bmiData.bmi,
                }
            }));
            setIsScanBMIModalVisible(false);
            Alert.alert('Success', 'BMI data updated successfully');
        } catch (error) {
            console.error('Error updating BMI:', error);
            Alert.alert('Error', 'Failed to update BMI');
        }
    };

    const renderArchiveChanges = (changes, title) => (
        <View>
            <Text style={styles.subtitle}>{title}</Text>
            {changes.length > 0 ? (
                changes.map((change, index) => (
                    <View key={`change-${index}`} style={styles.card}>
                        <InfoItem label="Timestamp" value={new Date(change.timestamp).toLocaleString()} />
                        {change.changedFields && Object.entries(change.changedFields).map(([field, value], idx) => (
                            <InfoItem key={`field-${index}-${idx}`} label={field} value={`Old: ${value.old}, New: ${value.new}`} />
                        ))}
                        <InfoItem
                            label="Edited by"
                            value={`${change.handledBy.firstName} ${change.handledBy.lastName}`}
                        />
                    </View>
                ))
            ) : (
                <Text style={styles.infoText}>No changes available.</Text>
            )}
        </View>
    );
    if (loading) {
        return <Text style={styles.loadingText}>Loading...</Text>;
    }

    if (error) {
        return <Text style={styles.errorText}>{error}</Text>;
    }

    if (!userData) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>
                    <Text style={styles.errorText}>No student data available</Text>
                </View>
            </SafeAreaView>
        );
    }


    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container}>
                <View style={styles.header}>
                    <Image
                        source={userData?.pfp ? { uri: userData.pfp } : require('../../assets/default-profile-pic.png')}
                        style={styles.avatar}
                    />

                    <Text style={styles.title}>{`${userData.personal.firstName} ${userData.personal.lastName}`}</Text>
                    <View style={styles.profileButtons}>
                        <Pressable
                            style={[styles.profileButton, styles.editProfileButton]}
                            onPress={() => setIsEditProfileModalVisible(true)}
                        >
                            <Text style={styles.profileButtonText}>Edit Profile</Text>
                        </Pressable>
                        <Pressable
                            style={[styles.profileButton, styles.scanBMIButton]}
                            onPress={() => setIsScanBMIModalVisible(true)}
                        >
                            <Text style={styles.profileButtonText}>Scan BMI</Text>
                        </Pressable>
                    </View>
                </View>


                <SectionCard title="Personal Information">
                    <InfoItem label="Education Level" value={userData.education.yearlvl} />
                    <InfoItem label="Gender" value={userData.personal.sex} />
                    <InfoItem label="Section" value={userData.education.section} />
                    <InfoItem label="Age" value={userData.personal.age} />
                    <InfoItem label="Civil Status" value={userData.personal.civilStatus} />
                    <InfoItem label="Birthdate" value={new Date(userData.personal.dateOfBirth).toLocaleDateString()} />
                    <InfoItem label="Address" value={userData.personal.address} />
                    <InfoItem label="Tel. No" value={userData.personal.telNo} />
                    <InfoItem label="Religion" value={userData.personal.religion} />
                    <InfoItem label="Guardian" value={userData.personal.guardian} />
                    <InfoItem label="Guardian's Address" value={userData.personal.guardianAddress} />
                    <InfoItem label="Guardian's Number" value={userData.personal.guardianTelNo} />
                </SectionCard>

                <SectionCard title="Medical History">
                    <InfoItem label="Respiratory" value={userData.medical.respiratory} />
                    <InfoItem label="Digestive" value={userData.medical.digestive} />
                    <InfoItem label="Nervous" value={userData.medical.nervous} />
                    <InfoItem label="Excretory" value={userData.medical.excretory} />
                    <InfoItem label="Endocrine" value={userData.medical.endocrine} />
                    <InfoItem label="Circulatory" value={userData.medical.circulatory} />
                    <InfoItem label="Skeletal" value={userData.medical.skeletal} />
                    <InfoItem label="Muscular" value={userData.medical.muscular} />
                    <InfoItem label="Reproductive" value={userData.medical.reproductive} />
                    <InfoItem label="Lymphatic" value={userData.medical.lymphatic} />
                </SectionCard>

                <SectionCard title="Habits">
                    <InfoItem label="Do you smoke?" value={userData.medical.smoking} />
                    <InfoItem label="Do you drink?" value={userData.medical.drinking} />
                    <InfoItem label="Allergy" value={userData.medical.allergy} />
                    <InfoItem label="Specific Allergy" value={userData.medical.specificAllergy} />
                </SectionCard>

                <SectionCard title="Physical Examination">
                    <InfoItem label="Eyes" value={userData.medical.eyes} />
                    <InfoItem label="Ear" value={userData.medical.ear} />
                    <InfoItem label="Nose" value={userData.medical.nose} />
                    <InfoItem label="Throat" value={userData.medical.throat} />
                    <InfoItem label="Tonsils" value={userData.medical.tonsils} />
                    <InfoItem label="Teeth" value={userData.medical.teeth} />
                    <InfoItem label="Tongue" value={userData.medical.tongue} />
                    <InfoItem label="Neck" value={userData.medical.neck} />
                    <InfoItem label="Thyroid" value={userData.medical.thyroids} />
                    <InfoItem label="Cervical Glands" value={userData.medical.cervicalGlands} />
                    <InfoItem label="Chest" value={userData.medical.chest} />
                    <InfoItem label="Contour" value={userData.medical.contour} />
                    <InfoItem label="Heart" value={userData.medical.heart} />
                    <InfoItem label="Rate" value={userData.medical.rate} />
                    <InfoItem label="Rhythm" value={userData.medical.rhythm} />
                    <InfoItem label="BP" value={userData.medical.bp} />
                    <InfoItem label="Height" value={userData.medical.height} />
                    <InfoItem label="Weight" value={userData.medical.weight} />
                    <InfoItem label="BMI" value={userData.medical.bmi} />
                    <InfoItem label="Lungs" value={userData.medical.lungs} />
                    <InfoItem label="Abdomen" value={userData.medical.abdomen} />
                    <InfoItem label="Liver" value={userData.medical.liver} />
                    <InfoItem label="Spleen" value={userData.medical.spleen} />
                    <InfoItem label="Kidneys" value={userData.medical.kidneys} />
                    <InfoItem label="Extremities" value={userData.medical.extremities} />
                    <InfoItem label="Upper Extremities" value={userData.medical.upperExtremities} />
                    <InfoItem label="Lower Extremities" value={userData.medical.lowerExtremities} />
                </SectionCard>

                <SectionCard title="Laboratory Examination">
                    <InfoItem label="Blood Chemistry" value={userData.medical.bloodChemistry} />
                    <InfoItem label="CBC" value={userData.medical.cbc} />
                    <InfoItem label="Urinalysis" value={userData.medical.urinalysis} />
                    <InfoItem label="Fecalysis" value={userData.medical.fecalysis} />
                </SectionCard>

                <SectionCard title="Diagnostic Procedures">
                    <InfoItem label="Chest X-ray Findings" value={userData.medical.chestXray} />
                </SectionCard>

                <SectionCard title="Others (ECG, Ultrasound, etc.)">
                    <InfoItem label="Other Procedures" value={userData.medical.others} />
                </SectionCard>


                <SectionCard title="Assessment" onAdd={handleAddAssessment}>
                    <Table
                        headers={['Date', 'Complaints', 'Actions']}
                        data={userData?.assessment?.map(assess => ({
                            date: new Date(assess.timestamp).toLocaleDateString(),
                            complaints: assess.complaints,
                            actions: assess.actions
                        })) || []}
                        onEdit={handleEditAssessment}
                    />
                </SectionCard>

                <AddEditModal
                    visible={isAddAssessmentModalVisible}
                    onClose={() => setIsAddAssessmentModalVisible(false)}
                    onSave={handleSaveAssessment}
                    title="New Assessment"
                    fields={[
                        { key: 'complaints', label: 'Complaints' },
                        { key: 'actions', label: 'Actions' }
                    ]}
                    initialValues={{}}
                />

                <AddEditModal
                    visible={isEditAssessmentModalVisible}
                    onClose={() => {
                        setIsEditAssessmentModalVisible(false);
                        setEditingAssessment(null);
                    }}
                    onSave={handleSaveAssessment}
                    title="Edit Assessment"
                    fields={[
                        { key: 'complaints', label: 'Complaints' },
                        { key: 'actions', label: 'Actions' }
                    ]}
                    initialValues={editingAssessment || {}}
                />

                <SectionCard title="Follow-Up" onAdd={handleAddFollowUp} isFollowUp={true} assessmentId={assessmentId}>
                    <Table
                        headers={['Date', 'Follow-Up Complaints', 'Follow-Up Actions']}
                        data={userData.assessment.flatMap(assessment => {
                            const followUp = assessment.followUps;
                            if (followUp) {
                                return {
                                    date: followUp.date ? new Date(followUp.date).toLocaleDateString() : "N/A",
                                    complaints: followUp.followUpComplaints,
                                    actions: followUp.followUpActions,
                                };
                            }
                            return [{ date: "", complaints: "", actions: "" }]
                        }).filter(followUp => followUp !== null)}
                        onEdit={(index) => handleEdit("Follow-Up", index)}
                        isFollowUp={true}
                    />
                </SectionCard>






                <SectionCard title="Immunizations Administered" onAdd={handleAddImmunization}>
                    <Table
                        headers={['Date', 'Vaccine', 'Remarks']}
                        data={userData?.immunization?.map((immun, index) => ({
                            date: new Date(immun.timestamp).toLocaleDateString(),
                            vaccine: immun.vaccine,
                            remarks: immun.remarks
                        })) || []}
                        onEdit={(index) => handleEdit("Immunizations Administered", index)}
                    />

                </SectionCard>

                <Pressable style={styles.archiveButton} onPress={fetchArchiveData}>
                    <Text style={styles.archiveButtonText}>Show Archive</Text>
                </Pressable>

                <Modal
                    transparent={true}
                    animationType="slide"
                    visible={showArchiveModal}
                    onRequestClose={() => setShowArchiveModal(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Archive Changes</Text>
                            <Pressable onPress={() => setShowArchiveModal(false)} style={styles.closeButton}>
                                <Text style={styles.closeButtonText}>X</Text>
                            </Pressable>
                            <ScrollView>
                                {archiveData && archiveData.changes ? (
                                    renderArchiveChanges(archiveData.changes, 'Medical Changes')
                                ) : (
                                    <Text style={styles.infoText}>No archive data available</Text>
                                )}
                            </ScrollView>
                        </View>
                    </View>
                </Modal>
            </ScrollView>

            <AddEditModal
                visible={isAddFollowUpModalVisible}
                onClose={() => {
                    setIsAddFollowUpModalVisible(false);
                    setEditingItem(null);
                }}
                onSave={handleSaveFollowUp}
                title={editingItem !== null ? "Edit Follow-Up" : "New Follow-Up"}
                fields={[
                    { key: 'followUpComplaints', label: 'Follow-Up Complaints' },
                    { key: 'followUpActions', label: 'Follow-Up Actions' }
                ]}
                initialValues={editingItem || {}}
            />



            <AddEditModal
                visible={isAddImmunizationModalVisible}
                onClose={() => {
                    setIsAddImmunizationModalVisible(false);
                    setEditingItem(null);
                }}
                onSave={handleSaveImmunization}
                title={editingItem !== null ? "Edit Immunization" : "New Immunization"}
                fields={[
                    { key: 'vaccine', label: 'Vaccine' },
                    { key: 'remarks', label: 'Remarks' }
                ]}
                initialValues={editingItem || {}}
            />

            <EditProfileModal
                visible={isEditProfileModalVisible}
                onClose={() => setIsEditProfileModalVisible(false)}
                student={userData}
                onSave={handleSaveProfile}
            />
            <ScanBMIModal
                visible={isScanBMIModalVisible}
                onClose={() => setIsScanBMIModalVisible(false)}
                onSave={handleSaveBMI}
                initialValues={{
                    height: userData.medical.height,
                    weight: userData.medical.weight,
                    bmi: userData.medical.bmi,
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    container: {
        flex: 1,
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginVertical: 20,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.primary,
        marginBottom: 10,
    },
    profileButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
    },
    profileButton: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 50,
        marginHorizontal: 5,
    },
    editProfileButton: {
        backgroundColor: Colors.green,
    },
    scanBMIButton: {
        backgroundColor: Colors.cobaltblue,
    },
    profileButtonText: {
        color: Colors.white,
        fontWeight: 'bold',
    },
    card: {
        backgroundColor: Colors.lgray,
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.primary,
        flex: 1,
        textAlign: 'center',
    },
    addButton: {
        backgroundColor: Colors.cobaltblue,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
        marginRight: 10,
    },
    addButtonText: {
        color: Colors.white,
        fontWeight: 'bold',
    },
    infoContainer: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    infoLabel: {
        fontWeight: 'bold',
        width: 120,
        color: Colors.text,
    },
    infoValue: {
        flex: 1,
        color: Colors.text,
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: Colors.lgray,
        paddingBottom: 5,
        marginBottom: 5,
    },
    tableHeaderText: {
        fontWeight: 'bold',
        width: 120,
        color: Colors.primary,
        textAlign: 'left',
        paddingRight: 10,
    },
    actionColumn: {
        width: 60,
        textAlign: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: Colors.lgray,
        paddingVertical: 8,
        alignItems: 'center',
    },
    tableRowText: {
        width: 120,
        color: Colors.text,
        textAlign: 'left',
        paddingRight: 10,
    },
    actionContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconButton: {
        padding: 5,
    },
    followUpAddContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: Colors.lgray,
    },
    noFollowUpsText: {
        fontStyle: 'italic',
        color: Colors.gray,
        marginLeft: 10,
    },
    errorText: {
        fontSize: 18,
        color: Colors.red,
        textAlign: 'center',
    },
    loadingText: {
        fontSize: 18,
        color: Colors.primary,
        textAlign: 'center',
        marginTop: 20,
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        width: '90%',
        maxHeight: '80%',
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: 20,
        alignItems: 'stretch',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalScrollView: {
        maxHeight: '70%',
        marginBottom: 20,
    },
    modalTitle: {
        marginBottom: 15,
        textAlign: 'left',
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
        color: Colors.primary,
    },
    inputContainer: {
        marginBottom: 15,
    },
    inputLabel: {
        fontSize: 16,
        marginBottom: 5,
        color: Colors.text,
    },
    input: {
        height: 40,
        borderWidth: 1,
        borderColor: Colors.lgray,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 10,
        backgroundColor: Colors.white,
    },
    largerInput: {
        height: 80,
        borderWidth: 1,
        borderColor: Colors.lgray,
        borderRadius: 5,
        paddingHorizontal: 10,
        paddingTop: 10,
        marginBottom: 10,
        backgroundColor: Colors.white,
        textAlignVertical: 'top',
    },
    nonEditableText: {
        fontSize: 16,
        color: Colors.gray,
        marginBottom: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    button: {
        borderRadius: 5,
        padding: 10,
        elevation: 2,
        minWidth: 80,
    },
    buttonClose: {
        backgroundColor: Colors.lgray,
    },
    buttonAdd: {
        backgroundColor: Colors.green,
    },
    buttonTextClose: {
        color: Colors.text,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    buttonTextAdd: {
        color: Colors.white,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    archiveButton: {
        backgroundColor: Colors.cobaltblue,
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 20,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20
    },
    archiveButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.white,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 20,
        width: '90%',
        maxHeight: '80%',
    },
    closeButton: {
        position: 'absolute',
        right: 10,
        top: 10,
        padding: 10,
    },
    closeButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    subtitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
        color: Colors.primary,
    },
    infoText: {
        fontSize: 16,
        color: Colors.gray,
        textAlign: 'center',
        marginTop: 10,
    },
});