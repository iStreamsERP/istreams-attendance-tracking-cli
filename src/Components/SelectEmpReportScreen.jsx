import { StyleSheet, View, Text, ScrollView, FlatList, Image } from 'react-native'
import { DataTable, Button, Menu, Card, PaperProvider } from 'react-native-paper'
import { GlobalStyles } from '../Styles/styles'
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import React, { useState } from 'react'
import FontAwesome6Icon from 'react-native-vector-icons/FontAwesome6'
import { handleEmpImageView } from '../Utils/EmpImageCRUDUtils';
import { Searchbar } from 'react-native-paper'
import { useAuth } from '../Context/AuthContext';
import { useTheme } from '../Context/ThemeContext';


const SelectEmpReportScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const { userData } = useAuth();
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);
    const [avatar, setAvatar] = useState(null);
    const [empNo, setEmpNo] = useState();
    const [empName, setEmpName] = useState();
    const [designation, setDesignation] = useState();
    const [loading, setLoading] = useState(false);

    // Calendar states
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [monthMenuVisible, setMonthMenuVisible] = useState(false);
    const [yearMenuVisible, setYearMenuVisible] = useState(false);

    // Search state
    const [tableSearchQuery, setTableSearchQuery] = useState('');

    // Sample data
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);

    const fetchImage = async (employee) => {
        if (!employee) return;

        const base64Img = await handleEmpImageView(
            employee,
            setEmpNo,
            setEmpName,
            setDesignation,
            userData.userEmail,
            userData.userDomain
        );

        if (base64Img) {
            setAvatar(base64Img);
        }
    };

    // Function to clear employee data
    const clearEmployeeData = () => {
        setAvatar(null);
        setEmpNo(null);
        setEmpName(null);
        setDesignation(null);
    };

    // Sample report data
    const reportData = [
        {
            id: 1,
            date: '15',
            day: 'Monday',
            inTime: '09:00 AM',
            outTime: '06:00 PM',
            hours: '9.0',
            employee: 'John Doe',
            empId: 'EMP001'
        },
        {
            id: 2,
            date: '16',
            day: 'Tuesday',
            inTime: '09:15 AM',
            outTime: '06:15 PM',
            hours: '9.0',
            employee: 'John Doe',
            empId: 'EMP001'
        },
        {
            id: 3,
            date: '17',
            day: 'Wednesday',
            inTime: '08:45 AM',
            outTime: '05:45 PM',
            hours: '9.0',
            employee: 'Jane Smith',
            empId: 'EMP002'
        },
        {
            id: 4,
            date: '18',
            day: 'Thursday',
            inTime: '09:30 AM',
            outTime: '06:30 PM',
            hours: '9.0',
            employee: 'Mike Johnson',
            empId: 'EMP003'
        },
        {
            id: 5,
            date: '19',
            day: 'Friday',
            inTime: '09:00 AM',
            outTime: '06:00 PM',
            hours: '9.0',
            employee: 'Sarah Wilson',
            empId: 'EMP004'
        },
        {
            id: 6,
            date: '22',
            day: 'Monday',
            inTime: '08:30 AM',
            outTime: '05:30 PM',
            hours: '9.0',
            employee: 'David Brown',
            empId: 'EMP005'
        },
        {
            id: 7,
            date: '23',
            day: 'Tuesday',
            inTime: '09:00 AM',
            outTime: '06:00 PM',
            hours: '9.0',
            employee: 'John Doe',
            empId: 'EMP001'
        },
        {
            id: 8,
            date: '24',
            day: 'Wednesday',
            inTime: '09:15 AM',
            outTime: '06:15 PM',
            hours: '9.0',
            employee: 'Jane Smith',
            empId: 'EMP002'
        },
        {
            id: 9,
            date: '25',
            day: 'Thursday',
            inTime: '08:45 AM',
            outTime: '05:45 PM',
            hours: '9.0',
            employee: 'Mike Johnson',
            empId: 'EMP003'
        },
        {
            id: 10,
            date: '26',
            day: 'Friday',
            inTime: '09:30 AM',
            outTime: '06:30 PM',
            hours: '9.0',
            employee: 'Sarah Wilson',
            empId: 'EMP004'
        },
    ];

    // Filter data based on table search query
    const filteredData = React.useMemo(() => {
        if (!tableSearchQuery) return reportData;

        const query = tableSearchQuery.toLowerCase();
        return reportData.filter(item =>
            item.date.toLowerCase().includes(query) ||
            item.day.toLowerCase().includes(query) ||
            item.inTime.toLowerCase().includes(query) ||
            item.outTime.toLowerCase().includes(query) ||
            item.hours.toLowerCase().includes(query) ||
            item.employee.toLowerCase().includes(query) ||
            item.empId.toLowerCase().includes(query)
        );
    }, [tableSearchQuery]);

    // Handle month selection
    const handleMonthSelect = (monthIndex) => {
        setSelectedMonth(monthIndex);
        setMonthMenuVisible(false);
    };

    // Handle year selection
    const handleYearSelect = (year) => {
        setSelectedYear(year);
        setYearMenuVisible(false);
    };

    // Get short day name (first 3 letters)
    const getShortDay = (day) => {
        return day.substring(0, 3);
    };

    // Render table row
    const renderItem = ({ item }) => (
        <DataTable.Row style={styles.row}>
            <DataTable.Cell style={styles.dateColumn}>
                <View style={styles.cellCenter}>
                    <Text style={styles.colText}>{item.date}</Text>
                    <Text style={styles.colText1}>{getShortDay(item.day)}</Text>
                </View>
            </DataTable.Cell>
            <DataTable.Cell style={styles.timeColumn}>
                <View style={styles.cellCenter}>
                    <Text style={styles.colText1}>{item.inTime}</Text>
                </View>
            </DataTable.Cell>
            <DataTable.Cell style={styles.timeColumn}>
                <View style={styles.cellCenter}>
                    <Text style={styles.colText1}>{item.outTime}</Text>
                </View>
            </DataTable.Cell>
            <DataTable.Cell style={styles.hoursColumn} numeric>
                <Text style={styles.colText}>{item.hours}</Text>
            </DataTable.Cell>
        </DataTable.Row>
    );

    // Render table header
    const renderHeader = () => (
        <DataTable.Header style={styles.header}>
            <DataTable.Title style={styles.dateColumn}>
                <View style={styles.headerCell}>
                    <Text style={styles.headerMainText}>Date</Text>
                </View>
            </DataTable.Title>
            <DataTable.Title style={styles.timeColumn}>
                <View style={styles.headerCell}>
                    <Text style={styles.headerMainText}>In</Text>
                </View>
            </DataTable.Title>
            <DataTable.Title style={styles.timeColumn}>
                <View style={styles.headerCell}>
                    <Text style={styles.headerMainText}>Out</Text>
                </View>
            </DataTable.Title>
            <DataTable.Title style={styles.hoursColumn}>
                <Text style={styles.headerMainText}>Total Hours</Text>
            </DataTable.Title>
        </DataTable.Header>
    );

    return (
        <PaperProvider>
            <View style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>
                <View style={styles.container}>
                    {/* Top Controls Section - Swapped positions */}
                    <Card style={styles.controlCard}>
                        <Card.Content style={styles.cardContent}>
                            <View style={styles.calendarHeader}>
                                <FontAwesome6Icon name="calendar" size={16} color="#6200ea" />
                                <Text style={styles.cardTitle}>Select Period</Text>
                            </View>

                            {/* Left Side - Calendar Controls (Previously Left) */}
                            <View style={globalStyles.twoInputContainer}>

                                <View style={styles.calendarControls}>
                                    {/* Month Selector */}
                                    <Menu
                                        visible={monthMenuVisible}
                                        onDismiss={() => setMonthMenuVisible(false)}
                                        anchor={
                                            <Button
                                                mode="outlined"
                                                onPress={() => setMonthMenuVisible(true)}
                                                style={styles.selectorButton}
                                                compact={true}
                                            >
                                                {months[selectedMonth]}
                                            </Button>
                                        }
                                        contentStyle={styles.menuContent}
                                    >
                                        <ScrollView style={styles.menuScrollView}>
                                            {months.map((month, index) => (
                                                <Menu.Item
                                                    key={index}
                                                    onPress={() => handleMonthSelect(index)}
                                                    title={month}
                                                    titleStyle={styles.menuItemText}
                                                />
                                            ))}
                                        </ScrollView>
                                    </Menu>

                                    {/* Year Selector */}
                                    <Menu
                                        visible={yearMenuVisible}
                                        onDismiss={() => setYearMenuVisible(false)}
                                        anchor={
                                            <Button
                                                mode="outlined"
                                                onPress={() => setYearMenuVisible(true)}
                                                style={styles.selectorButton}
                                                compact={true}
                                            >
                                                {selectedYear}
                                            </Button>
                                        }
                                        contentStyle={styles.menuContent}
                                    >
                                        <ScrollView style={styles.menuScrollView}>
                                            {years.map((year) => (
                                                <Menu.Item
                                                    key={year}
                                                    onPress={() => handleYearSelect(year)}
                                                    title={year.toString()}
                                                    titleStyle={styles.menuItemText}
                                                />
                                            ))}
                                        </ScrollView>
                                    </Menu>
                                </View>

                                {/* Right Side - Employee Selection (Previously Right) */}
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Button
                                        icon="account-plus"
                                        mode="contained-tonal"
                                        onPress={() =>
                                            navigation.navigate('EmployeeList', {
                                                onSelect: async (employees) => {
                                                    setLoading(true);
                                                    // Clear previous employee data immediately
                                                    clearEmployeeData();

                                                    if (employees.length !== 1) {
                                                        alert('Please select only one employee.');
                                                        setLoading(false);
                                                        return;
                                                    }
                                                    const employee = employees[0];
                                                    await fetchImage(employee);
                                                    setLoading(false);
                                                }
                                            })
                                        }
                                        loading={loading}
                                    >Select Employee</Button>
                                </View>

                            </View>
                        </Card.Content>
                    </Card>

                    {/* Employee Summary Card */}
                    <Card style={styles.summaryCard}>
                        <Card.Content style={styles.summaryContent}>
                            <View style={styles.summaryRow}>
                                <Image
                                    source={
                                        avatar ? { uri: avatar } : require("../../assets/images.png")
                                    }
                                    style={styles.employeeImage}
                                />
                                <View style={styles.employeeInfo}>
                                    <Text style={styles.employeeName}>
                                        {empName || 'No Employee Selected'}<Text style={{ fontSize: 14 }}> ({empNo})</Text>
                                    </Text>
                                    {designation && <Text style={styles.employeeDesignation}>{designation}</Text>}
                                </View>
                            </View>
                        </Card.Content>
                    </Card>

                    {/* Table Search */}
                    <View style={styles.searchSection}>
                        <Text style={styles.searchLabel}>Search Table:</Text>
                        <View style={styles.tableSearchContainer}>
                            <Searchbar
                                placeholder="Search records..."
                                onChangeText={setTableSearchQuery}
                                value={tableSearchQuery}
                                style={styles.tableSearchBar}
                                inputStyle={styles.searchInput}
                            />
                        </View>
                    </View>

                    {/* Data Table */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tableContainer}>
                        <View style={styles.table}>
                            <DataTable>
                                {renderHeader()}
                                {filteredData.length > 0 ? (
                                    <FlatList
                                        data={filteredData}
                                        renderItem={renderItem}
                                        keyExtractor={item => item.id.toString()}
                                    />
                                ) : (
                                    <DataTable.Row style={styles.row}>
                                        <DataTable.Cell style={styles.noDataCell}>
                                            <Text style={styles.noDataText}>No records found</Text>
                                        </DataTable.Cell>
                                    </DataTable.Row>
                                )}
                            </DataTable>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </PaperProvider>
    )
}

