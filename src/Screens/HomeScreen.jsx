import React, { useState, useEffect } from 'react';
import {
    View, Text, Image, StyleSheet, TouchableOpacity,
    BackHandler, Alert, Dimensions, ScrollView, Platform
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from 'react-native-paper';
//import HomeCarousel from '../Components/HomeCarousel';
import { GlobalStyles } from '../Styles/styles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome6Icon from 'react-native-vector-icons/FontAwesome6';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../Context/AuthContext';
import { useTheme } from '../Context/ThemeContext';
import HomeHeader from '../Components/HomeHeader';

const HomeScreen = () => {
    const navigation = useNavigation();
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);
    const { userData, logout } = useAuth();
    const [showPopup, setShowPopup] = useState(false);
    const insets = useSafeAreaInsets();

    // Orientation state
    const [isLandscape, setIsLandscape] = useState(Dimensions.get('window').width > Dimensions.get('window').height);

    useEffect(() => {
        const subscription = Dimensions.addEventListener('change', ({ window }) => {
            setIsLandscape(window.width > window.height);
        });
        return () => subscription?.remove();
    }, []);

    // Dynamic widths based on orientation
    const itemWidth3 = isLandscape ? Dimensions.get('window').width / 6 : Dimensions.get('window').width / 3.5;
    const itemWidth = isLandscape ? Dimensions.get('window').width / 4 : Dimensions.get('window').width / 2.8;

    const handleDPImageCLick = () => setShowPopup(!showPopup);

    const handleLogout = async () => {
        await AsyncStorage.clear();
        logout();
        navigation.replace('Login');
    };

    const handleTeamCheckin = () => navigation.navigate('LocationRadiusDetector', { returnTo: 'SwitchTeamCheckinScreen' });
    const handleTeamCheckout = () => navigation.navigate('LocationRadiusDetector', { returnTo: 'SwitchTeamCheckoutScreen' });
    const handleSelfCheckin = () => navigation.navigate('LocationRadiusDetector', { returnTo: 'SelfCheckin' });
    const handleSelfCheckout = () => navigation.navigate('LocationRadiusDetector', { returnTo: 'SelfCheckout' });
    const handleAddEmployee = () => navigation.navigate('NewEmployeeAddScreen');
    const handleChangeEmpImage = () => navigation.navigate('SwitchUpdateImageScreen');
    const handleShopfloorTracking = () => navigation.navigate('ShopfloorTracking');

    const actions1 = [
        { icon: 'qrcode-scan', label: 'Team\nCheck-in', onPress: handleTeamCheckin },
        { icon: 'account-group', label: 'Team\nCheck-out', onPress: handleTeamCheckout },
        { icon: 'account-arrow-left', label: 'Self\nCheck-in', onPress: handleSelfCheckin },
        { icon: 'account-arrow-right', label: 'Self\nCheck-out', onPress: handleSelfCheckout },
    ];

    const actions3 = [
        { icon: 'location-exit', label: 'Leave Request', onPress: () => navigation.navigate('LeaveRequest') },
        { icon: 'currency-usd', label: 'Loan Request', onPress: () => navigation.navigate('LoanRequest') },
        { icon: 'account-clock', label: 'Attendance Permission', onPress: () => navigation.navigate('AttendancePermission') },
        { icon: 'map-marker-path', label: 'Shopfloor Tracking', onPress: handleShopfloorTracking },
        { icon: 'progress-check', label: 'DPR', onPress: () => navigation.navigate('DPR') },
    ];

    const actions2 = [
        { label: 'Add New Employee', icon: 'user-plus', onPress: handleAddEmployee },
        { label: 'Update Employee Image', icon: 'images', onPress: handleChangeEmpImage },
        { label: 'Add Office Location', icon: 'door-open', onPress: () => navigation.navigate('AddOfcLocation') },
        { label: 'Reports', icon: 'chart-bar', onPress: () => navigation.navigate('Home1') },
    ];

    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
                Alert.alert('Exit App', 'Do you want to exit?', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Yes', onPress: () => BackHandler.exitApp() },
                ]);
                return true;
            };
            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => subscription.remove();
        }, [])
    );

    return (
        <View style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={[globalStyles.twoInputContainer1, globalStyles.my_5]}>
                <Image source={require('../../assets/logo_edited.png')} style={styles.logo} />
                <View style={[styles.iconRowContainer, globalStyles.twoInputContainer, { color: colors.card, }]}>
                    <TouchableOpacity style={[styles.titleContainer, { borderColor: colors.gray }]} onPress={handleDPImageCLick}>
                        <Text style={[globalStyles.subtitle_3, { width: 95, textAlign: 'center', color: colors.text }]} numberOfLines={1}>
                            {userData.companyName}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('NotificationListScreen')}
                        style={[globalStyles.iconContainer, { backgroundColor: colors.background }]}>
                        <Icon name='bell' size={24} color={colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('ChatScreen')}
                        style={[globalStyles.iconContainer, { backgroundColor: colors.background }]}>
                        <AntDesign name='message1' size={24} color={colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleDPImageCLick}>
                        <Image source={{ uri: `data:image/jpeg;base64,${userData.userAvatar}` }} style={globalStyles.iconContainer} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Popup */}
            {showPopup && (
                <View style={[styles.popup, { backgroundColor: colors.card }]}>
                    <Text style={[globalStyles.subtitle_3, globalStyles.txt_center, globalStyles.mb_5, { width: 170 }]} numberOfLines={2}>
                        {userData.companyName}
                    </Text>
                    <Text style={[globalStyles.subtitle_3, globalStyles.txt_center, globalStyles.mb_5]}>
                        Account Details
                    </Text>
                    <Button style={{ backgroundColor: colors.error }}
                        onPress={handleLogout}
                        theme={{ colors: { primary: 'white' } }}
                    >
                        Logout
                    </Button>
                </View>
            )}

            <HomeHeader user={
                { name: userData.userName, avatar: `data:image/jpeg;base64,${userData.userAvatar}` }} />
                
            {/* <HomeCarousel /> */}

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Attendance Capturing */}
                <View style={[styles.atteElementsContainer, { backgroundColor: colors.card }]}>
                    <Text style={[globalStyles.subtitle_1, { marginHorizontal: 16, marginBottom: 5 }]}>
                        Attendance Capturing
                    </Text>
                    <View style={globalStyles.twoInputContainer}>
                        {actions1.map((action, index) => (
                            <TouchableOpacity key={index} style={styles.action} onPress={action.onPress}>
                                <View style={styles.iconWrapper}>
                                    <Icon name={action.icon} size={30} color="#fff" />
                                </View>
                                <Text style={[globalStyles.subtitle_4, { textAlign: 'center' }]}>{action.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Request / Tracking */}
                <View style={[styles.atteElementsContainer3, { backgroundColor: colors.card }]}>
                    <Text style={[globalStyles.subtitle_1, { paddingLeft: 10, marginBottom: 5 }]}>
                        Request / Tracking
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {actions3.map((action, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.action3, { width: itemWidth3, backgroundColor: colors.card }]}
                                onPress={action.onPress}>
                                <View style={styles.iconWrapper3}>
                                    <Icon name={action.icon} size={28} color='#002D72' />
                                </View>
                                <Text style={[globalStyles.subtitle_3, { textAlign: 'center' }]}>{action.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Employee Management */}
                <View style={[styles.atteElementsContainer1, { backgroundColor: colors.card }]}>
                    <Text style={globalStyles.subtitle_1}>Employee Management</Text>
                    <View style={[globalStyles.twoInputContainer, { flexWrap: 'wrap' }]}>
                        {actions2.map((action2, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.action1, { width: itemWidth, backgroundColor: colors.card }]}
                                onPress={action2.onPress}>
                                <View style={styles.iconWrapper1}>
                                    <FontAwesome6Icon name={action2.icon} size={20} color="#fff" />
                                </View>
                                <Text style={[globalStyles.subtitle_3, { textAlign: 'center' }]}>{action2.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default HomeScreen;

const styles = StyleSheet.create({
    titleContainer: {
        borderWidth: 1,
        borderRadius: 10,
        height: 45,
        justifyContent: 'center'
    },
    iconRowContainer: {
        maxWidth: 220
    },
    logo: {
        width: 110,
        resizeMode: 'contain',
        height: 60
    },
    atteElementsContainer: {
        paddingVertical: 10,
        borderRadius: 16,
        marginVertical: 5
    },
    action: {
        alignItems: 'center',
        width: 80
    },
    iconWrapper: {
        backgroundColor: '#002D72',
        borderRadius: 16,
        padding: 12,
        marginBottom: 6
    },
    popup: {
        position: 'absolute', top: Platform.OS === 'ios' ? 70 : 60,
        right: Dimensions.get('window').width * 0.05,
        backgroundColor: 'white',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 20,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
        zIndex: 10,
    },
    atteElementsContainer1: {
        paddingTop: 10,
        paddingHorizontal: 10,
        borderRadius: 16,
        marginVertical: 5
    },
    action1: { alignItems: 'center', marginVertical: 5, backgroundColor: '#fff', paddingVertical: 8, paddingHorizontal: 8, borderRadius: 12, elevation: 3 },
    iconWrapper1: { backgroundColor: '#144f76', padding: 10, borderRadius: 39, marginBottom: 6 },
    atteElementsContainer3: { paddingVertical: 10, borderRadius: 16, marginVertical: 5 },
    action3: {
        height: 120, borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 2,
        marginHorizontal: 5, paddingHorizontal: 10, marginBottom: 5,
    },
    iconWrapper3: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        backgroundColor: '#E3F2FD'
    },
});
