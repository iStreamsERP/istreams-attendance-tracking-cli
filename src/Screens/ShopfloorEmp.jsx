import React, { useState } from 'react';
import { Text, View, StyleSheet, FlatList, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import Header from '../Components/Header';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { callSoapService } from '../SoapRequestAPI/callSoapService';
import { GlobalStyles } from '../Styles/styles';
import EmployeeListCard from '../Components/EmployeeListCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../Context/AuthContext';
import { useTheme } from '../Context/ThemeContext';
import { escapeXml } from '../Utils/UriToBase64Utils';

const ShopfloorEmp = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const { userData } = useAuth();
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);

    const [btnloading, setbtnLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const { deskArea, cuttingLineNo, sectionName, projectNo,
        locationName, entryDate, boqNo } = route.params || {};
    const [selectedEmp, setSelectedEmployees] = useState([]);

    const getEmpImage = async (employees) => {
        try {
            setLoading(true);
            const EmployeeListWithImages = [];

            for (const emp of employees) {
                let empImage = null;

                try {
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

    const SaveShopfloor = async () => {
        setbtnLoading(true);

        const empNoList = selectedEmp.map(emp => emp.EMP_NO);
        const empCount = selectedEmp.length;

        const transformedEmpNo = empNoList.join(',,|') + ',,|';

        try {
            const saveShpfloor_Parameters = {
                TRANS_DATE: entryDate,
                PROJECT_NO: projectNo,
                CUTTINGLINE_NO: cuttingLineNo,
                DESK_AREA_NO: deskArea,
                SECTION_NAME: escapeXml(sectionName),
                employeedata: transformedEmpNo,
                USERNAME: userData.userName,
                BOQ_NO: boqNo
            }
            const empCuttinglineResponse = await callSoapService(userData.clientURL, "MultipleEmployee_CuttinglineEntry", saveShpfloor_Parameters);

            const projectCuttinglineResponse = await callSoapService(userData.clientURL, "MultipleProject_CuttinglineEntry", saveShpfloor_Parameters);

            console.log(projectCuttinglineResponse);

            if (projectCuttinglineResponse === 'Success' && empCuttinglineResponse === 'Success') {
                // Alert.alert('Success', 'Shopfloor employees added successfully.');
                // navigation.navigate('ShopfloorTracking');

                navigation.navigate('SuccessAnimationScreen', {
                    message: 'ShopFloor Added Successfully',
                    details: `Shopfloor for ${empCount} employees added successfully.`,
                    returnTo: 'ShopfloorTracking' || 'Home1',
                });
            }
            setbtnLoading(false);
        } catch (error) {
            setbtnLoading(false);
            console.error('Error saving Checkin data:', error);
        }
    };

    return (
        <View style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>
            <Header title="Add Shopfloor Employees" />

            <View style={globalStyles.projectContainer}>
                <View style={[globalStyles.twoInputContainer, { justifyContent: 'flex-start' }]}>
                    <Text style={[globalStyles.subtitle_2]}>Desk Area No:</Text>
                    <Text style={[globalStyles.subtitle_2, { color: colors.primary }]}> {deskArea}</Text>
                </View>

                <View style={[globalStyles.twoInputContainer, { justifyContent: 'flex-start' }]}>
                    <Text style={[globalStyles.subtitle_2]}>CuttingLine No:</Text>
                    <Text style={[globalStyles.subtitle_2, { color: colors.primary }]}> {cuttingLineNo}</Text>
                </View>
            </View>


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

            <View style={[globalStyles.flex_1, globalStyles.my_10]}>
                <EmployeeListCard
                    loading={loading}
                    selectedEmp={selectedEmp}
                />
            </View>


            <View style={globalStyles.bottomButtonContainer}>
                <Button mode="contained"
                    onPress={SaveShopfloor}
                    theme={{
                        colors: {
                            primary: colors.primary,
                            disabled: colors.lightGray, 
                        },
                    }}
                    disabled={btnloading}
                    loading={btnloading}>
                    Save
                </Button>
            </View>
        </View>
    );
}

export default ShopfloorEmp;