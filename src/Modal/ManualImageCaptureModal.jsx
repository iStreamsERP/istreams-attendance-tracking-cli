import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Modal,
    View,
    StyleSheet,
    TouchableOpacity,
    Text,
    Image,
    Alert,
    BackHandler
} from "react-native";
import {
    Camera as VisionCamera,
    getCameraDevice,
    useCameraDevices,
    useCameraPermission,
} from "react-native-vision-camera";
import { GlobalStyles } from "../Styles/styles";
import { useTheme } from "../Context/ThemeContext";
import LottieView from "lottie-react-native";

const ManualImageCaptureModal = ({ visible, onClose, onCapture }) => {
    const [isActive, setIsActive] = useState(true);
    const [cameraPosition, setCameraPosition] = useState('back');
    const [capturedImage, setCapturedImage] = useState(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);

    const cameraRef = useRef(null);
    const { hasPermission, requestPermission } = useCameraPermission();
    const devices = useCameraDevices();

    useEffect(() => {
        if (!hasPermission) requestPermission();
    }, [hasPermission]);

    const cameraDevice = useMemo(() => {
        return getCameraDevice(devices, cameraPosition) || devices.back || devices.front;
    }, [devices, cameraPosition]);

    const toggleCamera = useCallback(() => {
        setCameraPosition((prev) => (prev === "front" ? "back" : "front"));
    }, []);

    const handleCapture = useCallback(async () => {
        if (isCapturing || !cameraRef.current) return;
        setIsCapturing(true);

        try {
            const photo = await cameraRef.current.takePhoto({
                qualityPrioritization: 'balanced',
                flash: 'off',
                skipMetadata: false,
            });

            const originalUri = `file://${photo.path}`;

            setCapturedImage(originalUri);

        } catch (error) {
            console.error('Error capturing image:', error);
            Alert.alert("Capture Error", error.message);
        } finally {
            setIsCapturing(false);
        }
    }, [isCapturing]);

    const handleSave = () => {
        if (capturedImage) {
            onCapture(capturedImage);
            setCapturedImage(null);
            onClose();
        }
    };

    const handleRetake = () => {
        setCapturedImage(null);
    };

    useEffect(() => {
        const handler = BackHandler.addEventListener('hardwareBackPress', () => {
            if (capturedImage) {
                setCapturedImage(null);
                return true;
            }
            return false;
        });

        return () => handler.remove();
    }, [capturedImage]);

    return (
        <Modal visible={visible} animationType="slide" transparent={false}>
            <View style={styles.container}>
                {capturedImage ? (
                    <View style={styles.previewContainer}>
                        <Image source={{ uri: capturedImage }} style={styles.previewImage}
                            resizeMode="contain" />
                        <View style={styles.previewControls}>
                            <TouchableOpacity onPress={handleRetake} style={styles.previewButton}>
                                <Text style={styles.previewButtonText}>Retake</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleSave} style={[styles.previewButton, styles.saveButton]}>
                                <Text style={styles.previewButtonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <>
                        {cameraDevice && (
                            <VisionCamera
                                ref={cameraRef}
                                style={StyleSheet.absoluteFill}
                                device={cameraDevice}
                                isActive={isActive}
                                photo={true}
                            />
                        )}
                        <View style={[globalStyles.twoInputContainer, styles.rotateControl]}>
                            <LottieView
                                source={require('../../assets/animations/rotate_phone.json')}
                                style={{ width: 70, height: 70 }}
                                autoPlay
                                loop
                            />
                            <Text style={[globalStyles.subtitle, { color: '#FFF' }]}>Rotate Your Mobile to Capture</Text>
                        </View>

                        <View style={styles.controlsContainer}>
                            <TouchableOpacity onPress={toggleCamera} style={styles.controlButton}>
                                <Text style={[globalStyles.subtitle, { color: '#FFF' }]}>🔄 Flip</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleCapture} style={styles.captureButton}>
                                <View style={styles.captureButtonInner} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={onClose} style={styles.controlButton}>
                                <Text style={[globalStyles.subtitle, { color: 'red' }]}>✖ Close</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </View>
        </Modal>
    );
};

export default ManualImageCaptureModal;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    rotateControl: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    controlsContainer: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    controlButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 15,
        borderRadius: 30,
        minWidth: 80,
        alignItems: 'center',
    },
    captureButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFF',
    },
    captureButtonInner: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#FFF',
    },
    previewContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#000',
    },
    previewImage: {
        width: '100%',
        height: '80%',
    },
    previewControls: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    previewButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
        minWidth: 100,
        alignItems: 'center',
    },
    saveButton: {
        backgroundColor: '#1C6758',
    },
    previewButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});