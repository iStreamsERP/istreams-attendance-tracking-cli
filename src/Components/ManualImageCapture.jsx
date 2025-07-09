import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    View,
    Alert,
    TouchableOpacity,
    Image,
    BackHandler
} from "react-native";
import {
    Camera as VisionCamera,
    getCameraDevice,
    useCameraDevices,
    useCameraPermission,
} from "react-native-vision-camera";

const ManualImageCapture = () => {
    const [isActive, setIsActive] = useState(true);
    const [isCameraInitialized, setIsCameraInitialized] = useState(false);
    const [cameraPosition, setCameraPosition] = useState('back');
    const [capturedImage, setCapturedImage] = useState(null);
    const [debugInfo, setDebugInfo] = useState('Initializing...');
    const [isCapturing, setIsCapturing] = useState(false);

    const cameraRef = useRef(null);

    const { hasPermission, requestPermission } = useCameraPermission();
    const devices = useCameraDevices();

    // Handle photo capture
    const handleCapture = useCallback(async () => {
        // Prevent multiple captures
        if (isCapturing) {
            console.log('Already capturing, skipping...');
            return false;
        }

        if (!cameraRef.current) {
            Alert.alert("Error", "Camera not ready");
            return false;
        }

        try {
            setIsCapturing(true);
            console.log('Taking photo...');

            const photo = await cameraRef.current.takePhoto({
                qualityPrioritization: 'balanced',
                flash: 'off',
                skipMetadata: false,
            });

            if (photo?.path) {
                setCapturedImage(`file://${photo.path}`);
                return true;
            }

            Alert.alert("Error", "Failed to capture photo");
            return false;
        } catch (error) {
            console.error('Capture error:', error);
            Alert.alert("Error", `Capture failed: ${error.message}`);
            return false;
        } finally {
            setIsCapturing(false);
        }
    }, [isCapturing]);

    // Toggle camera position
    const toggleCamera = useCallback(() => {
        setCameraPosition(prev => prev === 'front' ? 'back' : 'front');
    }, []);

    // Cleanup effects
    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            if (capturedImage) {
                setCapturedImage(null);
                return true;
            }
            return false;
        });

        return () => {
            backHandler.remove();
        };
    }, [capturedImage]);

    // Component unmount cleanup
    useEffect(() => {
        return () => {
            setIsActive(false);
        };
    }, []);

    // Initialize camera
    useEffect(() => {
        const initializeCamera = async () => {
            if (!hasPermission) {
                const granted = await requestPermission();
                if (!granted) {
                    setDebugInfo('Camera permission denied');
                    return;
                }
            }
            setIsCameraInitialized(true);
            setDebugInfo('Camera initialized');
        };
        initializeCamera();
    }, [hasPermission, requestPermission]);

    // Camera device selection
    const cameraDevice = useMemo(() => {
        if (!devices || Object.keys(devices).length === 0) {
            setDebugInfo('No camera devices found');
            return null;
        }

        const device = getCameraDevice(devices, cameraPosition) ||
            devices.back ||
            devices.front ||
            Object.values(devices).find(d => d);

        if (device) {
            setDebugInfo(`Using ${device.position} camera`);
        } else {
            setDebugInfo('No suitable camera device found');
        }

        return device;
    }, [devices, cameraPosition]);

    // Check if capture button should be enabled
    const isCaptureButtonEnabled = () => {
        return !isCapturing && isCameraInitialized;
    };

    // Get capture status message
    const getCaptureStatusMessage = () => {
        if (isCapturing) return "📸 Capturing...";
        if (!isCameraInitialized) return "🔄 Initializing camera...";
        return "📷 Ready to capture";
    };

    // Get capture status color
    const getCaptureStatusColor = () => {
        if (isCapturing) return "#FFA500";
        if (!isCameraInitialized) return "#FF6B6B";
        return "#4CAF50";
    };

    // Render camera controls
    const renderControls = () => (
        <View style={styles.controlsContainer}>
            <TouchableOpacity
                style={styles.controlButton}
                onPress={toggleCamera}
            >
                <Text style={styles.controlText}>🔄 Flip</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[
                    styles.captureButton,
                    !isCaptureButtonEnabled() && styles.captureButtonDisabled
                ]}
                onPress={handleCapture}
                disabled={!isCaptureButtonEnabled()}
            >
                <View style={[
                    styles.captureButtonInner,
                    !isCaptureButtonEnabled() && styles.captureButtonInnerDisabled
                ]} />
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.controlButton}
                onPress={() => setIsActive(!isActive)}
            >
                <Text style={styles.controlText}>
                    {isActive ? '⏸️ Pause' : '▶️ Resume'}
                </Text>
            </TouchableOpacity>
        </View>
    );

    // Render capture status
    const renderCaptureStatus = () => (
        <View style={styles.statusContainer}>
            <Text style={[styles.statusText, { color: getCaptureStatusColor() }]}>
                {getCaptureStatusMessage()}
            </Text>
        </View>
    );

    if (!isCameraInitialized) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1C6758" />
                <Text style={styles.loadingText}>🔄 Initializing Camera...</Text>
                <Text style={styles.debugText}>{debugInfo}</Text>
            </View>
        );
    }

    if (!hasPermission) {
        return (
            <View style={styles.permissionContainer}>
                <Text style={styles.permissionText}>
                    📷 Camera permission required
                </Text>
                <TouchableOpacity
                    style={styles.permissionButton}
                    onPress={requestPermission}
                >
                    <Text style={styles.permissionButtonText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (!cameraDevice) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.errorText}>❌ Camera not available</Text>
                <Text style={styles.debugText}>{debugInfo}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {capturedImage ? (
                <View style={styles.previewContainer}>
                    <Image
                        source={{ uri: capturedImage }}
                        style={styles.previewImage}
                        resizeMode="contain"
                    />
                    <TouchableOpacity
                        style={styles.closePreviewButton}
                        onPress={() => setCapturedImage(null)}
                    >
                        <Text style={styles.closePreviewText}>✕</Text>
                    </TouchableOpacity>
                    <View style={styles.previewControls}>
                        <TouchableOpacity
                            style={styles.previewButton}
                            onPress={() => setCapturedImage(null)}
                        >
                            <Text style={styles.previewButtonText}>📷 Retake</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.previewButton, styles.saveButton]}
                            onPress={() => {
                                // Handle save logic here
                                Alert.alert("Success", "Photo saved successfully!");
                                setCapturedImage(null);
                            }}
                        >
                            <Text style={styles.previewButtonText}>💾 Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <View style={styles.cameraContainer}>
                    <VisionCamera
                        ref={cameraRef}
                        style={StyleSheet.absoluteFill}
                        device={cameraDevice}
                        isActive={isActive}
                        photo={true}
                        onInitialized={() => console.log('Camera initialized')}
                        onError={(error) => {
                            console.error('Camera error:', error);
                            setDebugInfo(`Camera error: ${error.message}`);
                        }}
                    />
                    {renderCaptureStatus()}
                    {renderControls()}
                </View>
            )}
        </View>
    );
};

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

export default ManualImageCapture;