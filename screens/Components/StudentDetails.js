import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, Pressable, Modal, TextInput, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../../constants/Colors';

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
                <Pressable onPress={onEdit} style={styles.iconButton}>
                    <Ionicons name="pencil" size={18} color={Colors.primary} />
                </Pressable>
            </View>
        </View>
    );
};

const AddEditModal = ({ visible, onClose, onSave, title, fields, initialValues = {} }) => {
    const [values, setValues] = useState(initialValues);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        if (!isDirty) {
            setValues(initialValues);
        }
    }, [initialValues, isDirty]);

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
            // You might want to show a confirmation dialog here
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
    const [editedStudent, setEditedStudent] = useState({ ...student });

    const handleSave = () => {
        onSave(editedStudent);
        onClose();
    };

    const renderField = (key, label, editable = true, section = null) => (
        <View key={key}>
            {section && <Text style={styles.sectionTitle}>{section}</Text>}
            <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{label}:</Text>
                {editable ? (
                    <TextInput
                        style={styles.input}
                        onChangeText={(text) => setEditedStudent({ ...editedStudent, [key]: text })}
                        value={editedStudent[key]?.toString() || ''}
                    />
                ) : (
                    <Text style={styles.nonEditableText}>{editedStudent[key]?.toString() || 'N/A'}</Text>
                )}
            </View>
        </View>
    );

    const nonEditableFields = [
        { key: 'name', label: 'Full Name', section: 'I. Personal Information' },
        { key: 'educationLevel', label: 'Education Level' },
        { key: 'grade', label: 'Grade/Year' },
        { key: 'section', label: 'Section' },
        { key: 'age', label: 'Age' },
        { key: 'sex', label: 'Sex' },
        { key: 'civilStatus', label: 'Civil Status' },
        { key: 'birthdate', label: 'Birthdate' },
        { key: 'address', label: 'Address' },
        { key: 'telNo', label: 'Tel. No.' },
        { key: 'religion', label: 'Religion' },
        { key: 'guardian', label: 'Guardian' },
        { key: 'guardianAddress', label: "Guardian's Address" },
        { key: 'guardianNumber', label: "Guardian's Number" },
    ];

    const editableFields = [
        { key: 'respiratory', label: 'Respiratory', section: 'II. Medical History' },
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
        { key: 'smoking', label: 'Do you smoke?', section: 'III. Habits and Allergies' },
        { key: 'drinking', label: 'Do you drink?' },
        { key: 'allergy', label: 'Allergy?' },
        { key: 'eyes', label: 'Eyes', section: 'IV. Physical Examination' },
        { key: 'ear', label: 'Ear' },
        { key: 'nose', label: 'Nose' },
        { key: 'throat', label: 'Throat' },
        { key: 'tonsils', label: 'Tonsils' },
        { key: 'teeth', label: 'Teeth' },
        { key: 'tongue', label: 'Tongue' },
        { key: 'neck', label: 'Neck' },
        { key: 'thyroid', label: 'Thyroid' },
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
        { key: 'upper', label: 'Upper' },
        { key: 'lower', label: 'Lower' },
        { key: 'bloodChemistry', label: 'Blood Chemistry', section: 'V. Laboratory Examination' },
        { key: 'cbc', label: 'CBC' },
        { key: 'urinalysis', label: 'Urinalysis' },
        { key: 'fecalysis', label: 'Fecalysis' },
        { key: 'chestXray', label: 'Chest X-ray Findings', section: 'VI. Diagnostic Procedures' },
        { key: 'otherProcedures', label: 'Other Procedures', section: 'VII. Others (ECG, Ultrasound, etc.)' },
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
                        {nonEditableFields.map((field, index) =>
                            renderField(field.key, field.label, false, index === 0 ? field.section : null)
                        )}

                        {editableFields.map((field, index) =>
                            renderField(field.key, field.label, true, field.section)
                        )}
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

    useEffect(() => {
        setValues(initialValues);
    }, [initialValues]);

    const handleSave = () => {
        onSave(values);
        onClose();
    };

    const calculateBMI = () => {
        const height = parseFloat(values.height);
        const weight = parseFloat(values.weight);
        if (height && weight) {
            const bmi = (weight / ((height / 100) * (height / 100))).toFixed(2);
            setValues({ ...values, bmi });
        }
    };

    useEffect(() => {
        calculateBMI();
    }, [values.height, values.weight]);

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
                        <Text style={styles.inputLabel}>Height:</Text>
                        <TextInput
                            style={styles.input}
                            onChangeText={(text) => setValues({ ...values, height: text })}
                            value={values.height}
                            keyboardType="numeric"
                            placeholder="Enter height in cm"
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Weight:</Text>
                        <TextInput
                            style={styles.input}
                            onChangeText={(text) => setValues({ ...values, weight: text })}
                            value={values.weight}
                            keyboardType="numeric"
                            placeholder="Enter weight in kg"
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>BMI:</Text>
                        <TextInput
                            style={styles.input}
                            value={values.bmi}
                            editable={false}
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
    const { userId, assessmentId } = route.params;
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
    useEffect(() => {
        fetchUserDetails();
    }, [userId]);




    const fetchUserDetails = async () => {
        const token = await AsyncStorage.getItem('accessToken');
        try {
            const response = await axios.get(`http://192.168.1.10:3000/user/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUserData(response.data);
        } catch (err) {
            console.error('Failed to load user details', err);
            setError('Failed to load user details');
        } finally {
            setLoading(false);
        }
    };

    const fetchArchiveData = async () => {
        const token = await AsyncStorage.getItem('accessToken');
        try {
            const response = await axios.get(`http://192.168.1.10:3000/archive/${userId}/assessment`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });



            setArchiveData(response.data);
            setShowArchiveModal(true);
        } catch (err) {
            console.error('Error fetching archive data:', err);
            setError('Failed to load archive data');
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
    };
    const handleAddAssessment = () => {
        setEditingAssessment(null);
        setIsAddAssessmentModalVisible(true);
        setIsEditAssessmentModalVisible(false);

        if (userData && userData.assessment) {
            console.log(userData.assessment[0]?.medicalInfoId); // Optional chaining to avoid errors
        } else {
            console.log('userData or assessments are undefined');
        }
    };


    const handleEditAssessment = (index) => {
        const selectedAssessment = userData.assessment[index];
        console.log('Selected Assessment:', selectedAssessment);
        setEditingAssessment(selectedAssessment);
        setIsEditAssessmentModalVisible(true);
        setIsAddAssessmentModalVisible(false);
    };


    const handleSaveAssessment = async (newAssessment) => {
        const token = await AsyncStorage.getItem('accessToken');
        try {
            let response;
            if (editingAssessment) {
                const { medicalInfoId, originalDocument, ...updateData } = newAssessment;
                response = await axios.patch(
                    `http://192.168.1.10:3000/medical/assessment/${editingAssessment._id}`,
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
                response = await axios.post(
                    `http://192.168.1.10:3000/medical/assessment`,
                    {
                        ...newAssessment,
                        medicalInfoId: userData.assessment[0]?.medicalInfoId || userData.medicalInfo._id
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (response.status === 201 || response.status === 200) {
                    setUserData(prevData => ({
                        ...prevData,
                        assessment: [...prevData.assessment, response.data]
                    }));
                    console.log('New assessment added successfully');
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
        const token = await AsyncStorage.getItem('accessToken');
        try {
            let response;
            if (editingItem !== null) {
                // Editing existing follow-up
                response = await axios.put(
                    `http://192.168.1.10:3000/assessment/${userData.assessment[0]._id}/followup/${userData.followUps[editingItem]._id}`,
                    newFollowUp,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                console.log()
                setUserData(prevData => ({
                    ...prevData,
                    followUps: prevData.followUps.map((item, index) =>
                        index === editingItem ? response.data : item
                    )
                }));
            } else {
                // Adding new follow-up
                response = await axios.post(
                    `http://192.168.1.10:3000/assessment/${userData.assessment[0]._id}/followup`,
                    newFollowUp,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                setUserData(prevData => ({
                    ...prevData,
                    followUps: [...(prevData.followUps || []), response.data]
                }));
            }
            setEditingItem(null);
            setIsAddFollowUpModalVisible(false);
        } catch (error) {
            console.error('Error saving follow-up:', error);
            Alert.alert('Error', 'Failed to save follow-up');
        }
    };

    const handleSaveImmunization = async (newImmunization) => {
        const token = await AsyncStorage.getItem('accessToken');
        try {
            let response;
            if (editingItem !== null) {
                response = await axios.put(`http://192.168.1.10:3000/immunization/${userData.immunization[editingItem]._id}`, newImmunization, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUserData(prevData => ({
                    ...prevData,
                    immunization: prevData.immunization.map((item, index) =>
                        index === editingItem ? response.data : item
                    )
                }));
            } else {
                response = await axios.post(`http://192.168.1.10:3000/immunization`, {
                    ...newImmunization,
                    medicalInfoId: userData.immunization[0].medicalInfoId
                }, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUserData(prevData => ({
                    ...prevData,
                    immunization: [...prevData.immunization, response.data]
                }));
            }
            setEditingItem(null);
            setIsAddImmunizationModalVisible(false);
        } catch (error) {
            console.error('Error saving immunization:', error);
            Alert.alert('Error', 'Failed to save immunization');
        }
    };

    const handleEdit = (type, index) => {
        setEditingItem(index);
        switch (type) {
            // case "Assessment":
            //     setIsAddAssessmentModalVisible(true);
            //     break;
            case "Follow-Up":
                setIsAddFollowUpModalVisible(true);
                break;
            case "Immunizations Administered":
                setIsAddImmunizationModalVisible(true);
                break;
        }
    };


    const handleSaveProfile = async (updatedStudent) => {
        const token = await AsyncStorage.getItem('accessToken');
        try {
            const response = await axios.put(`http://192.168.1.10:3000/user/${userId}`, updatedStudent, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUserData(response.data);
            setIsEditProfileModalVisible(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            Alert.alert('Error', 'Failed to update profile');
        }
    };

    const handleSaveBMI = async (bmiData) => {
        const token = await AsyncStorage.getItem('accessToken');
        try {
            const response = await axios.put(`http://192.168.1.10:3000/user/${userId}/bmi`, bmiData, {
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
                        source={userData.profilePic ? { uri: userData.profilePic } : require('../../assets/default-profile-pic.png')}
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

                <SectionCard title="Follow-Up" onAdd={handleAddFollowUp} isFollowUp={true}>
                    <Table
                        headers={['Date', 'Complaints', 'Actions']}
                        data={(userData.followUps || []).map(followUp => ({
                            date: new Date(followUp.date).toLocaleDateString(),
                            complaints: followUp.followUpComplaints,
                            actions: followUp.followUpActions
                        }))}
                        onEdit={(index) => handleEdit("Follow-Up", index)}
                        isFollowUp={true}
                    />
                </SectionCard>


                <SectionCard title="Immunizations Administered" onAdd={handleAddImmunization}>
                    <Table
                        headers={['Date', 'Vaccine', 'Remarks']}
                        data={userData.immunization.map(immun => ({
                            date: new Date(immun.timestamp).toLocaleDateString(),
                            vaccine: immun.vaccine,
                            remarks: immun.remarks
                        }))}
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
                initialValues={editingItem !== null ? userData.followUps[editingItem] : {}}
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
                initialValues={editingItem !== null ? userData.immunization[editingItem] : {}}
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