export default SelectEmpReportScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    controlCard: {
        marginBottom: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    cardContent: {
        paddingVertical: 10,
        paddingHorizontal: 10,
    },
    // Updated: Calendar section now on right
    calendarHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        justifyContent: 'flex-start',
    },
    cardTitle: {
        marginLeft: 8,
        fontSize: 12,
        fontWeight: '600',
        color: '#6200ea',
    },
    calendarControls: {
        flexDirection: 'row',
        gap: 12,
        justifyContent: 'flex-start',
    },
    selectorButton: {
        flex: 1,
        borderColor: '#6200ea',
        borderRadius: 8,
        minHeight: 40,
        maxWidth: 100,
    },
    menuContent: {
        backgroundColor: 'white',
        borderRadius: 8,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    menuScrollView: {
        maxHeight: 200,
    },
    menuItemText: {
        fontSize: 14,
        color: '#333',
    },
    summaryCard: {
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    summaryContent: {
        paddingVertical: 6,
    },
    summaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    employeeImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 16,
    },
    employeeInfo: {
        flex: 1,
        justifyContent: 'center',
        marginLeft: 10
    },
    employeeName: {
        color: '#6200ea',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    employeeDesignation: {
        fontSize: 11,
        fontWeight: '600'
    },
    searchSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    searchLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
    },
    tableSearchContainer: {
        width: 200,
    },
    tableSearchBar: {
        height: 35,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        borderColor: '#6200ea',
        borderWidth: 1,
        elevation: 0,
    },
    searchInput: {
        fontSize: 14,
        minHeight: 36,
    },
    tableContainer: {
        flex: 1,
    },
    table: {
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        overflow: 'hidden',
        backgroundColor: 'white',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        minWidth: 350,
    },
    header: {
        backgroundColor: '#f5f5f5',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        height: 50,
        alignItems: 'center',
        justifyContent: 'center'
    },
    headerCell: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
        flex: 1
    },
    headerMainText: {
        fontWeight: '600',
        fontSize: 13, textAlign: 'center',
        textAlignVertical: 'center',
        includeFontPadding: false,
        lineHeight: 18,
        paddingVertical: 0,
        marginVertical: 0,
    },
    row: {
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        height: 60,
    },
    cellCenter: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    colText: {
        fontSize: 13,
        fontWeight: '600',
    },
    colText1: {
        color: '#757575',
        fontSize: 12,
        marginTop: 4,
    },
    noDataCell: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },
    noDataText: {
        color: '#999',
        fontSize: 14,
        fontStyle: 'italic',
    },
    // Column widths
    dateColumn: {
        minWidth: 50,
        maxWidth: 50,
        justifyContent: 'center',
    },
    hoursColumn: {
        minWidth: 80,
        maxWidth: 80,
        justifyContent: 'center',
    },
    timeColumn: {
        minWidth: 100,
        maxWidth: 100,
        justifyContent: 'center',
    },
});