import { Dimensions, Image, ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Text, TextInput, Button, Card } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import Header from '../Components/Header';
const { width } = Dimensions.get('window');
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GlobalStyles } from '../Styles/styles';
import LeaveTypeListPopup from '../Modal/LeaveTypeListPopUp';
import CategoryListPopUp from '../Modal/CategoryListPopUp';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { callSoapService } from '../SoapRequestAPI/callSoapService';
import { convertDataModelToStringData } from '../Utils/dataModelConverter';
import { useAuth } from '../Context/AuthContext';

const LeaveRequest = ({ employee }) => {
    const insets = useSafeAreaInsets();
    const { userData } = useAuth();
    const [loading, setLoading] = useState(true);
    const [empData, setEmpData] = useState({ empNo: '', empName: '', designation: '' });
    const [leaveType, setLeaveType] = useState('');
    const [category, setCategory] = useState('');
    const [leaveTypeVisible, setLeaveTypeVisible] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [totalDays, setTotalDays] = useState('');
    const [remarks, setRemarks] = useState('');
    const [btnLoading, setBtnLoading] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, [])

    useEffect(() => {
        const fetchEmployeeData = async () => {
            try {
                const User_EmpNo = userData.userEmployeeNo;
                const storedData = await AsyncStorage.getItem('EmployeeList');

                if (storedData) {
                    const parsedData = JSON.parse(storedData);
                    const employee = parsedData.find(emp => emp.EMP_NO === User_EmpNo);

                    if (employee) {
                        setEmpData({
                            empNo: employee.EMP_NO || '',
                            empName: employee.EMP_NAME || '',
                            designation: employee.DESIGNATION || '',
                        });
                    }
                }
            } catch (error) {
                console.error('Error fetching employee data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEmployeeData();
    }, [employee]);

    const onLeaveSelect = (leaveType) => {
        setLeaveType(leaveType.LEAVE_TYPE);
    };
    const onLeaveCategorySelect = (category) => {
        setCategory(category.LEAVE_CATEGORY);
    };

    // Date picker states
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [startDateObj, setStartDateObj] = useState(new Date());
    const [endDateObj, setEndDateObj] = useState(new Date());

    const formatDate = (date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const formatDateForAPI = (date) => {
        return date.toISOString();
    };

    const calculateDays = (start, end) => {
        if (start && end) {
            const timeDiff = end.getTime() - start.getTime();
            const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
            setTotalDays(dayDiff.toString());
        }
    };

    const onStartDateChange = (event, selectedDate) => {
        setShowStartDatePicker(false);
        if (selectedDate) {
            setStartDateObj(selectedDate);
            setStartDate(formatDate(selectedDate));
            calculateDays(selectedDate, endDateObj);
        }
    };

    const onEndDateChange = (event, selectedDate) => {
        setShowEndDatePicker(false);
        if (selectedDate) {
            setEndDateObj(selectedDate);
            setEndDate(formatDate(selectedDate));
            calculateDays(startDateObj, selectedDate);
        }
    };

    const handleSubmit = async () => {
        if (!leaveType) {
            alert('Please select leave type');
            return;
        }
        if (!startDate || !endDate) {
            alert('Please select start and end dates');
            return;
        }
        if (!remarks) {
            alert('Please enter remarks');
            return;
        }

        setBtnLoading(true);

        try {
            const leaveData = {
                LEAVE_TYPE: leaveType,
                LEAVE_CATEGORY: category || 'General', // Default category if none selected
                START_DATE: formatDateForAPI(startDateObj),
                END_DATE: formatDateForAPI(endDateObj),
                NO_OF_DAYS: totalDays,
                EMP_REMARKS: remarks,
                EMP_NO: empData.empNo, // Make sure to include employee number
            };

            const convertedDataModel = convertDataModelToStringData(
                "leave_request",
                leaveData
            );

            const leaveRequest_Parameter = {
                UserName: userData.userName,
                DModelData: convertedDataModel,
            };

            const response = await callSoapService(
                userData.clientURL,
                "DataModel_SaveData",
                leaveRequest_Parameter
            );

            if (response) {
                alert('Leave request submitted successfully');
                // Reset form
                setLeaveType('');
                setCategory('');
                setStartDate('');
                setEndDate('');
                setTotalDays('');
                setRemarks('');
                // Reset date objects to current date
                setStartDateObj(new Date());
                setEndDateObj(new Date());
            }
        } catch (error) {
            console.error('Error saving leave request:', error);
            alert('Failed to submit leave request: ' + error.message);
        } finally {
            setBtnLoading(false);
        }
    };

    return (
        <View style={[GlobalStyles.pageContainer, { paddingTop: insets.top }]}>
            <Header title='Leave Request' />
            <View style={styles.innerContainer}>

                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.profileContainer}>
                        <View style={styles.imageContainer}>
                            <Image
                                source={{ uri: `data:image/jpeg;base64,${userData.userAvatar}` }}
                                style={styles.image}
                            />
                        </View>
                    </View>

                    <Card style={styles.summaryCard}>
                        <Card.Content>
                            <View style={styles.summaryRow}>
                                <View style={styles.summaryItem}>
                                    <Text style={styles.summaryLabel}>Emp No</Text>
                                    <Text style={styles.summaryValue}>{empData.empNo || 'N/A'}</Text>
                                </View>
                                <View style={styles.summaryItem}>
                                    <Text style={styles.summaryLabel}>Emp Name</Text>
                                    <Text style={styles.summaryValue} numberOfLines={1} ellipsizeMode="tail">
                                        {empData.empName || 'N/A'}
                                    </Text>
                                </View>
                                <View style={styles.summaryItem}>
                                    <Text style={styles.summaryLabel}>Designation</Text>
                                    <Text style={styles.summaryValue}>{empData.designation || 'N/A'}</Text>
                                </View>
                            </View>
                        </Card.Content>
                    </Card>

                    <Text style={[GlobalStyles.subtitle_1, { marginTop: 5 }]}>Leave application</Text>

                    <View style={styles.inputContainer}>
                        {/* Leave Type Dropdown */}
                        <View style={styles.dropdownContainer}>
                            <TouchableOpacity onPress={() => setLeaveTypeVisible(true)}>
                                <TextInput
                                    mode="outlined"
                                    label="Leave Type"
                                    value={leaveType}
                                    editable={false}
                                    right={<TextInput.Icon icon="chevron-down" />}
                                    style={GlobalStyles.container1}
                                    onPress={() => setLeaveTypeVisible(true)}
                                    pointerEvents="none"
                                />
                            </TouchableOpacity>
                            <LeaveTypeListPopup
                                visible={leaveTypeVisible}
                                onClose={() => setLeaveTypeVisible(false)}
                                onSelect={(leaveType) => {
                                    onLeaveSelect(leaveType);
                                    setLeaveTypeVisible(false);
                                }}
                            />
                        </View>

                        {/* Category Dropdown */}
                        <View style={styles.dropdownContainer}>
                            <Text style={[GlobalStyles.subtitle_2, { marginTop: 10 }]}>Select Category</Text>

                            <CategoryListPopUp
                                onSelect={(category) => {
                                    onLeaveCategorySelect(category);
                                }}
                                selectedCategory={category}
                                leaveType={leaveType}
                            />
                        </View>

                        {/* Date Inputs */}
                        <View style={[GlobalStyles.twoInputContainer, { marginTop: 6 }]}>
                            <TouchableOpacity onPress={() => setShowStartDatePicker(true)}>
                                <TextInput
                                    mode="outlined"
                                    label="Start Date"
                                    value={startDate}
                                    editable={false}
                                    style={GlobalStyles.container1}
                                    placeholder="DD/MM/YYYY"
                                    right={<TextInput.Icon icon="calendar" onPress={() => setShowStartDatePicker(true)} />}
                                    pointerEvents="none"
                                />
                            </TouchableOpacity>

                            {/* Total Days */}
                            <TextInput
                                mode="outlined"
                                label="Total Days"
                                value={totalDays}
                                editable={false}
                                style={styles.totalDaysInput}
                            />
                        </View>

                        <View style={GlobalStyles.twoInputContainer}>
                            <TouchableOpacity onPress={() => setShowEndDatePicker(true)}>
                                <TextInput
                                    mode="outlined"
                                    label="End Date"
                                    value={endDate}
                                    editable={false}
                                    style={GlobalStyles.container1}
                                    placeholder="DD/MM/YYYY"
                                    right={<TextInput.Icon icon="calendar" onPress={() => setShowEndDatePicker(true)} />}
                                    pointerEvents="none"
                                />
                            </TouchableOpacity>
                        </View>

                        <View style={GlobalStyles.twoInputContainer}>
                            <TextInput
                                multiline
                                mode="outlined"
                                label="Enter EMP_REMARKS"
                                style={GlobalStyles.container1}
                                numberOfLines={4}
                                value={remarks}
                                onChangeText={setRemarks}
                            />
                        </View>
                    </View>

                    {/* Date Pickers */}
                    {showStartDatePicker && (
                        <DateTimePicker
                            value={startDateObj}
                            mode="date"
                            display="default"
                            onChange={onStartDateChange}
                            minimumDate={new Date()}
                        />
                    )}

                    {showEndDatePicker && (
                        <DateTimePicker
                            value={endDateObj}
                            mode="date"
                            display="default"
                            onChange={onEndDateChange}
                            minimumDate={startDateObj}
                        />
                    )}
                </ScrollView>

                {/* Action Buttons */}
                <View style={GlobalStyles.bottomButtonContainer}>
                    <Button
                        mode="contained"
                        onPress={handleSubmit}
                        loading={btnLoading}
                        disabled={btnLoading}
                    >
                        Submit
                    </Button>
                </View>
            </View>
        </View>
    );
};

export default LeaveRequest;

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    innerContainer: {
        flex: 1,
    },
    inputContainer: {
        flex: 1,
        marginVertical: 10,
    },
    //image
    profileContainer: {
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageContainer: {
        width: width * 0.30,
        height: width * 0.30,
        borderRadius: (width * 0.30) / 2,
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: (width * 0.35) / 2,
    },
    //card
    summaryCard: {
        marginTop: 15,
        marginBottom: 10,
        elevation: 2,
        width: '97%',
        alignSelf: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap'
    },
    summaryItem: {
        minWidth: '30%',
        alignItems: 'center',
        paddingHorizontal: 5,
        marginBottom: 5
    },
    summaryLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: 13,
        fontFamily: 'Inter-Bold',
        color: '#333',
        textAlign: 'center',
    },

    dropdownContainer: {
        flex: 1,
        position: 'relative',
    },

    totalDaysInput: {
        width: '30%',
        marginRight: '10'
    },
});