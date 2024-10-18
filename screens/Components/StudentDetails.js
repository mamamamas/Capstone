import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Modal, TouchableWithoutFeedback, Alert, Dimensions } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../../constants/Colors';
import AddAssessmentButton from './Assessment';
import Immunization from './Immunization';
import AddFollowUpButton from './AssessFollowUp';
import { Feather } from '@expo/vector-icons';
import EditImmunization from './ImmunApi'; // Import your ImmunApi.js file
const { width } = Dimensions.get('window');
const InfoItem = ({ label, value }) => (
    <View style={styles.infoContainer}>
        <Text style={styles.infoLabel}>{label}:</Text>
        <Text style={styles.infoValue}>{value || 'N/A'}</Text>
    </View>
);
const TableHeader = ({ headers }) => (
    <View style={styles.tableHeader}>
        {headers.map((header, index) => (
            <View key={index} style={[styles.tableHeaderCell, { flex: index === headers.length - 1 ? 0.5 : 1 }]}>
                <Text style={styles.tableHeaderText}>{header}</Text>
            </View>
        ))}
    </View>
);

const TableRow = ({ data, onEdit }) => (
    <View style={styles.tableRow}>
        {Object.entries(data).map(([key, value], index) => (
            key === 'action' ? (
                <TouchableOpacity
                    key={index}
                    style={[styles.tableCellAction, { flex: 0.5 }]}
                    onPress={() => onEdit(data)}
                >
                    <Feather name="edit" size={20} color={Colors.primary} />
                </TouchableOpacity>
            ) : (
                <View key={index} style={[styles.tableCellContainer, { flex: 1 }]}>
                    <Text style={styles.tableCell}>{value}</Text>
                </View>
            )
        ))}
    </View>
);

