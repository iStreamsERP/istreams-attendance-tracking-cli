import React, { useState, useEffect } from 'react'
import { Text, StyleSheet, ScrollView, KeyboardAvoidingView, View, Platform, Image } from 'react-native';
import Header from '../Components/Header';
import { GlobalStyles } from '../Styles/styles';
import FontAwesome6Icon from 'react-native-vector-icons/FontAwesome6';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TextInput, Button, Snackbar } from 'react-native-paper';
import { LocationService } from '../Logics/LocationService';
import { formatDate, formatTime } from '../Utils/dataTimeUtils';
import ProjectListPopup from '../Modal/ProjectListPopUp';
import { useNavigation } from '@react-navigation/native';
import ProjectBOQListPopUp from '../Modal/ProjectBOQListPopUp';
import { callSoapService } from '../SoapRequestAPI/callSoapService';
import ManualImageCaptureModal from '../Modal/ManualImageCaptureModal';
import { useAuth } from '../Context/AuthContext';

const DPR = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const { userData } = useAuth();
    const [locationName, setLocationName] = useState('Fetching location...');
    const [projectNo, setProjectNo] = useState('');
    const [projectName, setProjectName] = useState('');
    const [entryDate, setEntryDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [coordinates, setCoordinates] = useState('');
    const [btnloading, setbtnLoading] = useState(false);
    const [address, setAddress] = useState('');
    const [isPopupVisible, setPopupVisible] = useState(false);
    const [activity, setActivity] = useState('');
    const [compQty, setCompQty] = useState('');
    const [percentage, setPercentage] = useState('');
    const [boqNo, setBoqNo] = useState('');

    const [boqList, setBoqList] = useState([]);
    const [isBoqPopupVisible, setBoqPopupVisible] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);

    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMsg, setSnackbarMsg] = useState('');
    const [cameraVisible, setCameraVisible] = useState(false);

    useEffect(() => {
        LocationService(setLocationName, setCoordinates, setAddress);

        const now = new Date();

        setEntryDate(formatDate(now));

        // Current time
        const currentTimeFormatted = formatTime(now);

        // One hour later
        const oneHourLater = new Date(now); // Clone the current time
        oneHourLater.setHours(oneHourLater.getHours() + 1);
        const oneHourLaterFormatted = formatTime(oneHourLater);

        // Set both values
        setStartTime(currentTimeFormatted);
        setEndTime(oneHourLaterFormatted);
    }, []);

    const handleProjectSelect = async (project) => {
        setProjectNo(project.PROJECT_NO);
        setProjectName(project.PROJECT_NAME);

        try {
            const PrjBOQ_ListParameter = {
                projectnum: project.PROJECT_NO,
            };

            const ProjectBOQList = await callSoapService(userData.clientURL, 'getproject_part_details', PrjBOQ_ListParameter);

            if (ProjectBOQList !== null) {
                setBoqList(ProjectBOQList);
            }
        } catch (error) {
            console.error("Error fetching BOQ list:", error);
        }
    };

    const handleCapture = (uri) => {
        setCapturedImage(uri);
    };

    const handleProjectBOQSelect = (boq) => {
        setBoqNo(String(boq.BOQ_NO));
    };

    const handleNavigation = () => {
        if (!projectNo) {
            setSnackbarMsg('Select Project');
            setSnackbarVisible(true);
            return;
        }
        else if (!boqNo) {
            setSnackbarMsg('Select Valid BOQ');
            setSnackbarVisible(true);
            return;
        }
        else if (!activity && !compQty && !percentage) {
            setSnackbarMsg('Enter Required Fields');
            setSnackbarVisible(true);
            return;
        }
        else if (!capturedImage) {
            setSnackbarMsg('Capture Project Image');
            setSnackbarVisible(true);
            return;
        }
        else {
            navigation.navigate('DPREmp', {
                startTime, endTime, projectNo, activity, compQty,
                percentage, capturedImage, locationName, boqNo
            });
        }
    };
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}>

            <View style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <View style={[GlobalStyles.pageContainer, { paddingTop: insets.top }]}>
                        <Header title="DPR" />

                        <View>
                            <View style={GlobalStyles.locationContainer}>
                                <FontAwesome6Icon name="location-dot" size={20} color="#70706d" />
                                <Text style={[GlobalStyles.subtitle, { marginLeft: 5 }]}>{locationName}</Text>
                            </View>
                        </View>

                        <View style={[GlobalStyles.twoInputContainer]}>
                            <View style={GlobalStyles.container1}>
                                <TextInput
                                    mode="outlined"
                                    label="Start Time"
                                    value={startTime}
                                    editable={false}
                                />
                            </View>

                            <View style={GlobalStyles.container2}>
                                <TextInput
                                    mode="outlined"
                                    label="End Time"
                                    value={endTime}
                                    editable={false}
                                />
                            </View>
                        </View>

                        <Text style={GlobalStyles.subtitle_1}>Project Details</Text>
                        <View style={[GlobalStyles.twoInputContainer]}>
                            <View style={GlobalStyles.container1}>
                                <TextInput
                                    mode="outlined"
                                    label="Project No"
                                    onPressIn={() => setPopupVisible(true)}
                                    value={projectNo}
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
                            </View>
                            <View style={GlobalStyles.container2}>
                                <TextInput
                                    mode="outlined"
                                    label="Entry Date"
                                    value={entryDate}
                                    editable={false}
                                />
                            </View>
                        </View>

                        <View>
                            <TextInput
                                mode="outlined"
                                label="Project Name"
                                value={projectName}
                                multiline
                                numberOfLines={2}
                                editable={false}
                            />
                        </View>

                        <View>
                            <Text style={GlobalStyles.subtitle_1}>BOQ Details</Text>
                            <TextInput
                                mode="outlined"
                                label="BOQ No"
                                value={boqNo}
                                onPressIn={() => setBoqPopupVisible(true)}
                                showSoftInputOnFocus={false}
                            />
                            <ProjectBOQListPopUp
                                visible={isBoqPopupVisible}
                                onClose={() => setBoqPopupVisible(false)}
                                onSelect={(boq) => {
                                    handleProjectBOQSelect(boq);
                                    setBoqPopupVisible(false);
                                }}
                                data={boqList}
                            />

                            <TextInput
                                mode="outlined"
                                label="Activity"
                                placeholder='Enter the Activity taken place'
                                value={activity}
                                onChangeText={setActivity}
                            />

                            <TextInput
                                mode="outlined"
                                label="Completed Quantity"
                                value={compQty}
                                onChangeText={setCompQty}
                            />

                            <TextInput
                                mode="outlined"
                                label="Percentage"
                                value={percentage}
                                onChangeText={setPercentage}
                            />

                            <Snackbar
                                visible={snackbarVisible}
                                onDismiss={() => setSnackbarVisible(false)}
                                duration={3000}
                                action={{
                                    label: 'OK',
                                    onPress: () => setSnackbarVisible(false),
                                }}
                            >
                                {snackbarMsg}
                            </Snackbar>

                            <View style={GlobalStyles.camButtonContainer}>
                                <Button icon="camera" mode="contained-tonal" onPress={() => setCameraVisible(true)}>
                                    Capture Project Image
                                </Button>

                                <ManualImageCaptureModal
                                    visible={cameraVisible}
                                    onClose={() => setCameraVisible(false)}
                                    onCapture={handleCapture}
                                />
                            </View>
                            <View style={GlobalStyles.imageContainer}>
                                <Image
                                    source={{ uri: capturedImage }}
                                    style={GlobalStyles.fullImage}
                                />
                            </View>
                        </View>
                    </View>
                </ScrollView>

                <View style={[GlobalStyles.bottomButtonContainer, { paddingHorizontal: 10, paddingBottom: insets.bottom }]}>
                    <Button mode="contained"
                        onPress={handleNavigation}
                        loading={btnloading}
                        disabled={btnloading}>
                        Next
                    </Button>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        flex: 1
    }
})

export default DPR;