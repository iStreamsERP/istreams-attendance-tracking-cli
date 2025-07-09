import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    View,
    Alert,
    TouchableOpacity,
    Image,
    BackHandler,
    Modal,
    Dimensions
} from "react-native";
import {
    Camera as VisionCamera,
    getCameraDevice,
    useCameraDevices,
    useCameraPermission,
    useFrameProcessor
} from "react-native-vision-camera";
import {
    Worklets,
    useSharedValue
} from "react-native-worklets-core";
import { useFaceDetector } from "react-native-vision-camera-face-detector";
import { compressImage } from "../Utils/UriToBase64Utils";
import RNFS from 'react-native-fs';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Create FaceDetectionCamera component
const FaceDetectionCamera = React.forwardRef(({
    faceDetectionOptions = {},
    faceDetectionCallback,
    ...props
}, ref) => {
    const { detectFaces } = useFaceDetector(faceDetectionOptions);
    const isProcessing = useSharedValue(false);

    // Simplified face detection callback using runOnJS
    const onFacesDetected = Worklets.createRunOnJS(faceDetectionCallback);

    const frameProcessor = useFrameProcessor((frame) => {
        'worklet';

        // Skip if already processing to avoid blocking
        if (isProcessing.value) return;

        try {
            isProcessing.value = true;

            // Detect faces
            const detectedFaces = detectFaces(frame);

            // Call the callback with detected faces
            if (detectedFaces && Array.isArray(detectedFaces)) {
                onFacesDetected(detectedFaces);
            } else {
                onFacesDetected([]);
            }

        } catch (error) {
            console.error('Face detection error:', error);
            onFacesDetected([]);
        } finally {
            isProcessing.value = false;
        }
    }, [detectFaces, onFacesDetected]);

    return (
        <VisionCamera
            {...props}
            ref={ref}
            frameProcessor={frameProcessor}
            pixelFormat='yuv'
        />
    );
});

