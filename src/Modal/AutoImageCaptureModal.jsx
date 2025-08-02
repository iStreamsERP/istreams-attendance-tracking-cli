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

// Device type and orientation detection
const getScreenDimensions = () => {
    const { width, height } = Dimensions.get('window');
    return { width, height };
};

const isTablet = () => {
    const { width, height } = getScreenDimensions();
    const aspectRatio = width / height;
    const minDimension = Math.min(width, height);
    const maxDimension = Math.max(width, height);
    
    // Tablets typically have:
    // - Larger minimum dimension (usually > 600dp)
    // - Different aspect ratios (closer to 4:3 or 3:2)
    return minDimension > 600 || (aspectRatio > 0.6 && aspectRatio < 0.8) || maxDimension > 900;
};

const getOrientation = () => {
    const { width, height } = getScreenDimensions();
    return width > height ? 'landscape' : 'portrait';
};

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
    const [countdown, setCountdown] = useState(0);
    const [faceInTargetBox, setFaceInTargetBox] = useState(false);
    const [debugInfo, setDebugInfo] = useState('Initializing...');
    const [isCapturing, setIsCapturing] = useState(false);

    // Orientation state
    const [screenDimensions, setScreenDimensions] = useState(getScreenDimensions());
    const [orientation, setOrientation] = useState(getOrientation());

    const [currentChallenge, setCurrentChallenge] = useState(null);
    const [challengeCompleted, setChallengeCompleted] = useState(false);
    const [stableDetectionCount, setStableDetectionCount] = useState(0);

    const cameraRef = useRef(null);
    const lastFrameTime = useRef(0);
    const countdownInterval = useRef(null);
    const eyeClosedTime = useRef(null);
    const blinkDetected = useRef(false);
    const autoCaptureTimeout = useRef(null);
    const shakeHistory = useRef([]);
    const shakeStartTime = useRef(null);
    const headShakeDetected = useRef(false);

    // Device and orientation info
    const deviceType = useMemo(() => isTablet() ? 'tablet' : 'phone', []);
    const isLandscape = orientation === 'landscape';
    
    // Handle orientation changes
    useEffect(() => {
        const subscription = Dimensions.addEventListener('change', ({ window }) => {
            setScreenDimensions({ width: window.width, height: window.height });
            setOrientation(window.width > window.height ? 'landscape' : 'portrait');
        });

        return () => subscription?.remove();
    }, []);

    // Dynamic sizing based on device type and orientation
    const targetBoxDimensions = useMemo(() => {
        const { width: screenWidth, height: screenHeight } = screenDimensions;
        
        if (deviceType === 'tablet') {
            if (isLandscape) {
                // Landscape tablet - adjust for wider screen
                const boxWidth = Math.min(screenWidth * 0.25, 300);
                const boxHeight = Math.min(screenHeight * 0.6, 400);
                return {
                    width: boxWidth,
                    height: boxHeight,
                    left: (screenWidth - boxWidth) / 2,
                    top: (screenHeight - boxHeight) / 2
                };
            } else {
                // Portrait tablet
                const boxWidth = Math.min(screenWidth * 0.4, 350);
                const boxHeight = Math.min(screenHeight * 0.5, 420);
                return {
                    width: boxWidth,
                    height: boxHeight,
                    left: (screenWidth - boxWidth) / 2,
                    top: (screenHeight - boxHeight) / 2
                };
            }
        } else {
            if (isLandscape) {
                // Landscape phone - smaller box to accommodate wider layout
                const boxWidth = 200;
                const boxHeight = 250;
                return {
                    width: boxWidth,
                    height: boxHeight,
                    left: (screenWidth - boxWidth) / 2,
                    top: (screenHeight - boxHeight) / 2
                };
            } else {
                // Portrait phone - original dimensions
                const boxWidth = 250;
                const boxHeight = 300;
                return {
                    width: boxWidth,
                    height: boxHeight,
                    left: (screenWidth - boxWidth) / 2,
                    top: (screenHeight - boxHeight) / 2
                };
            }
        }
    }, [deviceType, isLandscape, screenDimensions]);

    useEffect(() => {
        return () => {
            if (autoCaptureTimeout.current) {
                clearTimeout(autoCaptureTimeout.current);
            }
            if (countdownInterval.current) {
                clearInterval(countdownInterval.current);
            }
        };
    }, []);

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
            ]
        },
        {
            id: 'double',
            name: 'double',
            actions: [
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
        const challengeType = challengeTypes[Math.floor(Math.random() * challengeTypes.length)];
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

    // Enhanced blink detection for tablets and orientation
    const detectBlink = useCallback((face) => {
        if (!face) return false;
 
        const left = face.leftEyeOpenProbability;
        const right = face.rightEyeOpenProbability;
 
        if (left === undefined || right === undefined || left === null || right === null) {
            return false;
        }
 
        const now = Date.now();
        // Adjusted thresholds for tablets and orientation
        const closedThreshold = deviceType === 'tablet' ? 0.4 : 0.5;
        const openThreshold = deviceType === 'tablet' ? 0.7 : 0.8;
        
        const closed = left < closedThreshold && right < closedThreshold;
        const opened = left > openThreshold && right > openThreshold;
 
        console.log(`[${deviceType}-${orientation}] Blink check:`, { 
            left: left.toFixed(2), 
            right: right.toFixed(2), 
            closed, 
            opened,
            thresholds: { closed: closedThreshold, open: openThreshold }
        });
 
        // If blink already detected and still valid, return true
        if (blinkDetected.current && now - blinkDetected.current < 3000) {
            return true;
        }
 
        // Start of blink - eyes closed
        if (closed && !eyeClosedTime.current) {
            eyeClosedTime.current = now;
            console.log('👁️ Eyes closed detected');
        }
 
        // End of blink - eyes opened after being closed
        if (opened && eyeClosedTime.current) {
            const blinkDuration = now - eyeClosedTime.current;
            console.log('⏱️ Blink duration:', blinkDuration);
 
            // More lenient duration for tablets
            const minDuration = deviceType === 'tablet' ? 80 : 100;
            const maxDuration = deviceType === 'tablet' ? 2500 : 2000;
            
            if (blinkDuration >= minDuration && blinkDuration <= maxDuration) {
                blinkDetected.current = now;
                eyeClosedTime.current = null;
                console.log('✅ Valid blink detected!');
                return true;
            } else {
                eyeClosedTime.current = null;
                console.log('❌ Invalid blink duration:', blinkDuration);
            }
        }
 
        // Reset if eyes have been open too long
        if (opened && eyeClosedTime.current && (now - eyeClosedTime.current > 3000)) {
            eyeClosedTime.current = null;
            console.log('🔄 Reset - eyes open too long');
        }
 
        return false;
    }, [deviceType, orientation]);

    // Enhanced headshake detection for tablets and orientation
    const detectHeadShake = useCallback((face) => {
        if (headShakeDetected.current) return true;

        const now = Date.now();
        const yaw = face.yawAngle;

        if (yaw == null) return false;

        // Add yaw with timestamp to history
        shakeHistory.current.push({ time: now, yaw });
        shakeHistory.current = shakeHistory.current.filter(p => now - p.time < 2000); // Increased window for tablets

        if (shakeHistory.current.length < 4) return false; // Reduced minimum points

        // Adjusted thresholds for tablets and orientation
        const leftThreshold = deviceType === 'tablet' ? -8 : -10;
        const rightThreshold = deviceType === 'tablet' ? 8 : 10;

        const directions = shakeHistory.current.map(p =>
            p.yaw < leftThreshold ? 'left' :
                p.yaw > rightThreshold ? 'right' : 'center'
        );

        const filtered = directions.filter(d => d !== 'center');
        let changes = 0;
        for (let i = 1; i < filtered.length; i++) {
            if (filtered[i] !== filtered[i - 1]) changes++;
        }

        console.log(`[${deviceType}-${orientation}] Headshake - Yaw:`, yaw.toFixed(2), "Dirs:", filtered.join(','), "Changes:", changes);

        // Reduced change requirement for tablets
        const requiredChanges = deviceType === 'tablet' ? 2 : 3;
        if (changes >= requiredChanges) {
            headShakeDetected.current = true;
            console.log('✅ Head shake detected!');

            setTimeout(() => {
                headShakeDetected.current = false;
                shakeHistory.current = [];
            }, 3000);

            return true;
        }

        return false;
    }, [deviceType, orientation]);

    // Detect liveness actions
    const detectLivenessAction = useCallback((face) => {
        if (!currentChallenge || !face) return false;

        // For single validation challenges
        if (currentChallenge.type === 'single') {
            switch (currentChallenge.id) {
                case 'blink':
                    return detectBlink(face);
                case 'smile':
                    // Adjusted smile threshold for tablets
                    const smileThreshold = deviceType === 'tablet' ? 0.6 : 0.7;
                    return (face.smilingProbability ?? 0) > smileThreshold;
                case 'headshake':
                    return detectHeadShake(face);
                case 'none':
                default:
                    return true;
            }
        }

        // For double validation challenges
        else if (currentChallenge.type === 'double') {
            const completedActions = [...currentChallenge.completedActions];
            let allCompleted = false;

            const nextAction = currentChallenge.sequence[completedActions.length];

            if (nextAction === 'blink' && detectBlink(face)) {
                if (!completedActions.includes('blink')) {
                    completedActions.push('blink');
                }
            }
            else if (nextAction === 'smile' && (face.smilingProbability ?? 0) > (deviceType === 'tablet' ? 0.6 : 0.7)) {
                if (!completedActions.includes('smile')) {
                    completedActions.push('smile');
                }
            }
            else if (nextAction === 'headshake' && detectHeadShake(face)) {
                if (!completedActions.includes('headshake')) {
                    completedActions.push('headshake');
                }
            }

            setCurrentChallenge(prev => ({
                ...prev,
                completedActions
            }));

            allCompleted = completedActions.length === currentChallenge.sequence.length;
            return allCompleted;
        }

        return false;
    }, [currentChallenge, detectBlink, detectHeadShake, deviceType]);

    const handleModalClose = useCallback(() => {
        setIsActive(false);
        onClose();

        if (autoCaptureTimeout.current) {
            clearTimeout(autoCaptureTimeout.current);
            autoCaptureTimeout.current = null;
        }
        if (countdownInterval.current) {
            clearInterval(countdownInterval.current);
            countdownInterval.current = null;
        }

        setCapturedImage(null);
        setFaces([]);
        setFaceInTargetBox(false);
        setChallengeCompleted(false);
        setStableDetectionCount(0);
        setCountdown(0);
        blinkDetected.current = false;
        eyeClosedTime.current = null;
        shakeHistory.current = [];
        shakeStartTime.current = null;
        headShakeDetected.current = false;
        setDebugInfo('Initializing...');
    }, [onClose]);

    const handleCaptureSuccess = useCallback((imagePath) => {
        console.log('Capture success:', imagePath);

        if (onCapture) {
            onCapture(imagePath);
        }

        handleModalClose();
    }, [onCapture, handleModalClose]);

    const { hasPermission, requestPermission } = useCameraPermission();
    const devices = useCameraDevices();

    // Enhanced face position detection for tablets and orientation
    const isFaceInTargetBox = useCallback((face) => {
        if (!face || !face.bounds) return false;

        const { bounds } = face;
        const { width: boxWidth, height: boxHeight, left: boxLeft, top: boxTop } = targetBoxDimensions;

        const faceCenterX = bounds.x + bounds.width / 2;
        const faceCenterY = bounds.y + bounds.height / 2;

        const targetCenterX = boxLeft + boxWidth / 2;
        const targetCenterY = boxTop + boxHeight / 2;

        // Adjusted tolerances for tablets and orientation
        const horizontalTolerance = boxWidth * (deviceType === 'tablet' ? 0.4 : 0.3);
        const verticalTolerance = boxHeight * (deviceType === 'tablet' ? 0.4 : 0.3);

        const isInHorizontalRange = Math.abs(faceCenterX - targetCenterX) <= (boxWidth / 2 + horizontalTolerance);
        const isInVerticalRange = Math.abs(faceCenterY - targetCenterY) <= (boxHeight / 2 + verticalTolerance);

        const faceLeft = bounds.x;
        const faceRight = bounds.x + bounds.width;
        const faceTop = bounds.y;
        const faceBottom = bounds.y + bounds.height;

        const overlapLeft = Math.max(faceLeft, boxLeft);
        const overlapRight = Math.min(faceRight, boxLeft + boxWidth);
        const overlapTop = Math.max(faceTop, boxTop);
        const overlapBottom = Math.min(faceBottom, boxTop + boxHeight);

        const hasOverlap = overlapLeft < overlapRight && overlapTop < overlapBottom;
        if (!hasOverlap) return false;

        const overlapWidth = overlapRight - overlapLeft;
        const overlapHeight = overlapBottom - overlapTop;
        const overlapArea = overlapWidth * overlapHeight;
        const faceArea = bounds.width * bounds.height;
        const overlapPercentage = overlapArea / faceArea;

        // Adjusted overlap requirements for tablets and orientation
        const minOverlapPercentage = deviceType === 'tablet' ? 0.3 : 0.4;
        const hasMinimumOverlap = overlapPercentage >= minOverlapPercentage;

        // Adjusted size requirements for tablets and orientation
        const minFaceWidth = boxWidth * (deviceType === 'tablet' ? 0.25 : 0.3);
        const minFaceHeight = boxHeight * (deviceType === 'tablet' ? 0.25 : 0.3);
        const isLargeEnough = bounds.width >= minFaceWidth && bounds.height >= minFaceHeight;

        const maxFaceWidth = boxWidth * (deviceType === 'tablet' ? 1.8 : 1.5);
        const maxFaceHeight = boxHeight * (deviceType === 'tablet' ? 1.8 : 1.5);
        const isNotTooLarge = bounds.width <= maxFaceWidth && bounds.height <= maxFaceHeight;

        const result = isInHorizontalRange && isInVerticalRange && hasMinimumOverlap && isLargeEnough && isNotTooLarge;
        
        if (result) {
            console.log(`[${deviceType}-${orientation}] Face in target box:`, {
                faceSize: `${bounds.width.toFixed(0)}x${bounds.height.toFixed(0)}`,
                overlapPercent: (overlapPercentage * 100).toFixed(1) + '%',
                position: `${faceCenterX.toFixed(0)},${faceCenterY.toFixed(0)}`
            });
        }

        return result;
    }, [targetBoxDimensions, deviceType, orientation]);

    // Handle photo capture with orientation-aware rotation
    const handleCapture = useCallback(async () => {
        if (isCapturing) {
            console.log('Capture already in progress, skipping...');
            return false;
        }

        if (!cameraRef.current) {
            Alert.alert("Error", "Camera not ready");
            return false;
        }

        const facesNearBox = faces.filter(face => isFaceInTargetBox(face));
        if (facesNearBox.length !== 1) {
            if (faces.length === 0) {
                Alert.alert("Position Error", "No face detected");
            } else if (facesNearBox.length === 0) {
                Alert.alert("Position Error", "Please move your face closer to the target area");
            } else {
                Alert.alert("Position Error", "Only one face should be near the target area");
            }
            return false;
        }

        if (!faceInTargetBox) {
            Alert.alert("Position Error", "Please position your face near the target box");
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
            if (countdownInterval.current) {
                clearInterval(countdownInterval.current);
                countdownInterval.current = null;
            }
            setCountdown(0);

            console.log('Taking photo...');
            const photo = await cameraRef.current.takePhoto({
                qualityPrioritization: 'balanced',
                flash: 'off',
                skipMetadata: false,
            });

            if (!photo?.path) {
                throw new Error("Photo path not available");
            }

            const imageUri = `file://${photo.path}`;
            
            // Orientation-aware rotation handling
            let rotationAngle = 0;
            // if (deviceType === 'tablet') {
            //     rotationAngle = isLandscape ? 0 : 0; // Adjust based on your camera setup
            // } else {
            //     rotationAngle = isLandscape ? 0 : 270; // Adjust based on your camera setup
            // }
            
            const compressedUri = await compressImage(imageUri, rotationAngle);

            try {
                const originalStats = await RNFS.stat(imageUri);
                const compressedStats = await RNFS.stat(compressedUri);
                console.log(`[${deviceType}-${orientation}] Original size:`, Math.round(originalStats.size / 1024), 'KB');
                console.log(`[${deviceType}-${orientation}] Compressed size:`, Math.round(compressedStats.size / 1024), 'KB');
                const compressionRatio = ((1 - compressedStats.size / originalStats.size) * 100);
                console.log(`[${deviceType}-${orientation}] Size reduction:`, compressionRatio.toFixed(1) + '%');
            } catch (e) {
                console.warn('Failed to get file stats:', e.message);
            }

            setCapturedImage(compressedUri);

            blinkDetected.current = false;
            eyeClosedTime.current = null;
            shakeHistory.current = [];
            shakeStartTime.current = null;
            headShakeDetected.current = false;
            setChallengeCompleted(false);
            setStableDetectionCount(0);

            setTimeout(() => {
                handleCaptureSuccess(compressedUri);
            }, 500);

            return true;
        } catch (error) {
            console.error('Capture error:', error);
            Alert.alert("Error", `Capture failed: ${error.message}`);
            return false;
        } finally {
            setIsCapturing(false);
        }
    }, [
        faces,
        faceInTargetBox,
        autoCaptureEnabled,
        challengeCompleted,
        currentChallenge,
        isCapturing,
        handleCaptureSuccess,
        isFaceInTargetBox,
        deviceType,
        orientation,
        isLandscape
    ]);

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
            setDebugInfo(`Camera initialized for ${deviceType} in ${orientation} mode`);
        };

        if (visible) {
            initializeCamera();
        }
    }, [hasPermission, requestPermission, visible, deviceType, orientation]);

    // Camera device selection with tablet and orientation optimization
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
            setDebugInfo(`Using ${device.position} camera on ${deviceType} in ${orientation} mode`);
            console.log(`[${deviceType}-${orientation}] Camera device:`, {
                position: device.position,
                formats: device.formats?.length || 0,
                hasFlash: device.hasFlash,
                hasTorch: device.hasTorch
            });
        } else {
            setDebugInfo('No suitable camera device found');
        }

        return device;
    }, [devices, cameraPosition, deviceType, orientation]);

    // Enhanced face detection options for tablets and orientation
    const faceDetectionOptions = useMemo(() => ({
        performanceMode: deviceType === 'tablet' ? 'fast' : 'accurate',
        landmarkMode: 'all',
        contourMode: 'none',
        classificationMode: 'all',
        minFaceSize: deviceType === 'tablet' ? 0.1 : 0.15,
        trackingEnabled: true,
    }), [deviceType]);

    // Enhanced face detection callback with tablet and orientation optimizations
    const handleFacesDetected = useCallback((detectedFaces) => {
        try {
            const now = Date.now();
            // Adjusted throttling for tablets and orientation
            const throttleMs = deviceType === 'tablet' ? 300 : 500;
            if (now - lastFrameTime.current < throttleMs) return;
            lastFrameTime.current = now;

            const validFaces = Array.isArray(detectedFaces) ? detectedFaces : [];
            const facesInTargetBox = validFaces.filter(face => isFaceInTargetBox(face));

            setFaces(facesInTargetBox);

            const hasOneFaceInBox = facesInTargetBox.length >= 1;
            const face = hasOneFaceInBox ? facesInTargetBox[0] : null;

            setFaceInTargetBox(hasOneFaceInBox);

            if (face && hasOneFaceInBox) {
                const completed = detectLivenessAction(face);
                setChallengeCompleted(completed);

                if (completed && autoCaptureEnabled && !isCapturing && !capturedImage) {
                    setStableDetectionCount(prev => {
                        const newCount = prev + 1;

                        // Adjusted stable frame requirements for tablets and orientation
                        const requiredStableFrames = deviceType === 'tablet' ? 
                            (currentChallenge?.id === 'headshake' ? 1 :
                             currentChallenge?.id === 'none' ? 2 : 1) :
                            (currentChallenge?.id === 'headshake' ? 1 :
                             currentChallenge?.id === 'none' ? 3 : 2);

                        if (newCount >= requiredStableFrames) {
                            if (countdown === 0) {
                                startCountdown();
                            }
                            return newCount;
                        }

                        return newCount;
                    });
                } else {
                    if (countdown > 0) {
                        stopCountdown();
                    }
                    setStableDetectionCount(0);
                }
            } else {
                if (countdown > 0) {
                    stopCountdown();
                }
                setChallengeCompleted(false);
                setStableDetectionCount(0);

                if (!hasOneFaceInBox) {
                    if (currentChallenge?.id === 'blink') {
                        blinkDetected.current = false;
                        eyeClosedTime.current = null;
                    }
                    setStableDetectionCount(0);
                }
            }

            const debugDetails = `[${deviceType}-${orientation}] Challenge: ${currentChallenge?.id || 'none'}, Stable: ${stableDetectionCount}, Countdown: ${countdown}`;
            setDebugInfo(`Faces In Box: ${facesInTargetBox.length}, Valid: ${hasOneFaceInBox}, Completed: ${challengeCompleted} | ${debugDetails}`);

        } catch (error) {
            console.error('Face processing error:', error);
            setDebugInfo(`Error: ${error.message}`);
            setFaces([]);
            setFaceInTargetBox(false);
            setChallengeCompleted(false);
            setStableDetectionCount(0);
            if (countdown > 0) {
                stopCountdown();
            }
        }
    }, [detectLivenessAction, autoCaptureEnabled, capturedImage, isFaceInTargetBox, currentChallenge, challengeCompleted, isCapturing, stableDetectionCount, countdown, startCountdown, stopCountdown, deviceType, orientation]);

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

        stopCountdown();
    }, [stopCountdown]);

    // Check if capture button should be enabled
    const isCaptureButtonEnabled = () => {
        if (isCapturing) return false;
        if (faces.length !== 1) return false;
        if (!faceInTargetBox) return false;

        if (autoCaptureEnabled) {
            return challengeCompleted;
        } else {
            return challengeCompleted;
        }
    };

    // Updated countdown and auto-capture logic
    const startCountdown = useCallback(() => {
        if (countdown > 0 || !autoCaptureEnabled || isCapturing) return;

        setCountdown(0);
        countdownInterval.current = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(countdownInterval.current);
                    countdownInterval.current = null;
                    setCountdown(0);

                    if (faceInTargetBox && challengeCompleted && !isCapturing) {
                        handleCapture();
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 0);
    }, [countdown, autoCaptureEnabled, isCapturing, faceInTargetBox, challengeCompleted, handleCapture]);

    const stopCountdown = useCallback(() => {
        if (countdownInterval.current) {
            clearInterval(countdownInterval.current);
            countdownInterval.current = null;
        }
        setCountdown(0);
    }, []);

    // Get face detection status message with icons
    const getFaceDetectionMessage = () => {
        if (isCapturing) return "📸 Capturing...";

        if (faces.length === 0) return `👤 No face detected in target area (${deviceType} ${orientation})`;
        if (faces.length > 1) return `👤 Only one face allowed in target area`;

        if (faces.length === 1) {
            if (challengeCompleted) {
                if (autoCaptureEnabled) {
                    if (countdown > 0) {
                        return `⏰ Capturing in ${countdown}...`;
                    } else {
                        return "✅ Ready - Starting countdown...";
                    }
                } else {
                    return "✅ Ready - Tap to capture";
                }
            }

            if (currentChallenge?.type === 'double') {
                const currentStep = currentChallenge.completedActions.length;
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

    // Enhanced target box rendering for tablets and orientation
    const renderTargetBox = () => {
        const { width: boxWidth, height: boxHeight } = targetBoxDimensions;
        const cornerSize = deviceType === 'tablet' ? 
            (isLandscape ? 50 : 60) : 
            (isLandscape ? 40 : 50);
        const borderWidth = deviceType === 'tablet' ? 
            (isLandscape ? 4 : 5) : 
            (isLandscape ? 3 : 4);
        
        return (
            <View style={styles.targetBoxContainer}>
                <View style={[
                    styles.targetBox, 
                    { 
                        borderColor: getFaceDetectionColor(),
                        width: boxWidth,
                        height: boxHeight
                    }
                ]}>
                    <View style={[
                        styles.targetBoxLine, 
                        styles.targetBoxTopLeft, 
                        { 
                            borderColor: getFaceDetectionColor(),
                            width: cornerSize,
                            height: cornerSize,
                            borderTopWidth: borderWidth,
                            borderLeftWidth: borderWidth
                        }
                    ]} />
                    <View style={[
                        styles.targetBoxLine, 
                        styles.targetBoxTopRight, 
                        { 
                            borderColor: getFaceDetectionColor(),
                            width: cornerSize,
                            height: cornerSize,
                            borderTopWidth: borderWidth,
                            borderRightWidth: borderWidth
                        }
                    ]} />
                    <View style={[
                        styles.targetBoxLine, 
                        styles.targetBoxBottomLeft, 
                        { 
                            borderColor: getFaceDetectionColor(),
                            width: cornerSize,
                            height: cornerSize,
                            borderBottomWidth: borderWidth,
                            borderLeftWidth: borderWidth
                        }
                    ]} />
                    <View style={[
                        styles.targetBoxLine, 
                        styles.targetBoxBottomRight, 
                        { 
                            borderColor: getFaceDetectionColor(),
                            width: cornerSize,
                            height: cornerSize,
                            borderBottomWidth: borderWidth,
                            borderRightWidth: borderWidth
                        }
                    ]} />
                </View>
            </View>
        );
    };

    // Enhanced status rendering for orientation
    const renderFaceDetectionStatus = () => {
        const fontSize = deviceType === 'tablet' ? 
            (isLandscape ? 24 : 28) : 
            (isLandscape ? 20 : 24);
        const padding = deviceType === 'tablet' ? 
            (isLandscape ? 16 : 20) : 
            (isLandscape ? 12 : 16);
        const topPosition = isLandscape ? 30 : 50;
        
        return (
            <View style={[
                styles.faceCountContainer, 
                { 
                    paddingHorizontal: padding,
                    top: topPosition
                }
            ]}>
                <Text style={[
                    styles.faceCountText, 
                    { 
                        color: getFaceDetectionColor(),
                        fontSize: fontSize
                    }
                ]}>
                    {getFaceDetectionMessage()}
                </Text>
            </View>
        );
    };

    // Enhanced controls rendering for tablets and orientation
    const renderControls = () => {
        const buttonSize = deviceType === 'tablet' ? 
            (isLandscape ? 70 : 90) : 
            (isLandscape ? 60 : 70);
        const buttonPadding = deviceType === 'tablet' ? 
            (isLandscape ? 15 : 20) : 
            (isLandscape ? 12 : 15);
        const fontSize = deviceType === 'tablet' ? 
            (isLandscape ? 16 : 18) : 
            (isLandscape ? 14 : 16);
        const bottomPosition = isLandscape ? 20 : 40;
        
        return (
            <View style={[
                styles.controlsContainer,
                { 
                    bottom: bottomPosition,
                    flexDirection: isLandscape ? 'row' : 'row',
                    paddingHorizontal: isLandscape ? 20 : 0
                }
            ]}>
                <TouchableOpacity
                    style={[
                        styles.controlButton, 
                        autoCaptureEnabled && styles.controlButtonActive,
                        { padding: buttonPadding }
                    ]}
                    onPress={toggleAutoCapture}
                >
                    <Text style={[styles.controlText, { fontSize }]}>
                        {autoCaptureEnabled ? '🟢 Auto' : '⚪ Manual'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.captureButton,
                        !isCaptureButtonEnabled() && styles.captureButtonDisabled,
                        { width: buttonSize, height: buttonSize, borderRadius: buttonSize / 2 }
                    ]}
                    onPress={handleCapture}
                    disabled={!isCaptureButtonEnabled()}
                >
                    <View style={[
                        styles.captureButtonInner,
                        !isCaptureButtonEnabled() && styles.captureButtonInnerDisabled,
                        { 
                            width: buttonSize - 10, 
                            height: buttonSize - 10, 
                            borderRadius: (buttonSize - 10) / 2 
                        }
                    ]} />
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={onClose} 
                    style={[styles.controlButton, { padding: buttonPadding }]}
                >
                    <Text style={[styles.controlText, { fontSize }]}>✖ Close</Text>
                </TouchableOpacity>
            </View>
        );
    };

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
                        onInitialized={() => console.log(`Camera initialized for ${deviceType} in ${orientation} mode`)}
                        onError={(error) => {
                            console.error('Camera error:', error);
                            setDebugInfo(`Camera error: ${error.message}`);
                        }}
                    />
                    {renderFaceDetectionStatus()}
                    {renderTargetBox()}
                    {renderControls()}
                </View>
            </View>
        </Modal>
    );
};

