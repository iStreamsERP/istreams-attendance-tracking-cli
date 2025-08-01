import { Dimensions, Image, ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Text, TextInput, Button, Card, Checkbox } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import Header from '../Components/Header';
const { width } = Dimensions.get('window');
import { GlobalStyles } from '../Styles/styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { callSoapService } from '../SoapRequestAPI/callSoapService';
import { convertDataModelToStringData } from '../Utils/dataModelConverter';
import { useAuth } from '../Context/AuthContext';
import { useTheme } from '../Context/ThemeContext';
import { formatTime, formatDate } from '../Utils/dataTimeUtils';

const AttendancePermission = ({ employee }) => {
    const insets = useSafeAreaInsets();
    const { userData } = useAuth();
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);

    const [loading, setLoading] = useState(true);
    const [empData, setEmpData] = useState({ empNo: '', empName: '', designation: '' });
    const [payable, setPayable] = useState(false);
    const [reason, setReason] = useState('');
    const [btnLoading, setBtnLoading] = useState(false);
    const [entryDate, setEntryDate] = useState('');
    const [showEntryDatePicker, setShowEntryDatePicker] = useState(false);
    const [entryDateObj, setEntryDateObj] = useState(new Date());
    const [showStartTimePicker, setShowStartTimePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);
    const [startTimeObj, setStartTimeObj] = useState(new Date());
    const [endTimeObj, setEndTimeObj] = useState(new Date());
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [totalHours, setTotalHours] = useState('');

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

    const onEntryDateChange = (event, selectedDate) => {
        setShowEntryDatePicker(false);
        if (selectedDate) {
            setEntryDateObj(selectedDate);
            setEntryDate(formatDate(selectedDate));

            // Clear times and total hours
            setStartTime('');
            setEndTime('');
            setTotalDays('');
            setStartTimeObj(new Date());
            setEndTimeObj(new Date());
        }
    };

    const onStartTimeChange = (event, selectedTime) => {
        setShowStartTimePicker(false);
        if (selectedTime) {
            setStartTimeObj(selectedTime);
            setStartTime(formatTime(selectedTime));
            calculateHours(selectedTime, endTimeObj);
        }
    };

    const onEndTimeChange = (event, selectedTime) => {
        setShowEndTimePicker(false);
        if (selectedTime) {
            setEndTimeObj(selectedTime);
            setEndTime(formatTime(selectedTime));
            calculateHours(startTimeObj, selectedTime);
        }
    };

    const calculateHours = (start, end) => {
        if (start && end) {
            const diffMs = end.getTime() - start.getTime();
            const hours = (diffMs / (1000 * 60 * 60)).toFixed(2);
            setTotalHours(hours);
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
            <Header title='Attendance Permission' />
            <View style={globalStyles.flex_1}>

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

                    <View style={globalStyles.flex_1}>
                        {/* Date Inputs */}
                        <View style={globalStyles.twoInputContainer}>
                            <TouchableOpacity onPress={() => setShowEntryDatePicker(true)}>
                                <TextInput
                                    mode="outlined"
                                    label="Entry Date"
                                    value={entryDate}
                                    editable={false}
                                    theme={theme}
                                    style={[globalStyles.input, { marginBottom: 0 }]}
                                    placeholder="DD/MM/YYYY"
                                    right={<TextInput.Icon color={colors.text} icon="calendar" onPress={() => setShowEntryDatePicker(true)} />}
                                    pointerEvents="none"
                                />
                            </TouchableOpacity>
                        </View>

                        <View style={[globalStyles.twoInputContainer, globalStyles.my_10]}>
                            <TouchableOpacity onPress={() => entryDate && setShowStartTimePicker(true)}
                                disabled={!entryDate}
                                style={globalStyles.flex_1}>
                                <TextInput
                                    mode="outlined"
                                    label="Time From"
                                    value={startTime}
                                    editable={false}
                                    theme={theme}
                                    style={globalStyles.container1 }
                                    placeholder="HH:MM"
                                    right={<TextInput.Icon icon="clock" color={colors.text} onPress={() => entryDate && setShowStartTimePicker(true)} 
                                    disabled={!entryDate}/>}
                                />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => startTime && setShowEndTimePicker(true)}
                                disabled={!entryDate}
                                style={globalStyles.flex_1}>
                                <TextInput
                                    mode="outlined"
                                    label="Time To"
                                    value={endTime}
                                    editable={false}
                                    theme={theme}
                                    style={globalStyles.container1}
                                    placeholder="HH:MM"
                                    right={<TextInput.Icon icon="clock" color={colors.text} onPress={() => startTime && setShowEndTimePicker(true)}
                                    disabled={!startTime} />}
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Total Days */}
                        <TextInput
                            mode="outlined"
                            label="Total Hours"
                            value={totalHours}
                            theme={theme}
                            editable={false}
                            style={[globalStyles.container2, { width: '70%' }]}
                        />

                        <View style={[globalStyles.twoInputContainer, globalStyles.my_10, { justifyContent: 'flex-start', alignItems: 'center' }]}>
                            <Checkbox
                                status={payable ? "checked" : "unchecked"}
                                onPress={() => setPayable(!payable)}
                                color={colors.primary}
                            />
                            <Text style={[globalStyles.subtitle_2, { color: colors.text }]}>Payable</Text>
                        </View>

                        <View style={globalStyles.twoInputContainer}>
                            <TextInput
                                multiline
                                mode="outlined"
                                label="Reason"
                                style={globalStyles.container1}
                                numberOfLines={4}
                                value={reason}
                                theme={theme}
                                onChangeText={setReason}
                            />
                        </View>
                    </View>

                    {/* Date Pickers */}
                    {showEntryDatePicker && (
                        <DateTimePicker
                            value={entryDateObj}
                            mode="date"
                            display="default"
                            onChange={onEntryDateChange}
                            minimumDate={new Date()}
                        />
                    )}

                    {showStartTimePicker && (
                        <DateTimePicker
                            value={startTimeObj}
                            mode="time"
                            is24Hour={true}
                            display="default"
                            onChange={onStartTimeChange}
                        />
                    )}

                    {showEndTimePicker && (
                        <DateTimePicker
                            value={endTimeObj}
                            mode="time"
                            is24Hour={true}
                            display="default"
                            onChange={onEndTimeChange}
                        />
                    )}
                </ScrollView>

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
            </View>
        </View>
    );
};

export default AttendancePermission;

const styles = StyleSheet.create({
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
});