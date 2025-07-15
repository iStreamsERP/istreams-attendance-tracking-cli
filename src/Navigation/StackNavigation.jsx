import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import LoginScreen from '../Screens/LoginScreen';
import DataLoadingScreen from '../Screens/DataLoadingScreen';
import HomeScreen from '../Screens/HomeScreen';
import SelfCheckin from '../Screens/SelfCheckin';
import TeamCheckin from '../Screens/TeamCheckin';
import TeamCheckinEmployees from '../Screens/TeamCheckinEmployees';
import TeamCheckout from '../Screens/TeamCheckout';
import TeamCheckoutEmployees from '../Screens/TeamCheckoutEmployees';
import ProjectSelfCheckin from '../Screens/ProjectSelfCheckin';
import SelfCheckout from '../Screens/SelfCheckout';
import NewEmployeeAddScreen from '../Screens/NewEmployeeAddScreen';
import SwitchUpdateImageScreen from '../Screens/SwitchUpdateImageScreen';
import UpdateNonMatchedEmpScreen from '../Screens/UpdateNonMatchedEmpScreen';
import AddOfcLocation from '../Screens/AddOfcLocation';
import SwitchReportScreen from '../Screens/SwitchReportScreen';
import LeaveRequest from '../Screens/LeaveRequest';
import ShopfloorTracking from '../Screens/ShopfloorTracking';
import ShopfloorEmp from '../Screens/ShopfloorEmp';
import DPR from '../Screens/DPR';
import DPREmp from '../Screens/DPREmp';
import LocationRadiusDetector from '../Components/LocationRadiusDetector';
import SuccessAnimationScreen from '../Animations/SuccessAnimationScreen';
import FailureAnimationScreen from '../Animations/FailureAnimationScreen';
import EmployeeList from '../Components/EmployeeList';
import SampleScreen from '../Screens/SampleScreen';

const Stack = createNativeStackNavigator();

const StackNavigation = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="SelfCheckin" component={SelfCheckin} />
                <Stack.Screen name="DataLoading" component={DataLoadingScreen} />
                <Stack.Screen name="TeamCheckin" component={TeamCheckin} />
                <Stack.Screen name="TeamCheckinEmployees" component={TeamCheckinEmployees} />
                <Stack.Screen name="TeamCheckout" component={TeamCheckout} />
                <Stack.Screen name="TeamCheckoutEmployees" component={TeamCheckoutEmployees} />
                <Stack.Screen name="ProjectSelfCheckin" component={ProjectSelfCheckin} />
                <Stack.Screen name="SelfCheckout" component={SelfCheckout} />
                <Stack.Screen name="NewEmployeeAddScreen" component={NewEmployeeAddScreen} />
                <Stack.Screen name="SwitchUpdateImageScreen" component={SwitchUpdateImageScreen} />
                <Stack.Screen name="UpdateNonMatchedEmpScreen" component={UpdateNonMatchedEmpScreen} />
                <Stack.Screen name="SwitchReportScreen" component={SwitchReportScreen} />
                <Stack.Screen name="AddOfcLocation" component={AddOfcLocation} />
                <Stack.Screen name="EmployeeList" component={EmployeeList} />
                <Stack.Screen name="LeaveRequest" component={LeaveRequest} />
                <Stack.Screen name="ShopfloorTracking" component={ShopfloorTracking} />
                <Stack.Screen name="ShopfloorEmp" component={ShopfloorEmp} />
                <Stack.Screen name="DPR" component={DPR} />
                <Stack.Screen name="DPREmp" component={DPREmp} />
                <Stack.Screen name="LocationRadiusDetector" component={LocationRadiusDetector} />
                <Stack.Screen name="SampleScreen" component={SampleScreen} />
                <Stack.Screen
                    name="SuccessAnimationScreen"
                    component={SuccessAnimationScreen}
                    options={{ 
                        presentation: 'transparentModal', 
                        animation: 'slide_from_bottom',
                    }}
                />
                <Stack.Screen
                    name="FailureAnimationScreen"
                    component={FailureAnimationScreen}
                    options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default StackNavigation;
