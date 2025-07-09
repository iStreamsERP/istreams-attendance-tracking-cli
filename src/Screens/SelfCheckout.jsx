import React, { useState, useEffect } from 'react';
import { Text, View, Alert, StyleSheet, Image } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import Header from '../Components/Header';
import { GlobalStyles } from '../Styles/styles';
import { convertUriToBase64 } from '../Utils/UriToBase64Utils';
import { SaveAttendance } from '../Utils/SaveAttendance';
import { useNavigation } from '@react-navigation/native';
import FontAwesome6Icon from 'react-native-vector-icons/FontAwesome6';
import ProjectListPopup from '../Modal/ProjectListPopUp';
import { LocationService } from '../Logics/LocationService';
import { formatDate, formatTime } from '../Utils/dataTimeUtils';
import AutoImageCaptureModal from './AutoImageCaptureModal';
import { ImageRecognition } from '../Utils/ImageRecognition';
import ImageRecognitionResult from '../Components/ImageRecognitionResult';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../Context/AuthContext';

const SelfCheckout = () => {
    const [isPopupVisible, setPopupVisible] = useState(false);
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { userData } = useAuth();
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
    const TrackingStatus = 'checkout';
    const [base64Img, setBase64Img] = useState(null);
    const [selectedEmp, setSelectedEmp] = useState('');
    const [empNo, setEmpNo] = useState([]);
    const [autosaveTriggered, setAutosaveTriggered] = useState(false);
    const [showCameraModal, setShowCameraModal] = useState(false);
    const [address, setAddress] = useState('');
    const [matchedImage, setMatchedImage] = useState(null);

    const userEmail = userData.userEmail;
    const userName = userData.userName;
    const deviceId = userData.androidID;
    const clientURL = userData.clientURL;
    const companyCode = userData.companyCode;
    const branchCode = userData.branchCode;

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

    useEffect(() => {
        setShowCameraModal(true);

        LocationService(setLocationName, setCoordinates, setAddress);

        const now = new Date();
        setEntryDate(formatDate(now));
        setEntryTime(formatTime(now));
    }, []);

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
            const hasNonMatchedFaces = groupedData.some(item => item.title === "Non-Matched Faces");

            if (hasNonMatchedFaces) {
                setEmpNo([]);
                setSelectedEmp(null);
                navigation.navigate('FailureAnimationScreen', {
                    message: 'No Employee Image Matched',
                    details: 'Next employee please',
                    returnTo: 'SelfCheckout'
                });
            }
            else {
                const extractedEmpNos = groupedData.flatMap(item => item.data.map(i => i.EMP_NO));
                console.log("Extracted Employee Numbers:", extractedEmpNos);
                setEmpNo(extractedEmpNos);
                setSelectedEmp(extractedEmpNos[0]);
            }
        }
    }, [groupedData]);

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
            SaveSelfCheckout();
            setAutosaveTriggered(true);
        }
    }, [capturedImage, groupedData, locationName, selectedEmp]);

    const SaveSelfCheckout = async () => {
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
                returnTo: 'SelfCheckout',
                setErrorMessage
            });
        } catch (error) {
            setbtnLoading(false);
            console.error('Error saving Checkin data:', error);
        }
        finally {
            setbtnLoading(false);
        }
    };

    const reload = () => {
        handleImageRecognition();
    };

    return (
        <View style={[GlobalStyles.pageContainer, { paddingTop: insets.top }]}>
            <Header title="Self Check-Out" />

            <View style={{ flex: 1 }}>
                <View style={GlobalStyles.locationContainer}>
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
                            onPressIn={() => setShowDatePicker(true)}
                        />
                    </View>

                    <View style={GlobalStyles.container2}>
                        <TextInput
                            mode="outlined"
                            label="Entry Time"
                            value={entryTime}
                            editable={false}
                            onPressIn={() => setShowTimePicker(true)}
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

                <View style={[GlobalStyles.camButtonContainer, GlobalStyles.twoInputContainer, { marginBottom: 10 }]}>
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
                    onPress={SaveSelfCheckout}
                    loading={btnloading}
                    disabled={btnloading}>
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

export default SelfCheckout;