import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, FlatList, Alert, Image, Dimensions } from 'react-native';
import { Button } from 'react-native-paper';
import Header from '../Components/Header';
import { useNavigation, useRoute } from '@react-navigation/native';
import { callSoapService } from '../SoapRequestAPI/callSoapService';
import { GlobalStyles } from '../Styles/styles';
import EmployeeListCard from '../Components/EmployeeListCard';
import { useAuth } from '../Context/AuthContext';
import { SaveAttendance } from '../Utils/SaveAttendance';
import { ImageRecognition } from '../Utils/ImageRecognition';
import ImageRecognitionResult from '../Components/ImageRecognitionResult';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { convertUriToBase64 } from '../Utils/UriToBase64Utils';

const { width, height } = Dimensions.get('window');

const TeamCheckinEmployees = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const { userData } = useAuth();
    const [btnloading, setbtnLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [base64Img, setBase64Img] = useState(null);
    const { projectNo, projectName, capturedImage,
        locationName, entryDate, entryTime, coordinates } = route.params || {};
    const TrackingStatus = 'checkin';
    const [selectedEmp, setSelectedEmployees] = useState([]);
    const [recogloading, setrecogLoading] = useState(false);
    const [matchingFaceNames, setMatchingFaceNames] = useState([]);
    const [cleanedMatchNames, setCleanedMatchNames] = useState([]);
    const [groupedData, setgroupedData] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [matchedImage, setMatchedImage] = useState(null);
    const [empNo, setEmpNo] = useState([]);

    const userEmail = userData.userEmail;
    const userName = userData.userName;
    const deviceId = userData.androidID;
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

    const handleImageRecognition = async () => {
        await ImageRecognition(
            capturedImage,
            userEmail,
            userName,
            deviceId,
            clientURL,
            setrecogLoading,
            setBase64Img,
            setMatchingFaceNames,
            setCleanedMatchNames,
            setgroupedData,
            setErrorMessage);
    };

    useEffect(() => {
        if (capturedImage) {
            handleImageRecognition();
        }
    }, [capturedImage]);

    useEffect(() => {
        if (errorMessage) {
            Alert.alert('Error', errorMessage, [
                { text: 'OK', onPress: () => setErrorMessage('') }
            ]);
        }
    }, [errorMessage]);


    const SaveTeamCheckin = async () => {
        setbtnLoading(true);
        const selectedEmpNos = selectedEmp
            .filter(emp => emp.EMP_NO) // filter null or undefined
            .map(emp => emp.EMP_NO);

        // 2. Extract EMP_NO from groupedData
        const groupedEmpNos = groupedData.flatMap(item =>
            item.data
                .filter(emp => emp.EMP_NO)
                .map(emp => emp.EMP_NO)
        );

        // 3. Merge both lists and remove duplicates
        const allEmpNos = Array.from(new Set([...selectedEmpNos, ...groupedEmpNos]));

        // 4. Convert to required XML string for API
        const empDataXml = allEmpNos.map(empNo => `<string>${empNo}</string>`).join('');

        const empData = empDataXml;

        const base64Img = await convertUriToBase64(capturedImage);

        setBase64Img(base64Img);

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
                returnTo: 'TeamCheckin',
                setErrorMessage
            });

            setbtnLoading(false);
        } catch (error) {
            setbtnLoading(false);
            console.error('Error saving Checkin data:', error);
        }
    };

    const reload = () => {
        handleImageRecognition();
    };

    return (
        <View style={[GlobalStyles.pageContainer, { paddingTop: insets.top }]}>
            <Header title="Add Check-in Employees" />

            <View style={styles.projectContainer}>
                <Text style={[GlobalStyles.subtitle_2, { color: '#0685de' }]}> {projectNo}</Text>
                <Text style={GlobalStyles.subtitle}> {projectName}</Text>
            </View>

            <View style={[GlobalStyles.camButtonContainer, GlobalStyles.twoInputContainer, { marginTop: 0,alignItems: 'center' }]}>
                <View style={styles.imageContainer}>
                    <Text style={GlobalStyles.subtitle_1}>Uploaded Image</Text>
                    {capturedImage ? (
                        <Image
                            source={{ uri: capturedImage }}
                            style={styles.empImageDisplay}
                        />
                    ) : (
                        <View style={[GlobalStyles.empImageDisplay, styles.placeholderContainer]}>
                            <Text style={styles.placeholderText}>No Image</Text>
                        </View>
                    )}
                </View>

                <Button icon={"reload"} mode="contained" title="Reload Page" onPress={reload} >Retry</Button>
            </View>

            <FlatList
                data={selectedEmp}
                keyExtractor={(item) => item.EMP_NO}
                ListHeaderComponent={
                    <>
                        <ImageRecognitionResult recogloading={recogloading} groupedData={groupedData} />

                        <View style={GlobalStyles.camButtonContainer}>
                            <Button
                                icon="plus"
                                mode="contained-tonal"
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

                        <Text style={[GlobalStyles.subtitle_2, { color: '#0685de' }]}>
                            Selected Employees
                        </Text>
                    </>
                }
                renderItem={({ item }) => (
                    <EmployeeListCard loading={loading} selectedEmp={[item]} />
                )}
                ListEmptyComponent={<Text style={[GlobalStyles.body, { padding: 10, textAlign: 'center' }]}>No employees selected.</Text>}
            />

            <View style={GlobalStyles.bottomButtonContainer}>
                <Button mode="contained"
                    onPress={SaveTeamCheckin}
                    disabled={btnloading}
                    loading={btnloading}>
                    Save
                </Button>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    projectContainer: {
        backgroundColor: '#d7dff7',
        borderRadius: 15,
        padding: 10,
        marginVertical: 10,
    },
    empImageDisplay: {
        width: width * 0.20,
        height: width * 0.20,
        borderRadius: (width * 0.20) / 2,
        borderWidth: 2,
        borderColor: '#ddd',
    },
});

export default TeamCheckinEmployees;