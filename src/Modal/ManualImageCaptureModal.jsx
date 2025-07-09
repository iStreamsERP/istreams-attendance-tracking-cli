// components/ManualImageCaptureModal.js
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
import { compressImage } from "../Utils/UriToBase64Utils";
import RNFS from 'react-native-fs';

const ManualImageCaptureModal = ({ visible, onClose, onCapture }) => {
    const [isActive, setIsActive] = useState(true);
    const [isCameraInitialized, setIsCameraInitialized] = useState(false);
    const [cameraPosition, setCameraPosition] = useState('back');
    const [capturedImage, setCapturedImage] = useState(null);
    const [debugInfo, setDebugInfo] = useState('Initializing...');
    const [isCapturing, setIsCapturing] = useState(false);

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
                skipMetadata: true,
            });

            const originalUri = `file://${photo.path}`;

            const compressedUri = await compressImage(originalUri);

            //console.log('Compressed URI:', compressedUri);

            // try {
            //     const originalStats = await RNFS.stat(originalUri);
            //     const compressedStats = await RNFS.stat(compressedUri);
            //     console.log('Original size:', Math.round(originalStats.size / 1024), 'KB');
            //     console.log('Compressed size:', Math.round(compressedStats.size / 1024), 'KB');
            //     const compressionRatio = ((1 - compressedStats.size / originalStats.size) * 100);
            //     console.log('Size reduction:', compressionRatio.toFixed(1) + '%');
            // } catch (e) {
            //     console.warn('Failed to get file stats:', e.message);
            // }

            setCapturedImage(compressedUri);

            if (compressedUri !== originalUri) {
                try {
                    await RNFS.unlink(originalUri);
                    console.log('Original file cleaned up');
                } catch (e) {
                    console.warn('Failed to delete original file:', e.message);
                }
            }

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
                        <View style={styles.controlsContainer}>
                            <TouchableOpacity onPress={toggleCamera} style={styles.controlButton}>
                                <Text style={styles.controlText}>🔄 Flip</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleCapture} style={styles.captureButton}>
                                <View style={styles.captureButtonInner} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={onClose} style={styles.controlButton}>
                                <Text style={styles.controlText}>✖ Close</Text>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    loadingText: {
        color: '#FFF',
        marginTop: 16,
        fontSize: 16,
    },
    debugText: {
        color: '#FFF',
        fontSize: 12,
        marginTop: 8,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#000',
    },
    permissionText: {
        color: '#FFF',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
    permissionButton: {
        backgroundColor: '#1C6758',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 8,
    },
    permissionButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    errorText: {
        color: '#FF4444',
        fontSize: 16,
        textAlign: 'center',
    },
    cameraContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    statusContainer: {
        position: 'absolute',
        top: 50,
        alignSelf: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFF',
        textAlign: 'center',
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
    controlText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold',
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
    captureButtonDisabled: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderColor: '#888',
    },
    captureButtonInner: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#FFF',
    },
    captureButtonInnerDisabled: {
        backgroundColor: '#888',
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
    closePreviewButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closePreviewText: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: 'bold',
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
    successModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    successModal: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 30,
        width: '80%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    successIcon: {
        fontSize: 60,
        marginBottom: 20,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1C6758',
        marginBottom: 10,
    },
    successMessage: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    successModalButton: {
        backgroundColor: '#1C6758',
        paddingHorizontal: 30,
        paddingVertical: 10,
        borderRadius: 8,
    },
    successModalButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    }
});