const AutoImageCaptureModal = ({ visible, onClose, onCapture, navigation, returnRoute = 'PreviousPage'
}) => {
    const [isActive, setIsActive] = useState(true);
    const [isCameraInitialized, setIsCameraInitialized] = useState(false);
    const [cameraPosition, setCameraPosition] = useState('front');
    const [faces, setFaces] = useState([]);
    const [autoCaptureEnabled, setAutoCaptureEnabled] = useState(true);
    const [capturedImage, setCapturedImage] = useState(null);
    //const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [faceInTargetBox, setFaceInTargetBox] = useState(false);
    const [debugInfo, setDebugInfo] = useState('Initializing...');
    const [isCapturing, setIsCapturing] = useState(false); // Add capture state

    const [currentChallenge, setCurrentChallenge] = useState(null);
    const [challengeCompleted, setChallengeCompleted] = useState(false);
    const [stableDetectionCount, setStableDetectionCount] = useState(0); // Add stable detection counter

    const cameraRef = useRef(null);
    const lastFrameTime = useRef(0);
    const countdownInterval = useRef(null);
    const eyeClosedTime = useRef(null);
    const blinkDetected = useRef(false);
    const autoCaptureTimeout = useRef(null); // Add timeout ref
    const shakeHistory = useRef([]);
    const shakeStartTime = useRef(null);
    const headShakeDetected = useRef(false);

    // Updated challenges with icons and improved descriptions
    const challengeTypes = useMemo(() => [
        {
            id: 'single',
            name: 'single',
            actions: [
                {
                    id: 'none',
                    name: 'Look straight at camera 📸',
                    icon: '📸',
                    description: 'Position your face in the center'
                },
                {
                    id: 'blink',
                    name: 'Blink your eyes slowly 👁️',
                    icon: '👁️',
                    description: 'Close and open your eyes slowly'
                },
                {
                    id: 'smile',
                    name: 'Show a big smile 😊',
                    icon: '😊',
                    description: 'Smile widely for the camera'
                },
                // {
                //     id: 'headshake',
                //     name: 'Shake your head 🙂‍↔️',
                //     icon: '🙂‍↔️',
                //     description: 'Turn your head left and right'
                // },
            ]
        },
        {
            id: 'double',
            name: 'double',
            actions: [
                // {
                //     id: 'blink+headshake',
                //     name: 'Blink then shake head 👁️➡️🙂‍↔️',
                //     icon: '👁️🙂‍↔️',
                //     description: 'First blink, then shake your head'
                // },
                // {
                //     id: 'headshake+blink',
                //     name: 'Shake head then blink 🙂‍↔️➡️👁️',
                //     icon: '🙂‍↔️👁️',
                //     description: 'First shake head, then blink'
                // },
                // {
                //     id: 'smile+headshake',
                //     name: 'Smile then shake head 😊➡️🙂‍↔️',
                //     icon: '😊🙂‍↔️',
                //     description: 'First smile, then shake your head'
                // },
                // {
                //     id: 'headshake+smile',
                //     name: 'Shake head then smile 🙂‍↔️➡️😊',
                //     icon: '🙂‍↔️😊',
                //     description: 'First shake head, then smile'
                // },

                {
                    id: 'blink',
                    name: 'Blink then shake head 👁️➡️🙂‍↔️',
                    icon: '👁️🙂‍↔️',
                    description: 'First blink, then shake your head'
                },
            ]
        }
    ], []);

    // Helper function to get action icon and name
    const getActionDisplay = useCallback((actionId) => {
        const allActions = [
            ...challengeTypes[0].actions,
            ...challengeTypes[1].actions
        ];

        // Handle individual actions
        switch (actionId) {
            case 'blink':
                return { icon: '👁️', name: 'Blink your eyes' };
            case 'smile':
                return { icon: '😊', name: 'Smile please' };
            case 'headshake':
                return { icon: '🙂‍↔️', name: 'Shake your head left and right' };
            case 'none':
                return { icon: '📸', name: 'Look straight' };
            default:
                const action = allActions.find(a => a.id === actionId);
                return action ? { icon: action.icon, name: action.name } : { icon: '📸', name: 'Unknown' };
        }
    }, [challengeTypes]);

    // Select random challenge
    const selectRandomChallenge = useCallback(() => {
        // Randomly choose challenge type (single or double)
        const challengeType = challengeTypes[Math.floor(Math.random() * challengeTypes.length)];

        // Get a random challenge from the selected type
        const randomChallenge = challengeType.actions[
            Math.floor(Math.random() * challengeType.actions.length)
        ];

        setCurrentChallenge({
            ...randomChallenge,
            type: challengeType.id,
            completedActions: [],
            sequence: randomChallenge.id.split('+')
        });

        setChallengeCompleted(false);
        setStableDetectionCount(0);
        // Reset detection states
        blinkDetected.current = false;
        eyeClosedTime.current = null;
        shakeHistory.current = [];
        shakeStartTime.current = null;
        headShakeDetected.current = false;
    }, [challengeTypes]);

    // Initialize challenge
    useEffect(() => {
        if (isCameraInitialized && !capturedImage) {
            selectRandomChallenge();
        }
    }, [isCameraInitialized, capturedImage, selectRandomChallenge]);

    // Reset challenge after capture
    useEffect(() => {
        if (capturedImage) {
            setCurrentChallenge(null);
            setChallengeCompleted(false);
            setStableDetectionCount(0);
        }
    }, [capturedImage]);

    // Detect blink function
    const detectBlink = useCallback((face) => {
        if (!face) return false;

        const left = face.leftEyeOpenProbability ?? 1;
        const right = face.rightEyeOpenProbability ?? 1;

        const now = Date.now();
        const closed = left < 0.3 && right < 0.3;
        const opened = left > 0.8 && right > 0.8;

        if (!blinkDetected.current) {
            if (closed) {
                eyeClosedTime.current = now;
            }

            if (eyeClosedTime.current && opened) {
                const blinkDuration = now - eyeClosedTime.current;
                if (blinkDuration >= 100 && blinkDuration <= 800) {
                    blinkDetected.current = true;
                    setTimeout(() => {
                        blinkDetected.current = false;
                    }, 3000);
                    return true;
                } else {
                    eyeClosedTime.current = null;
                }
            }
        }

        return blinkDetected.current;
    }, []);

    // Detect headshake using yaw angle
    const detectHeadShake = useCallback((face) => {
        if (headShakeDetected.current) return true;

        const now = Date.now();
        const yaw = face.yawAngle;

        if (yaw == null) return false;

        // Add yaw with timestamp to history
        shakeHistory.current.push({ time: now, yaw });
        shakeHistory.current = shakeHistory.current.filter(p => now - p.time < 1500); // Keep only last 1.5s

        if (shakeHistory.current.length < 6) return false;

        // Convert to directions: left (< -10), right (> 10)
        const directions = shakeHistory.current.map(p =>
            p.yaw < -10 ? 'left' :
                p.yaw > 10 ? 'right' : 'center'
        );

        // Filter out 'center' and count changes
        const filtered = directions.filter(d => d !== 'center');
        let changes = 0;
        for (let i = 1; i < filtered.length; i++) {
            if (filtered[i] !== filtered[i - 1]) changes++;
        }

        console.log("Yaw:", yaw.toFixed(2), "Dirs:", filtered.join(','), "Changes:", changes);

        if (changes >= 3) {
            headShakeDetected.current = true;
            console.log('✅ Head shake detected!');

            setTimeout(() => {
                headShakeDetected.current = false;
                shakeHistory.current = [];
            }, 3000);

            return true;
        }

        return false;
    }, []);

    // Detect liveness actions
    const detectLivenessAction = useCallback((face) => {
        if (!currentChallenge || !face) return false;

        // For single validation challenges
        if (currentChallenge.type === 'single') {
            switch (currentChallenge.id) {
                case 'blink':
                    return detectBlink(face);
                case 'smile':
                    return (face.smilingProbability ?? 0) > 0.7;
                case 'headshake':
                    return detectHeadShake(face);
                case 'none':
                default:
                    return true;
            }
        }
        // For double validation challenges
        else if (currentChallenge.type === 'double') {
            // Check which actions are completed
            const completedActions = [...currentChallenge.completedActions];
            let allCompleted = false;

            // Check next action in sequence
            const nextAction = currentChallenge.sequence[completedActions.length];

            if (nextAction === 'blink' && detectBlink(face)) {
                if (!completedActions.includes('blink')) {
                    completedActions.push('blink');
                }
            }
            else if (nextAction === 'smile' && (face.smilingProbability ?? 0) > 0.7) {
                if (!completedActions.includes('smile')) {
                    completedActions.push('smile');
                }
            }
            else if (nextAction === 'headshake' && detectHeadShake(face)) {
                if (!completedActions.includes('headshake')) {
                    completedActions.push('headshake');
                }
            }

            // Update challenge with completed actions
            setCurrentChallenge(prev => ({
                ...prev,
                completedActions
            }));

            // Check if all actions in sequence are completed
            allCompleted = completedActions.length === currentChallenge.sequence.length;

            return allCompleted;
        }

        return false;
    }, [currentChallenge, detectBlink, detectHeadShake]);

    const handleModalClose = useCallback(() => {
        setIsActive(false);
        onClose();

        // Clean up timeouts and intervals
        if (autoCaptureTimeout.current) {
            clearTimeout(autoCaptureTimeout.current);
            autoCaptureTimeout.current = null;
        }
        if (countdownInterval.current) {
            clearInterval(countdownInterval.current);
            countdownInterval.current = null;
        }

        // Reset all states
        setCapturedImage(null);
        setFaces([]);
        setFaceInTargetBox(false);
        setChallengeCompleted(false);
        setStableDetectionCount(0);
        blinkDetected.current = false;
        eyeClosedTime.current = null;
        shakeHistory.current = [];
        shakeStartTime.current = null;
        headShakeDetected.current = false;
        setDebugInfo('Initializing...');
    }, [onClose]);

    // Handle successful capture - navigate back with image
    const handleCaptureSuccess = useCallback((imagePath) => {
        console.log('Capture success:', imagePath);

        // Call the onCapture callback if provided
        if (onCapture) {
            onCapture(imagePath);
        }

        // Close the modal
        handleModalClose();
    }, [onCapture, handleModalClose]);

    const { hasPermission, requestPermission } = useCameraPermission();
    const devices = useCameraDevices();

    // Target box dimensions and position
    const targetBoxWidth = 250;
    const targetBoxHeight = 300;
    const targetBoxLeft = (screenWidth - targetBoxWidth) / 2;
    const targetBoxTop = (screenHeight - targetBoxHeight) / 2;
    const targetBoxRight = targetBoxLeft + targetBoxWidth;
    const targetBoxBottom = targetBoxTop + targetBoxHeight;

    // Check if face is within target box
    const isFaceInTargetBox = useCallback((face) => {
        if (!face || !face.bounds) return false;

        const { bounds } = face;
        const faceCenterX = bounds.x + bounds.width / 2;
        const faceCenterY = bounds.y + bounds.height / 2;

        // Add tolerance for better UX
        const tolerance = 50;

        return (
            faceCenterX >= (targetBoxLeft - tolerance) &&
            faceCenterX <= (targetBoxRight + tolerance) &&
            faceCenterY >= (targetBoxTop - tolerance) &&
            faceCenterY <= (targetBoxBottom + tolerance)
        );
    }, [targetBoxLeft, targetBoxTop, targetBoxRight, targetBoxBottom]);

    // Handle photo capture
    const handleCapture = useCallback(async () => {
        if (isCapturing) {
            console.log('Already capturing, skipping...');
            return false;
        }

        if (!cameraRef.current) {
            Alert.alert("Error", "Camera not ready");
            return false;
        }

        if (faces.length !== 1) {
            Alert.alert("Position Error", "Please ensure only one face is visible");
            return false;
        }

        if (!faceInTargetBox) {
            Alert.alert("Position Error", "Please position your face within the target box");
            return false;
        }

        if (!autoCaptureEnabled && !challengeCompleted) {
            Alert.alert("Challenge Required", `Please complete the challenge: ${currentChallenge?.name || "Look straight"}`);
            return false;
        }

        try {
            setIsCapturing(true);

            if (autoCaptureTimeout.current) {
                clearTimeout(autoCaptureTimeout.current);
                autoCaptureTimeout.current = null;
            }

            setCountdown(0);
            if (countdownInterval.current) {
                clearInterval(countdownInterval.current);
            }

            console.log('Taking photo...');
            const photo = await cameraRef.current.takePhoto({
                qualityPrioritization: 'balanced',
                flash: 'off',
                skipMetadata: false,
            });

            if (photo?.path) {
                const imageUri = `file://${photo.path}`;

                const compressedUri = await compressImage(imageUri);

                try {
                    const originalStats = await RNFS.stat(imageUri);
                    const compressedStats = await RNFS.stat(compressedUri);
                    console.log('Original size:', Math.round(originalStats.size / 1024), 'KB');
                    console.log('Compressed size:', Math.round(compressedStats.size / 1024), 'KB');
                    const compressionRatio = ((1 - compressedStats.size / originalStats.size) * 100);
                    console.log('Size reduction:', compressionRatio.toFixed(1) + '%');
                } catch (e) {
                    console.warn('Failed to get file stats:', e.message);
                }

                setCapturedImage(compressedUri);

                // Reset states
                blinkDetected.current = false;
                eyeClosedTime.current = null;
                shakeHistory.current = [];
                shakeStartTime.current = null;
                headShakeDetected.current = false;
                setChallengeCompleted(false);
                setStableDetectionCount(0);

                // Call success handler after a brief delay to show success modal
                setTimeout(() => {
                    handleCaptureSuccess(compressedUri);
                }, 1500);

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
    }, [faces.length, faceInTargetBox, autoCaptureEnabled, challengeCompleted, currentChallenge, isCapturing, handleCaptureSuccess]);

    // Cleanup effects
    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            if (capturedImage) {
                setCapturedImage(null);
                return true;
            }
            if (visible) {
                handleModalClose();
                return true;
            }
            return false;
        });

        return () => {
            backHandler.remove();
        };
    }, [capturedImage, visible, handleModalClose]);

    // Component unmount cleanup
    useEffect(() => {
        return () => {
            setIsActive(false);
            if (autoCaptureTimeout.current) {
                clearTimeout(autoCaptureTimeout.current);
            }
            if (countdownInterval.current) {
                clearInterval(countdownInterval.current);
            }
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

        if (visible) {
            initializeCamera();
        }
    }, [hasPermission, requestPermission, visible]);

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

    // Face detector configuration - Simplified for better compatibility
    const faceDetectionOptions = useMemo(() => ({
        performanceMode: 'accurate',
        landmarkMode: 'all',
        contourMode: 'none',
        classificationMode: 'all',
        minFaceSize: 0.15,
        trackingEnabled: true, // Enable tracking for smoother headshake detection
    }), []);

    // Face detection callback - Single consolidated logic
    const handleFacesDetected = useCallback((detectedFaces) => {
        try {
            const now = Date.now();
            // Throttle to 10 FPS for better head shake detection
            if (now - lastFrameTime.current < 100) return;
            lastFrameTime.current = now;

            // Ensure we have a valid array
            const validFaces = Array.isArray(detectedFaces) ? detectedFaces : [];
            setFaces(validFaces);

            const hasOneFace = validFaces.length === 1;
            const face = hasOneFace ? validFaces[0] : null;
            const faceInBox = hasOneFace && isFaceInTargetBox(face);

            setFaceInTargetBox(faceInBox);

            // Handle challenge completion
            if (face && faceInBox) {
                const completed = detectLivenessAction(face);
                setChallengeCompleted(completed);

                // Enhanced stable detection logic for auto capture
                if (completed && autoCaptureEnabled && !isCapturing && !capturedImage) {
                    setStableDetectionCount(prev => {
                        const newCount = prev + 1;

                        // For head shake, require fewer stable frames since it's a one-time action
                        // For other challenges, require stable detection
                        const requiredStableFrames = currentChallenge?.id === 'headshake' ? 1 :
                            currentChallenge?.id === 'none' ? 3 : 2;

                        if (newCount >= requiredStableFrames) {
                            // Clear any existing timeout
                            if (autoCaptureTimeout.current) {
                                clearTimeout(autoCaptureTimeout.current);
                            }

                            // Trigger auto capture with minimal delay
                            autoCaptureTimeout.current = setTimeout(() => {
                                handleCapture();
                            }, currentChallenge?.id === 'headshake' ? 500 : 100);

                            return 0; // Reset counter after triggering capture
                        }

                        return newCount;
                    });
                } else {
                    setStableDetectionCount(0); // Reset if conditions not met
                }
            } else {
                setChallengeCompleted(false);
                setStableDetectionCount(0);

                // Clear auto capture timeout if conditions not met
                if (autoCaptureTimeout.current) {
                    clearTimeout(autoCaptureTimeout.current);
                    autoCaptureTimeout.current = null;
                }
            }

            // Reset states when no valid face or not in box
            if (!hasOneFace || !faceInBox) {
                if (currentChallenge?.id === 'blink') {
                    blinkDetected.current = false;
                    eyeClosedTime.current = null;
                }
                if (currentChallenge?.id === 'headshake') {
                    // Don't reset head shake immediately to allow for movement
                }
                setStableDetectionCount(0);
            }

            // Enhanced debug info
            const debugDetails = `Challenge: ${currentChallenge?.id || 'none'}, Stable: ${stableDetectionCount}`;
            setDebugInfo(`Faces: ${validFaces.length}, In Box: ${faceInBox}, Completed: ${challengeCompleted} | ${debugDetails}`);

        } catch (error) {
            console.error('Face processing error:', error);
            setDebugInfo(`Error: ${error.message}`);
            setFaces([]);
            setFaceInTargetBox(false);
            setChallengeCompleted(false);
            setStableDetectionCount(0);
        }
    }, [detectLivenessAction, autoCaptureEnabled, capturedImage, handleCapture, isFaceInTargetBox, currentChallenge, challengeCompleted, isCapturing, stableDetectionCount]);

    // Toggle auto capture
    const toggleAutoCapture = useCallback(() => {
        setAutoCaptureEnabled(prev => !prev);
        setFaceInTargetBox(false);
        setChallengeCompleted(false);
        setStableDetectionCount(0);
        blinkDetected.current = false;
        eyeClosedTime.current = null;
        shakeHistory.current = [];
        shakeStartTime.current = null;
        headShakeDetected.current = false;

        // Clear any pending auto capture
        if (autoCaptureTimeout.current) {
            clearTimeout(autoCaptureTimeout.current);
            autoCaptureTimeout.current = null;
        }
    }, []);

    // Check if capture button should be enabled
    const isCaptureButtonEnabled = () => {
        if (isCapturing) return false;
        if (faces.length !== 1) return false;
        if (!faceInTargetBox) return false;

        if (autoCaptureEnabled) {
            return challengeCompleted;
        } else {
            return challengeCompleted; // For manual mode, require challenge completion
        }
    };

    // Get face detection status message with icons
    const getFaceDetectionMessage = () => {
        if (isCapturing) return "📸 Capturing...";
        if (faces.length === 0) return "👤 No face detected";
        if (faces.length > 1) return `👤 Only one face allowed`;

        if (faces.length === 1) {
            if (!faceInTargetBox) return "🎯 Position face in target area";

            if (challengeCompleted) {
                if (autoCaptureEnabled) {
                    return stableDetectionCount > 0 ?
                        `⏱️ Auto capturing in ${Math.max(1, 3 - stableDetectionCount)}...` :
                        "✅ Ready - Auto capturing...";
                } else {
                    return "✅ Ready - Tap to capture";
                }
            }

            // Show ONLY the current challenge step
            if (currentChallenge?.type === 'double') {
                const currentStep = currentChallenge.completedActions.length;

                // Only show the current action instruction
                const currentAction = getActionDisplay(currentChallenge.sequence[currentStep]);
                return `${currentAction.icon} ${currentAction.name}`;
            }
            else if (currentChallenge?.type === 'single') {
                const action = getActionDisplay(currentChallenge.id);
                return `${action.icon} ${action.name}`;
            }

            return currentChallenge?.name || "📸 Performing liveness check";
        }

        return "🔄 Initializing...";
    };

    // Get face detection status color
    const getFaceDetectionColor = () => {
        if (isCapturing) return "#FFA500";
        if (faces.length === 0) return "#FF6B6B";
        if (faces.length > 1) return "#FF6B6B";

        if (faces.length === 1) {
            if (!faceInTargetBox) return "#FF6B6B";
            if (challengeCompleted) return "#4CAF50";
            return "#FFA500";
        }

        return "#FF6B6B";
    };

    const renderTargetBox = () => (
        <View style={styles.targetBoxContainer}>
            <View style={[styles.targetBox, { borderColor: getFaceDetectionColor() }]}>
                <View style={[styles.targetBoxLine, styles.targetBoxTopLeft, { borderColor: getFaceDetectionColor() }]} />
                <View style={[styles.targetBoxLine, styles.targetBoxTopRight, { borderColor: getFaceDetectionColor() }]} />
                <View style={[styles.targetBoxLine, styles.targetBoxBottomLeft, { borderColor: getFaceDetectionColor() }]} />
                <View style={[styles.targetBoxLine, styles.targetBoxBottomRight, { borderColor: getFaceDetectionColor() }]} />
            </View>
        </View>
    );

    const renderFaceDetectionStatus = () => (
        <View style={styles.faceCountContainer}>
            <Text style={[styles.faceCountText, { color: getFaceDetectionColor() }]}>
                {getFaceDetectionMessage()}
            </Text>
        </View>
    );

    // Render camera controls
    const renderControls = () => (
        <View style={styles.controlsContainer}>
            <TouchableOpacity
                style={[styles.controlButton, autoCaptureEnabled && styles.controlButtonActive]}
                onPress={toggleAutoCapture}
            >
                <Text style={styles.controlText}>
                    {autoCaptureEnabled ? '🟢 Auto' : '⚪ Manual'}
                </Text>
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

            <TouchableOpacity onPress={onClose} style={styles.controlButton}>
                <Text style={styles.controlText}>✖ Close</Text>
            </TouchableOpacity>
        </View>
    );

    if (!isCameraInitialized) {
        return (
            <Modal visible={visible} animationType="slide" transparent={false}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#1C6758" />
                    <Text style={styles.loadingText}>🔄 Initializing Camera...</Text>
                    <Text style={styles.debugText}>{debugInfo}</Text>
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={handleModalClose}
                    >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        );
    }

    if (!hasPermission) {
        return (
            <Modal visible={visible} animationType="slide" transparent={false}>
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
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={handleModalClose}
                    >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        );
    }

    if (!cameraDevice) {
        return (
            <Modal visible={visible} animationType="slide" transparent={false}>
                <View style={styles.loadingContainer}>
                    <Text style={styles.errorText}>❌ Camera not available</Text>
                    <Text style={styles.debugText}>{debugInfo}</Text>
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={handleModalClose}
                    >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        );
    }

    return (
        <Modal visible={visible} animationType="slide" transparent={false}>
            <View style={styles.container}>
                <View style={styles.cameraContainer}>
                    <FaceDetectionCamera
                        ref={cameraRef}
                        style={StyleSheet.absoluteFill}
                        device={cameraDevice}
                        isActive={isActive && visible}
                        photo={true}
                        faceDetectionOptions={faceDetectionOptions}
                        faceDetectionCallback={handleFacesDetected}
                        onInitialized={() => console.log('Camera initialized')}
                        onError={(error) => {
                            console.error('Camera error:', error);
                            setDebugInfo(`Camera error: ${error.message}`);
                        }}
                    />
                    {renderFaceDetectionStatus()}
                    {renderTargetBox()}
                    {renderControls()}
                </View>

                {/* <Modal
                    visible={showSuccessModal}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setShowSuccessModal(false)}
                >
                    <View style={styles.successModalOverlay}>
                        <View style={styles.successModal}>
                            <Text style={styles.successIcon}>✅</Text>
                            <Text style={styles.successTitle}>Success!</Text>
                            <Text style={styles.successMessage}>Photo captured successfully</Text>
                        </View>
                    </View>
                </Modal> */}
            </View>
        </Modal>
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
        marginBottom: 2,
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
    },
    cameraContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    targetBoxContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    targetBox: {
        width: 250,
        height: 300,
        borderWidth: 2,
        position: 'relative',
    },
    targetBoxLine: {
        position: 'absolute',
        width: 50,
        height: 50,
    },
    targetBoxTopLeft: {
        top: -2,
        left: -2,
        borderTopWidth: 4,
        borderLeftWidth: 4,
    },
    targetBoxTopRight: {
        top: -2,
        right: -2,
        borderTopWidth: 4,
        borderRightWidth: 4,
    },
    targetBoxBottomLeft: {
        bottom: -2,
        left: -2,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
    },
    targetBoxBottomRight: {
        bottom: -2,
        right: -2,
        borderBottomWidth: 4,
        borderRightWidth: 4,
    },
    faceCountContainer: {
        position: 'absolute',
        top: 50,
        alignSelf: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        maxWidth: '90%', // responsive container width
    },

    faceCountText: {
        fontSize: 24, // slightly smaller for flexibility
        fontWeight: 'bold',
        color: '#FFF',
        textAlign: 'center',
        flexWrap: 'wrap',       // allow text wrapping if needed
        includeFontPadding: false,
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
    },
    controlButtonActive: {
        backgroundColor: '#1C6758',
    },
    controlText: {
        color: '#FFF',
        fontSize: 16,
    },
    captureButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureButtonDisabled: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    captureButtonInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
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

export default AutoImageCaptureModal;