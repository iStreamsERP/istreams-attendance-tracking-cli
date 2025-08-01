import axios from 'axios';
import { formatNormalDate, formatNormalTime } from './dataTimeUtils';
import { callSoapService } from '../SoapRequestAPI/callSoapService';
import GlobalVariables from '../Logics/GlobalVariables';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ImageRecognition = async (
    capturedImage,
    userEmail,
    userName,
    deviceId,
    clientURL,
    setRecogLoading,
    setBase64Img,
    setMatchingFaceNames,
    setCleanedMatchNames,
    setGroupedData,
    setErrorMessage
) => {
    try {
        const getDeviceID = async () => {
            const deviceID = deviceId;
            if (!deviceID) {
                const deviceID = userName;
                return deviceID;
            }
            return deviceID;
        }
        const getUniqueRefNo = async () => {
            const now = new Date();
            const date = formatNormalDate(now);
            const time = formatNormalTime(now);

            const dateStr = date + time;

            return dateStr;
        }

        const refNo = await getUniqueRefNo();
        const DEVICE_ID = await getDeviceID();
        setRecogLoading(true);
        const Username = userEmail;

        const formData = new FormData();
        formData.append('file', {
            uri: capturedImage,
            name: 'uploaded_img.jpeg',
            type: 'image/jpeg'
        });
        formData.append('RefNo', refNo);
        formData.append('DomainName', Username);
        formData.append('DeviceName', DEVICE_ID);

        try {
            const response = await axios.post(
                'http://103.168.19.35:8100/ImageMatching',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Accept': 'application/json',
                    },
                }
            );

        } catch (error) {
            setErrorMessage('Image recognition error:', error.response?.data || error.message);
            console.log('Image recognition error:', error.response?.data || error.message);
        }

        const fetchAndDisplayImages = async () => {
            try {
                const domainPart = Username.split('@')[1].split('.')[0];
                setErrorMessage(null);

                const response = await fetch(
                    `http://103.168.19.35:8070/api/View/get-folder-images/${domainPart}/${DEVICE_ID}/${refNo}`
                );

                const text = await response.text();
                if (!text) {
                    throw new Error('Empty response received from image matching API.');
                }

                let data;
                try {
                    data = JSON.parse(text);
                } catch (parseError) {
                    throw new Error('Invalid JSON response received: ' + parseError.message);
                }

                let finalCombinedList = [];

                if (data["3_matching_faces"]?.length > 0) {
                    const matchNames = data["3_matching_faces"].map(img => img.name.replace('.jpg', ''));
                    const matchingFaces = data["3_matching_faces"];
                    setMatchingFaceNames(matchingFaces.map(i => i.name));
                    setCleanedMatchNames(matchNames);

                    let GetMatched_EmpList = [];

                    if (
                        !GlobalVariables.emp_parsedData ||
                        (Array.isArray(GlobalVariables.emp_parsedData) && GlobalVariables.emp_parsedData.length === 0) ||
                        (typeof GlobalVariables.emp_parsedData === 'object' && Object.keys(GlobalVariables.emp_parsedData).length === 0)
                    ) {
                        const storedData = await AsyncStorage.getItem('EmployeeList');

                        if (storedData !== null) {
                            GlobalVariables.emp_parsedData = JSON.parse(storedData);
                        }
                    }

                    if (matchNames.length > 1) {
                        GetMatched_EmpList = GlobalVariables.emp_parsedData.filter(emp => matchNames.includes(emp.EMP_NO));
                    }
                    else {
                        const GetMatched_EmpParameter = {
                            EmpNo: matchNames
                        };

                        GetMatched_EmpList = await callSoapService(clientURL, 'Get_Emp_BasicInfo', GetMatched_EmpParameter);
                    }

                    const enrichedMatched = await Promise.all(
                        GetMatched_EmpList.map(async (emp) => {
                            //const avatar = await handleEmpImageView(emp, () => { }, () => { }, () => { });
                            const img = matchingFaces.find(i => i.name.includes(emp.EMP_NO));
                            return {
                                //...emp,
                                EMP_NO: emp.EMP_NO,
                                EMP_NAME: emp.EMP_NAME,
                                DESIGNATION: emp.DESIGNATION,
                                //EMP_IMAGE: avatar || null,
                                EMP_IMAGE: img?.base64Data || null,
                                MATCH_TYPE: 'MATCHED'
                            };
                        })
                    );

                    finalCombinedList = [...finalCombinedList, ...enrichedMatched];

                    const foundEmpNos = GetMatched_EmpList.map(e => e.EMP_NO);
                    const unmatchedImages = matchingFaces.filter(img => {
                        const empNo = img.name.replace('.jpg', '');
                        return !foundEmpNos.includes(empNo);
                    });

                    const unmatchedImageRecords = unmatchedImages.map(img => ({
                        EMP_NO: img.name.replace('.jpg', ''),
                        EMP_NAME: '',
                        DESIGNATION: '',
                        EMP_IMAGE: img.base64Data,
                        MATCH_TYPE: 'MATCHED_NO_EMP_INLIST',
                    }));

                    finalCombinedList = [...finalCombinedList, ...unmatchedImageRecords];
                }

                if (data["4_non_matching_faces"]?.length > 0) {
                    const nonMatched = data["4_non_matching_faces"].map(img => ({
                        EMP_NO: '',
                        EMP_NAME: '',
                        DESIGNATION: '',
                        EMP_IMAGE: img.base64Data,
                        MATCH_TYPE: 'NON_MATCHED',
                    }));
                    finalCombinedList = [...finalCombinedList, ...nonMatched];
                }

                const matched = finalCombinedList.filter(emp => emp.MATCH_TYPE === 'MATCHED');
                const nonMatched = finalCombinedList.filter(emp => emp.MATCH_TYPE === 'NON_MATCHED');
                const matchedNoEmp = finalCombinedList.filter(emp => emp.MATCH_TYPE === 'MATCHED_NO_EMP_INLIST');

                const newGroupedData = [];
                if (matched.length > 0) newGroupedData.push({ title: 'Matched Employee', data: matched });
                if (nonMatched.length > 0) newGroupedData.push({ title: 'Non-Matched Employee', data: nonMatched });
                if (matchedNoEmp.length > 0) newGroupedData.push({ title: 'Matched Employee (No Employee in List)', data: matchedNoEmp });

                console.log(newGroupedData);

                if(newGroupedData.length === 0) {
                    setErrorMessage('Image Not Recognized. Recapture the Image');
                }

                setGroupedData(newGroupedData);
            } catch (error) {
                setErrorMessage(`Error: ${error.message}`);
            } finally {
                setRecogLoading(false);
            }
        };

        await fetchAndDisplayImages();

    } catch (error) {
        setErrorMessage('Image recognition error:', error);
        setRecogLoading(false);
    }
};


// Trash 2