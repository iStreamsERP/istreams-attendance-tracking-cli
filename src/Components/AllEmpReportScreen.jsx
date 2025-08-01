import { StyleSheet, View, Text, ScrollView, FlatList } from 'react-native'
import { DataTable, Button, Menu, Card, PaperProvider } from 'react-native-paper'
import { GlobalStyles } from '../Styles/styles'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import React, { useState } from 'react'
import FontAwesome6Icon from 'react-native-vector-icons/FontAwesome6'
import { Searchbar } from 'react-native-paper'
import { useTheme } from '../Context/ThemeContext'

const AllEmpReportScreen = () => {
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);

    // Calendar states
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [monthMenuVisible, setMonthMenuVisible] = useState(false);
    const [yearMenuVisible, setYearMenuVisible] = useState(false);

    // Employee selection states
    const [selectedEmployee, setSelectedEmployee] = useState('All Employees');
    const [employeeMenuVisible, setEmployeeMenuVisible] = useState(false);
    const [employeeSearchQuery, setEmployeeSearchQuery] = useState('');
    const [tableSearchQuery, setTableSearchQuery] = useState('');

    // Sample data
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);

    const employees = [
        'All Employees',
        'John Doe (EMP001)',
        'Jane Smith (EMP002)',
        'Mike Johnson (EMP003)',
        'Sarah Wilson (EMP004)',
        'David Brown (EMP005)',
    ];

    // Sample report data - updated with DD format dates
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

    // Filter employees based on search query
    const filteredEmployees = React.useMemo(() => {
        if (!employeeSearchQuery) {
            return employees;
        }
        return employees.filter(employee =>
            employee.toLowerCase().includes(employeeSearchQuery.toLowerCase())
        );
    }, [employeeSearchQuery]);

    // Filter data based on selected employee and table search query
    const filteredData = React.useMemo(() => {
        let data = reportData;

        // Filter by selected employee
        if (selectedEmployee !== 'All Employees') {
            const employeeName = selectedEmployee.includes('(')
                ? selectedEmployee.split(' (')[0]
                : selectedEmployee;
            data = data.filter(item => item.employee === employeeName);
        }

        // Filter by table search query
        if (tableSearchQuery) {
            const query = tableSearchQuery.toLowerCase();
            data = data.filter(item =>
                item.date.toLowerCase().includes(query) ||
                item.day.toLowerCase().includes(query) ||
                item.inTime.toLowerCase().includes(query) ||
                item.outTime.toLowerCase().includes(query) ||
                item.hours.toLowerCase().includes(query) ||
                item.employee.toLowerCase().includes(query) ||
                item.empId.toLowerCase().includes(query)
            );
        }

        return data;
    }, [selectedEmployee, tableSearchQuery]);

    // Calculate unique employees count from filtered data
    const uniqueEmployeesCount = React.useMemo(() => {
        const uniqueEmployees = new Set(filteredData.map(item => item.employee));
        return uniqueEmployees.size;
    }, [filteredData]);

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

    // Handle employee selection
    const handleEmployeeSelect = (employee) => {
        setSelectedEmployee(employee);
        setEmployeeMenuVisible(false);
    };

    // Get short day name (first 3 letters)
    const getShortDay = (day) => {
        return day.substring(0, 3);
    };

    // Render table row
    const renderItem = ({ item }) => (
        <DataTable.Row style={styles.row}>
            <DataTable.Cell style={styles.dateColumn}>
                <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                    <Text style={styles.colText}>{item.date}</Text>
                    <Text style={styles.colText1}>{getShortDay(item.day)}</Text>
                </View>
            </DataTable.Cell>
            <DataTable.Cell style={styles.employeeColumn}>
                <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                    <Text style={styles.colText}>{item.empId}</Text>
                    <Text style={styles.colText1}>{item.employee}</Text>
                </View>
            </DataTable.Cell>
            <DataTable.Cell style={styles.hoursColumn} numeric>
                <Text style={styles.colText}>{item.hours}</Text>
            </DataTable.Cell>
            <DataTable.Cell style={styles.timeColumn}>
                <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                    <Text style={styles.colText1}>{item.inTime}</Text>
                    <Text style={styles.colText1}>{item.outTime}</Text>
                </View>
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
            <DataTable.Title style={styles.employeeColumn}>
                <View style={styles.headerCell}>
                    <Text style={styles.headerMainText}>Employee</Text>
                </View>
            </DataTable.Title>
            <DataTable.Title style={styles.hoursColumn}>
                <Text style={styles.headerMainText}>Total Hours</Text>
            </DataTable.Title>
            <DataTable.Title style={styles.timeColumn}>
                <View style={styles.headerCell}>
                    <Text style={styles.headerMainText}>In/Out</Text>
                </View>
            </DataTable.Title>
        </DataTable.Header>
    );

    return (
        <PaperProvider>
            <View style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>
                <View style={styles.container}>
                    {/* Top Controls Section */}
                    <View style={styles.topControlsContainer}>
                        {/* Left Side - Calendar Controls */}
                        <Card style={styles.controlCard}>
                            <Card.Content style={styles.cardContent}>
                                <View style={styles.calendarHeader}>
                                    <FontAwesome6Icon name="calendar" size={16} color="#6200ea" />
                                    <Text style={styles.cardTitle}>Select Period</Text>
                                </View>

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
                            </Card.Content>
                        </Card>

                        {/* Right Side - Total Employees */}
                        <Card style={styles.controlCard}>
                            <Card.Content style={styles.summaryCardContent}>
                                <View style={styles.summaryHeader}>
                                    <FontAwesome6Icon name="users" size={16} color="#6200ea" />
                                    <Text style={styles.cardTitle}>Total Employees</Text>
                                </View>
                                <View style={styles.summaryValueContainer}>
                                    <Text style={styles.summaryValue}>{uniqueEmployeesCount}</Text>
                                </View>
                            </Card.Content>
                        </Card>
                    </View>

                    {/* Table Search and Container */}
                    <View style={globalStyles.twoInputContainer}>
                        <View>
                            <Text style={{ marginTop: 5, fontSize: 14, color: '#666', fontWeight: '600' }}>Search Table :</Text>
                        </View>

                        <View style={styles.tableSearchContainer}>
                            <Searchbar
                                placeholder="Search"
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

export default AllEmpReportScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    topControlsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 6,
        marginBottom: 16,
        gap: 12,
    },
    controlCard: {
        flex: 1,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    summaryCardContent: {
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    summaryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    summaryValueContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    summaryValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#6200ea',
    },
    cardContent: {
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    calendarHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardTitle: {
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '600',
        color: '#6200ea',
    },
    summaryCardTitle: {
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '600',
        color: 'white',
    },
    calendarControls: {
        flexDirection: 'row',
        gap: 25,
    },
    selectorButton: {
        flex: 1,
        borderColor: '#6200ea',
        borderRadius: 9,
        minHeight: 40,
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
    searchBar: {
        height: 48,
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
    tableSearchContainer: {
        marginBottom: 6,
        alignSelf: 'flex-end',
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
    employeeColumn: {
        minWidth: 120,
        maxWidth: 120,
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
})