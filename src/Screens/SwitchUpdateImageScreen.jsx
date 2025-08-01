import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import ChangeEmpImageScreen from './ChangeEmpImageScreen';
import EmployeeAddComponent from '../Components/EmployeeAddComponent';
import Header from '../Components/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GlobalStyles } from '../Styles/styles';
import { useAuth } from '../Context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../Context/ThemeContext';

const SwitchUpdateImageScreen = () => {
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);
    const [selectedSection, setSelectedSection] = useState('section1');
    const [employeeData, setEmployeeData] = useState();
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
        <View style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>
            <Header title="Update Image" />
            {/* Toggle Buttons */}
            <View style={globalStyles.toggleContainer}>
                <TouchableOpacity
                    style={[
                        globalStyles.toggleButton,
                        selectedSection === 'section1' ? globalStyles.activeButton : globalStyles.inactiveButton,
                        globalStyles.leftButton,
                    ]}
                    onPress={() => setSelectedSection('section1')}
                >
                    <Text
                        style={[
                            globalStyles.subtitle_3,
                            selectedSection === 'section1' ? globalStyles.activeText : globalStyles.inactiveText,
                        ]}
                    >
                        Self Update
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        globalStyles.toggleButton,
                        selectedSection === 'section2' ? globalStyles.activeButton : globalStyles.inactiveButton,
                        globalStyles.rightButton,
                    ]}
                    onPress={() => setSelectedSection('section2')}
                >
                    <Text
                        style={[
                            globalStyles.subtitle_3,
                            selectedSection === 'section2' ? globalStyles.activeText : globalStyles.inactiveText,
                        ]}
                    >
                        Other Employee
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Section Content */}
            {selectedSection === 'section1' && (
                <EmployeeAddComponent employee={employeeData} />
            )}

            {selectedSection === 'section2' && (
                <ChangeEmpImageScreen />
            )}
        </View>
    );
};

export default SwitchUpdateImageScreen;
