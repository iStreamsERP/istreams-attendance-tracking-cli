import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, FlatList, Image, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Header from '../Components/Header';
import { callSoapService } from '../SoapRequestAPI/callSoapService';
import { GlobalStyles } from '../Styles/styles';
import { ActivityIndicator, Button, Checkbox } from 'react-native-paper';
import { SaveAttendance } from '../Utils/SaveAttendance';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../Context/AuthContext';
import { convertUriToBase64 } from '../Utils/UriToBase64Utils';
import { decodeMicrosoftDate } from '../Utils/dataTimeUtils';
import { useTheme } from '../Context/ThemeContext';

const TeamCheckoutEmployees_Manual = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const { userData } = useAuth();
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);
    const { projectNo, chosenCheckinDate, entryDate, entryTime, coordinates, locationName, capturedImage } = route.params || {};
    const [btnloading, setbtnLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [checkinEmp, setcheckinEmp] = useState([]);
    const [checkedItems, setCheckedItems] = useState({});
    const [base64Img, setBase64Img] = useState(null);
    const TrackingStatus = 'checkout';
    const [errorMessage, setErrorMessage] = useState('');

    const userEmail = userData.userEmail;
    const userName = userData.userName;
    const deviceId = userData.androidID;
    const clientURL = userData.clientURL;
    const companyCode = userData.companyCode;
    const branchCode = userData.branchCode;

    const getCurrentCheckinEmp = async (projectNo, chosenCheckinDate) => {
        setLoading(true);
        const EmployeeListWithImages = [];

        try {
            const retCheckinEmp_parameters = {
                LogDate: chosenCheckinDate,
                PROJECT_NO: projectNo
            };
            const CurrentCheckinEmp = await callSoapService(userData.clientURL, 'Retrieve_Project_Current_Employees', retCheckinEmp_parameters);

            if (CurrentCheckinEmp.length === 0) {
                Alert.alert('No Employee Found', 'Check the Project No and Check-in Date');
                return;
            }

            for (const emp of CurrentCheckinEmp) {
                let empImage = null;

                try {
                    // Call SOAP API for employee image
                    empImage = await callSoapService(userData.clientURL, 'getpic_bytearray', {
                        EmpNo: emp.emp_no,
                    });

                } catch (error) {
                    console.warn(`Failed to fetch image for ${emp.emp_no}`, error);
                    empImage = null;
                }

                EmployeeListWithImages.push({
                    ...emp,
                    log_datetime: decodeMicrosoftDate(emp.log_datetime),
                    EMP_IMAGE: empImage,
                });
            }

            setcheckinEmp(EmployeeListWithImages);

            const initialChecks = {};
            CurrentCheckinEmp.forEach(emp => {
                initialChecks[emp.emp_no] = false;
            });
            setCheckedItems(initialChecks);

        } catch (error) {
            Alert.alert('Error', error.message);
        }
        finally {
            setLoading(false);
        }
    };

    const toggleCheckbox = (empNo) => {
        setCheckedItems(prevState => ({
            ...prevState,
            [empNo]: !prevState[empNo]
        }));
    };

    useEffect(() => {
        getCurrentCheckinEmp(projectNo, chosenCheckinDate);

        ConvertToBase64();
    }, []);

    const ConvertToBase64 = async () => {
        try {
            const Base64Img = await convertUriToBase64(capturedImage);
            console.log('Base64Img', Base64Img);

            setBase64Img(Base64Img);
        } catch (error) {
            console.error('Error Converting image to Base64:', error);
        }
    };
    const SaveTeamCheckout = async () => {
        setbtnLoading(true);
        
        const selectedEmp = checkinEmp.filter(emp => checkedItems[emp.emp_no]);

        if (selectedEmp.length === 0) {
            alert('Employee not selected');
            return;
        }

        const empData = selectedEmp
            .map(emp => emp.emp_no ? `<string>${emp.emp_no}</string>` : '')
            .join('');

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
                returnTo: 'SwitchTeamCheckoutScreen',
                setErrorMessage
            });
        } catch (error) {
            setbtnLoading(false);
            console.error('Error saving Checkout data:', error);
        }
        finally {
            setbtnLoading(false);
        }
    };

    useEffect(() => {
        if (errorMessage) {
            Alert.alert('Error', errorMessage, [
                { text: 'OK', onPress: () => setErrorMessage('') }
            ]);
        }
    }, [errorMessage]);
    return (
        <View style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>
            <Header title="Check-out Employees" />

            <View style={styles.employeeListContainer}>
                {loading ? (
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="small" color={colors.primary} />
                    </View>
                ) : (
                    <FlatList
                        data={checkinEmp}
                        showsVerticalScrollIndicator={false}
                        keyExtractor={(item, index) => (item.EMP_NO ? item.EMP_NO.toString() : `emp-${index}`)}
                        renderItem={({ item }) => (
                            <View style={[styles.container, { backgroundColor: colors.card }]}>
                                <Image
                                    source={
                                        item.EMP_IMAGE
                                            ? { uri: `data:image/png;base64,${item.EMP_IMAGE}` }
                                            : require('../../assets/human.png')
                                    }
                                    style={styles.empImage}
                                />
                                <View style={styles.innerContainer}>
                                    <Text style={[globalStyles.subtitle, { color: colors.primary }]}>{item.emp_no}</Text>
                                    <Text style={globalStyles.subtitle_2}>{item.emp_name}</Text>
                                    <View style={globalStyles.twoInputContainer}>
                                        <Text style={globalStyles.subtitle_3}>{item.inout_status}</Text>
                                        <Text style={globalStyles.subtitle_3}>{item.log_datetime.toLocaleString()}</Text>
                                    </View>
                                </View>
                                <View style={styles.checkBoxSection}>
                                    <Checkbox
                                        status={checkedItems[item.emp_no] ? 'checked' : 'unchecked'}
                                        color={colors.primary}
                                        onPress={() => toggleCheckbox(item.emp_no)}
                                    />
                                </View>
                            </View>
                        )}
                    />
                )}
            </View>

            <View style={globalStyles.bottomButtonContainer}>
                <Button mode="contained"
                    onPress={SaveTeamCheckout}
                    loading={btnloading}
                    theme={{
                        colors: {
                            primary: colors.primary,
                            disabled: colors.lightGray, // <- set your desired disabled color
                        },
                    }}
                    disabled={btnloading}>
                    Save
                </Button>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    employeeListContainer: {
        flex: 1,
        marginVertical: 10
    },
    empImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
    },
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderRadius: 15,
        padding: 10,
        marginBottom: 10
    },
    innerContainer: {
        flex: 1,
        marginLeft: 10,
        justifyContent: 'center',
    },
    checkBoxSection: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default TeamCheckoutEmployees_Manual;
