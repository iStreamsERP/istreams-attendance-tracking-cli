import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Header from '../Components/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GlobalStyles } from '../Styles/styles';
import { useAuth } from '../Context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TeamCheckout from './TeamCheckout';
import { useRoute } from '@react-navigation/native';
import TeamCheckout_Manual from './TeamCheckout_Manual';

const SwitchTeamCheckoutScreen = () => {
    const insets = useSafeAreaInsets();
    const [selectedSection, setSelectedSection] = useState('section1');
    const route = useRoute();
    const { selectedLocation } = route.params || {};
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
            <Header title="Team Check-out" />
            {/* Toggle Buttons */}
            <View style={styles.toggleContainer}>
                <TouchableOpacity
                    style={[
                        styles.button,
                        selectedSection === 'section1' ? styles.activeButton : styles.inactiveButton,
                        styles.leftButton,
                    ]}
                    onPress={() => setSelectedSection('section1')}
                >
                    <Text
                        style={[
                            GlobalStyles.subtitle_3,
                            selectedSection === 'section1' ? styles.activeText : styles.inactiveText,
                        ]}
                    >
                        Auto-Checkout
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.button,
                        selectedSection === 'section2' ? styles.activeButton : styles.inactiveButton,
                        styles.rightButton,
                    ]}
                    onPress={() => setSelectedSection('section2')}
                >
                    <Text
                        style={[
                            GlobalStyles.subtitle_3,
                            selectedSection === 'section2' ? styles.activeText : styles.inactiveText,
                        ]}
                    >
                        Manual-Checkout
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Section Content */}
            {selectedSection === 'section1' && (
                <TeamCheckout selectedLocation={selectedLocation}/>
            )}

            {selectedSection === 'section2' && (
                <TeamCheckout_Manual />
            )}
        </View>
    );
};

export default SwitchTeamCheckoutScreen;

const styles = StyleSheet.create({
    toggleContainer: {
        marginTop: 5,
        flexDirection: 'row',
        backgroundColor: '#fddde0',
        borderRadius: 25,
        padding: 3,
        alignSelf: 'center',
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 25,
        flex: 1,
        alignItems: 'center',
        borderRadius: 25,
    },
    leftButton: {
        borderTopLeftRadius: 25,
        borderBottomLeftRadius: 25,
    },
    rightButton: {
        borderTopRightRadius: 25,
        borderBottomRightRadius: 25,
    },
    activeButton: {
        backgroundColor: '#f44336',
    },
    inactiveButton: {
        backgroundColor: 'transparent',
    },
    activeText: {
        color: '#fff',
    },
    inactiveText: {
        color: '#999',
    },
});
