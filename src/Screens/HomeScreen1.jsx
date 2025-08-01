import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, BackHandler, Alert, Dimensions, ScrollView, Platform } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button, Switch } from 'react-native-paper';
import { GlobalStyles } from '../Styles/styles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import ModuleCard from '../Components/ModuleCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../Context/AuthContext';
import HomeHeader from '../Components/HomeHeader';
import { useTheme } from '../Context/ThemeContext';
import { colors } from '../Styles/colors';

const { width, height } = Dimensions.get('window');

const HomeScreen1 = () => {
    const navigation = useNavigation();
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);
    const { userData, logout } = useAuth();
    const [showPopup, setShowPopup] = useState(false);
    const insets = useSafeAreaInsets();
    const [selectedModule, setSelectedModule] = useState(null);

    const [avatarUri, setAvatarUri] = useState(userData?.userAvatar ? `data:image/jpeg;base64,${userData.userAvatar}` : null);

    const handleDPImageCLick = () => {
        navigation.navigate('ProfileScreen');
    };

    const handlePopupCLick = () => {
        setShowPopup(!showPopup);
    };

    const handleLogout = async () => {
        try {
            await AsyncStorage.clear();
            logout();
            navigation.replace('Login');
        } catch (error) {
            console.error('Error clearing AsyncStorage:', error);
        }
    };

    // === Action Handlers ===
    const handleTeamCheckin = () => navigation.navigate('LocationRadiusDetector', { returnTo: 'SwitchTeamCheckinScreen' });
    const handleTeamCheckout = () => navigation.navigate('LocationRadiusDetector', { returnTo: 'SwitchTeamCheckoutScreen' });
    const handleSelfCheckin = () => navigation.navigate('LocationRadiusDetector', { returnTo: 'SelfCheckin' });
    const handleSelfCheckout = () => navigation.navigate('LocationRadiusDetector', { returnTo: 'SelfCheckout' });
    const handleAddEmployee = () => navigation.navigate('NewEmployeeAddScreen');
    const handleChangeEmpImage = () => navigation.navigate('SwitchUpdateImageScreen');
    const handleShopfloorTracking = () => navigation.navigate('ShopfloorTracking');

    const modules = [
        {
            image: require('../../assets/modules/Attendance_capturing.jpg'),
            title: 'Attendance Capturing',
            subtitle: '(Self-Checkin, Checkout, Team-Checkin, Checkout)',
            submodules: [
                {
                    image: require('../../assets/modules/self_checkin.jpg'),
                    title: 'Self Check-in',
                    onPress: handleSelfCheckin,
                },
                {
                    image: require('../../assets/modules/self-checkout.jpg'),
                    title: 'Self Check-out',
                    onPress: handleSelfCheckout,
                },
                {
                    image: require('../../assets/modules/team_checkin.jpg'),
                    title: 'Team Check-in',
                    onPress: handleTeamCheckin,
                },
                {
                    image: require('../../assets/modules/team_checkout.jpg'),
                    title: 'Team Check-out',
                    onPress: handleTeamCheckout,
                },
            ],
        },
        {
            image: require('../../assets/modules/tracking.jpg'),
            title: 'Requests',
            subtitle: '(Leave, Loan, Late Permission)',
            submodules: [
                {
                    image: require('../../assets/modules/leave_request.jpg'),
                    title: 'Leave Request',
                    onPress: () => navigation.navigate('LeaveRequest'),
                },
                {
                    image: require('../../assets/modules/loan_request.jpg'),
                    title: 'Loan Request',
                    onPress: () => navigation.navigate('LoanRequest'),
                },
                {
                    image: require('../../assets/modules/late.jpg'),
                    title: 'Attendance Permission',
                    onPress: () => navigation.navigate('AttendancePermission'),
                },
            ],
        },
        {
            image: require('../../assets/modules/emp_management.jpg'),
            title: 'Employee Management',
            subtitle: '(Add, Update, Delete)',
            submodules: [
                {
                    image: require('../../assets/modules/add_emp.jpg'),
                    title: 'Add Employee',
                    onPress: handleAddEmployee,
                },
                {
                    image: require('../../assets/modules/update_emp.jpg'),
                    title: 'Update Employee Image',
                    onPress: handleChangeEmpImage,
                },
            ],
        },
        {
            image: require('../../assets/modules/request.jpg'),
            title: 'Progress Tracking',
            subtitle: '(Shopfloor Tracking, Site DPR)',
            submodules: [
                {
                    image: require('../../assets/modules/shopfloor.jpg'),
                    title: 'Shopfloor Tracking',
                    onPress: handleShopfloorTracking,
                },
                {
                    image: require('../../assets/modules/dpr.jpg'),
                    title: 'DPR',
                    onPress: () => navigation.navigate('DPR'),
                },
            ],
        },
        {
            image: require('../../assets/modules/others.jpg'),
            title: 'Others',
            subtitle: 'Add Location',
            submodules: [
                {
                    image: require('../../assets/modules/add-location.jpg'),
                    title: 'Add Office / Project Location',
                    onPress: () => navigation.navigate('AddOfcLocation'),
                },
            ],
        },

    ];


    const handleModuleClick = (module) => {
        setSelectedModule(module);
    };

    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
                if (selectedModule) {
                    setSelectedModule(null);
                    return true; // prevent exit
                }
                Alert.alert(
                    'Exit App',
                    'Do you want to exit?',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Yes', onPress: () => BackHandler.exitApp() },
                    ]
                );
                return true;
            };
            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => subscription.remove();
        }, [selectedModule])
    );

    return (
        <View style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>
            {/* === Top Bar === */}
            <View style={styles.row1Container}>
                <Image source={require('../../assets/logo_edited.png')} style={styles.logo} />
                <View style={[styles.iconRowContainer, { color: colors.card }]}>
                    <TouchableOpacity style={styles.titleContainer} onPress={handlePopupCLick}>
                        <Text style={[globalStyles.subtitle_3, { width: 95, textAlign: 'center', color: colors.text }]} numberOfLines={1}>
                            {userData.companyName}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('NotificationListScreen')} style={[globalStyles.iconContainer, { backgroundColor: colors.background }]}>
                        <Icon name='bell' size={24} color={colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('ChatScreen')} style={[globalStyles.iconContainer, { backgroundColor: colors.background }]}>
                        <AntDesign name='message1' size={24} color={colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleDPImageCLick}>
                        <Image
                            source={
                                avatarUri
                                    ? { uri: avatarUri }
                                    : require("../../assets/images.png") // fallback image path
                            }
                            style={globalStyles.iconContainer}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* === Popup for Account === */}
            {showPopup && (
                <View style={[styles.popup, { backgroundColor: colors.card }]}>
                    <Text style={[globalStyles.subtitle_3, { marginBottom: 5, textAlign: 'center', width: 170 }]} numberOfLines={2}>
                        {userData.companyName}
                    </Text>

                    <Text style={[globalStyles.subtitle_3, { marginBottom: 5, textAlign: 'center' }]}>
                        Account Details
                    </Text>

                    <Button style={styles.btnlogout} onPress={handleLogout} theme={{ colors: { primary: 'white' } }}>
                        Logout
                    </Button>
                </View>
            )}

            <HomeHeader user={{ name: userData.userName, avatar: avatarUri }} />

            {/* === Modules & Submodules === */}
            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                {!selectedModule ? (
                    modules.map((m, index) => (
                        <ModuleCard key={index} {...m} onPress={() => handleModuleClick(m)} />
                    ))
                ) : (
                    <>
                        <TouchableOpacity onPress={() => setSelectedModule(null)} style={{ marginBottom: 20 }}>
                            <Text style={[globalStyles.subtitle, { color: colors.primary }]}>← Back</Text>
                        </TouchableOpacity>
                        {selectedModule.submodules.map((sm, index) => (
                            <ModuleCard key={index} {...sm} />
                        ))}
                    </>
                )}
            </ScrollView>
        </View>
    );
};

export default HomeScreen1;

const styles = StyleSheet.create({
    row1Container: {
        marginVertical: 5,
        flexDirection: 'row',
        alignItems: "center",
        justifyContent: 'space-between'
    },
    titleContainer: {
        borderColor: colors.gray,
        borderWidth: 1,
        borderRadius: 10,
        height: 45,
        justifyContent: 'center',
        // Dynamically adjust width based on screen width
        width: width > 768 ? 180 : 95  // Tablet vs Mobile
    },
    iconRowContainer: {
        maxWidth: width > 768 ? 320 : 220,  // Give more space on tablet
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    logo: {
        width: width > 768 ? 150 : 110,
        resizeMode: 'contain',
        height: width > 768 ? 80 : 60,
    },
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 5
    },
    popup: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 70 : 60,
        right: width * 0.05,
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 20,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
        zIndex: 10,
    },
    btnlogout: {
        backgroundColor: 'red',
    },
});
