import React, { useState, useEffect } from 'react';
import { View, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import { GlobalStyles } from '../Styles/styles';
import Header from '../Components/Header';
import { useNavigation, useRoute } from '@react-navigation/native';
import CheckinComponent from '../Components/CheckinComponent';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PermissionsAndroid, Platform } from 'react-native';

const TeamCheckin = ({ route }) => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { selectedLocation } = route.params || {};
    const [entryDate, setEntryDate] = useState('');
    const [entryTime, setEntryTime] = useState('');
    const [projectNo, setProjectNo] = useState('');
    const [projectName, setProjectName] = useState('');
    const [cameraVisible, setCameraVisible] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [coordinates, setCoordinates] = useState('');
    const [locationName, setLocationName] = useState('Fetching location...');

    useEffect(() => {
        const requestLocationPermission = async () => {
            if (Platform.OS === 'android') {
                const hasPermission = await PermissionsAndroid.check(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                );

                if (!hasPermission) {
                    const granted = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                        {
                            title: 'Location Permission',
                            message: 'This app needs access to your location.',
                            buttonPositive: 'OK',
                        }
                    );

                    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                        Alert.alert('Permission Denied', 'Location access is required to continue.');
                    }
                }
            }
        };

        requestLocationPermission();
    }, []);

    const handleProjectSelect = (project) => {
        setProjectNo(project.PROJECT_NO);
        setProjectName(project.PROJECT_NAME);
    };

    const handlenavToEmpPage = () => {

        if (!projectNo || !projectName) {
            alert('Project Not Selected.');
            return;
        }
        else if (!capturedImage) {
            alert('Employee Image Not captured.')
        }
        else {
            navigation.navigate('TeamCheckinEmployees', {
                projectNo, projectName, capturedImage,
                locationName, entryDate, entryTime, coordinates
            });
        }
    };
    return (
        <View style={[GlobalStyles.pageContainer, { paddingTop: insets.top }]}>
            <Header title="Team Check-in" />

            <CheckinComponent
                entryDate={entryDate}
                setEntryDate={setEntryDate}
                entryTime={entryTime}
                setEntryTime={setEntryTime}
                projectNo={projectNo}
                projectName={projectName}
                capturedImage={capturedImage}
                setCapturedImage={setCapturedImage}
                cameraVisible={cameraVisible}
                setCameraVisible={setCameraVisible}
                coordinates={coordinates}
                setCoordinates={setCoordinates}
                locationName={locationName}
                setLocationName={setLocationName}
                onProjectSelect={handleProjectSelect}
                selectedLocation = {selectedLocation}
                setProjectNo={setProjectNo}
                setProjectName={setProjectName} />

            <View style={GlobalStyles.bottomButtonContainer}>
                <Button mode="contained" onPress={handlenavToEmpPage}>
                    Next
                </Button>
            </View>
        </View>
    );
};

export default TeamCheckin;