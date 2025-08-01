import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Header from '../Components/Header';
import { LocationService } from '../Logics/LocationService';
import { convertDataModelToStringData } from '../Utils/dataModelConverter';
import { GlobalStyles } from '../Styles/styles';
import { useTheme } from '../Context/ThemeContext';
import { TextInput, Button } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ProjectListPopup from '../Modal/ProjectListPopUp';
import { useAuth } from '../Context/AuthContext';
import { callSoapService } from '../SoapRequestAPI/callSoapService';
import ProjectLocationPopUp from '../Modal/ProjectLocationPopUp';

const AddOfcLocation = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { userData } = useAuth();
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);
    const [locationName, setLocationName] = useState('');
    const [userlocationName, setuserlocationName] = useState('');
    const [address, setAddress] = useState('');
    const [coordinates, setCoordinates] = useState('');
    const [locationDescription, setlocationDescription] = useState('');
    const [isPopupVisible, setPopupVisible] = useState(false);
    const [isLocPopupVisible, setLocPopupVisible] = useState(false);
    const [projectNo, setProjectNo] = useState('');
    const [projectName, setProjectName] = useState('');
    const [btnloading, setbtnLoading] = useState(false);

    const [formData, setFormData] = useState({});

    const getInitialFormState = () => {
        const [gpsLatitude, gpsLongitude] = coordinates?.split(',') || ['', ''];

        return {
            PROJECT_NO: '',
            PROJECT_NAME: '',
            SITE_LOCATION: '',
            DETAIL_DESCRIPTION: '',
            LOCATION_ADDRESS: address || '',
            GPS_LOCATION: coordinates || '',
            GPS_LATITUDE: gpsLatitude,
            GPS_LONGITUDE: gpsLongitude,
            CHECK_IN_RADIOUS: '',
            USER_NAME: userData.userName,
            ENT_DATE: new Date().toISOString().split('T')[0],
        };
    };

    useEffect(() => {
        LocationService(setLocationName, setCoordinates, setAddress);
    }, []);

    useEffect(() => {
        if (address && coordinates && coordinates.includes(',')) {
            const [gpsLatitude, gpsLongitude] = coordinates.split(',');

            setFormData(prev => ({
                ...prev,
                LOCATION_ADDRESS: address,
                GPS_LOCATION: coordinates,
                GPS_LATITUDE: gpsLatitude,
                GPS_LONGITUDE: gpsLongitude,
                USER_NAME: userData.userName,
                ENT_DATE: new Date().toISOString().split("T")[0],
            }));
        }
    }, [address, coordinates]);

    const handleChange = (name, value) => {
        setFormData(prevFormData => ({
            ...prevFormData,
            [name]: value,
        }));
    };

    const handleProjectSelect = (project) => {
        setProjectNo(project.PROJECT_NO);
        setProjectName(project.PROJECT_NAME);
        setFormData(prev => ({
            ...prev,
            PROJECT_NO: project.PROJECT_NO,
            PROJECT_NAME: project.PROJECT_NAME
        }));
        setPopupVisible(false);
    };

    const handleProjectLocSelect = (projectLoc) => {
        // Fallback to current values if API returns null
        const finalGPS = projectLoc.GPS_LOCATION || coordinates;
        const finalAddress = projectLoc.LOCATION_ADDRESS || address;

        const [lat, long] = finalGPS?.split(',') || ['', ''];

        // Update states
        setLocationName(projectLoc.SITE_LOCATION || '');
        setCoordinates(finalGPS);
        setAddress(finalAddress);
        setlocationDescription(projectLoc.DETAIL_DESCRIPTION || '');

        setFormData(prev => ({
            ...prev,
            SITE_LOCATION: projectLoc.SITE_LOCATION || '',
            DETAIL_DESCRIPTION: projectLoc.DETAIL_DESCRIPTION || '',
            LOCATION_ADDRESS: finalAddress,
            CHECK_IN_RADIOUS: projectLoc.CHECK_IN_RADIOUS?.toString() || '',
            GPS_LOCATION: finalGPS,
            GPS_LATITUDE: lat,
            GPS_LONGITUDE: long,
            PROJECT_NO: projectLoc.PROJECT_NO || '',
            PROJECT_NAME: projectLoc.PROJECT_NAME || '',
        }));

        setLocPopupVisible(false);
    };


    const handlenavToEmpPage = async () => {
        if (!formData.SITE_LOCATION || !formData.DETAIL_DESCRIPTION) {
            alert('Location Details not entered.');
            return;
        }
        if (!formData.LOCATION_ADDRESS || !formData.GPS_LOCATION) {
            alert('Location not found.');
            return;
        }

        setbtnLoading(true);

        try {
            const updatedFormData = {
                ...formData,
                PROJECT_NO: formData.PROJECT_NO || '*',
                PROJECT_NAME: formData.PROJECT_NAME || ' ',
            };

            console.log('formData PROJECT_NO:', updatedFormData.PROJECT_NO, 'PROJECT_NAME:', updatedFormData.PROJECT_NAME);

            const convertedDataModel = convertDataModelToStringData(
                "project_site_locations",
                updatedFormData
            );

            const siteLocation_Parameter = {
                UserName: userData.userName,
                DModelData: convertedDataModel,
            };

            console.log('siteLocation_Parameter:', siteLocation_Parameter);

            const response = await callSoapService(
                userData.clientURL,
                "DataModel_SaveData",
                siteLocation_Parameter
            );

            navigation.navigate('SuccessAnimationScreen', {
                message: 'Office Location Added Successfully',
                details: ``,
                returnTo: 'AddOfcLocation' || 'Home1',
            });

        } catch (error) {
            setbtnLoading(false);
            console.error('Error saving Checkin data:', error);
        }
        finally {
            setbtnLoading(false);
            setFormData(getInitialFormState());
            setProjectNo('');
            setProjectName('');
            setlocationDescription('');
            setuserlocationName('');
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}  // adjust offset if needed
        >
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
            >
                <View style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>
                    <Header title="Add Office Location" />

                    <View style={[globalStyles.twoInputContainer, { alignItems: 'center', marginVertical: 5 }]}>
                        <Text style={[globalStyles.subtitle_1, { marginTop: 10 }]}>Location Details</Text>
                        <Button icon="pencil" mode="contained-tonal" onPress={() => setLocPopupVisible(true)}>
                            Edit
                        </Button>
                    </View>

                    <TextInput
                        mode='outlined'
                        label="Location Name"
                        theme={theme}
                        value={formData.SITE_LOCATION}
                        onChangeText={text => handleChange('SITE_LOCATION', text)}
                    />

                    <TextInput
                        mode='outlined'
                        label="Location Description"
                        theme={theme}
                        value={formData.DETAIL_DESCRIPTION}
                        onChangeText={text => handleChange('DETAIL_DESCRIPTION', text)}
                    />

                    <TextInput
                        mode='outlined'
                        label="Address"
                        value={formData.LOCATION_ADDRESS}
                        theme={theme}
                        multiline
                        numberOfLines={2}
                        onChangeText={text => handleChange('LOCATION_ADDRESS', text)}
                        editable={false}
                    />

                    <Text style={[globalStyles.subtitle, { marginTop: 10 }]}>Co-ordinates</Text>
                    <View style={[globalStyles.twoInputContainer, { marginVertical: 5 }]}>
                        <TextInput
                            mode="outlined"
                            label="Latitude"
                            value={formData.GPS_LATITUDE}
                            theme={theme}
                            onChangeText={text => handleChange('GPS_LATITUDE', text)}
                            style={globalStyles.container1}
                            editable={false}
                            showSoftInputOnFocus={false}
                        />
                        <TextInput
                            mode="outlined"
                            label="Longitude"
                            value={formData.GPS_LONGITUDE}
                            theme={theme}
                            onChangeText={text => handleChange('GPS_LONGITUDE', text)}
                            style={globalStyles.container2}
                            showSoftInputOnFocus={false}
                            editable={false}
                        />
                    </View>

                    <Text style={[globalStyles.subtitle, { marginTop: 10 }]}>Check-in Radius (in m)</Text>
                    <View style={[globalStyles.twoInputContainer, { marginVertical: 5 }]}>
                        <TextInput
                            mode="outlined"
                            label="Check-in Radius"
                            theme={theme}
                            value={formData.CHECK_IN_RADIOUS}
                            onChangeText={text => handleChange('CHECK_IN_RADIOUS', text)}
                            style={{ width: '50%' }}
                        />
                    </View>

                    <Text style={[globalStyles.subtitle_1, { marginTop: 10 }]}>Project Details</Text>
                    <View style={{ flex: 1 }}>
                        <TextInput
                            mode="outlined"
                            label="Project No"
                            theme={theme}
                            onPressIn={() => setPopupVisible(true)}
                            value={formData.PROJECT_NO}
                            onChangeText={text => handleChange('PROJECT_NO', text)}
                            style={{ width: '70%', marginTop: 5 }}
                            placeholder="Enter Project No"
                            showSoftInputOnFocus={false}
                        />
                        <ProjectListPopup
                            visible={isPopupVisible}
                            onClose={() => setPopupVisible(false)}
                            onSelect={handleProjectSelect}
                        />
                        <TextInput
                            mode="outlined"
                            label="Project Name"
                            theme={theme}
                            multiline
                            numberOfLines={2}
                            value={formData.PROJECT_NAME}
                            showSoftInputOnFocus={false}
                            placeholder="Enter Project Name"
                        />

                        <ProjectLocationPopUp
                            visible={isLocPopupVisible}
                            onClose={() => setLocPopupVisible(false)}
                            onSelect={handleProjectLocSelect}
                        />
                    </View>

                    <View style={globalStyles.bottomButtonContainer}>
                        <Button
                            mode="contained"
                            disabled={btnloading}
                            loading={btnloading}
                            theme={{
                                colors: {
                                    primary: colors.primary,
                                    disabled: colors.lightGray,
                                },
                            }}
                            onPress={handlenavToEmpPage}
                        >
                            {btnloading ? 'Saving...' : 'Save'}
                        </Button>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
};

export default AddOfcLocation;