// Enhanced styles with tablet and orientation support
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
        textAlign: 'center',
        paddingHorizontal: 10,
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
    cancelButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        marginTop: 20,
    },
    cancelButtonText: {
        color: '#FFF',
        fontSize: 14,
    },
    errorText: {
        color: '#FF4444',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 10,
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
        borderWidth: 2,
        position: 'relative',
    },
    targetBoxLine: {
        position: 'absolute',
    },
    targetBoxTopLeft: {
        top: -2,
        left: -2,
    },
    targetBoxTopRight: {
        top: -2,
        right: -2,
    },
    targetBoxBottomLeft: {
        bottom: -2,
        left: -2,
    },
    targetBoxBottomRight: {
        bottom: -2,
        right: -2,
    },
    faceCountContainer: {
        position: 'absolute',
        alignSelf: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingVertical: 10,
        borderRadius: 20,
        maxWidth: '90%',
    },
    faceCountText: {
        fontWeight: 'bold',
        color: '#FFF',
        textAlign: 'center',
        flexWrap: 'wrap',
        includeFontPadding: false,
    },
    controlsContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    controlButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 30,
    },
    controlButtonActive: {
        backgroundColor: '#1C6758',
    },
    controlText: {
        color: '#FFF',
    },
    captureButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureButtonDisabled: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    captureButtonInner: {
        backgroundColor: '#FFF',
    },
    captureButtonInnerDisabled: {
        backgroundColor: '#888',
    },
});

export default AutoImageCaptureModal;