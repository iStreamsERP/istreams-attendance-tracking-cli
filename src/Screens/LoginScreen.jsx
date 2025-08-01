import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView, KeyboardAvoidingView, Platform, Image, Dimensions } from 'react-native';
import Video, { VideoRef } from 'react-native-video';
import { GlobalStyles } from '../Styles/styles';
import { TextInput, Button, Checkbox } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { loginBLL } from '../Logics/LoginBLL';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';
import { useAuth } from '../Context/AuthContext';
import { requestNotificationPermission, displayLocalNotification } from '../Utils/notificationUtils';
import { useTheme } from '../Context/ThemeContext';
import { colors } from '../Styles/colors';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
    const { login, userData } = useAuth();
    const { darkMode, theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);
    const insets = useSafeAreaInsets();
    const [usernameInput, setUsernameInput] = useState('');
    const [passwordInput, setPasswordInput] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);

    const VideoRef = useRef < VideoRef > (null);

    useEffect(() => {
        loadCredentials();
        requestNotificationPermission();
    }, []);

    const loadCredentials = async () => {
        try {
            const storedUsername = await AsyncStorage.getItem('username');
            const storedPassword = await AsyncStorage.getItem('password');
            if (storedUsername && storedPassword) {
                setUsernameInput(storedUsername);
                setPasswordInput(storedPassword);
                setRememberMe(true);
            }
        } catch (error) {
            console.error('Error loading credentials:', error);
        }
    };

    const handleSoapCall = async () => {
        try {
            setLoading(true);

            const username = usernameInput;
            const password = passwordInput;

            if (!username || !password) {
                alert('Enter Username and Password');
                return;
            }
            try {
                const response = await loginBLL(username, password, login);

                if (response === "Authetication passed") {
                    const value = await AsyncStorage.getItem('USE_MANUAL_CAPTURE');
                    console.log('USE_MANUAL_CAPTURE', value);
                    
                    if (value === null) {
                        await AsyncStorage.setItem('USE_MANUAL_CAPTURE', JSON.stringify(true));
                    }

                    if (rememberMe) {
                        await AsyncStorage.setItem('username', username);
                        await AsyncStorage.setItem('password', password);
                    }
                    else {
                        await AsyncStorage.removeItem('username');
                        await AsyncStorage.removeItem('password');
                    }
                    setLoading(false);

                    const title = '✓ Login Success';
                    const body = 'Continue using Attendance App';

                    displayLocalNotification(title, body);

                    const isFirstLogin = await AsyncStorage.getItem('isFirstLogin');
                    if (!isFirstLogin) {
                        await AsyncStorage.setItem('isFirstLogin', 'true');
                        navigation.navigate("DataLoading");
                    } else {
                        navigation.dispatch(
                            CommonActions.reset({
                                index: 0,
                                routes: [{ name: 'Home1' }],
                            })
                        );
                    }
                }
                else {
                    alert(response);
                }
            }
            catch (error) {
                console.error('SOAP Call Failed:', error);
                console.log(error);

            }
        }
        catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
        >
            <Video
                source={require('../../assets/video/login_bg.mp4')}
                style={StyleSheet.absoluteFill}
                resizeMode='none'
                repeat={true}
                muted={false}
                paused={false}
            />
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.innerContainer}>
                    <View style={{ marginVertical: 70 }}>
                        <Image
                            source={require('../../assets/logo_edited.png')}
                            style={styles.logo}
                        />
                    </View>

                    <View style={[styles.formContainer, { backgroundColor: colors.loginBackground, }]}>
                        <Text style={[globalStyles.title, { marginVertical: 10, textAlign: "center", color: colors.text }]}>Login</Text>

                        <TextInput
                            mode="outlined"
                            label="Username"
                            value={usernameInput}
                            theme={theme}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            onChangeText={setUsernameInput}
                            placeholder="Enter username"
                            style={[globalStyles.input, { marginBottom: 10 }]}
                        />

                        <TextInput
                            mode="outlined"
                            label="Password"
                            value={passwordInput}
                            theme={theme}
                            onChangeText={setPasswordInput}
                            autoCapitalize="none"
                            placeholder="Enter your password"
                            style={globalStyles.input}
                            secureTextEntry={!passwordVisible}
                            right={
                                <TextInput.Icon
                                    icon={passwordVisible ? "eye-off" : "eye"}
                                    onPress={() => setPasswordVisible(!passwordVisible)}
                                />
                            }
                        />

                        {/* Remember Me and Forgot Password */}
                        <View style={styles.checkboxContainer}>
                            <View style={styles.checkBoxSection}>
                                <Checkbox
                                    status={rememberMe ? "checked" : "unchecked"}
                                    color={colors.primary}
                                    onPress={() => setRememberMe(!rememberMe)}
                                />
                                <Text style={[globalStyles.subtitle_2, { color: colors.text }]}>Remember me</Text>
                            </View>
                            <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword1")}>
                                <Text style={[globalStyles.subtitle_3, { color: colors.text }]}>Forgot Password</Text>
                            </TouchableOpacity>
                        </View>

                        <Button
                            mode="contained"
                            loading={loading}
                            onPress={handleSoapCall}
                            style={{ backgroundColor: colors.primary }}
                            disabled={loading}
                        >
                            Login
                        </Button>

                        {/* Sign Up Text */}
                        <View style={styles.signUpTextContainer}>
                            <Text style={[globalStyles.content, { color: colors.text }]}>
                                Don't have an account?
                            </Text>
                            <TouchableOpacity onPress={
                                () => navigation.navigate("SignUpScreen")}>
                                <Text style={[globalStyles.subtitle, { color: colors.primary }]}>Sign Up</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "transparent",
    },
    scrollContainer: {
        flexGrow: 1,
    },
    innerContainer: {
        flex: 1,
        justifyContent: "space-between",
    },
    formContainer: {
        padding: 20,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
    },
    logo: {
        width: width * 0.4,
        height: height * 0.15,
        resizeMode: 'contain',
        alignSelf: 'center',
    },
    checkboxContainer: {
        marginBottom: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    checkBoxSection: {
        flexDirection: "row",
        alignItems: "center",
    },
    signUpTextContainer: {
        marginTop: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
    },
});

export default LoginScreen;