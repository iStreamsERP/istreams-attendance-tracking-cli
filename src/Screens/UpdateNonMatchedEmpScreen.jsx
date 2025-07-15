import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import ChangeEmpImageScreen from './ChangeEmpImageScreen';
import Header from '../Components/Header';
import { useAuth } from '../Context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlobalStyles } from '../Styles/styles';

const UpdateNonMatchedEmpScreen = () => {
    const [employeeData, setEmployeeData] = useState();
    const insets = useSafeAreaInsets();
    const { userData } = useAuth();
    useEffect(() =>{
        const fetchEmployeeData = async () => {
            let User_EmpNo = userData.userEmployeeNo;

            const storedData = await AsyncStorage.getItem('EmployeeList');
            if (storedData !== null) {
                const parsedData = JSON.parse(storedData);
                const employee = parsedData.find(emp => emp.EMP_NO === User_EmpNo);
                setEmployeeData(employee);
            }
        };

        fetchEmployeeData();
    }, []);

    return (
        <View style={[GlobalStyles.pageContainer, { paddingTop: insets.top }]}>
            <Header title="Update Non-Matched Emp Image" />

            <ChangeEmpImageScreen />
        </View>
    );
};

export default UpdateNonMatchedEmpScreen;
