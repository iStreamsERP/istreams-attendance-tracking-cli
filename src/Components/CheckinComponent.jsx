import React, { useState, useEffect } from 'react';
import { Text, View, Image, ScrollView } from 'react-native';
import { Provider as PaperProvider, TextInput, Button } from 'react-native-paper';
import { GlobalStyles } from '../Styles/styles';
import ManualImageCaptureModal from '../Modal/ManualImageCaptureModal';
import { LocationService } from '../Logics/LocationService';
import FontAwesome6Icon from 'react-native-vector-icons/FontAwesome6';
import ProjectListPopup from '../Modal/ProjectListPopUp';
import { formatDate, formatTime } from '../Utils/dataTimeUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';


const CheckinComponent = ({
    entryDate,
    setEntryDate,
    setEntryTime,
    entryTime,
    projectNo,
    projectName,
    capturedImage,
    setCapturedImage,
    cameraVisible,
    setCameraVisible,
    setCoordinates,
    locationName,
    setLocationName,
    onProjectSelect,
    selectedLocation,
    setProjectName,
    setProjectNo
}) => {
    const [isPopupVisible, setPopupVisible] = useState(false);
    const [address, setAddress] = useState('');

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
        LocationService(setLocationName, setCoordinates, setAddress)

        const now = new Date();
        setEntryDate(formatDate(now));
        setEntryTime(formatTime(now));
    }, []);

    const handleCapture = (uri) => {
        setCapturedImage(uri);
    };

    return (
        <View>
            <View style={GlobalStyles.locationContainer}>
                <FontAwesome6Icon name="location-dot" size={20} color="#70706d" />
                <Text style={[GlobalStyles.subtitle, { marginLeft: 5 }]}>{locationName}</Text>
            </View>

            <View style={[GlobalStyles.twoInputContainer, { marginTop: 5 }]}>
                <View style={GlobalStyles.container1}>
                    <TextInput
                        mode="outlined"
                        label="Entry Date"
                        value={entryDate}
                        editable={false}
                        style={{ height: 45 }}
                        onPressIn={() => setShowDatePicker(true)}
                    />
                </View>

                <View style={GlobalStyles.container2}>
                    <TextInput
                        mode="outlined"
                        label="Entry Time"
                        value={entryTime}
                        editable={false}
                        style={{ height: 45 }}
                        onPressIn={() => setShowTimePicker(true)}
                    />
                </View>
            </View>

            <Text style={[GlobalStyles.subtitle_1, { marginTop: 5 }]}>Project Details</Text>
            <View>
                <TextInput
                    mode="outlined"
                    label="Project No"
                    onPressIn={() => setPopupVisible(true)}
                    value={projectNo}
                    style={{ width: '70%', marginTop: 5, height: 45 }}
                    placeholder="Enter Project No"
                    editable={false} />
                {/* <ProjectListPopup
                    visible={isPopupVisible}
                    onClose={() => setPopupVisible(false)}
                    onSelect={(project) => {
                        onProjectSelect(project);
                        setPopupVisible(false);
                    }}
                /> */}
                <TextInput
                    mode="outlined"
                    label="Project Name"
                    value={projectName}
                    showSoftInputOnFocus={false}
                    style={{ height: 45 }}
                    placeholder="Enter Project Name" />
            </View>
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
            <View style={GlobalStyles.flex_1}>
                <Image
                    source={{ uri: capturedImage }}
                    style={GlobalStyles.fullImage}
                />
            </View>
        </View>
    )
}

export default CheckinComponent;