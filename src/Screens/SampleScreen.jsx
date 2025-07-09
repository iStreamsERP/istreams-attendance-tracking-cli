// HomeScreen.js
import React, { useState } from "react";
import { View, Button, Image, StyleSheet } from "react-native";
import ManualImageCaptureModal from "../Modal/ManualImageCaptureModal";

const SampleScreen = () => {
  const [cameraVisible, setCameraVisible] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);

  const handleCapture = (uri) => {
    console.log("Captured image URI:", uri);
    setCapturedImage(uri);
  };

  return (
    <View style={styles.container}>
      <Button title="📷 Open Camera" onPress={() => setCameraVisible(true)} />
      {capturedImage && (
        <Image source={{ uri: capturedImage }} style={styles.previewImage} />
      )}

      <ManualImageCaptureModal
        visible={cameraVisible}
        onClose={() => setCameraVisible(false)}
        onCapture={handleCapture}
      />
    </View>
  );
};

export default SampleScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  previewImage: {
    width: 200,
    height: 200,
    marginTop: 20,
    borderRadius: 10,
  },
});
