import React, { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { GlobalStyles } from '../Styles/styles';
import { useTheme } from '../Context/ThemeContext';

const HomeHeader = ({ user }) => {
    const { theme, darkMode } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);
    const [avatarUri, setAvatarUri] = useState(user.avatar);

    const hour = new Date().getHours();
    const getGreeting = () => {
        if (hour < 6) return 'Hii, Night';
        if (hour < 12) return 'Hii, Morning';
        if (hour < 17) return 'Hii, Afternoon';
        if (hour < 21) return 'Hii, Evening';
        return 'Hii, Night';
    };

    const greeting = getGreeting();

    const headerGradientColors = theme.dark
        ? ['#141E30', '#243B55']   // Dark mode
        : ['#667eea', '#764ba2', '#f093fb']; // Light mode

    return (
        <LinearGradient
            colors={headerGradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerContainer}
        >
            {/* Floating orbs for visual interest */}
            <View style={styles.orbContainer}>
                <View style={[styles.orb, styles.orb1]} />
                <View style={[styles.orb, styles.orb2]} />
                <View style={[styles.orb, styles.orb3]} />
            </View>

            <View style={styles.contentWrapper}>
                <View style={styles.leftSection}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={
                                avatarUri
                                    ? { uri: avatarUri }
                                    : require("../../assets/images.png") // fallback image path
                            }
                            style={styles.avatar}
                        />
                        <View style={styles.avatarGlow} />
                    </View>

                    <View style={[globalStyles.flex_1, globalStyles.justifyContentCenter]}>
                        <Text style={[styles.greeting, globalStyles.body, { color: darkMode ? colors.text : colors.background }]}>{greeting}</Text>
                        <Text style={[globalStyles.title1, { color: darkMode ? colors.text : colors.background }, styles.username]}>{user.name}</Text>
                        <View style={styles.underline} />
                    </View>
                </View>

                {/* Status indicator */}
                <View style={styles.statusContainer}>
                    <View style={styles.statusDot} />
                    <Text style={globalStyles.subtitle_4}>Online</Text>
                </View>
            </View>
        </LinearGradient >
    );
};

export default HomeHeader;

const styles = StyleSheet.create({
    headerContainer: {
        position: 'relative',
        paddingHorizontal: 24,
        paddingTop: 50,
        paddingBottom: 32,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 10,
        overflow: 'hidden',
    },
    orbContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    orb: {
        position: 'absolute',
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    orb1: {
        width: 80,
        height: 80,
        top: -20,
        right: -20,
    },
    orb2: {
        width: 120,
        height: 120,
        bottom: -30,
        left: -40,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    orb3: {
        width: 60,
        height: 60,
        top: '50%',
        right: '20%',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
    contentWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 1,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 18,
    },
    avatar: {
        width: 72,
        height: 72,
        borderRadius: 36,
        borderWidth: 3,
        borderColor: 'rgba(255, 255, 255, 0.9)',
        zIndex: 2,
    },
    avatarGlow: {
        position: 'absolute',
        top: -4,
        left: -4,
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        zIndex: 1,
    },
    greeting: {
        color: 'rgba(255, 255, 255, 0.85)',
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
    },
    username: {
        marginBottom: 6,
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    underline: {
        width: 40,
        height: 3,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 2,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        paddingHorizontal: 6,
        paddingVertical: 6,
        borderRadius: 20,
        backdropFilter: 'blur(10px)',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4ade80',
        marginRight: 6,
        shadowColor: '#4ade80',
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.8,
        shadowRadius: 4,
        elevation: 4,
    },
});