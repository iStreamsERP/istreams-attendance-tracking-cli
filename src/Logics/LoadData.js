import AsyncStorage from "@react-native-async-storage/async-storage";
import { callSoapService } from "../SoapRequestAPI/callSoapService";

const LoadData = async (taskKey, clientURL) => {

    try {
        if (taskKey === 'fetchEmployees') {
            const EmpList_SQLQueryParameter = {
                SQLQuery: 'SELECT EMP_NO, EMP_NAME, DESIGNATION from emp_master'
            };

            const EmployeeList = await callSoapService(clientURL, 'DataModel_GetDataFrom_Query', EmpList_SQLQueryParameter);

            await AsyncStorage.setItem('EmployeeList', JSON.stringify(EmployeeList));
        }

        if (taskKey === 'fetchProjects') {
            const ProjectList = await callSoapService(clientURL, 'getallprojects', '');

            await AsyncStorage.setItem('ProjectList', JSON.stringify(ProjectList));
        }

        if (taskKey === 'fetchLeaveType') {
            const LeaveTypeList = await callSoapService(clientURL, 'HR_Get_LeaveTypes_List', '');

            await AsyncStorage.setItem('LeaveTypeList', JSON.stringify(LeaveTypeList));
        }

        if (taskKey === 'fetchCategory') {
            const CategoryList = await callSoapService(clientURL, 'HR_Get_LeaveCategories_List', '');


            await AsyncStorage.setItem('CategoryList', JSON.stringify(CategoryList));
        }

        if (taskKey === 'fetchManpowerSuppliers') {
            const ManSupplier_SQLQueryParameter = {
                SQLQuery: 'SELECT SUPPLIER_NAME from manpower_supplier_master'
            };

            const ManPowerSupplierList = await callSoapService(clientURL, 'DataModel_GetDataFrom_Query', ManSupplier_SQLQueryParameter);

            await AsyncStorage.setItem('ManPowerSupplierList', JSON.stringify(ManPowerSupplierList));
        }
        if (taskKey === 'fetchDesignationMaster') {
            const Designation_SQLQueryParameter = {
                SQLQuery: 'SELECT DESIGNATION from designation_master'
            };

            const DesignationMasterList = await callSoapService(clientURL, 'DataModel_GetDataFrom_Query', Designation_SQLQueryParameter);

            await AsyncStorage.setItem('DesignationMasterList', JSON.stringify(DesignationMasterList));
        }
        if (taskKey === 'fetchDeskArea') {
            const DeskAreaList = await callSoapService(clientURL, 'GetAllDeskAreaList', '');

            await AsyncStorage.setItem('DeskAreaList', JSON.stringify(DeskAreaList));
        }

        if (taskKey === 'fetchCuttingLine') {
            const CuttingLineList = await callSoapService(clientURL, 'GetCuttingLinesList', '');

            await AsyncStorage.setItem('CuttingLineList', JSON.stringify(CuttingLineList));
        }
    } catch (error) {
        console.error("❌ loadData error:", error);
    }
};

export default LoadData;