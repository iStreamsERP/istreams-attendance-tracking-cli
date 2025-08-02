import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, Checkbox, Searchbar } from 'react-native-paper';
import Header from './Header';
import { useTheme } from '../Context/ThemeContext';
import { GlobalStyles } from '../Styles/styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const EmployeeList = () => {
    const insets = useSafeAreaInsets();
    const route = useRoute();
    const { onSelect } = route.params;
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);

    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();
    const [employees, setEmployees] = useState([]);
    const [checkedItems, setCheckedItems] = useState({});
    const [searchQuery, setSearchQuery] = useState('');

    const getData = async () => {
        setLoading(true);
        try {
            const storedData = await AsyncStorage.getItem('EmployeeList');
            console.log('storedData', storedData);

            if (storedData !== null) {
                const parsedData = JSON.parse(storedData);
                setEmployees(parsedData);

                // Initialize checkbox state
                const initialChecks = {};
                parsedData.forEach(emp => {
                    initialChecks[emp.EMP_NO] = false;
                });
                setCheckedItems(initialChecks);
            } else {
                setEmployees([]); // clear if no data
            }
        } catch (e) {
            console.error('Failed to retrieve data:', e);
        } finally {
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
        <View style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>
            <Header title="Employee List" />
            {/* Search Input */}
            <Searchbar
                style={globalStyles.my_10}
                placeholder="Search Employees"
                value={searchQuery}
                onChangeText={setSearchQuery}
            />

            {/* Selected Employee Count */}
            <Text style={[globalStyles.subtitle_2, { marginBottom: 10 }]}>
                Selected Employees: {checkedCount}
            </Text>

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredEmployees}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item) => item.EMP_NO.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={[globalStyles.twoInputContainer, styles.container, { backgroundColor: colors.card }]}
                            onPress={() => toggleCheckbox(item.EMP_NO)}>
                            <Image
                                source={require('../../assets/images.png')}
                                style={globalStyles.empImageInList}
                            />
                            <View style={[globalStyles.flex_1, globalStyles.ml_10, globalStyles.justifyContentCenter]}>
                                <Text style={[globalStyles.subtitle, { color: colors.primary }]}>{item.EMP_NO}</Text>
                                <Text style={globalStyles.subtitle_2}>{item.EMP_NAME}</Text>
                                <Text style={globalStyles.content}>{item.DESIGNATION}</Text>
                            </View>
                            <View style={styles.checkBoxSection}>
                                <Checkbox
                                    status={checkedItems[item.EMP_NO] ? 'checked' : 'unchecked'}
                                    color={colors.primary}
                                    onPress={() => toggleCheckbox(item.EMP_NO)}
                                />
                            </View>
                        </TouchableOpacity>
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
                    <Text style={[globalStyles.bigtitle, { color: 'white' }]}>✓</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

export default EmployeeList;

const styles = StyleSheet.create({
    container: {
        borderRadius: 15,
        padding: 10,
        marginBottom: 10,
    },
    checkBoxSection: {
        justifyContent: 'center',
        alignItems: 'center',
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
});
