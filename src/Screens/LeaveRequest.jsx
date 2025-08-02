import { Image, ScrollView, View, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
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
import { formatDate } from '../Utils/dataTimeUtils';
import { useAuth } from '../Context/AuthContext';
import { useTheme } from '../Context/ThemeContext';
import AutoImageCaptureModal from '../Modal/AutoImageCaptureModal';
import { ImageRecognition } from '../Utils/ImageRecognition';
import { useNavigation } from '@react-navigation/native';

const LeaveRequest = ({ employee }) => {
    const insets = useSafeAreaInsets();
    const { userData } = useAuth();
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);
    const navigation = useNavigation();

    const [empCardLoading, setEmpCardLoading] = useState(true);
    const [empData, setEmpData] = useState({ empNo: '', empName: '', designation: '' });
    const [leaveType, setLeaveType] = useState('');
    const [category, setCategory] = useState('');
    const [leaveTypeVisible, setLeaveTypeVisible] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [totalDays, setTotalDays] = useState('');
    const [remarks, setRemarks] = useState('');
    const [btnLoading, setBtnLoading] = useState(false);
    const [showCameraModal, setShowCameraModal] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [matchedImage, setMatchedImage] = useState(null);
    const [hasRecognized, setHasRecognized] = useState(false);
    const [matchingFaceNames, setMatchingFaceNames] = useState([]);
    const [cleanedMatchNames, setCleanedMatchNames] = useState([]);
    const [groupedData, setgroupedData] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [recogloading, setrecogLoading] = useState(false);
    const [base64Img, setBase64Img] = useState(null);

    const userEmail = userData.userEmail;
    const userName = userData.userName;
    const deviceId = userData.androidID;
    const clientURL = userData.clientURL;
    const userDomain = userData.userDomain;

    useEffect(() => {
        setShowCameraModal(true);
    }, []);

    useEffect(() => {
        if (capturedImage && !hasRecognized) {
            handleImageRecognition();
            setHasRecognized(true);
        }
    }, [capturedImage, hasRecognized]);

    useEffect(() => {
        if (errorMessage) {
            Alert.alert('Error', errorMessage, [
                { text: 'OK', onPress: () => setErrorMessage('') }
            ]);
        }
    }, [errorMessage]);

    useEffect(() => {
        if (groupedData && groupedData.length > 0) {
            const hasNonMatchedFaces = groupedData.some(item => item.title === "Non-Matched Employee");

            if (hasNonMatchedFaces) {
                setEmpData(null);
                setMatchedImage(null);
                navigation.navigate('FailureAnimationScreen', {
                    message: 'No Employee Image Matched',
                    details: 'Next employee please',
                    returnTo: 'SelfCheckin'
                });
            } else {
                const extractedEmpNos = groupedData.flatMap(item => item.data.map(i => i.EMP_NO));

                if (extractedEmpNos.length > 0) {
                    const imageUrl = `http://103.168.19.35:8070/api/EncodeImgToNpy/view?DomainName=${userDomain}&EmpNo=${extractedEmpNos[0]}`;
                    console.log('Generated matched image URL:', imageUrl);

                    setMatchedImage(imageUrl);
                }

                setEmpData({
                    empNo: groupedData[0].data[0].EMP_NO,
                    empName: groupedData[0].data[0].EMP_NAME,
                    designation: groupedData[0].data[0].DESIGNATION,
                });
            }
            setEmpCardLoading(false); // stop loading after employee data is set
        }
    }, [groupedData]);

    const handleImageRecognition = async () => {
        await ImageRecognition(
            capturedImage,
            userEmail,
            userDomain,
            userName,
            deviceId,
            clientURL,
            setrecogLoading,
            setBase64Img,
            setMatchingFaceNames,
            setCleanedMatchNames,
            setgroupedData,
            setErrorMessage);
    };

    const resetFaceStates = () => {
        setCapturedImage(null);
        setMatchingFaceNames([]);
        setCleanedMatchNames([]);
        setgroupedData([]);
        setMatchedImage(null);
        setEmpData(null);
        setErrorMessage('');
        setHasRecognized(false);
    };

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
                COMPANY_CODE: userData.companyCode,
                BRANCH_CODE: userData.branchCode,
                REF_NO: -1,
                EMP_NO: empData.empNo,
                LEAVE_TYPE: leaveType,
                LEAVE_CATEGORY: category || ' ',
                START_DATE: startDate,
                END_DATE: endDate,
                NO_OF_DAYS: totalDays,
                EMP_REMARKS: remarks,
                EMP_NO: empData.empNo,
                USER_NAME: userData.userName,
                ENT_DATE: formatDate(new Date()),
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

            const refNo = response.match(/\d+/)[0];

            if (response === `Successfully Saved with Ref No '${refNo}'`) {
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
                resetFaceStates();
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
                    <View style={globalStyles.justalignCenter}>
                        {empCardLoading ? (
                            <ActivityIndicator size="large" color={colors.primary} />
                        ) : (
                            <View style={globalStyles.centerRoundImg}>
                                <Image
                                    source={{ uri: matchedImage }}
                                    style={globalStyles.roundImg}
                                />
                            </View>
                        )}
                    </View>

                    {empCardLoading ? (
                        <Card style={[globalStyles.summaryCard, { backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', height: 150 }]}>
                            <ActivityIndicator size="large" color={colors.primary} />
                        </Card>
                    ) : (
                        <Card style={[globalStyles.summaryCard, { backgroundColor: colors.card }]}>
                            <Card.Content>
                                <View style={globalStyles.summaryRow}>
                                    <View style={globalStyles.summaryItem}>
                                        <Text style={[globalStyles.content1, globalStyles.txt_center]}>Emp No</Text>
                                        <Text style={[globalStyles.subtitle_2, globalStyles.txt_center, { color: colors.primary }]}>
                                            {empData?.empNo || 'N/A'}
                                        </Text>
                                    </View>
                                    <View style={globalStyles.summaryItem}>
                                        <Text style={[globalStyles.content1, globalStyles.txt_center]}>Designation</Text>
                                        <Text style={[globalStyles.subtitle_2, globalStyles.txt_center]}>
                                            {empData?.designation || 'N/A'}
                                        </Text>
                                    </View>
                                </View>
                                <View style={globalStyles.summaryItem}>
                                    <Text style={[globalStyles.content1, globalStyles.txt_center]}>Emp Name</Text>
                                    <Text style={[globalStyles.subtitle_2, globalStyles.txt_center]}>
                                        {empData?.empName || 'N/A'}
                                    </Text>
                                </View>
                            </Card.Content>
                        </Card>
                    )}

                    <Text style={[globalStyles.subtitle, globalStyles.mb_5]}>Leave application</Text>

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
                                onPress={() => setLeaveTypeVisible(true)}
                                pointerEvents="none"
                            />
                        </TouchableOpacity>

                        <Text style={[globalStyles.subtitle_2, globalStyles.mt_5]}>Select Category</Text>

                        <CategoryListPopUp
                            onSelect={(category) => {
                                onLeaveCategorySelect(category);
                            }}
                            selectedCategory={category}
                            leaveType={leaveType}
                        />

                        {/* Date Inputs */}
                        <View style={[globalStyles.twoInputContainer, { columnGap: 3 }, globalStyles.mb_5]}>
                            <TouchableOpacity onPress={() => setShowStartDatePicker(true)} style={globalStyles.flex_1}>
                                <TextInput
                                    mode="outlined"
                                    label="Start Date"
                                    value={startDate}
                                    editable={false}
                                    theme={theme}
                                    style={globalStyles.container2}
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
                            style={{ width: '70%' }}
                        />

                        <TextInput
                            multiline
                            mode="outlined"
                            label="Enter EMP_REMARKS"
                            theme={theme}
                            numberOfLines={3}
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

                {showCameraModal && (
                    <AutoImageCaptureModal
                        visible={showCameraModal}
                        onClose={() => setShowCameraModal(false)}
                        onCapture={(imagePath) => {
                            setCapturedImage(imagePath);
                            console.log('Captured image URI local:', capturedImage);
                        }}
                    />
                )}

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
                                disabled: colors.lightGray,
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