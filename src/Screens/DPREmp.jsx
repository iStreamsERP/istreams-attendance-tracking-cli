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

const DPREmp = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const { userData } = useAuth();
    const [btnloading, setbtnLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const { startTime, endTime, projectNo, activity, compQty,
        percentage, dprImage, locationName, boqNo } = route.params || {};
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

    const SaveShopfloor = async () => {
        setbtnLoading(true);

        try {

            setbtnLoading(false);
        } catch (error) {
            setbtnLoading(false);
            console.error('Error saving Checkin data:', error);
        }
    };

    return (
        <View style={[GlobalStyles.pageContainer, { paddingTop: insets.top }]}>
            <Header title="Add DPR Employees" />

            <View style={[styles.projectContainer, GlobalStyles.twoInputContainer]}>
                <View style={[GlobalStyles.twoInputContainer, { justifyContent: 'flex-start' }]}>
                    <Text style={[GlobalStyles.subtitle_2]}>Project No:</Text>
                    <Text style={[GlobalStyles.subtitle_2, { color: '#873e23' }]}> {projectNo}</Text>
                </View>

                <View style={[GlobalStyles.twoInputContainer, { justifyContent: 'flex-start' }]}>
                    <Text style={[GlobalStyles.subtitle_2]}>BOQ No:</Text>
                    <Text style={[GlobalStyles.subtitle_2, { color: '#873e23' }]}> {boqNo}</Text>
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

            <View style={{flex: 1, marginVertical: 10}}>
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

export default DPREmp;