import React, { useEffect, useState, useRef } from 'react';
import { Text, View, StyleSheet, FlatList, Alert, Image, Dimensions } from 'react-native';
import { Button } from 'react-native-paper';
import Header from '../Components/Header';
import { useNavigation, useRoute } from '@react-navigation/native';
import { GlobalStyles } from '../Styles/styles';
import { useAuth } from '../Context/AuthContext';
import { SaveAttendance } from '../Utils/SaveAttendance';
import { ImageRecognition } from '../Utils/ImageRecognition';
import ImageRecognitionResult from '../Components/ImageRecognitionResult';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { convertUriToBase64 } from '../Utils/UriToBase64Utils';
import RNFS from 'react-native-fs';
import { useTheme } from '../Context/ThemeContext';

const { width, height } = Dimensions.get('window');

const TeamCheckinEmployees = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const { userData } = useAuth();
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);

    const hasNonMatchedFacesRef = useRef(false);
    const [btnloading, setbtnLoading] = useState(false);
    const [base64Img, setBase64Img] = useState(null);
    const { projectNo, projectName, capturedImage,
        locationName, entryDate, entryTime, coordinates } = route.params || {};
    const TrackingStatus = 'checkin';
    const [selectedEmp, setSelectedEmployees] = useState([]);
    const [empNo, setEmpNo] = useState([]);
    const [recogloading, setrecogLoading] = useState(false);
    const [matchingFaceNames, setMatchingFaceNames] = useState([]);
    const [cleanedMatchNames, setCleanedMatchNames] = useState([]);
    const [groupedData, setgroupedData] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [empData, setEmpData] = useState('');

    const userEmail = userData.userEmail;
    const userName = userData.userName;
    const deviceId = userData.androidID;
    const clientURL = userData.clientURL;
    const companyCode = userData.companyCode;
    const branchCode = userData.branchCode;

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

    useEffect(() => {
        if (groupedData && groupedData.length > 0) {
            const hasNonMatchedFaces = Array.isArray(groupedData) && groupedData.some(item => item.title === "Non-Matched Employee");
            hasNonMatchedFacesRef.current = hasNonMatchedFaces;

            const extractedEmpNos = groupedData.flatMap(item => item.data.map(i => i.EMP_NO));
            setEmpNo(extractedEmpNos);
            setSelectedEmployees(
                extractedEmpNos.map(empNo => ({ EMP_NO: empNo }))
            );

            const empDataXml = extractedEmpNos.map(empNo => `<string>${empNo}</string>`).join('');

            console.log('empDataXml', empDataXml);

            setEmpData(empDataXml);

        }
    }, [groupedData]);

    const SaveTeamCheckin = async () => {
        if (!capturedImage) {
            Alert.alert('Missing required data. Please ensure photo is captured.');
            return;
        }
        if (!projectNo) {
            Alert.alert('Now Select Project Details to Continue.');
            return;
        }
        if (hasNonMatchedFacesRef.current || !selectedEmp || selectedEmp.length === 0) {
            Alert.alert('UnMatched Employee Found. Add Employee and try again.');
            return;
        }
        setbtnLoading(true);

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

    const reload = () => {
        handleImageRecognition();
    };

    return (
        <View style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>
            <Header title="Add Check-in Employees" />

            <View style={[styles.projectContainer, { backgroundColor: colors.card }]}>
                <Text style={[globalStyles.subtitle_2, { color: '#0685de' }]}> {projectNo}</Text>
                <Text style={globalStyles.subtitle}> {projectName}</Text>
            </View>

            <View style={[globalStyles.camButtonContainer, globalStyles.twoInputContainer, { marginTop: 0, alignItems: 'center' }]}>
                <View style={styles.imageContainer}>
                    <Text style={globalStyles.subtitle_1}>Uploaded Image</Text>
                    {capturedImage ? (
                        <Image
                            source={{ uri: capturedImage }}
                            style={styles.empImageDisplay}
                        />
                    ) : (
                        <View style={[globalStyles.empImageDisplay, styles.placeholderContainer]}>
                            <Text style={styles.placeholderText}>No Image</Text>
                        </View>
                    )}
                </View>

                <Button
                    icon={"reload"}
                    mode="contained"
                    theme={{
                        colors: {
                            primary: colors.primary,
                            disabled: colors.lightGray, // <- set your desired disabled color
                        },
                    }}
                    title="Reload Page"
                    onPress={reload}
                >
                    Retry
                </Button>
            </View>

            <FlatList
                data={selectedEmp}
                keyExtractor={(item) => item.EMP_NO}
                ListHeaderComponent={
                    <ImageRecognitionResult recogloading={recogloading} groupedData={groupedData} />
                }
            />

            <View style={globalStyles.bottomButtonContainer}>
                <Button mode="contained"
                    onPress={SaveTeamCheckin}
                    theme={{ colors: { primary: colors.primary } }}
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