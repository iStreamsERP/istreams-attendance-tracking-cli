import React, { useState, useEffect } from 'react';
import { Text, View, Alert, Image, StyleSheet } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import Header from '../Components/Header';
import { GlobalStyles } from '../Styles/styles';
import { convertUriToBase64 } from '../Utils/UriToBase64Utils';
import { SaveAttendance } from '../Utils/SaveAttendance';
import { useNavigation, useRoute } from '@react-navigation/native';
import FontAwesome6Icon from 'react-native-vector-icons/FontAwesome6';
import ProjectListPopup from '../Modal/ProjectListPopUp';
import { LocationService } from '../Logics/LocationService';
import { formatDate, formatTime } from '../Utils/dataTimeUtils';
import AutoImageCaptureModal from '../Modal/AutoImageCaptureModal';
import { ImageRecognition } from '../Utils/ImageRecognition';
import ImageRecognitionResult from '../Components/ImageRecognitionResult';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../Context/AuthContext';
import { useCheckin } from '../Context/CheckinContext';

const SelfCheckin = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const route = useRoute();
    const { selectedLocation } = route.params || {};
    const { userData } = useAuth();
    const { getLastCheckin, recordCheckin } = useCheckin();

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
    const [headerName, setHeaderName] = useState('');
    const [saveCompleted, setSaveCompleted] = useState(false);
    const [matchedImage, setMatchedImage] = useState(null);
    const [hasRecognized, setHasRecognized] = useState(false);

    const userEmail = userData.userEmail;
    const userName = userData.userName;
    const deviceId = userData.androidID;
    const clientURL = userData.clientURL;
    const companyCode = userData.companyCode;
    const branchCode = userData.branchCode;

    const domain = userEmail.split('@')[1].split('.')[0];

    useEffect(() => {
        const now = new Date();
        setEntryDate(formatDate(now));
        setEntryTime(formatTime(now));

        LocationService(setLocationName, setCoordinates, setAddress);

        setShowCameraModal(true);
    }, []);

    useEffect(() => {
        const loadOrUpdateLocation = async () => {
            try {
                let locationFromParams = selectedLocation;

                if (locationFromParams) {
                    // Save new value if different from stored
                    const stored = await AsyncStorage.getItem('CURRENT_OFC_LOCATION');
                    if (!stored || JSON.stringify(JSON.parse(stored)) !== JSON.stringify(locationFromParams)) {
                        await AsyncStorage.setItem('CURRENT_OFC_LOCATION', JSON.stringify(locationFromParams));
                        console.log('Stored new location:', locationFromParams);
                    }
                }

                // Load final location from storage (which is either the newly saved one or the existing one)
                const finalStored = await AsyncStorage.getItem('CURRENT_OFC_LOCATION');
                const location = finalStored ? JSON.parse(finalStored) : null;

                console.log('Using location:', location);

                const [projectNo, projectName] = location?.name?.split(' - ') || ['', ''];
                setProjectNo(projectNo);
                setProjectName(projectName);
                setHeaderName(location?.siteLocation || '');

            } catch (error) {
                console.error('Error handling location storage:', error);
            }
        };

        loadOrUpdateLocation();
    }, []);


    useEffect(() => {
        if (capturedImage && !hasRecognized) {
            handleImageRecognition();
            setHasRecognized(true);
        }
    }, [capturedImage, hasRecognized]);

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
                    const imageUrl = `http://23.105.135.231:8082/api/EncodeImgToNpy/view?DomainName=${domain}&EmpNo=${extractedEmpNos[0]}`;
                    console.log('Generated matched image URL:', imageUrl);
                    
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
        setHasRecognized(false);
    };

    const SaveSelfCheckin = async () => {
        if (!capturedImage) {
            alert('Missing required data. Please ensure photo is captured.');
            return;
        }
        if (!selectedEmp || selectedEmp === null || selectedEmp === '') {
            alert('UnMatched Employee Found. Add Employee and try again.');
            return;
        }

        const now = new Date();
        const lastTime = getLastCheckin(selectedEmp);
        const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds

        if (lastTime && now - lastTime < fiveMinutes) {
            const remaining = Math.ceil((fiveMinutes - (now - lastTime)) / 1000);
            Alert.alert('Already Checked In Within 5 Minutes', `Try again after ${remaining} seconds`);
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
                base64Img: base64,
                navigation,
                returnTo: 'SelfCheckin',
                setErrorMessage
            });
            recordCheckin(selectedEmp);

            setSaveCompleted(true);
        } catch (error) {
            console.error('Error saving Checkin data:', error);
        } finally {
            setbtnLoading(false);
            setLocationLoading(false);
        }
    };

    const reload = () => {
        handleImageRecognition();
    };

    return (
        <View style={[GlobalStyles.pageContainer, { paddingTop: insets.top }]}>
            <Header title={`${headerName} Check-in`} />
            <View style={{ flex: 1 }}>
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
                        //onPressIn={() => setPopupVisible(true)}
                        value={projectNo}
                        style={{ width: '70%', marginTop: 5 }}
                        placeholder="Enter Project No"
                        //showSoftInputOnFocus={false} 
                        editable={false} />

                    {/* <ProjectListPopup
                        visible={isPopupVisible}
                        onClose={() => setPopupVisible(false)}
                        onSelect={(project) => {
                            handleProjectSelect(project);
                            setPopupVisible(false);
                        }}

                    /> */}

                    <TextInput
                        mode="outlined"
                        label="Project Name"
                        value={projectName}
                        showSoftInputOnFocus={false}
                        placeholder="Enter Project Name" />
                </View>

                <View style={[GlobalStyles.camButtonContainer, GlobalStyles.twoInputContainer, { marginBottom: 10 }]} >
                    <Button
                        icon={"reload"}
                        mode="contained"
                        title="Reload Page"
                        onPress={() => { resetFaceStates(); setShowCameraModal(true); }} >
                        Retake
                    </Button>
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