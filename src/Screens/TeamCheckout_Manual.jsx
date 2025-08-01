import React, { useEffect, useState } from 'react';
import { Text, View, Image, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LocationService } from '../Logics/LocationService';
import FontAwesome6Icon from 'react-native-vector-icons/FontAwesome6';
import { GlobalStyles } from '../Styles/styles';
import { TextInput, Button } from 'react-native-paper';
import { formatDate, formatTime } from '../Utils/dataTimeUtils';
import ProjectListPopup from '../Modal/ProjectListPopUp';
import CustomDatePicker from '../Components/CustomDatePicker';
import ManualImageCaptureModal from '../Modal/ManualImageCaptureModal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../Context/ThemeContext';
import { handlePickImageOptimized } from '../Utils/nativeCameraFunction';

const TeamCheckout_Manual = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const route = useRoute();
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);
    const { selectedLocation } = route.params || {};
    const [locationName, setLocationName] = useState('Fetching Location...');
    const [coordinates, setCoordinates] = useState('');
    const [entryDate, setCheckoutDate] = useState('');
    const [entryTime, setCheckoutTime] = useState('');
    const [projectNo, setProjectNo] = useState('');
    const [projectName, setProjectName] = useState('');
    const [isPopupVisible, setPopupVisible] = useState(false);
    const [visible, setVisible] = useState(false);
    const [chosenCheckinDate, setChosenCheckinDate] = useState('');
    const [address, setAddress] = useState('');
    const [capturedImage, setCapturedImage] = useState(null);
    const [useNativeCamera, setUseNativeCamera] = useState(false);
    const [cameraVisible, setCameraVisible] = useState(false);

    useEffect(() => {
        const loadOrUpdateLocation = async () => {
            try {
                let locationFromParams = selectedLocation;

                if (locationFromParams) {
                    // Save new value if different from stored
                    const stored = await AsyncStorage.getItem('CURRENT_OFC_LOCATION');
                    if (!stored || JSON.stringify(JSON.parse(stored)) !== JSON.stringify(locationFromParams)) {
                        await AsyncStorage.setItem('CURRENT_OFC_LOCATION', JSON.stringify(locationFromParams));
                    }
                }

                // Load final location from storage (which is either the newly saved one or the existing one)
                const finalStored = await AsyncStorage.getItem('CURRENT_OFC_LOCATION');
                const location = finalStored ? JSON.parse(finalStored) : null;

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
        const loadPreference = async () => {
            const value = await AsyncStorage.getItem('USE_MANUAL_CAPTURE');
            
            if (value !== null) {
                setUseNativeCamera(JSON.parse(value));
            }
        };
        loadPreference();
    }, []);

    const handleProjectSelect = (project) => {
        setProjectNo(project.PROJECT_NO);
        setProjectName(project.PROJECT_NAME);
        setPopupVisible(false);
    };

    const handleDateSelected = (dateString) => {
        setChosenCheckinDate(dateString);
    };

    const handleCapturePress = () => {
        if (useNativeCamera) {
            handlePickImageOptimized(setCapturedImage); // Default picker
        } else {
            setCameraVisible(true);  // Open custom camera modal
        }
    };

    useEffect(() => {
        LocationService(setLocationName, setCoordinates, setAddress);

        const now = new Date();
        setCheckoutDate(formatDate(now));
        setCheckoutTime(formatTime(now));
        setChosenCheckinDate(formatDate(now));
    }, []);

    const handlenavToEmpPage = () => {

        if (!projectNo) {
            alert('Project Not Selected.');
            return;
        }
        else if (!chosenCheckinDate) {
            alert('Check-in Date not entered.')
        }
        else if (!capturedImage) {
            alert('Employee Image Not captured.')
        }
        else {
            navigation.navigate('TeamCheckoutEmployees_Manual', {
                projectNo, chosenCheckinDate,
                entryDate, entryTime, coordinates, locationName, capturedImage
            });
        }
    };

    return (
        <View style={[globalStyles.pageContainer, { paddingTop: insets.top, paddingHorizontal: 0 }]}>
            <ScrollView>
                <View style={globalStyles.locationContainer}>
                    <FontAwesome6Icon name="location-dot" size={20} color="#70706d" />
                    <Text style={[globalStyles.subtitle, { marginLeft: 5 }]}>{locationName}</Text>
                </View>

                <View style={[globalStyles.twoInputContainer, { marginTop: 5 }]}>
                    <View style={globalStyles.container1}>
                        <TextInput
                            mode="outlined"
                            label="Entry Date"
                            style={globalStyles.height_45}
                            theme={theme}
                            value={entryDate}
                            editable={false}
                        />
                    </View>

                    <View style={globalStyles.container2}>
                        <TextInput
                            mode="outlined"
                            label="Entry Time"
                            value={entryTime}
                            theme={theme}
                            editable={false}
                            style={globalStyles.height_45}
                            onPressIn={() => setShowTimePicker(true)}
                        />
                    </View>
                </View>

                <Text style={[globalStyles.subtitle, globalStyles.mt_5]}>Retrieve Check-in Details here</Text>
                <View style={[globalStyles.twoInputContainer, { marginVertical: 5 }]}>
                    <TextInput
                        mode="outlined"
                        label="Project No"
                        // onPressIn={() => setPopupVisible(true)}
                        value={projectNo}
                        onChangeText={setProjectNo}
                        style={globalStyles.container1}
                        placeholder="Enter Project No"
                        theme={theme}
                        //showSoftInputOnFocus={false}
                        editable={false} />
                    <TextInput
                        mode="outlined"
                        label="Check-in Date"
                        onPress={() => setVisible(true)}
                        value={chosenCheckinDate}
                        theme={theme}
                        style={globalStyles.container2}
                        showSoftInputOnFocus={false}
                    />
                </View>

                <TextInput
                    mode="outlined"
                    label="Project Name"
                    value={projectName}
                    theme={theme}
                    onChangeText={setProjectName}
                    editable={false}
                    style={globalStyles.height_45}
                    placeholder="Enter Project Name" />

                <View style={globalStyles.camButtonContainer}>
                    <Button icon="camera" mode="contained-tonal"
                        onPress={handleCapturePress}
                    >
                        Capture Image
                    </Button>

                    <ManualImageCaptureModal
                        visible={cameraVisible}
                        onClose={() => setCameraVisible(false)}
                        onCapture={(uri) => {
                            setCapturedImage(uri);
                            setCameraVisible(false);
                        }}
                    />
                </View>
                <View style={globalStyles.imageContainer}>
                    <Image
                        source={{ uri: capturedImage }}
                        style={globalStyles.fullImage}
                    />
                </View>
            </ScrollView>

            <View style={globalStyles.bottomButtonContainer}>
                <Button mode="contained"
                    onPress={handlenavToEmpPage}
                    theme={{
                        colors: {
                            primary: colors.primary,
                            disabled: 'gray', // <- set your desired disabled color
                        },
                    }}>
                    Next
                </Button>
            </View>

            {/* <ProjectListPopup
                visible={isPopupVisible}
                onClose={() => setPopupVisible(false)}
                onSelect={handleProjectSelect}
            /> */}

            <CustomDatePicker
                visible={visible}
                onClose={() => setVisible(false)}
                onDateSelected={handleDateSelected}
            />
        </View>
    )
};

export default TeamCheckout_Manual;