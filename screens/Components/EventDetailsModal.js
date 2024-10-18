import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';

const EventDetailsModal = ({ visible, events, onClose, onEdit, onDelete }) => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [actionsModalVisible, setActionsModalVisible] = useState(false);

  const renderEventItem = ({ item }) => (
    <View style={styles.eventItem}>
      <Text style={styles.modalTitle}>{item.title || 'No Title'}</Text>
      <View style = {{ flexDirection: 'row',
    justifyContent: 'space-between',}}>
      <View>
      <Text style={styles.modalText}>Start Date: {item.start}</Text>
      <Text style={styles.modalText}>End Date: {item.end}</Text>
      </View>
      <TouchableOpacity onPress={() => {
        setSelectedEvent(item);
        setActionsModalVisible(true);
      }}>
          <MaterialIcons name="more-vert" size={24} color={Colors.black} />
      </TouchableOpacity>
      </View>
    </View>
  );

  const handleEdit = () => {
    if (onEdit) {
      onEdit(selectedEvent);
    }
    setActionsModalVisible(false);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(selectedEvent);
    }
    setActionsModalVisible(false);
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={onClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {events.length ? (
              <FlatList
                data={events}
                renderItem={renderEventItem}
                keyExtractor={(item) => item.start || item.title}
              />
            ) : (
              <Text>No Events Available</Text>
            )}
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {selectedEvent && (
        <Modal
          visible={actionsModalVisible}
          transparent
          animationType="none"
          onRequestClose={() => setActionsModalVisible(false)}
        >
          <View style={{  flex: 1,
      justifyContent: 'center',
      alignItems: 'center',}}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Options</Text>
              <View style={styles.buttonContainer}>
  <TouchableOpacity onPress={handleEdit} style={styles.actionButton}>
    <Text style={styles.actionButtonText}>Edit</Text>
  </TouchableOpacity>
  <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
    <Text style={styles.actionButtonText}>Delete</Text>
  </TouchableOpacity>
</View>

              <TouchableOpacity onPress={() => setActionsModalVisible(false)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      width: '80%',
      padding: 20,
      backgroundColor: 'white',
      borderRadius: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    eventItem: {
      marginBottom: 15,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
      textAlign: 'Left',
    },
    modalText: {
      fontSize: 14,
      marginBottom: 5,
    },
    closeButton: {
      marginTop: 20,
      padding: 10,
      backgroundColor: Colors.cobaltblue,
      borderRadius: 20,
      alignItems: 'center',
    },
    closeButtonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 16,
    },
    actionButton: {
      flex: 1,  // Equal width for both buttons
      marginHorizontal: 5,  // Adds space between the buttons
      padding: 10,
      backgroundColor: Colors.cobaltblue,
      borderRadius: 20,
      alignItems: 'center',
    },
    actionButtonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 16,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
    },
  });
  

export default EventDetailsModal;
