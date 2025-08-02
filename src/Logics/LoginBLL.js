import { callSoapService } from "../SoapRequestAPI/callSoapService";
import config from "../../config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DeviceInfo from 'react-native-device-info';

export const loginBLL = async (username, password, login) => {
    const Public_ServiceURL = config.API_BASE_URL;

    let name = '';
    let userImage = '';

    const doConn_parameters = {
        LoginUserName: username,
    };

    AsyncStorage.setItem("doConnectionPayload", JSON.stringify(doConn_parameters));

    try {
        const Public_doConnResponse = await callSoapService(Public_ServiceURL, 'doConnection', doConn_parameters);

        if (Public_doConnResponse === "SUCCESS") {
            const Public_GetServiceURL = await callSoapService(Public_ServiceURL, 'GetServiceURL_Local', doConn_parameters);
            const Client_doConnResponse = await callSoapService(Public_GetServiceURL, 'doConnection', doConn_parameters);

            if (Client_doConnResponse === "SUCCESS") {
                name = username.split('@')[0];

                const verify_Auth_parameters = {
                    username: name,
                    password
                };
                const Client_verifyAuth = await callSoapService(Public_GetServiceURL, 'verifyauthentication', verify_Auth_parameters);

                if (Client_verifyAuth === "Authetication passed") {

                    const Client_companyCode = await callSoapService(Public_GetServiceURL, 'General_Get_DefaultCompanyCode', '');

                    const branchCode_parameters = {
                        CompanyCode: Client_companyCode
                    };
                    const Client_branchCode = await callSoapService(Public_GetServiceURL, 'General_Get_DefaultBranchCode', branchCode_parameters);

                    const companyName_parameters = {
                        CompanyCode: Client_companyCode,
                        BranchCode: Client_branchCode,
                    };
                    const Client_companyName = await callSoapService(Public_GetServiceURL, 'General_Get_DefaultCompanyName', companyName_parameters);

                    const empDetails_parameters = {
                        userfirstname: name
                    };
                    const Client_EmpDetails = await callSoapService(Public_GetServiceURL, 'getemployeename_and_id', empDetails_parameters);

                    const Employee = Client_EmpDetails[0];
                    const empImage_parameters = {
                        EmpNo: Employee.EMP_NO
                    };

                    try {
                        const Client_EmpImage = await callSoapService(Public_GetServiceURL, 'getEmpPic_bytearray_Medium', empImage_parameters);
                        userImage = Client_EmpImage.trim();
                    } catch (error) {
                        userImage = null;
                    }

                    const android = await DeviceInfo.getUniqueId();

                    const domain = username.split('@')[1].split('.')[0];

                    const payload = {
                        companyCode: Client_companyCode,
                        branchCode: Client_branchCode,
                        userEmail: username,
                        userName: Employee.USER_NAME,
                        userEmployeeNo: Employee.EMP_NO,
                        userAvatar: userImage,
                        clientURL: Public_GetServiceURL,
                        companyName: Client_companyName,
                        androidID: android,
                        userDomain: domain
                    };

                    login(payload);

                    return Client_verifyAuth;
                }

                return Client_verifyAuth;
            }

            return Client_doConnResponse;
        }

        return Public_doConnResponse;

    } catch (error) {
        console.error(error);
        
        return error;
    }
};


export default class EmployeeDetails {
    constructor({ USER_NAME, EMP_NO }) {
        this.EMP_NO = EMP_NO;
        this.USER_NAME = USER_NAME;
    }
}