const Table = ({ headers, data, onEdit }) => (
    <View style={styles.tableContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ width: width * 1.5 }}>
                <TableHeader headers={headers} />
                {data.map((item, index) => (
                    <TableRow key={index} data={item} onEdit={onEdit} />
                ))}
            </View>
        </ScrollView>
    </View>
);
const StudentDetails = ({ route }) => {
    const { userId, assessmentId } = route.params;
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showArchiveModal, setShowArchiveModal] = useState(false);
    const [archiveData, setArchiveData] = useState(null);
    const [followUps, setFollowUps] = useState([]);
    const [assessmentDetails, setAssessmentDetails] = useState(null);
    const [editingImmunizationId, setEditingImmunizationId] = useState(null);
    const [vaccine, setVaccine] = useState(''); // To store the vaccine input
    const [remarks, setRemarks] = useState('');
    const [modalVisible, setModalVisible] = useState(false); // To control modal visibility
    const [editingImmunization, setEditingImmunization] = useState(null);

    const [isEditing, setIsEditing] = useState(false); // To check if it's editing mode
    useEffect(() => {
        fetchUserDetails();
    }, [userId]);

    const fetchUserDetails = async () => {
        const token = await AsyncStorage.getItem('accessToken');
        const id = await AsyncStorage.getItem('id');
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
            const response = await axios.get(`http://192.168.1.10:3000/archive/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setArchiveData(response.data);
            setShowArchiveModal(true);

        } catch (err) {
            setError('Failed to load archive data');
        }
    };
    const handleCloseEditImmunization = () => {
        setEditingImmunization(null);
    };
    const handleImmunizationUpdated = (updatedImmunization) => {
        setUserData(prevData => ({
            ...prevData,
            immunization: prevData.immunization.map(immun =>
                immun._id === updatedImmunization._id ? updatedImmunization : immun
            )
        }));
    };

    const handleAssessmentAdded = (newAssessment) => {
        setUserData(prevData => ({
            ...prevData,
            assessment: [...prevData.assessment, newAssessment]
        }));
    };

    const handleImmunizationAdded = (newImmunization) => {
        setUserData(prevData => ({
            ...prevData,
            immunization: [...prevData.immunization, newImmunization]
        }));
    };
    const handleEditAssessment = (assessment) => {
        // Implement edit functionality for assessment
        Alert.alert('Edit Assessment', 'Edit functionality to be implemented');
    };
    const handleEditImmunization = (immunization) => {
        console.log('Editing immunization:', immunization); // Add this log
        setEditingImmunization(immunization);
    };

    const handleFollowUpAdded = (newFollowUp) => {
        // Update the local state with the new follow-up
        setUserData((prevData) => ({
            ...prevData,
            followUps: [...(prevData.followUps || []), newFollowUp], // Add new follow-up
        }));
        Alert.alert('Success', 'Follow-up added successfully');
    };



    const renderArchiveChanges = (changes, title) => (
        <View>
            <Text style={styles.subtitle}>{title}</Text>
            {changes.length > 0 ? (
                changes.map((change, index) => (
                    <View key={`change-${index}`} style={styles.card}>
                        <InfoItem label="Timestamp" value={new Date(change.timestamp).toLocaleString()} />
                        {change.changedFields && Object.keys(change.changedFields).map((field, idx) => (
                            <InfoItem key={`field-${index}-${idx}`} label={field} value={change.changedFields[field]} />
                        ))}
                        <InfoItem label="Edited by" value={`${change.user?.firstname || "Unknown"} (${change.user?.role || "Unknown"})`} />
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

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container}>
                <Text style={styles.title}>Personal Info</Text>
                <View style={styles.card}>
                    <Text style={styles.title}>I.</Text>
                    <InfoItem label="Name" value={`${userData.personal.firstName} ${userData.personal.lastName}`} />
                    <InfoItem label="Year Level" value={userData.education.yearlvl} />
                    <InfoItem label="Section" value={userData.education.section} />
                    <InfoItem label="Age" value={userData.personal.age} />
                    <InfoItem label="Sex" value={userData.personal.sex} />
                    <InfoItem label="CivilStatus" value={userData.personal.civilStatus} />
                    <InfoItem label="Date of Birth" value={new Date(userData.personal.dateOfBirth).toLocaleDateString()} />
                    <InfoItem label="Tel. No." value={userData.personal.telNo} />
                    <InfoItem label="Religion" value={userData.personal.religion} />
                    <InfoItem label="Guardian" value={userData.personal.guardian} />
                    <InfoItem label="guardianAddress" value={userData.personal.guardianAddress} />
                    <InfoItem label="guardianTelNo" value={userData.personal.guardianTelNo} />
                </View>

                <Text style={styles.subtitle}>Medical Info</Text>
                <View style={styles.card}>
                    <Text style={styles.title}>II.</Text>
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
                    <Text style={styles.title}>III.</Text>
                    <InfoItem label="Smoking" value={userData.medical.smoking} />
                    <InfoItem label="drinking" value={userData.medical.drinking} />
                    <InfoItem label="Allergy" value={userData.medical.allergy} />
                    <InfoItem label="SpecificAllergy" value={userData.medical.specificAllergy} />

                </View>
                <View style={styles.card}>
                    <Text style={styles.title}>IV.</Text>
                    <InfoItem label="Eyes" value={userData.medical.eyes} />
                    <InfoItem label="Ear" value={userData.medical.ear} />
                    <InfoItem label="Nose" value={userData.medical.nose} />
                    <InfoItem label="Throat" value={userData.medical.throat} />
                    <InfoItem label="Tonsils" value={userData.medical.tonsils} />
                    <InfoItem label="Teeth" value={userData.medical.teeth} />
                    <InfoItem label="Tongue" value={userData.medical.tongue} />
                    <InfoItem label="Neck" value={userData.medical.neck} />
                    <InfoItem label="Thyroids" value={userData.medical.thyroids} />
                    <InfoItem label="CervicalGlands" value={userData.medical.cervicalGlands} />
                    <Text style={styles.title}>V.</Text>
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


                </View>

                <View style={styles.card}>
                    <Text style={styles.title}>VI.</Text>
                    <InfoItem label="Abdomen" value={userData.medical.abdomen} />
                    <InfoItem label="Contour" value={userData.medical.ABcontour} />
                    <InfoItem label="Liver" value={userData.medical.liver} />
                    <InfoItem label="Spleen" value={userData.medical.spleen} />
                    <InfoItem label="Kidneys" value={userData.medical.kidneys} />
                    <Text style={styles.title}>VII.</Text>
                    <InfoItem label="Extremities" value={userData.medical.extremities} />
                    <InfoItem label="UpperExtremities" value={userData.medical.upperExtremities} />
                    <InfoItem label="LowerExtremities" value={userData.medical.lowerExtremities} />
                </View>

                <Text style={styles.subtitle}>Laboratory Examination</Text>
                <View style={styles.card}>
                    <Text style={styles.subtitle}>Laboratory Examination</Text>
                    <Text style={styles.title}>VIII.</Text>
                    <InfoItem label="BloodChemistry" value={userData.medical.bloodChemistry} />
                    <InfoItem label="CBC" value={userData.medical.cbc} />
                    <InfoItem label="Urinalysis" value={userData.medical.urinalysis} />
                    <InfoItem label="Fecalysis" value={userData.medical.fecalysis} />
                    <Text style={styles.title}>IX.</Text>
                    <Text style={styles.subtitle}>Diagnostic Procedures</Text>
                    <InfoItem label="ChestXray" value={userData.medical.chestXray} />
                    <Text style={styles.title}>X.</Text>
                    <Text style={styles.subtitle}>Others(ECG, Ultrasound, etc.)</Text>
                    <InfoItem label="Other" value={userData.medical.others} />


                </View>
                <SafeAreaView style={styles.safeArea}>
                    <ScrollView style={styles.container}>
                        {/* Personal Info and Medical Info sections remain unchanged */}
                        <Text style={styles.subtitle}>Assessments</Text>
                        <Table
                            headers={['Date', 'Complaints', 'Actions', 'Edit']}
                            data={userData.assessment.map(assess => ({
                                date: new Date(assess.timestamp).toLocaleDateString(),
                                complaints: assess.complaints,
                                actions: assess.actions,
                                action: 'edit'
                            }))}
                            onEdit={handleEditAssessment}
                        />
                        {userData.assessment.length > 0 && (
                            <AddAssessmentButton
                                medicalInfoId={userData.assessment[0].medicalInfoId}
                                onAssessmentAdded={handleAssessmentAdded}
                            />
                        )}

                        <Text style={styles.subtitle}>Follow-Ups</Text>
                        {userData.followUps && Array.isArray(userData.followUps) ? (
                            <Table
                                headers={['Complaints', 'Actions']}
                                data={userData.followUps.map(followUp => ({
                                    complaints: followUp.followUpComplaints,
                                    actions: followUp.followUpActions
                                }))}
                                onEdit={() => { }}
                            />
                        ) : (
                            <Text style={styles.infoText}>No follow-ups available</Text>
                        )}
                        {userData.assessment.length > 0 && (
                            <AddFollowUpButton
                                assessmentId={userData.assessment[0]._id}
                                onFollowUpAdded={handleFollowUpAdded}
                            />
                        )}

                        <Text style={styles.subtitle}>Immunization</Text>
                        <Table
                            headers={['Date', 'Vaccine', 'Remarks', 'Edit']}
                            data={userData.immunization.map(immun => ({
                                date: new Date(immun.timestamp).toLocaleDateString(),
                                vaccine: immun.vaccine,
                                remarks: immun.remarks,
                                action: 'edit',
                                _id: immun._id
                            }))}
                            onEdit={handleEditImmunization}
                        />
                        <Immunization
                            medicalInfoId={userData.immunization[0]?.medicalInfoId}
                            onImmunizationAdded={handleImmunizationAdded}
                        />
                        {editingImmunization && (
                            <EditImmunization
                                immunization={editingImmunization}
                                onImmunizationUpdated={handleImmunizationUpdated}
                                onCloseModal={handleCloseEditImmunization}
                            />
                        )}
                    </ScrollView>
                </SafeAreaView>
                <TouchableOpacity style={styles.archiveButton} onPress={fetchArchiveData}>
                    <Text style={styles.archiveButtonText}>Show Archive</Text>
                </TouchableOpacity>
                <Modal
                    transparent={true}
                    animationType="slide"
                    visible={showArchiveModal}
                    onRequestClose={() => setShowArchiveModal(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Archive Changes</Text>
                            <TouchableWithoutFeedback onPress={() => setShowArchiveModal(false)}>
                                <View style={styles.closeButton}>
                                    <Text style={styles.closeButtonText}>X</Text>
                                </View>
                            </TouchableWithoutFeedback>
                            {archiveData && (
                                <ScrollView>
                                    {archiveData.medicalArchive?.changes?.length > 0 ? (
                                        renderArchiveChanges(archiveData.medicalArchive.changes, 'Medical Changes')
                                    ) : (
                                        <Text>No Medical Changes available</Text>
                                    )}
                                    {archiveData.immunizationArchives?.length > 0 && archiveData.immunizationArchives.some(immunization => immunization.changes?.length > 0) ? (
                                        archiveData.immunizationArchives.map((immunization, index) => (
                                            immunization.changes?.length > 0 && renderArchiveChanges(immunization.changes, `Immunization Changes ${index + 1}`)
                                        ))
                                    ) : (
                                        <Text>No Immunization Changes available</Text>
                                    )}
                                    {archiveData.assessmentArchives?.length > 0 && archiveData.assessmentArchives.some(assessment => assessment.changes?.length > 0) ? (
                                        archiveData.assessmentArchives.map((assessment, index) => (
                                            assessment.changes?.length > 0 && renderArchiveChanges(assessment.changes, `Assessment Changes ${index + 1}`)
                                        ))
                                    ) : (
                                        <Text>No Assessment Changes available</Text>
                                    )}
                                </ScrollView>
                            )}
                        </View>
                    </View>
                </Modal>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    container: {
        flex: 1,
        padding: 20,
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: Colors.primary,
    },
    subtitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
        color: Colors.primary,
    },
    card: {
        backgroundColor: Colors.lgray,
        borderRadius: 12,
        padding: 10,
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    infoContainer: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    infoLabel: {
        fontWeight: 'bold',
        width: 120,
        color: 'black',
    },
    infoValue: {
        flex: 1,
        color: 'black',
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
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: Colors.primary,
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
    infoText: {
        fontSize: 16,
        color: Colors.gray,
        textAlign: 'center',
        marginTop: 10,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: Colors.primary,
    },
    tableHeaderCell: {
        padding: 10,
        justifyContent: 'center',
    },
    tableHeaderText: {
        fontWeight: 'bold',
        color: Colors.black,
        textAlign: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: Colors.lgray,
        backgroundColor: Colors.white,
    },
    tableCellContainer: {
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tableCell: {
        color: Colors.black,
        textAlign: 'center',
    },
    tableCellAction: {
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default StudentDetails;