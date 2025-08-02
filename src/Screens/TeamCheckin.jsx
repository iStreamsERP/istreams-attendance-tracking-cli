import React, { useState, useEffect } from 'react';
import { View, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import { GlobalStyles } from '../Styles/styles';
import { useNavigation } from '@react-navigation/native';
import CheckinComponent from '../Components/CheckinComponent';
import { PermissionsAndroid, Platform } from 'react-native';
import { useTheme } from '../Context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TeamCheckin = ({ selectedLocation }) => {
    const navigation = useNavigation();
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);
    
    const [entryDate, setEntryDate] = useState('');
    const [entryTime, setEntryTime] = useState('');
    const [projectNo, setProjectNo] = useState('');
    const [projectName, setProjectName] = useState('');
    const [cameraVisible, setCameraVisible] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [coordinates, setCoordinates] = useState('');
    const [locationName, setLocationName] = useState('Fetching location...');
    const [useNativeCamera, setUseNativeCamera] = useState(false);

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

    useEffect(() => {
        const loadCameraPreference = async () => {
            const value = await AsyncStorage.getItem('USE_MANUAL_CAPTURE');
            console.log(value);
            
            if (value !== null) {
                setUseNativeCamera(JSON.parse(value));
            }
        };
        loadCameraPreference();
    }, []);

    const handleProjectSelect = (project) => {
        setProjectNo(project.PROJECT_NO);
        setProjectName(project.PROJECT_NAME);
    };

    const handlenavToEmpPage = () => {
        if (!projectNo) {
            alert('Project Not Selected.');
        } else if (!capturedImage) {
            alert('Employee Image Not captured.');
        } else {
            navigation.navigate('TeamCheckinEmployees', {
                projectNo, projectName, capturedImage,
                locationName, entryDate, entryTime, coordinates
            });
        }
    };

    return (
        <View style={[globalStyles.pageContainer, { paddingTop: 0, paddingHorizontal: 0 }]}>
            <CheckinComponent
                entryDate={entryDate} setEntryDate={setEntryDate}
                entryTime={entryTime} setEntryTime={setEntryTime}
                projectNo={projectNo} setProjectNo={setProjectNo}
                projectName={projectName} setProjectName={setProjectName}
                capturedImage={capturedImage} setCapturedImage={setCapturedImage}
                cameraVisible={cameraVisible} setCameraVisible={setCameraVisible}
                useNativeCamera={useNativeCamera} setUseNativeCamera={setUseNativeCamera}
                coordinates={coordinates} setCoordinates={setCoordinates}
                locationName={locationName} setLocationName={setLocationName}
                onProjectSelect={handleProjectSelect}
                selectedLocation={selectedLocation}
            />
            <View style={globalStyles.bottomButtonContainer}>
                <Button
                    mode="contained"
                    theme={{ colors: { primary: colors.primary } }}
                    onPress={handlenavToEmpPage}>
                    Next
                </Button>
            </View>
        </View>
    );
};

export default TeamCheckin;