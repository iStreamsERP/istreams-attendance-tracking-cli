import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    Image,
    TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../Context/ThemeContext';
import { GlobalStyles } from '../Styles/styles';
import Header from '../Components/Header';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const NotificationListScreen = () => {
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);
    const [notifications, setNotifications] = useState([]);

    const loadNotifications = async () => {
        const data = await AsyncStorage.getItem('notifications');
        if (data) setNotifications(JSON.parse(data));
    };

    const clearNotifications = async () => {
        try {
            await AsyncStorage.removeItem('notifications');
            setNotifications([]);
            console.log('Notifications cleared');
        } catch (error) {
            console.error('Error clearing notifications:', error);
        }
    };

    useEffect(() => {
        const interval = setInterval(loadNotifications, 3000); // Polling
        loadNotifications();
        return () => clearInterval(interval);
    }, []);

    const renderItem = ({ item }) => (
        <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.iconContainer}>
                {item.source === 'firebase' ? (
                    <Image
                        source={require('../../assets/FirebaseLogo_Full.png')}
                        style={styles.icon}
                    />
                ) : (
                    <Image
                        source={require('../../assets/bell.png')}
                        style={styles.icon}
                    />
                )}
            </View>
            <View style={styles.textContainer}>
                <Text style={globalStyles.subtitle}>{item.title}</Text>
                <Text style={globalStyles.subtitle_3}>{item.body}</Text>
                <Text style={globalStyles.small_text}>
                    {new Date(item.timestamp).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                    })}{' '}
                    at{' '}
                    {new Date(item.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </Text>
            </View>
            <View style={styles.dot} />
        </View>
    );

    return (
        <View style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>
            <Header title="Notifications" />
            <TouchableOpacity onPress={clearNotifications} style={[globalStyles.camButtonContainer, globalStyles.mx_10]}>
                <Text style={styles.clearBtn}>Clear All</Text>
            </TouchableOpacity>
            <FlatList
                data={notifications}
                keyExtractor={(_, i) => i.toString()}
                renderItem={renderItem}
                contentContainerStyle={{ paddingVertical: 10 }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    clearBtn: {
        fontSize: 14,
        color: '#007AFF',
    },

    card: {
        flexDirection: 'row',
        padding: 8,
        marginBottom: 5,
        
        borderRadius: 12,
        alignItems: 'flex-start',
    },
    iconContainer: {
        marginRight: 12,
    },
    icon: {
        width: 40,
        height: 40,
        borderRadius: 8,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontWeight: '700',
        fontSize: 15,
        marginBottom: 4,
        color: '#1a1a1a',
    },
    body: {
        fontSize: 13,
        color: '#333',
        marginBottom: 6,
    },
    time: {
        fontSize: 11,
        color: '#888',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#007AFF',
        alignSelf: 'center',
        marginLeft: 8,
    },
});


export default NotificationListScreen;
