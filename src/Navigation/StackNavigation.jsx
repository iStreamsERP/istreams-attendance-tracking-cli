import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import LoginScreen from '../Screens/LoginScreen';
import DataLoadingScreen from '../Screens/DataLoadingScreen';
import HomeScreen from '../Screens/HomeScreen';
import HomeScreen1 from '../Screens/HomeScreen1';
import SelfCheckin from '../Screens/SelfCheckin';
import TeamCheckin from '../Screens/TeamCheckin';
import TeamCheckinEmployees from '../Screens/TeamCheckinEmployees';
import TeamCheckout from '../Screens/TeamCheckout';
import TeamCheckoutEmployees from '../Screens/TeamCheckoutEmployees';
import TeamCheckin_Manual from '../Screens/TeamCheckin_Manual';
import TeamCheckinEmployees_Manual from '../Screens/TeamCheckinEmployees_Manual';
import TeamCheckout_Manual from '../Screens/TeamCheckout_Manual';
import TeamCheckoutEmployees_Manual from '../Screens/TeamCheckoutEmployees_Manual';
import SwitchTeamCheckinScreen from '../Screens/SwitchTeamCheckinScreen';
import SwitchTeamCheckoutScreen from '../Screens/SwitchTeamCheckoutScreen';
import ProjectSelfCheckin from '../Screens/ProjectSelfCheckin';
import ProjectSelfCheckout from '../Screens/ProjectSelfCheckout';
import SelfCheckout from '../Screens/SelfCheckout';
import NewEmployeeAddScreen from '../Screens/NewEmployeeAddScreen';
import SwitchUpdateImageScreen from '../Screens/SwitchUpdateImageScreen';
import UpdateNonMatchedEmpScreen from '../Screens/UpdateNonMatchedEmpScreen';
import AddOfcLocation from '../Screens/AddOfcLocation';
import SwitchReportScreen from '../Screens/SwitchReportScreen';
import LeaveRequest from '../Screens/LeaveRequest';
import LoanRequest from '../Screens/LoanRequest';
import AttendancePermission from '../Screens/AttendancePermission';
import ShopfloorTracking from '../Screens/ShopfloorTracking';
import ShopfloorEmp from '../Screens/ShopfloorEmp';
import DPR from '../Screens/DPR';
import DPREmp from '../Screens/DPREmp';
import LocationRadiusDetector from '../Components/LocationRadiusDetector';
import SuccessAnimationScreen from '../Animations/SuccessAnimationScreen';
import FailureAnimationScreen from '../Animations/FailureAnimationScreen';
import EmployeeList from '../Components/EmployeeList';
import SampleScreen from '../Screens/SampleScreen';
import NotificationListScreen from '../Screens/NotificationListScreen';
import ChatScreen from '../Screens/ChatScreen';
import ChatDetailScreen from '../Screens/ChatDetailScreen';
import ProfileScreen from '../Screens/ProfileScreen';
import AddUserScreen from '../Screens/AddUserScreen';

const Stack = createNativeStackNavigator();

const StackNavigation = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="Home1" component={HomeScreen1} />
                <Stack.Screen name="SelfCheckin" component={SelfCheckin} />
                <Stack.Screen name="DataLoading" component={DataLoadingScreen} />
                <Stack.Screen name="TeamCheckin" component={TeamCheckin} />
                <Stack.Screen name="TeamCheckinEmployees" component={TeamCheckinEmployees} />
                <Stack.Screen name="TeamCheckout" component={TeamCheckout} />
                <Stack.Screen name="TeamCheckoutEmployees" component={TeamCheckoutEmployees} />
                <Stack.Screen name="TeamCheckin_Manual" component={TeamCheckin_Manual} />
                <Stack.Screen name="TeamCheckinEmployees_Manual" component={TeamCheckinEmployees_Manual} />
                <Stack.Screen name="TeamCheckout_Manual" component={TeamCheckout_Manual} />
                <Stack.Screen name="TeamCheckoutEmployees_Manual" component={TeamCheckoutEmployees_Manual} />
                <Stack.Screen name="SwitchTeamCheckinScreen" component={SwitchTeamCheckinScreen} />
                <Stack.Screen name="SwitchTeamCheckoutScreen" component={SwitchTeamCheckoutScreen} />
                <Stack.Screen name="ProjectSelfCheckin" component={ProjectSelfCheckin} />
                <Stack.Screen name="ProjectSelfCheckout" component={ProjectSelfCheckout} />
                <Stack.Screen name="SelfCheckout" component={SelfCheckout} />
                <Stack.Screen name="NewEmployeeAddScreen" component={NewEmployeeAddScreen} />
                <Stack.Screen name="SwitchUpdateImageScreen" component={SwitchUpdateImageScreen} />
                <Stack.Screen name="UpdateNonMatchedEmpScreen" component={UpdateNonMatchedEmpScreen} />
                <Stack.Screen name="SwitchReportScreen" component={SwitchReportScreen} />
                <Stack.Screen name="AddOfcLocation" component={AddOfcLocation} />
                <Stack.Screen name="EmployeeList" component={EmployeeList} />
                <Stack.Screen name="LeaveRequest" component={LeaveRequest} />
                <Stack.Screen name="LoanRequest" component={LoanRequest} />
                <Stack.Screen name="AttendancePermission" component={AttendancePermission} />
                <Stack.Screen name="ShopfloorTracking" component={ShopfloorTracking} />
                <Stack.Screen name="ShopfloorEmp" component={ShopfloorEmp} />
                <Stack.Screen name="DPR" component={DPR} />
                <Stack.Screen name="DPREmp" component={DPREmp} />
                <Stack.Screen name="LocationRadiusDetector" component={LocationRadiusDetector} />
                <Stack.Screen name="SampleScreen" component={SampleScreen} />
                <Stack.Screen name="NotificationListScreen" component={NotificationListScreen} />
                <Stack.Screen name="ChatScreen" component={ChatScreen} />
                <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
                <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
                <Stack.Screen name="AddUserScreen" component={AddUserScreen} />
                
                {/* Animation Screens */}
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
