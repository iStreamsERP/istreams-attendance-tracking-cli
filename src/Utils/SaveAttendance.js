import { callSoapService } from '../SoapRequestAPI/callSoapService';

export const SaveAttendance = async ({
    companyCode,
    branchCode,
    userName,
    clientURL,
    projectNo,
    locationName,
    entryDate,
    entryTime,
    coordinates,
    TrackingStatus,
    selectedEmp,
    base64Img,
    navigation,
    returnTo,
    setErrorMessage
}) => {
    try {
        const Attendance_parameters = {
            CompanyCode: companyCode,
            BranchCode: branchCode,
            LogDate: entryDate,
            LogTime: entryTime,
            MachineNo: '22',
            EmpNo: '',
            tracking_status: TrackingStatus,
            gps_location: coordinates,
            Username: userName,
            PROJECT_NO: projectNo,
            PROJECT_LOCATION: locationName,
            EmpData: selectedEmp
        };

        const empAttendance = await callSoapService(clientURL, 'AddAttendance', Attendance_parameters);

        if (Number.isInteger(empAttendance)) {
            const AttendanceImg_parameters = {
                CompanyCode: companyCode,
                BranchCode: branchCode,
                AttendanceRefBatchNo: empAttendance,
                ImageData: base64Img,
                ImageExtension: 'jpeg',
            };

            const empAttendanceImg = await callSoapService(clientURL, 'AddAttendance_Image', AttendanceImg_parameters);

            if (empAttendanceImg === null) {
                setErrorMessage('Attendance Capture Failed');
            }
            else {
                navigation.navigate('SuccessAnimationScreen', {
                    message: 'Attendance Captured Successfully',
                    details: `Attendance Ref Batch No: ${empAttendance}`,
                    returnTo: returnTo || 'Home1',
                });
            }
        }
        else {
            const errorMsg = String(empAttendance).split(' ').slice(0, 10).join(' ');
            setErrorMessage(errorMsg);
        }
    } catch (error) {
        console.log('Error in SaveAttendance:', error);

        const errorMsg =
            error?.response?.data?.message ||
            error?.message ||
            'An unexpected error occurred while saving attendance.';

        setErrorMessage(errorMsg);
    }
};
