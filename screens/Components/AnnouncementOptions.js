import React from 'react';
import { View, Text, Pressable, StyleSheet, Modal, TouchableWithoutFeedback, Keyboard } from 'react-native';
import Colors from '../../constants/Colors';

const AnnouncementOptions = ({ visible, onClose, onEdit, onDelete }) => {
  // Handles closing the modal when clicking outside
  const handleOutsideClick = () => {
    Keyboard.dismiss(); // Dismiss the keyboard if it's open
    onClose();
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="none" // No animation
      onRequestClose={onClose} // Handles the back button press
    >
      <TouchableWithoutFeedback onPress={handleOutsideClick}>
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <Pressable style={styles.option} onPress={onEdit}>
              <Text style={styles.optionText}>Edit</Text>
            </Pressable>
            <Pressable style={styles.option} onPress={onDelete}>
              <Text style={styles.optionText}>Delete</Text>
            </Pressable>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent', // No dim background
  },
  modalContainer: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 10,
    width: 200,
    elevation: 5,
  },
  option: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lgray,
    borderTopWidth: 1,
    borderTopColor: Colors.lgray,
  },
  optionText: {
    fontSize: 16,
    color: Colors.black,
  },
});

export default AnnouncementOptions;
