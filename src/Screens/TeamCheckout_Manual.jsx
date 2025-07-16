import React, { useEffect, useState } from 'react';
import { Text, View, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Header from '../Components/Header';
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

const TeamCheckout_Manual = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const route = useRoute();
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

    const handleProjectSelect = (project) => {
        setProjectNo(project.PROJECT_NO);
        setProjectName(project.PROJECT_NAME);
        setPopupVisible(false);
    };

    const handleDateSelected = (dateString) => {
        console.log('Date selected:', dateString);
        
        setChosenCheckinDate(dateString);
    };

    const handleCapture = (uri) => {
        setCapturedImage(uri);
    };

    useEffect(() => {
        LocationService(setLocationName, setCoordinates, setAddress);

        const now = new Date();
        setCheckoutDate(formatDate(now));
        setCheckoutTime(formatTime(now));
        setChosenCheckinDate(formatDate(now));
    }, []);

    const handlenavToEmpPage = () => {

        if (!projectNo || !projectName) {
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
            navigation.navigate('TeamCheckoutEmployees', {
                projectNo, chosenCheckinDate,
                entryDate, entryTime, coordinates, locationName, capturedImage
            });
        }
    };

    return (
        <View style={[GlobalStyles.pageContainer, { paddingTop: insets.top }]}>
            <Header title="Team Check-out" />

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

            <Text style={[GlobalStyles.subtitle, { marginTop: 10 }]}>Retrieve Check-in Details here</Text>
            <View style={[GlobalStyles.twoInputContainer, { marginVertical: 5 }]}>
                <TextInput
                    mode="outlined"
                    label="Project No"
                    // onPressIn={() => setPopupVisible(true)}
                    value={projectNo}
                    onChangeText={setProjectNo}
                    style={GlobalStyles.container1}
                    placeholder="Enter Project No"
                    //showSoftInputOnFocus={false}
                    editable={false} />
                <TextInput
                    mode="outlined"
                    label="Check-in Date"
                    onPress={() => setVisible(true)}
                    value={chosenCheckinDate}
                    style={GlobalStyles.container2}
                    showSoftInputOnFocus={false}
                />
            </View>

            <TextInput
                mode="outlined"
                label="Project Name"
                value={projectName}
                onChangeText={setProjectName}
                editable={false}
                placeholder="Enter Project Name" />

            <View style={GlobalStyles.camButtonContainer}>
                <Button icon="camera" mode="contained-tonal" onPress={() => setCameraVisible(true)}>
                    Capture Image
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

            <View style={GlobalStyles.bottomButtonContainer}>
                <Button mode="contained" onPress={handlenavToEmpPage}>
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