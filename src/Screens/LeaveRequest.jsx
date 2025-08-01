import { Dimensions, Image, ScrollView, View, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Text, TextInput, Button, Card } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import Header from '../Components/Header';
import { GlobalStyles } from '../Styles/styles';
import LeaveTypeListPopup from '../Modal/LeaveTypeListPopUp';
import CategoryListPopUp from '../Modal/CategoryListPopUp';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { callSoapService } from '../SoapRequestAPI/callSoapService';
import { convertDataModelToStringData } from '../Utils/dataModelConverter';
import { useAuth } from '../Context/AuthContext';
import { useTheme } from '../Context/ThemeContext';

const LeaveRequest = ({ employee }) => {
    const insets = useSafeAreaInsets();
    const { userData } = useAuth();
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);

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
                const GetMatched_EmpParameter = {
                    EmpNo: userData.userEmployeeNo
                };

                const GetMatched_EmpList = await callSoapService(userData.clientURL, 'Get_Emp_BasicInfo', GetMatched_EmpParameter);

                const employee = GetMatched_EmpList[0];

                if (employee) {
                    setEmpData({
                        empNo: employee.EMP_NO || '',
                        empName: employee.EMP_NAME || '',
                        designation: employee.DESIGNATION || '',
                    });
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
        <View style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>
            <Header title='Leave Request' />
            <View style={globalStyles.flex_1}>
                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={globalStyles.centerRoundImgContainer}>
                        <View style={globalStyles.centerRoundImg}>
                            <Image
                                source={{ uri: `data:image/jpeg;base64,${userData.userAvatar}` }}
                                style={globalStyles.roundImg}
                            />
                        </View>
                    </View>

                    <Card style={[globalStyles.summaryCard, { backgroundColor: colors.card }]}>
                        <Card.Content>
                            <View style={globalStyles.summaryRow}>
                                <View style={globalStyles.summaryItem}>
                                    <Text style={[globalStyles.content1, globalStyles.txt_center]}>Emp No</Text>
                                    <Text style={[globalStyles.subtitle_2, globalStyles.txt_center, { color: colors.primary }]}>{empData.empNo || 'N/A'}</Text>
                                </View>

                                <View style={globalStyles.summaryItem}>
                                    <Text style={[globalStyles.content1, globalStyles.txt_center]}>Designation</Text>
                                    <Text style={[globalStyles.subtitle_2, globalStyles.txt_center]}>{empData.designation || 'N/A'}</Text>
                                </View>
                            </View>

                            <View style={globalStyles.summaryItem}>
                                <Text style={[globalStyles.content1, globalStyles.txt_center]}>Emp Name</Text>
                                <Text style={[globalStyles.subtitle_2, globalStyles.txt_center]}>
                                    {empData.empName || 'N/A'}
                                </Text>
                            </View>
                        </Card.Content>
                    </Card>

                    <Text style={[globalStyles.subtitle_1]}>Leave application</Text>

                    <View style={globalStyles.flex_1}>
                        {/* Leave Type Dropdown */}
                        <TouchableOpacity onPress={() => setLeaveTypeVisible(true)}>
                            <TextInput
                                mode="outlined"
                                label="Leave Type"
                                value={leaveType}
                                editable={false}
                                theme={theme}
                                right={<TextInput.Icon color={colors.text} icon="chevron-down" />}
                                style={globalStyles.container1}
                                onPress={() => setLeaveTypeVisible(true)}
                                pointerEvents="none"
                            />
                        </TouchableOpacity>

                        <Text style={[globalStyles.subtitle_2, { marginTop: 10 }]}>Select Category</Text>

                        <CategoryListPopUp
                            onSelect={(category) => {
                                onLeaveCategorySelect(category);
                            }}
                            selectedCategory={category}
                            leaveType={leaveType}
                        />

                        {/* Date Inputs */}
                        <View style={[globalStyles.twoInputContainer, globalStyles.mb_10]}>
                            <TouchableOpacity onPress={() => setShowStartDatePicker(true)} style={globalStyles.flex_1}>
                                <TextInput
                                    mode="outlined"
                                    label="Start Date"
                                    value={startDate}
                                    editable={false}
                                    theme={theme}
                                    style={globalStyles.container1}
                                    placeholder="DD/MM/YYYY"
                                    right={<TextInput.Icon color={colors.text} icon="calendar" onPress={() => setShowStartDatePicker(true)} />}
                                    pointerEvents="none"
                                />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => setShowEndDatePicker(true)} style={globalStyles.flex_1}>
                                <TextInput
                                    mode="outlined"
                                    label="End Date"
                                    value={endDate}
                                    editable={false}
                                    theme={theme}
                                    style={globalStyles.container2}
                                    placeholder="DD/MM/YYYY"
                                    right={<TextInput.Icon color={colors.text} icon="calendar" onPress={() => setShowEndDatePicker(true)} />}
                                    pointerEvents="none"
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Total Days */}
                        <TextInput
                            mode="outlined"
                            label="Total Days"
                            value={totalDays}
                            theme={theme}
                            editable={false}
                            style={[globalStyles.container2, globalStyles.mb_10, { width: '70%' }]}
                        />

                        <TextInput
                            multiline
                            mode="outlined"
                            label="Enter EMP_REMARKS"
                            style={globalStyles.container1}
                            theme={theme}
                            numberOfLines={4}
                            value={remarks}
                            onChangeText={setRemarks}
                        />
                    </View>
                </ScrollView>

                <LeaveTypeListPopup
                    visible={leaveTypeVisible}
                    onClose={() => setLeaveTypeVisible(false)}
                    onSelect={(leaveType) => {
                        onLeaveSelect(leaveType);
                        setLeaveTypeVisible(false);
                    }}
                />

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

                {/* Action Buttons */}
                <View style={globalStyles.bottomButtonContainer}>
                    <Button
                        mode="contained"
                        onPress={handleSubmit}
                        theme={{
                            colors: {
                                primary: colors.primary,
                                disabled: colors.lightGray, // <- set your desired disabled color
                            },
                        }}
                        loading={btnLoading}
                        disabled={btnLoading}
                    >
                        Submit
                    </Button>
                </View>
            </View >
        </View >
    );
};

export default LeaveRequest;