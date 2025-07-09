import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, Checkbox, Searchbar } from 'react-native-paper';
import Header from './Header';
import { GlobalStyles } from '../Styles/styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const EmployeeList = () => {
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();
    const [employees, setEmployees] = useState([]);
    const [checkedItems, setCheckedItems] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const insets = useSafeAreaInsets();
    const route = useRoute();
    const { onSelect } = route.params;

    const getData = async () => {
        try {
            const storedData = await AsyncStorage.getItem('EmployeeList');
            if (storedData !== null) {
                const parsedData = JSON.parse(storedData);
                setEmployees(parsedData);

                // Initialize checkbox state
                const initialChecks = {};
                parsedData.forEach(emp => {
                    initialChecks[emp.EMP_NO] = false;
                });
                setCheckedItems(initialChecks);
            }
        } catch (e) {
            console.error('Failed to retrieve data:', e);
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
        getData();
    }, []);

    const checkedCount = Object.values(checkedItems).filter(Boolean).length;

    // Filter employees based on the search query
    const filteredEmployees = employees.filter(emp => {
        const empName = emp.EMP_NAME || ''; 
        const empNo = emp.EMP_NO ? emp.EMP_NO.toString() : ''; 
        const designation = emp.DESIGNATION || ''; 

        return (
            empName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            empNo.includes(searchQuery) ||
            designation.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    return (
        <View style={[GlobalStyles.pageContainer, { paddingTop: insets.top }]}>
            <Header title="Employee List" />
            {/* Search Input */}
            <Searchbar
                style={styles.inputContainer}
                placeholder="Search Employees"
                value={searchQuery}
                onChangeText={setSearchQuery}
            />

            {/* Selected Employee Count */}
            <Text style={[GlobalStyles.subtitle_2, { marginBottom: 10 }]}>
                Selected Employees: {checkedCount}
            </Text>

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>
            ) : (
                <FlatList
                    data={filteredEmployees}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item) => item.EMP_NO.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.container}>
                            <Image
                                source={require('../../assets/human.png')}
                                style={{ width: 60, height: 60, borderRadius: 30 }}
                            />
                            <View style={styles.innerContainer}>
                                <Text style={GlobalStyles.txtEmpNo}>{item.EMP_NO}</Text>
                                <Text style={GlobalStyles.txtEmpName}>{item.EMP_NAME}</Text>
                                <Text style={GlobalStyles.txtDesignation}>{item.DESIGNATION}</Text>
                            </View>
                            <View style={styles.checkBoxSection}>
                                <Checkbox
                                    status={checkedItems[item.EMP_NO] ? 'checked' : 'unchecked'}
                                    onPress={() => toggleCheckbox(item.EMP_NO)}
                                />
                            </View>
                        </View>
                    )}
                />
            )}

            {/* Floating Button */}
            {checkedCount >= 1 && (
                <TouchableOpacity
                    style={styles.floatingButton}
                    onPress={() => {
                        const selectedEmp = employees.filter(emp => checkedItems[emp.EMP_NO]);
                        onSelect(selectedEmp);
                        navigation.goBack();
                    }}
                >
                    <Text style={styles.floatingButtonText}>✓</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

export default EmployeeList;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#dddddb',
        justifyContent: 'space-between',
        borderRadius: 15,
        padding: 10,
        marginBottom: 10,
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
    inputContainer: {
        marginVertical: 10,
    },
    floatingButton: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        backgroundColor: '#007BFF',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    },
    floatingButtonText: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
    },
});
