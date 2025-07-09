import React, { useState, useEffect } from 'react';
import { Text, View, Image } from 'react-native';
import { Provider as PaperProvider, TextInput, Button } from 'react-native-paper';
import { GlobalStyles } from '../Styles/styles';
import ManualImageCaptureModal from '../Modal/ManualImageCaptureModal';
import { LocationService } from '../Logics/LocationService';
import FontAwesome6Icon from 'react-native-vector-icons/FontAwesome6';
import ProjectListPopup from '../Modal/ProjectListPopUp';
import { formatDate, formatTime } from '../Utils/dataTimeUtils';

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
}) => {
    const [isPopupVisible, setPopupVisible] = useState(false);
    const [address, setAddress] = useState('');

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
        <PaperProvider>
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
                        onProjectSelect(project);
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
        </PaperProvider>
    )
}

export default CheckinComponent;