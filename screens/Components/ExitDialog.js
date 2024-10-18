// components/ExitDialog.js
import React from 'react';
import Dialog from 'react-native-dialog';

const ExitDialog = ({ visible, onCancel, onConfirm, title = "Exit App", description = "Do you want to close the app?" }) => {
  return (
    <Dialog.Container visible={visible}>
      <Dialog.Title>{title}</Dialog.Title>
      <Dialog.Description>{description}</Dialog.Description>
      <Dialog.Button label="Cancel" onPress={onCancel} />
      <Dialog.Button label="Close" onPress={onConfirm} />
    </Dialog.Container>
  );
};

export default ExitDialog;
