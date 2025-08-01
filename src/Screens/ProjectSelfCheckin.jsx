import React, { useState, useEffect } from 'react';
import { Text, View, Image, StyleSheet, Alert } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import Header from '../Components/Header';
import { GlobalStyles } from '../Styles/styles';
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
import { useAuth } from '../Context/AuthContext';
import { convertUriToBase64 } from '../Utils/UriToBase64Utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../Context/ThemeContext';

const ProjectSelfCheckin = () => {
    const insets = useSafeAreaInsets();
    const { userData } = useAuth();
    const route = useRoute();
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);
    const { selectedLocation } = route.params || {};
    //const [isPopupVisible, setPopupVisible] = useState(false);
    const navigation = useNavigation();
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
    const [showCameraModal, setShowCameraModal] = useState(false);
    const [address, setAddress] = useState('');
    const [matchedImage, setMatchedImage] = useState(null);
    const [hasRecognized, setHasRecognized] = useState(false);

    const userEmail = userData.userEmail;
    const userName = userData.userName;
    const deviceId = userData.androidID;
    const clientURL = userData.clientURL;
    const companyCode = userData.companyCode;
    const branchCode = userData.branchCode;

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

            } catch (error) {
                console.error('Error handling location storage:', error);
            }
        };

        loadOrUpdateLocation();
    }, []);

    useEffect(() => {
        setShowCameraModal(true);

        LocationService(setLocationName, setCoordinates, setAddress);

        const now = new Date();
        setEntryDate(formatDate(now));
        setEntryTime(formatTime(now));
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
                    const imageUrl = `http://103.168.19.35:8070/api/EncodeImgToNpy/view?DomainName=demo&EmpNo=${extractedEmpNos[0]}`;
                    setMatchedImage(imageUrl);
                }
            }
        }
    }, [groupedData]);

    const SaveSelfCheckin = async () => {
        if (!capturedImage) {
            alert('Missing required data. Please ensure photo is captured.');
            return;
        }
        if (!projectNo) {
            alert('Now Select Project Details to Continue.');
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
                base64Img: base64,
                navigation,
                returnTo: 'ProjectSelfCheckin',
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
        <View style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>
            <Header title="Project Self Check-In" />
            <View style={{ flex: 1 }}>
                <View style={globalStyles.locationContainer}>
                    <FontAwesome6Icon name="location-dot" size={20} color="#70706d" />
                    <Text style={[globalStyles.subtitle, { marginLeft: 5 }]}>{locationName}</Text>
                </View>

                <View style={[globalStyles.twoInputContainer, { marginTop: 10 }]}>
                    <View style={globalStyles.container1}>
                        <TextInput
                            mode="outlined"
                            label="Entry Date"
                            value={entryDate}
                            theme={theme}
                            editable={false}
                            onPressIn={() => setShowDatePicker(true)}
                        />
                    </View>

                    <View style={globalStyles.container2}>
                        <TextInput
                            mode="outlined"
                            label="Entry Time"
                            value={entryTime}
                            theme={theme}
                            editable={false}
                            onPressIn={() => setShowTimePicker(true)}
                        />
                    </View>
                </View>

                <Text style={[globalStyles.subtitle_1, { marginTop: 10 }]}>Project Details</Text>
                <View>
                    <TextInput
                        mode="outlined"
                        label="Project No"
                        //onPressIn={() => setPopupVisible(true)}
                        theme={theme}
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
                        theme={theme}
                        placeholder="Enter Project Name" />
                </View>

                <View style={[globalStyles.camButtonContainer, globalStyles.twoInputContainer, { marginVertical: 10 }]} >
                    <Button
                        icon={"reload"}
                        mode="contained"
                        title="Reload Page"
                        onPress={() => setShowCameraModal(true)}
                        theme={{
                            colors: {
                                primary: colors.primary,
                                disabled: colors.lightGray, // <- set your desired disabled color
                            },
                        }}
                    >
                        Retake
                    </Button>
                    <Button
                        icon={"reload"}
                        mode="contained"
                        title="Reload Page"
                        onPress={reload}
                        theme={{
                            colors: {
                                primary: colors.primary,
                                disabled: colors.lightGray, // <- set your desired disabled color
                            },
                        }}>
                        Retry
                    </Button>
                </View>

                <View style={globalStyles.twoInputContainer}>
                    <View style={styles.imageContainer}>
                        <Text style={globalStyles.subtitle_1}>Uploaded Image</Text>
                        {capturedImage ? (
                            <Image
                                source={{ uri: capturedImage }}
                                style={globalStyles.uploadedEmpImage}
                            />
                        ) : (
                            <View style={[globalStyles.uploadedEmpImage, styles.placeholderContainer]}>
                                <Text style={styles.placeholderText}>No Image</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.imageContainer}>
                        <Text style={globalStyles.subtitle_1}>
                            {Array.isArray(groupedData) && groupedData.some(item => item.title === "Non-Matched Faces")
                                ? "No Match Found"
                                : ""}
                        </Text>
                        {matchedImage ? (
                            <Image
                                source={{ uri: matchedImage }}
                                style={globalStyles.uploadedEmpImage}
                                onError={(error) => {
                                    console.log('Image load error:', error);
                                    setMatchedImage(null);
                                }}
                            />
                        ) : (
                            <View style={[globalStyles.uploadedEmpImage, styles.placeholderContainer]}>
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

            <View style={globalStyles.bottomButtonContainer}>
                <Button mode="contained"
                    onPress={SaveSelfCheckin}
                    theme={{
                        colors: {
                            primary: colors.primary,
                            disabled: colors.lightGray, // <- set your desired disabled color
                        },
                    }}
                    disabled={btnloading}
                    loading={btnloading}>
                    Save
                </Button>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    empImage: {
        width: 70,
        height: 70,
        borderRadius: 40,
        marginRight: 10,
    },
});

export default ProjectSelfCheckin;