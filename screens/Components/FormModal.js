import React from 'react';
import PropTypes from 'prop-types';
import { Modal, View, TextInput, Pressable, Text, StyleSheet } from 'react-native';
import Colors from '../../constants/Colors';

const FormModal = ({
  visible,
  onClose,
  formFields,
  onSave,
  saveLabel = 'Save',
  cancelLabel = 'Cancel',
  modalStyle,
  buttonStyle
}) => {
  return (
    <Modal visible={visible} transparent animationType='none'>
      <View style={[styles.modalContainer, modalStyle]}>
        <View style={styles.modalContent}>
          {formFields.map((field, index) => (
            <TextInput
              key={index}
              placeholder={field.placeholder}
              style={[
                styles.input,
                field.isDescription && styles.descriptionInput // Apply description-specific styling
              ]}
              value={field.value}
              onChangeText={field.onChangeText}
              multiline={field.isDescription || false} // Make the input multiline if it's the description
              textAlignVertical={field.isDescription ? 'top' : 'center'} // Align text at the top for the description
              accessibilityLabel={field.placeholder} // for accessibility
            />
          ))}

          <View style={styles.modalButtonContainer}>
            <Pressable onPress={onSave} style={[styles.modalButton, buttonStyle]}>
              <Text style={styles.modalButtonText}>{saveLabel}</Text>
            </Pressable>
            <Pressable onPress={onClose} style={[styles.modalButton, buttonStyle]}>
              <Text style={styles.modalButtonText}>{cancelLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

FormModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  formFields: PropTypes.arrayOf(
    PropTypes.shape({
      placeholder: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
      onChangeText: PropTypes.func.isRequired,
      isDescription: PropTypes.bool, // Optional field for larger text inputs like description
    })
  ).isRequired,
  onSave: PropTypes.func.isRequired,
  saveLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  modalStyle: PropTypes.object,
  buttonStyle: PropTypes.object,
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Added dim background
  },
  modalContent: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.lgray,
    marginBottom: 10,
    padding: 8, // Added padding for better user experience
  },
  descriptionInput: {
    height: 100, // Larger height for description
    textAlignVertical: 'top', // Ensure text starts at the top
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    backgroundColor: Colors.cobaltblue,
    padding: 10,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: Colors.white,
  },
});

export default FormModal;
