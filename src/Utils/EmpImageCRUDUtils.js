import axios from 'axios';
import { Alert } from 'react-native';

export const handleEmpImageUpload = async (avatar, empNo, setbtnLoading, userEmail, setErrorMessage) => {
    setbtnLoading(true);
    
    const formData = new FormData();
    formData.append('DomainName', userEmail);
    formData.append('EmpImageFile', {
        uri: avatar,
        type: 'image/jpeg',
        name: 'avatar.jpg',
    });
    formData.append('EmpNo', empNo);

    try {
        const response = await axios.post(
            `http://103.168.19.35:8070/api/EncodeImgToNpy/upload`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        if (response.data.message === 'Already exists') {
            const updateresponse = await axios.put(
                `http://103.168.19.35:8070/api/EncodeImgToNpy/update`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            if (updateresponse.data.status === 'Success') {
                Alert.alert('Image Updated Successfully');
            }
        }

        if (response.data.status === 'Success') {
            Alert.alert('Image Uploaded Successfully');
        }
    } catch (error) {
        setErrorMessage('Upload Error:', error);
    } finally {
        setbtnLoading(false);
    }
};

export const handleEmpImageView = async (
    employee,
    setEmpNo,
    setEmpName,
    setDesignation,
    userEmail,
    userDomain,
    setErrorMessage,
    setAvatar
) => {
    const empNoforImg = employee.EMP_NO;

    setEmpNo(employee.EMP_NO);
    setEmpName(employee.EMP_NAME);
    setDesignation(employee.DESIGNATION);

    try {
        const response = await axios.get(
            `http://103.168.19.35:8070/api/EncodeImgToNpy/view`,
            {
                params: {
                    DomainName: userDomain,
                    EmpNo: empNoforImg,
                },
                headers: {
                    accept: '*/*',
                },
                responseType: 'blob',
            }
        );

        const blob = response.data;
        const reader = new FileReader();

        return new Promise((resolve) => {
            reader.onloadend = () => {
                const base64data = reader.result;
                resolve(base64data); // return image data
            };
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        setErrorMessage('Employee Image Not Found:', error);
        setAvatar(null);
    }
};