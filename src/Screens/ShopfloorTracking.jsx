import React, { useState, useEffect } from 'react'
import { Text, StyleSheet, View } from 'react-native';
import Header from '../Components/Header';
import { GlobalStyles } from '../Styles/styles';
import FontAwesome6Icon from 'react-native-vector-icons/FontAwesome6';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TextInput, Button, Snackbar } from 'react-native-paper';
import { LocationService } from '../Logics/LocationService';
import { formatDate, formatTime } from '../Utils/dataTimeUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const ShopfloorTracking = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const [locationName, setLocationName] = useState('Fetching location...');
    const [entryDate, setEntryDate] = useState('');
    const [entryTime, setEntryTime] = useState('');
    const [coordinates, setCoordinates] = useState('');
    const [btnloading, setbtnLoading] = useState(false);
    const [address, setAddress] = useState('');
    const [deskArea, setDeskArea] = useState(null);
    const [sectionName, setSectionName] = useState('');
    const [cuttingLineNo, setCuttingLineNo] = useState(null);
    const [projectNo, setProjectNo] = useState('');
    const [projectName, setProjectName] = useState('');
    const [boqNo, setBoqNo] = useState('');
    const [boqName, setBoqName] = useState('');

    const [deskAreaList, setdeskAreaList] = useState([]);
    const [cuttingLineList, setCuttingLineList] = useState([]);

    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMsg, setSnackbarMsg] = useState('');

    useEffect(() => {
        LocationService(setLocationName, setCoordinates, setAddress);

        const now = new Date();
        setEntryDate(formatDate(now));
        setEntryTime(formatTime(now));

        LoadData();
    }, []);

    const LoadData = async () => {
        try {
            if (!deskAreaList || deskAreaList.length === 0) {
                const storedDeskAreaData = await AsyncStorage.getItem('DeskAreaList');
                if (storedDeskAreaData !== null) {
                    const parsedData = JSON.parse(storedDeskAreaData);
                    setdeskAreaList(parsedData);
                }
            }

            if (!cuttingLineList || cuttingLineList.length === 0) {
                const storedCuttingLineData = await AsyncStorage.getItem('CuttingLineList');
                if (storedCuttingLineData !== null) {
                    const parsedData = JSON.parse(storedCuttingLineData);
                    setCuttingLineList(parsedData);
                }
            }
        } catch (e) {
            console.error('Failed to retrieve data:', e);
        }
    };


    const handleGetSectionName = () => {
        const filteredData = deskAreaList.filter(item => item.DESK_AREA_NO === deskArea);

        if (filteredData.length > 0) {
            setSectionName(filteredData[0].SECTION_NAME);
        } else {
            setDeskArea('');
            setSectionName('');
            setSnackbarMsg('Desk Area Not Found');
            setSnackbarVisible(true);
        }
    };

    const handleGetProjectBOQ = () => {
        const filteredData = cuttingLineList.filter(item => item.CUTTINGLINE_NO === cuttingLineNo);

        if (filteredData.length > 0) {
            setProjectNo(filteredData[0].PROJECT_NO);
            setProjectName(filteredData[0].PROJECT_NAME);
            setBoqNo(String(filteredData[0].BOQ_NO));
            setBoqName(filteredData[0].BOQ_DESCRIPTION);
        } else {
            setCuttingLineNo('');
            setProjectNo('');
            setProjectName('');
            setBoqNo('');
            setBoqName('');
            setSnackbarMsg('Cutting Line Not Found');
            setSnackbarVisible(true);
        }
    };

    const handleNavigation = () => {
        if (!deskArea) {
            setSnackbarMsg('Enter Desk Area No');
            setSnackbarVisible(true);
            return;
        }
        else if (!cuttingLineNo) {
            setSnackbarMsg('Enter CuttingLine No');
            setSnackbarVisible(true);
            return;
        }
        else {
            navigation.navigate('ShopfloorEmp', {
                deskArea,cuttingLineNo,sectionName,projectNo,
                locationName, entryDate, boqNo
            });
        }
    };
    return (
        <View style={[GlobalStyles.pageContainer, { paddingTop: insets.top }]}>
            <Header title="Shopfloor Tracking" />

            <View>
                <View style={GlobalStyles.locationContainer}>
                    <FontAwesome6Icon name="location-dot" size={20} color="#70706d" />
                    <Text style={[GlobalStyles.subtitle, { marginLeft: 5 }]}>{locationName}</Text>
                </View>
            </View>

            <View style={[GlobalStyles.twoInputContainer, { marginTop: 10 }]}>
                <View style={GlobalStyles.container1}>
                    <TextInput
                        mode="outlined"
                        label="Desk Area No"
                        value={deskArea}
                        onChangeText={setDeskArea}
                        returnKeyType="done"
                        onSubmitEditing={handleGetSectionName}
                    />
                </View>

                <View style={GlobalStyles.container2}>
                    <TextInput
                        mode="outlined"
                        label="Section Name"
                        value={sectionName}
                        onChangeText={setSectionName}
                        editable={false}
                    />
                </View>
            </View>

            <View style={[GlobalStyles.twoInputContainer, { marginTop: 10 }]}>
                <View style={GlobalStyles.container1}>
                    <TextInput
                        mode="outlined"
                        label="CuttingLine No"
                        value={cuttingLineNo}
                        onChangeText={setCuttingLineNo}
                        returnKeyType="done"
                        onSubmitEditing={handleGetProjectBOQ}
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

            <View style={{ marginTop: 10 }}>
                <Text style={GlobalStyles.subtitle_1}>Project Details</Text>
                <TextInput
                    mode="outlined"
                    label="Project No"
                    value={projectNo}
                    style={{ marginVertical: 5 }}
                    editable={false}
                />
                <TextInput
                    mode="outlined"
                    label="Project Name"
                    value={projectName}
                    multiline
                    numberOfLines={2}
                    editable={false}
                />
            </View>

            <View style={{ flex: 1, marginTop: 10 }}>
                <Text style={GlobalStyles.subtitle_1}>BOQ Details</Text>
                <TextInput
                    mode="outlined"
                    label="BOQ No"
                    value={boqNo}
                    style={{ marginVertical: 5 }}
                    editable={false}
                />
                <TextInput
                    mode="outlined"
                    label="BOQ Desc"
                    value={boqName}
                    editable={false}
                    multiline
                    numberOfLines={3}
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
            </View>

            <View style={GlobalStyles.bottomButtonContainer}>
                <Button mode="contained"
                    onPress={handleNavigation}
                    loading={btnloading}
                    disabled={btnloading}>
                    Next
                </Button>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({

})

export default ShopfloorTracking;