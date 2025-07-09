import React, { useState, useEffect, useCallback } from 'react';
import { Text, View, Alert, ActivityIndicator, Image, StyleSheet } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import Header from '../Components/Header';
import { GlobalStyles } from '../Styles/styles';
import { convertUriToBase64 } from '../Utils/UriToBase64Utils';
import { SaveAttendance } from '../Utils/SaveAttendance';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import FontAwesome6Icon from 'react-native-vector-icons/FontAwesome6';
import ProjectListPopup from '../Modal/ProjectListPopUp';
import { LocationService } from '../Logics/LocationService';
import { formatDate, formatTime } from '../Utils/dataTimeUtils';
import AutoImageCaptureModal from './AutoImageCaptureModal';
import { ImageRecognition } from '../Utils/ImageRecognition';
import ImageRecognitionResult from '../Components/ImageRecognitionResult';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../Context/AuthContext';

const SelfCheckin = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const route = useRoute();
    const { selectedLocation } = route.params || {};
    const { userData } = useAuth();

    // Location checking states
    const [locationLoading, setLocationLoading] = useState(false);
    const [pageAccessible, setPageAccessible] = useState(false);
    const [distance, setDistance] = useState(null);
    const [canAccess, setCanAccess] = useState(false);
    const [officeLocation, setOfficeLocation] = useState(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [hasCompletedInitialCheck, setHasCompletedInitialCheck] = useState(false);
    const [persistedLocation, setPersistedLocation] = useState(null);

    // Existing states
    const [isPopupVisible, setPopupVisible] = useState(false);
    const [btnloading, setbtnLoading] = useState(false);
    const [entryDate, setEntryDate] = useState('');
    const [entryTime, setEntryTime] = useState('');
    const [projectNo, setProjectNo] = useState('');
    const [projectName, setProjectName] = useState('');
    const [capturedImage, setCapturedImage] = useState(null);
    const [coordinates, setCoordinates] = useState('');
    const [locationName, setLocationName] = useState('Fetching location...');
    const [recogloading, setrecogLoading] = useState(false);
    const [matchingFaceNames, setMatchingFaceNames] = useState([]);
    const [cleanedMatchNames, setCleanedMatchNames] = useState([]);
    const [groupedData, setgroupedData] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const TrackingStatus = 'checkin';
    const [base64Img, setBase64Img] = useState(null);
    const [selectedEmp, setSelectedEmp] = useState('');
    const [empNo, setEmpNo] = useState([]);
    const [autosaveTriggered, setAutosaveTriggered] = useState(false);
    const [showCameraModal, setShowCameraModal] = useState(false);
    const [address, setAddress] = useState('');
    const [headerName, setHeaderName] = useState('Office Check-In');
    const [ofcLocation, setOfcLocation] = useState(null);
    const [checkinRadius, setCheckinRadius] = useState('');
    const [ready, setReady] = useState(false);
    const [saveCompleted, setSaveCompleted] = useState(false);
    const [matchedImage, setMatchedImage] = useState(null);

    const userEmail = userData.userEmail;
    const userName = userData.userName;
    const deviceId = userData.androidID;
    const clientURL = userData.clientURL;
    const companyCode = userData.companyCode;
    const branchCode = userData.branchCode;

    const fetchOfficeLocation = useCallback(async () => {
        // Don't run location fetch if save is completed
        if (saveCompleted) {
            return officeLocation;
        }

        setPageAccessible(false);
        setCanAccess(false);

        try {
            const locationJson = await AsyncStorage.getItem('CURRENT_OFC_LOCATION');
            const officeLoc = locationJson ? JSON.parse(locationJson) : null;
            setOfficeLocation(officeLoc);

            if (!officeLoc) {
                if (!isInitialLoad) {
                    Alert.alert('Error', 'Office location data not available.');
                }
                return null;
            }
            return officeLoc;
        } catch (error) {
            console.error('Error fetching office location:', error);
            if (!isInitialLoad) {
                Alert.alert('Error', 'Unable to fetch office location.');
            }
            return null;
        } finally {
            setLocationLoading(false);
            setIsInitialLoad(false);
        }
    }, [isInitialLoad, saveCompleted, officeLocation]);

    // Function to calculate distance between two coordinates using Haversine formula
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371000; // Earth's radius in meters
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return distance;
    };

    // Parse coordinates string to get latitude and longitude
    const parseCoordinates = (coordString) => {
        if (!coordString || typeof coordString !== 'string') {
            console.log('Invalid coordinate string:', coordString);
            return { latitude: 0, longitude: 0 };
        }

        const cleanCoordString = coordString.replace(/\s+/g, ' ').trim();
        const coords = cleanCoordString.split(',');

        if (coords.length !== 2) {
            console.log('Coordinate format error:', coordString);
            return { latitude: 0, longitude: 0 };
        }

        const lat = parseFloat(coords[0].trim());
        const lon = parseFloat(coords[1].trim());

        if (isNaN(lat) || isNaN(lon)) {
            return { latitude: 0, longitude: 0 };
        }

        return { latitude: lat, longitude: lon };
    };

    // Modified checkLocationDistance to accept officeLoc as parameter
    const checkLocationDistance = useCallback(async (officeLoc) => {
        // Don't run location check if save is completed

        if (saveCompleted || !officeLoc) {
            setLocationLoading(false);
            return pageAccessible; // Return current access status
        }

        try {
            let capturedLocationName = '';
            let capturedCoordinates = '';

            const captureLocationName = (name) => {
                capturedLocationName = name;
                setLocationName(name);
            };

            const captureCoordinates = (coords) => {
                capturedCoordinates = coords;
                setCoordinates(coords);
            };

            await LocationService(captureLocationName, captureCoordinates, setAddress);

            console.log('Captured Location Name:', capturedLocationName);
            console.log('Captured Coordinates:', capturedCoordinates);


            if (capturedCoordinates) {
                const currentCoords = parseCoordinates(capturedCoordinates);
                const officeCoords = parseCoordinates(officeLoc.coordinates);

                if (currentCoords.latitude !== 0 && currentCoords.longitude !== 0 &&
                    officeCoords.latitude !== 0 && officeCoords.longitude !== 0) {

                    const distanceFromOffice = calculateDistance(
                        currentCoords.latitude,
                        currentCoords.longitude,
                        officeCoords.latitude,
                        officeCoords.longitude
                    );

                    const roundedDistance = Math.round(distanceFromOffice);
                    setDistance(roundedDistance);

                    const isWithinRange = distanceFromOffice <= checkinRadius;
                    setCanAccess(isWithinRange);

                    if (isWithinRange) {
                        setPageAccessible(true);
                        return true;
                    } else {
                        setPageAccessible(false);
                        Alert.alert(
                            'Access Denied',
                            `You are ${roundedDistance}m away from office. You must be within ${checkinRadius}m to access this page.`,
                            [
                                {
                                    text: 'Try Again',
                                    onPress: async () => {
                                        setLocationLoading(true);
                                        const newOfficeLoc = await fetchOfficeLocation();
                                        if (newOfficeLoc) {
                                            await checkLocationDistance(newOfficeLoc);
                                        }
                                    }
                                },
                                {
                                    text: 'Cancel',
                                    onPress: () => navigation.goBack()
                                }
                            ]
                        );
                        return false;
                    }
                } else {
                    Alert.alert('Error', 'Invalid coordinates detected. Please try again.');
                    setPageAccessible(false);
                    return false;
                }
            } else {
                Alert.alert('Error', 'Unable to get location coordinates.');
                setPageAccessible(false);
                return false;
            }
        } catch (error) {
            console.error('Error checking location:', error);
            Alert.alert('Error', 'Unable to get your current location. Please try again.');
            setPageAccessible(false);
            return false;
        } finally {
            setLocationLoading(false);
        }
    }, [fetchOfficeLocation, navigation, checkinRadius, saveCompleted, pageAccessible]);

    const handleProjectSelect = (project) => {
        setProjectNo(project.PROJECT_NO);
        setProjectName(project.PROJECT_NAME);
    };

    const handleImageRecognition = async () => {
        await ImageRecognition(
            capturedImage,
            userEmail,
            userName,
            deviceId,
            clientURL,
            setrecogLoading,
            setBase64Img,
            setMatchingFaceNames,
            setCleanedMatchNames,
            setgroupedData,
            setErrorMessage);
    };

    const resetFaceStates = () => {
        setCapturedImage(null);
        setMatchingFaceNames([]);
        setCleanedMatchNames([]);
        setgroupedData([]);
        setMatchedImage(null);
        setSelectedEmp(null);
        setEmpNo([]);
        setErrorMessage('');
        setAutosaveTriggered(false);
    };

    useEffect(() => {
        const handleLocationData = async () => {
            // Check for new location data first
            if (selectedLocation && Object.keys(selectedLocation).length > 0) {
                // Set state from new location data
                setHeaderName(`${selectedLocation.name} Check-In`);
                setOfcLocation(selectedLocation.details);
                setCheckinRadius(selectedLocation.range || 10);

                // Save to AsyncStorage
                try {
                    await AsyncStorage.setItem(
                        'SELECTED_LOCATION_STORAGE',
                        JSON.stringify(selectedLocation)
                    );
                } catch (error) {
                    console.error('Failed to save location:', error);
                }

                setReady(true);
            } else {
                // No new location - try loading saved location
                try {
                    const savedLocation = await AsyncStorage.getItem('SELECTED_LOCATION_STORAGE');
                    if (savedLocation) {
                        const parsedLocation = JSON.parse(savedLocation);
                        setHeaderName(`${parsedLocation.name} Check-In`);
                        setOfcLocation(parsedLocation.details);
                        setCheckinRadius(parsedLocation.range || 10);
                    } else {
                        // No saved location - use defaults
                        setHeaderName('Office Check-In');
                        setCheckinRadius(10);
                    }
                } catch (error) {
                    console.error('Failed to load location:', error);
                    setHeaderName('Office Check-In');
                    setCheckinRadius(10);
                }
                setReady(true);
            }
        };

        handleLocationData();
    }, [selectedLocation]);

    // Use useEffect instead of useFocusEffect to run only once
    useEffect(() => {
        if (!ready || hasCompletedInitialCheck) return;

        const initialize = async () => {
            const officeLoc = await fetchOfficeLocation();
            if (officeLoc) {
                const isWithinRange = await checkLocationDistance(officeLoc);
                if (isWithinRange) {
                    setShowCameraModal(true);
                    setHasCompletedInitialCheck(true); // Mark as completed

                    const now = new Date();
                    setEntryDate(formatDate(now));
                    setEntryTime(formatTime(now));
                }
            }
        };

        initialize();
    }, [ready]);

    useEffect(() => {
        if (capturedImage) {
            handleImageRecognition();
        }
    }, [capturedImage]);

    useEffect(() => {
        if (errorMessage) {
            Alert.alert('Error', errorMessage, [
                { text: 'OK', onPress: () => setErrorMessage('') }
            ]);
        }
    }, [errorMessage]);

    useEffect(() => {
        if (groupedData && groupedData.length > 0) {
            const hasNonMatchedFaces = Array.isArray(groupedData) && groupedData.some(item => item.title === "Non-Matched Faces");

            if (hasNonMatchedFaces) {
                setEmpNo([]);
                setSelectedEmp(null);

                // Set matched image to show non-matched faces or a placeholder
                setMatchedImage(null);

                navigation.navigate('FailureAnimationScreen', {
                    message: 'No Employee Image Matched',
                    details: 'Next employee please',
                    returnTo: 'SelfCheckin'
                });
            } else {
                const extractedEmpNos = groupedData.flatMap(item => item.data.map(i => i.EMP_NO));
                setEmpNo(extractedEmpNos);
                setSelectedEmp(extractedEmpNos[0]);

                // Generate matched image URL for the first matched employee
                if (extractedEmpNos.length > 0) {
                    const imageUrl = `http://23.105.135.231:8082/api/EncodeImgToNpy/view?DomainName=demo&EmpNo=${extractedEmpNos[0]}`;
                    setMatchedImage(imageUrl);
                }
            }
        }
    }, [groupedData]);

    useEffect(() => {
        if (
            !autosaveTriggered &&
            capturedImage &&
            groupedData.length > 0 &&
            locationName &&
            selectedEmp?.length > 0
        ) {
            SaveSelfCheckin();
            setAutosaveTriggered(true);
        }
    }, [capturedImage, groupedData, locationName, selectedEmp]);

    const SaveSelfCheckin = async () => {
        if (!capturedImage) {
            alert('Missing required data. Please ensure photo is captured.');
            return;
        }
        if (!selectedEmp || selectedEmp === null || selectedEmp === '') {
            alert('UnMatched Employee Found. Add Employee and try again.');
            return;
        }

        setbtnLoading(true);

        try {
            const base64 = await convertUriToBase64(capturedImage);
            setBase64Img(base64);

            const empData = `<string>${selectedEmp}</string>`;

            await SaveAttendance({
                companyCode,
                branchCode,
                userName,
                clientURL,
                projectNo,
                locationName,
                entryDate,
                entryTime,
                coordinates,
                TrackingStatus,
                selectedEmp: empData,
                base64Img: base64Img,
                navigation,
                returnTo: 'SelfCheckin',
                setErrorMessage
            });

            // Mark save as completed - this prevents further location loading
            setSaveCompleted(true);
        } catch (error) {
            console.error('Error saving Checkin data:', error);
        } finally {
            setbtnLoading(false);
            // Completely stop any location loading after save
            setLocationLoading(false);
        }
    };

    const reload = () => {
        handleImageRecognition();
    };

    // Show loading screen during location check (but not after save is completed or initial check is done)
    if (locationLoading && !saveCompleted && !hasCompletedInitialCheck) {
        return (
            <View style={[GlobalStyles.pageContainer, { paddingTop: insets.top }]}>
                <Header title="Office Self Check-In" />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={{ marginTop: 10, fontSize: 16, color: '#666' }}>
                        Checking your location...
                    </Text>
                </View>
            </View>
        );
    }

    // Show access denied if not within range
    if (!pageAccessible) {
        return (
            <View style={[GlobalStyles.pageContainer, { paddingTop: insets.top }]}>
                <Header title="Office Self Check-In" />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={[GlobalStyles.subtitle_2, { marginVertical: 10, color: '#666' }]}>
                        Checking your location...Please wait.
                    </Text>
                    <Text style={[GlobalStyles.subtitle_2, { color: '#666', textAlign: 'center', marginBottom: 10 }]}>
                        You must be within {checkinRadius}m of the office to access this page.
                    </Text>
                    {distance && (
                        <Text style={[GlobalStyles.subtitle_2, { color: '#F44336', marginBottom: 20 }]}>
                            Current distance: {distance}m from office
                        </Text>
                    )}
                    <Button
                        mode="contained"
                        onPress={async () => {
                            setLocationLoading(true);
                            const officeLoc = await fetchOfficeLocation();
                            if (officeLoc) {
                                await checkLocationDistance(officeLoc);
                            }
                        }}
                    >
                        Try Again
                    </Button>
                </View>
            </View>
        );
    }

    return (
        <View style={[GlobalStyles.pageContainer, { paddingTop: insets.top }]}>
            <Header title={headerName} />
            <View style={{ flex: 1 }}>
                <View style={GlobalStyles.twoInputContainer}>
                    <View style={GlobalStyles.twoInputContainer}>
                        <Icon name="office-building" size={20} color="#70706d" />
                        <Text style={[GlobalStyles.subtitle, { marginLeft: 5 }]}>{ofcLocation}</Text>
                    </View>
                    {distance && (
                        <Text style={[GlobalStyles.subtitle_2, { color: '#4CAF50' }]}>
                            ✓ Within range ({distance}m)
                        </Text>
                    )}
                </View>
                <View style={[GlobalStyles.locationContainer, { flexDirection: 'row', alignItems: 'center' }]}>
                    <FontAwesome6Icon name="location-dot" size={20} color="#70706d" />
                    <Text style={[GlobalStyles.subtitle, { marginLeft: 5 }]}>{locationName}</Text>
                </View>

                <View style={[GlobalStyles.twoInputContainer, { marginTop: 10 }]}>
                    <View style={GlobalStyles.container1}>
                        <TextInput
                            mode="outlined"
                            label="Entry Date"
                            value={entryDate}
                            editable={false}
                        />
                    </View>

                    <View style={GlobalStyles.container2}>
                        <TextInput
                            mode="outlined"
                            label="Entry Time"
                            value={entryTime}
                            editable={false}
                        />
                    </View>
                </View>

                <Text style={[GlobalStyles.subtitle_1, { marginTop: 10 }]}>Project Details</Text>
                <View>
                    <TextInput
                        mode="outlined"
                        label="Project No"
                        onPressIn={() => setPopupVisible(true)}
                        value={projectNo}
                        style={{ width: '70%', marginTop: 5 }}
                        placeholder="Enter Project No"
                        showSoftInputOnFocus={false} />

                    <ProjectListPopup
                        visible={isPopupVisible}
                        onClose={() => setPopupVisible(false)}
                        onSelect={(project) => {
                            handleProjectSelect(project);
                            setPopupVisible(false);
                        }}

                    />

                    <TextInput
                        mode="outlined"
                        label="Project Name"
                        value={projectName}
                        showSoftInputOnFocus={false}
                        placeholder="Enter Project Name" />
                </View>

                <View style={[GlobalStyles.camButtonContainer, GlobalStyles.twoInputContainer, { marginBottom: 10 }]} >
                    <Button icon={"reload"} mode="contained" title="Reload Page" onPress={() => { resetFaceStates(); setShowCameraModal(true); }} >Retake</Button>
                    <Button icon={"reload"} mode="contained" title="Reload Page" onPress={reload} >Retry</Button>
                </View>

                <View style={GlobalStyles.twoInputContainer}>
                    <View style={styles.imageContainer}>
                        <Text style={GlobalStyles.subtitle_1}>Uploaded Image</Text>
                        {capturedImage ? (
                            <Image
                                source={{ uri: capturedImage }}
                                style={GlobalStyles.empImageDisplay}
                            />
                        ) : (
                            <View style={[GlobalStyles.empImageDisplay, styles.placeholderContainer]}>
                                <Text style={styles.placeholderText}>No Image</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.imageContainer}>
                        <Text style={GlobalStyles.subtitle_1}>
                            {Array.isArray(groupedData) && groupedData.some(item => item.title === "Non-Matched Faces")
                                ? "No Match Found"
                                : ""}
                        </Text>
                        {matchedImage ? (
                            <Image
                                source={{ uri: matchedImage }}
                                style={GlobalStyles.empImageDisplay}
                                onError={(error) => {
                                    console.log('Image load error:', error);
                                    setMatchedImage(null);
                                }}
                            />
                        ) : (
                            <View style={[GlobalStyles.empImageDisplay, styles.placeholderContainer]}>
                                <Text style={styles.placeholderText}>
                                    {Array.isArray(groupedData) && groupedData.some(item => item.title === "Non-Matched Faces")
                                        ? "No Match Found"
                                        : ""}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {showCameraModal && (
                    <AutoImageCaptureModal
                        visible={showCameraModal}
                        onClose={() => setShowCameraModal(false)}
                        onCapture={(imagePath) => {
                            setCapturedImage(imagePath);
                            console.log('Captured image URI local:', capturedImage);
                        }}
                    />
                )}

                <ImageRecognitionResult
                    recogloading={recogloading}
                    groupedData={groupedData}
                />
            </View>

            <View style={GlobalStyles.bottomButtonContainer}>
                <Button mode="contained"
                    onPress={SaveSelfCheckin}
                    disabled={btnloading}
                    loading={btnloading}>
                    Save
                </Button>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    empImage: {
        width: 70,
        height: 70,
        borderRadius: 40,
        marginRight: 10,
    },
    imageContainer: {
        flex: 1,
        alignItems: 'center',
    },
    placeholderContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderWidth: 1,
        borderColor: '#ddd',
        borderStyle: 'dashed',
    },
    placeholderText: {
        color: '#666',
        fontSize: 12,
        textAlign: 'center',
    },
});

export default SelfCheckin;