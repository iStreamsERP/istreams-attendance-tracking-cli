import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, BackHandler, Alert, Dimensions, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from 'react-native-paper';
import HomeCarousel from '../Components/HomeCarousel';
import { GlobalStyles } from '../Styles/styles';
import IonIcons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import FontAwesome6Icon from 'react-native-vector-icons/FontAwesome6';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../Context/AuthContext';
import SelfCheckinPopup from '../Modal/SelfCheckinPopup';

const HomeScreen = () => {
    const navigation = useNavigation();
    const { userData, logout } = useAuth();
    const [showPopup, setShowPopup] = useState(false);
    const insets = useSafeAreaInsets();
    const [showSelfCheckinPopup, setShowSelfCheckinPopup] = useState(false);

    const handleDPImageCLick = () => {
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

    const handleTeamCheckin = () => {
        navigation.navigate('TeamCheckin');
    };

    const handleTeamCheckout = () => {
        navigation.navigate('TeamCheckout');
    };

    const handleSelfCheckin = () => {
        //navigation.navigate('SelfCheckin');
        setShowSelfCheckinPopup(true);
    };

    const handleSelfCheckout = () => {
        navigation.navigate('SelfCheckout');
    };

    const handleAddEmployee = () => {
        navigation.navigate('NewEmployeeAddScreen');
    };

    const handleViewAttendance = () => {
        navigation.navigate('ViewAttendance');
    };

    const handleChangeEmpImage = () => {
        navigation.navigate('SwitchUpdateImageScreen');
    };

    const handleSelfCheckinSelection = (option) => {
        if (option.type === 'office') {
            navigation.navigate('SelfCheckin', { selectedLocation: option.data });
        } else if (option === 'project') {
            navigation.navigate('ProjectSelfCheckin');
        }
    };

    const handleShopfloorTracking = () => {
        navigation.navigate('ShopfloorTracking');
    };

    const actions1 = [
        { icon: 'qrcode-scan', label: 'Team\nCheck-in', onPress: handleTeamCheckin },
        { icon: 'account-group', label: 'Team\nCheck-out', onPress: handleTeamCheckout },
        { icon: 'account-arrow-left', label: 'Self\nCheck-in', onPress: handleSelfCheckin },
        { icon: 'account-arrow-right', label: 'Self\nCheck-out', onPress: handleSelfCheckout },
    ];

    const actions2 = [
        { label: 'Add New Employee', icon: 'user-plus', onPress: handleAddEmployee },
        { label: 'Update Employee Image', icon: 'images', onPress: handleChangeEmpImage },
        { label: 'View Attendance', icon: 'users-viewfinder', onPress: handleViewAttendance },
        { label: 'Reports', icon: 'chart-bar', onPress: () => { navigation.navigate('SwitchReportScreen') } },
        { label: 'Add Office Location', icon: 'door-open', onPress: () => { navigation.navigate('AddOfcLocation') } },
        { label: 'Leave Request', icon: 'person-walking-arrow-right', onPress: () => { navigation.navigate('LeaveRequest') } },
        { label: 'Shopfloor Tracking', icon: 'chart-bar', onPress: handleShopfloorTracking },
        { label: 'DPR', icon: 'chart-bar', onPress: () => { navigation.navigate('DPR') } },
        { label: 'DPR', icon: 'chart-bar', onPress: () => { navigation.navigate('DPR') } },
    ];

    const numColumns = 3;
    const itemWidth = Dimensions.get('window').width / numColumns - 30;

    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
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

            const subscription = BackHandler.addEventListener(
                'hardwareBackPress',
                onBackPress
            );

            return () => {
                subscription.remove(); // ✅ the correct way
            };
        }, [])
    );

    return (
        <View style={[GlobalStyles.pageContainer, { paddingTop: insets.top }]}>
            <View style={styles.row1Container}>
                <Image
                    source={require('../../assets/logo_edited.png')}
                    style={styles.logo}
                />

                <View style={styles.iconRowContainer}>
                    <TouchableOpacity style={styles.titleContainer} onPress={handleDPImageCLick}>
                        <Text style={[GlobalStyles.subtitle_3, { width: 100, textAlign: 'center' }]}
                            numberOfLines={1}>{userData.companyName}</Text>
                    </TouchableOpacity>

                    <View style={styles.iconContainer}>
                        <IonIcons name="settings" size={20} color={'black'} />
                    </View>
                    <TouchableOpacity onPress={handleDPImageCLick}>
                        <Image
                            source={{ uri: `data:image/jpeg;base64,${userData.userAvatar}` }}
                            style={styles.iconContainer}
                        />
                    </TouchableOpacity>
                </View>
            </View>
            {/* Popup for Account Details and Logout */}
            {showPopup && (
                <View style={styles.popup}>
                    <Text style={[GlobalStyles.subtitle_3, { marginBottom: 5, textAlign: 'center', width: 170 }]} numberOfLines={2}>{userData.companyName}</Text>
                    <Text style={[GlobalStyles.subtitle_3, { marginBottom: 5, textAlign: 'center' }]}>Account Details</Text>
                    <Button style={styles.btnlogout} title="Logout" onPress={handleLogout} theme={{ colors: { primary: 'white' } }}>Logout</Button>
                </View>
            )}
            <HomeCarousel />

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.atteElementsContainer}>
                    <Text style={[GlobalStyles.title1, { marginHorizontal: 16, marginBottom: 5 }]}>Attendance Capturing</Text>
                    <View style={styles.container}>
                        {actions1.map((action, index) => (
                            <TouchableOpacity key={index} style={styles.action} onPress={action.onPress}>
                                <View style={styles.iconWrapper}>
                                    <Icon name={action.icon} size={30} color="#fff" />
                                </View>
                                <Text style={[GlobalStyles.subtitle_4, { textAlign: 'center' }]}>{action.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.atteElementsContainer1}>
                    <Text style={GlobalStyles.title1}>
                        Employee Management
                    </Text>
                    <View style={styles.container1}>
                        {actions2.map((action2, index) => (
                            <TouchableOpacity key={index} style={[styles.action1, { width: itemWidth }]} onPress={action2.onPress}>
                                <View style={styles.iconWrapper1}>
                                    <FontAwesome6Icon name={action2.icon} size={20} color="#fff" />
                                </View>
                                <Text style={[GlobalStyles.subtitle_3, { textAlign: 'center' }]}>{action2.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Popup for Account Details and Logout */}
                {showSelfCheckinPopup && (
                    <SelfCheckinPopup visible={showSelfCheckinPopup} onClose={() => setShowSelfCheckinPopup(false)}
                        onSelectOption={handleSelfCheckinSelection} />
                )}
            </ScrollView>
        </View>
    );
};

export default HomeScreen;

const styles = StyleSheet.create({
    row1Container: {
        marginVertical: 5,
        flexDirection: 'row',
        alignItems: "center",
        justifyContent: 'space-between'
    },
    titleContainer: {
        borderColor: '#002D72',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 10,
        height: 45,
        justifyContent: 'center',
        backgroundColor: '#f0f8ff',
    },
    iconRowContainer: {
        width: 220,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    logo: {
        width: 120,
        resizeMode: 'contain',
        height: 60
    },
    iconContainer: {
        height: 45,
        width: 45,
        borderRadius: 25,
        backgroundColor: '#cbcdcc',
        alignItems: 'center',
        justifyContent: 'center'
    },
    atteElementsContainer: {
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderRadius: 16,
        marginVertical: 10,
    },
    container: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    action: {
        alignItems: 'center',
        width: 80,
    },
    iconWrapper: {
        backgroundColor: '#002D72',
        borderRadius: 16,
        padding: 12,
        marginBottom: 6,
    },
    popup: {
        position: 'absolute',
        top: 65,
        right: 10, // ✅ replace left/transform combo with a fixed right value
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
    btnlogout: {
        backgroundColor: 'red',
    },
    atteElementsContainer1: {
        paddingVertical: 10,
        paddingHorizontal: 10,
        backgroundColor: '#f0f8ff',
        borderRadius: 16,
    },
    container1: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    action1: {
        alignItems: 'center',
        marginVertical: 5,
        backgroundColor: '#fff',
        paddingVertical: 8,
        paddingHorizontal: 8,
        borderRadius: 12,
        elevation: 3,
        flexBasis: '32%',
    },
    iconWrapper1: {
        backgroundColor: '#144f76',
        padding: 10,
        borderRadius: 39,
        marginBottom: 6,
    },
});
