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

const ShopfloorEmp = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const { userData } = useAuth();
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

    const transformEmpData = (empNoList) => {
        return empNoList.join(',,|') + ',,|';
    };

    const strEmpList = () => {
        const empNoList = selectedEmp.map(emp => emp.EMP_NO);
        const transformedEmpNo1 = transformEmpData(empNoList);
        setTransformedEmpNo(transformedEmpNo1);
        console.log(transformedEmpNo);
    };

    const escapeXml = (unsafe) => {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&apos;");
    };

    const SaveShopfloor = async () => {
        setbtnLoading(true);

        const empNoList = selectedEmp.map(emp => emp.EMP_NO);
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
                Alert.alert('Success', 'Shopfloor employees added successfully.');
                navigation.navigate('ShopfloorTracking');
            }
            setbtnLoading(false);
        } catch (error) {
            setbtnLoading(false);
            console.error('Error saving Checkin data:', error);
        }
    };

    return (
        <View style={[GlobalStyles.pageContainer, { paddingTop: insets.top }]}>
            <Header title="Add Shopfloor Employees" />

            <View style={styles.projectContainer}>
                <View style={[GlobalStyles.twoInputContainer, { justifyContent: 'flex-start' }]}>
                    <Text style={[GlobalStyles.subtitle_2]}>Desk Area No:</Text>
                    <Text style={[GlobalStyles.subtitle_2, { color: '#873e23' }]}> {deskArea}</Text>
                </View>

                <View style={[GlobalStyles.twoInputContainer, { justifyContent: 'flex-start' }]}>
                    <Text style={[GlobalStyles.subtitle_2]}>CuttingLine No:</Text>
                    <Text style={[GlobalStyles.subtitle_2, { color: '#873e23' }]}> {cuttingLineNo}</Text>
                </View>
            </View>


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

            <View style={{ flex: 1 , marginVertical: 10}}>
                <EmployeeListCard
                    loading={loading}
                    selectedEmp={selectedEmp}
                />
            </View>


            <View style={GlobalStyles.bottomButtonContainer}>
                <Button mode="contained"
                    onPress={SaveShopfloor}
                    disabled={btnloading}
                    loading={btnloading}>
                    Save
                </Button>
            </View>
        </View>
    );
}


const styles = StyleSheet.create({
    projectContainer: {
        backgroundColor: '#d7dff7',
        borderRadius: 15,
        padding: 10,
        marginVertical: 10,
    },
});

export default ShopfloorEmp;