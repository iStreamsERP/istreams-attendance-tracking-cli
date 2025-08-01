import React, { useEffect, useState, useRef } from 'react';
import { Text, View, StyleSheet, FlatList, Alert, Image, Dimensions } from 'react-native';
import { Button } from 'react-native-paper';
import Header from '../Components/Header';
import { useNavigation, useRoute } from '@react-navigation/native';
import { callSoapService } from '../SoapRequestAPI/callSoapService';
import { GlobalStyles } from '../Styles/styles';
import EmployeeListCard from '../Components/EmployeeListCard';
import { useAuth } from '../Context/AuthContext';
import { SaveAttendance } from '../Utils/SaveAttendance';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { convertUriToBase64 } from '../Utils/UriToBase64Utils';
import RNFS from 'react-native-fs';
import { useTheme } from '../Context/ThemeContext';

const { width, height } = Dimensions.get('window');

const TeamCheckinEmployees_Manual = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const { userData } = useAuth();
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);

    const [btnloading, setbtnLoading] = useState(false);
    const [base64Img, setBase64Img] = useState(null);
    const { projectNo, projectName, capturedImage,
        locationName, entryDate, entryTime, coordinates } = route.params || {};
    const TrackingStatus = 'checkin';
    const [selectedEmp, setSelectedEmployees] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');

    const [loading, setLoading] = useState(false);

    const userName = userData.userName;
    const clientURL = userData.clientURL;
    const companyCode = userData.companyCode;
    const branchCode = userData.branchCode;

    const getEmpImage = async (employees) => {
        try {
            setLoading(true);
            const EmployeeListWithImages = [];

            for (const emp of employees) {
                let empImage = null;

                try {
                    // Call SOAP API for employee image
                    empImage = await callSoapService(userData.clientURL, 'getpic_bytearray', {
                        EmpNo: emp.EMP_NO,
                    });

                } catch (error) {
                    console.warn(`Failed to fetch image for ${emp.EMP_NO}`, error);
                    empImage = null;
                }

                EmployeeListWithImages.push({
                    ...emp,
                    EMP_IMAGE: empImage,
                });
            }

            setSelectedEmployees(EmployeeListWithImages);
        }
        catch (error) {
            console.error('Error fetching employee images:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (errorMessage) {
            Alert.alert('Error', errorMessage, [
                { text: 'OK', onPress: () => setErrorMessage('') }
            ]);
        }
    }, [errorMessage]);

    const SaveTeamCheckin = async () => {
        if (!capturedImage) {
            Alert.alert('Missing required data. Please ensure photo is captured.');
            return;
        }
        if (!projectNo) {
            Alert.alert('Now Select Project Details to Continue.');
            return;
        }
        if (!selectedEmp || selectedEmp.length === 0) {
            Alert.alert('No Employee Selected.', 'Add Employee and try again.');
            return;
        }
        setbtnLoading(true);

        const selectedEmpNos = selectedEmp
            .filter(emp => emp.EMP_NO) // filter null or undefined
            .map(emp => emp.EMP_NO);

        // 4. Convert to required XML string for API
        const empDataXml = selectedEmpNos.map(empNo => `<string>${empNo}</string>`).join('');

        const empData = empDataXml;

        const base64Img = await convertUriToBase64(capturedImage);

        setBase64Img(base64Img);

        if (capturedImage) {
            const exists = await RNFS.exists(capturedImage);
            if (exists) {
                await RNFS.unlink(capturedImage);
                console.log('Image deleted from cache:', capturedImage);
            }
        }

        try {
            await SaveAttendance({
                companyCode,
                branchCode,
                userName,
                clientURL,
                projectNo,
                locationName,
                entryDate,
                entryTime,
                coordinates,
                TrackingStatus,
                selectedEmp: empData,
                base64Img: base64Img,
                navigation,
                returnTo: 'SwitchTeamCheckinScreen',
                setErrorMessage
            });
        } catch (error) {
            console.error('Error saving Checkin data:', error);
        } finally {
            setbtnLoading(false);
        }
    };

    return (
        <View style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>
            <Header title="Add Check-in Employees" />

            <View style={globalStyles.projectContainer}>
                <Text style={[globalStyles.subtitle_2, { color: colors.primary }]}> {projectNo}</Text>
                <Text style={globalStyles.subtitle}> {projectName}</Text>
            </View>

            <View>
                <View style={styles.imageContainer}>
                    <Text style={globalStyles.subtitle_1}>Uploaded Image</Text>
                    {capturedImage ? (
                        <Image
                            source={{ uri: capturedImage }}
                            style={globalStyles.uploadedEmpImage}
                        />
                    ) : (
                        <View style={[globalStyles.empImageDisplay, styles.placeholderContainer]}>
                            <Text style={styles.placeholderText}>No Image</Text>
                        </View>
                    )}
                </View>
            </View>

            <FlatList
                data={selectedEmp}
                keyExtractor={(item) => item.EMP_NO}
                ListHeaderComponent={
                    <>
                        <View style={globalStyles.camButtonContainer}>
                            <Button
                                icon="plus"
                                mode="contained-tonal"
                                theme={theme}
                                onPress={() =>
                                    navigation.navigate('EmployeeList', {
                                        onSelect: async (employees) => {
                                            await getEmpImage(employees);
                                        }
                                    })
                                }
                            >
                                Add Employees
                            </Button>
                        </View>

                        <Text style={[globalStyles.subtitle_2, globalStyles.mb_10, { color: colors.primary }]}>
                            Selected Employees
                        </Text>
                    </>
                }
                renderItem={({ item }) => (
                    <EmployeeListCard loading={loading} selectedEmp={[item]} />
                )}
                ListEmptyComponent={<Text style={[globalStyles.body, { padding: 10, textAlign: 'center' }]}>No employees selected.</Text>}
            />

            <View style={globalStyles.bottomButtonContainer}>
                <Button mode="contained"
                    onPress={SaveTeamCheckin}
                    theme={{
                        colors: {
                            primary: colors.primary,
                            disabled: colors.lightGray, // <- set your desired disabled color
                        },
                    }}
                    disabled={btnloading}
                    loading={btnloading}>
                    Save
                </Button>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({

});

export default TeamCheckinEmployees_Manual;