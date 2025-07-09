import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Header from '../Components/Header';
import { LocationService } from '../Logics/LocationService';
import { convertDataModelToStringData } from '../Utils/dataModelConverter';
import { GlobalStyles } from '../Styles/styles';
import { TextInput, Button } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ProjectListPopup from '../Modal/ProjectListPopUp';
import { useAuth } from '../Context/AuthContext';
import { callSoapService } from '../SoapRequestAPI/callSoapService';

const AddOfcLocation = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { userData } = useAuth();
    const [locationName, setLocationName] = useState('');
    const [userlocationName, setuserlocationName] = useState('');
    const [address, setAddress] = useState('');
    const [coordinates, setCoordinates] = useState('');
    const [locationDescription, setlocationDescription] = useState('');
    const [isPopupVisible, setPopupVisible] = useState(false);
    const [projectNo, setProjectNo] = useState('');
    const [projectName, setProjectName] = useState('');
    const [btnloading, setbtnLoading] = useState(false);

    const [formData, setFormData] = useState({});

    const getInitialFormState = () => {
        const [gpsLatitude, gpsLongitude] = coordinates?.split(',') || ['', ''];

        return {
            PROJECT_NO: '',
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
        }));
        setPopupVisible(false);
    };


    const handlenavToEmpPage = async () => {
        if (!formData.SITE_LOCATION || !formData.DETAIL_DESCRIPTION) {
            alert('Location Details not entered.');
            return;
        }
        if (!formData.PROJECT_NO) {
            alert('Select Project Details to Continue.');
            return;
        }
        if (!formData.LOCATION_ADDRESS || !formData.GPS_LOCATION) {
            alert('Location not found.');
            return;
        }

        setbtnLoading(true);

        try {
            const convertedDataModel = convertDataModelToStringData(
                "project_site_locations",
                formData
            );

            const siteLocation_Parameter = {
                UserName: userData.userName,
                DModelData: convertedDataModel,
            };

            const response = await callSoapService(
                userData.clientURL,
                "DataModel_SaveData",
                siteLocation_Parameter
            );
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
        <View style={[GlobalStyles.pageContainer, { paddingTop: insets.top }]}>
            <Header title="Add Office Location" />

            <Text style={[GlobalStyles.subtitle_1, { marginTop: 10 }]}>Location Details</Text>
            <TextInput
                mode='outlined'
                label="Location Name"
                value={formData.SITE_LOCATION}
                onChangeText={text => handleChange('SITE_LOCATION', text)} />

            <TextInput
                mode='outlined'
                label="Location Description"
                value={formData.DETAIL_DESCRIPTION}
                onChangeText={text => handleChange('DETAIL_DESCRIPTION', text)} />

            <TextInput
                mode='outlined'
                label="Address"
                value={formData.LOCATION_ADDRESS}
                numberOfLines={2}
                onChangeText={text => handleChange('LOCATION_ADDRESS', text)}
                editable={false} />

            <Text style={[GlobalStyles.subtitle, { marginTop: 10 }]}>Co-ordinates</Text>
            <View style={[GlobalStyles.twoInputContainer, { marginVertical: 5 }]}>
                <TextInput
                    mode="outlined"
                    label="Latitude"
                    value={formData.GPS_LATITUDE}
                    onChangeText={text => handleChange('GPS_LATITUDE', text)}
                    style={GlobalStyles.container1}
                    editable={false}
                    showSoftInputOnFocus={false} />
                <TextInput
                    mode="outlined"
                    label="Longitude"
                    value={formData.GPS_LONGITUDE}
                    onChangeText={text => handleChange('GPS_LONGITUDE', text)}
                    style={GlobalStyles.container2}
                    showSoftInputOnFocus={false}
                    editable={false} />
            </View>

            <Text style={[GlobalStyles.subtitle, { marginTop: 10 }]}>Check-in Radius (in m)</Text>
            <View style={[GlobalStyles.twoInputContainer, { marginVertical: 5 }]}>
                <TextInput
                    mode="outlined"
                    label="Check-in Radius"
                    value={formData.CHECK_IN_RADIOUS}
                    onChangeText={text => handleChange('CHECK_IN_RADIOUS', text)}
                    style={{ width: '50%' }} />
            </View>

            <Text style={[GlobalStyles.subtitle_1, { marginTop: 10 }]}>Project Details</Text>
            <View style={{ flex: 1 }}>
                <TextInput
                    mode="outlined"
                    label="Project No"
                    onPressIn={() => setPopupVisible(true)}
                    value={formData.PROJECT_NO}
                    onChangeText={text => handleChange('PROJECT_NO', text)}
                    style={{ width: '70%', marginTop: 5 }}
                    placeholder="Enter Project No"
                    showSoftInputOnFocus={false} />
                <ProjectListPopup
                    visible={isPopupVisible}
                    onClose={() => setPopupVisible(false)}
                    onSelect={handleProjectSelect}
                />
                <TextInput
                    mode="outlined"
                    label="Project Name"
                    value={projectName}
                    showSoftInputOnFocus={false}
                    placeholder="Enter Project Name" />
            </View>

            <View style={GlobalStyles.bottomButtonContainer}>
                <Button mode="contained"
                    disabled={btnloading}
                    loading={btnloading}
                    onPress={handlenavToEmpPage}>
                    Save
                </Button>
            </View>
        </View>
    )
};

export default AddOfcLocation;