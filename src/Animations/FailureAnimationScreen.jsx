import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Animated } from 'react-native';
import LottieView from 'lottie-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Button } from 'react-native-paper';
import { useTheme } from '../Context/ThemeContext';

export default function FailureAnimationScreen() {
    const hasNavigated = useRef(false);
    const navigation = useNavigation();
    const route = useRoute();
    const { theme } = useTheme();
    const colors = theme.colors;
    const [countdown, setCountdown] = useState(5);

    const { message, details, returnTo } = route.params;

    const handleSkip = () => {
        if (hasNavigated.current) return;
        hasNavigated.current = true;
        navigation.replace(returnTo);
    };

    const handleUpdateEmployee = () => {
        if (hasNavigated.current) return;
        hasNavigated.current = true;
        navigation.navigate('NewEmployeeAddScreen');
    };

    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();
    }, []);

    useEffect(() => {
        if (countdown === 0) {
            handleSkip();
            return;
        }
        const timer = setTimeout(() => {
            setCountdown(prev => prev - 1);
        }, 1000);
        return () => clearTimeout(timer);
    }, [countdown]);

    return (
        <View style={styles.overlay}>
            <Animated.View style={[styles.modal, { opacity: fadeAnim, backgroundColor: colors.card }]}>
                <LottieView
                    source={require('../../assets/animations/notFound_animation.json')}
                    autoPlay
                    loop={false}
                    style={styles.animation}
                />
                <Text style={styles.message}>{message}</Text>
                <Text style={styles.name}>{details}</Text>

                <Button style={{ marginTop: 20 }} mode="contained" onPress={handleSkip} theme={{ colors: { primary: '#6c757d' } }}>
                    Skip to Next Employee {countdown > 0 ? `(${countdown})` : ''}
                </Button>

                <View style={styles.container}>
                    <View style={styles.line} />
                    <Text style={styles.text}>or</Text>
                    <View style={styles.line} />
                </View>

                <Button mode="contained" onPress={handleUpdateEmployee} theme={{ colors: { primary: '#007bff' } }}>
                    Update Employee Information
                </Button>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        borderRadius: 20,
        padding: 25,
        width: '80%',
        alignItems: 'center',
        elevation: 10,
    },
    animation: {
        width: 150,
        height: 150,
    },
    message: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'red',
        textAlign: 'center',
        marginTop: 10,
    },
    name: {
        fontSize: 14,
        marginTop: 15,
        textAlign: 'center',
        color: '#333',
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: '#ccc',
    },
    text: {
        marginHorizontal: 10,
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
});
