import React, { useEffect } from 'react';
import { View, Button, PermissionsAndroid } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';

const CameraPermission = () => {
  const requestCameraPermission = async () => {
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
  };

  const selectImage = async () => {
    // Check for camera permission before launching the image picker
    const hasPermission = await requestCameraPermission();
    if (hasPermission) {
      // Launch the image picker if permission is granted
      const options = {
        mediaType: 'photo',
        includeBase64: false,
      };
      const response = await launchImageLibrary(options);
      // Handle the response here
      console.log(response);
    } else {
      console.log("Camera permission denied");
    }
  };

  return (
    <View>
      <Button title="Select Image" onPress={selectImage} />
    </View>
  );
};

export default CameraPermission;
