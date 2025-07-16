import { messaging } from "../../firebaseConfig";
import {
    getToken as getFCMToken, onMessage,
    onBackgroundMessage,
    getInitialNotification,
    onNotificationOpenedApp,
    requestPermission,
    isSupported,
} from "@react-native-firebase/messaging";
import notifee, { AndroidImportance } from '@notifee/react-native';

export async function requestUserPermission() {
    try {
        const permission = await requestPermission(messaging);
        if (permission === 'granted') {
            console.log('User granted permission');
        } else {
            console.log('User declined or has provisional permission');
        }
    } catch (e) {
        console.log('Request permission error:', e);
    }
}


export async function requestNotificationPermission() {
    const settings = await notifee.requestPermission();

    if (settings.authorizationStatus >= 1) {
        console.log('✅ Notification permission granted.');
    } else {
        console.warn('🚫 Notification permission denied.');
    }
}

export const getToken = async () => {
    try {
        const token = await getFCMToken(messaging, {
            vapidKey: 'BLbr-X4Y5EE5Z89145TBqhsEZ_3qeln4yTwbPXff83P-XdrItx2OypVObqJNQgbgVIbSqrNAl3F184aflNizMlk', // Optional, only needed on web
        });
        console.log('FCM Token:', token);
        return token;
    } catch (error) {
        console.log('Error getting FCM token:', error);
    }
};

export const NotificationListener = () => {
    // Foreground messages
    onMessage(messaging, remoteMessage => {
        console.log('Foreground FCM message:', remoteMessage);
    });

    // Background & quit state — optional, but RN usually handles this via linking or navigation
    onNotificationOpenedApp(messaging, remoteMessage => {
        console.log(
            'Notification caused app to open from background:',
            remoteMessage.notification,
        );
    });

    getInitialNotification(messaging).then(remoteMessage => {
        if (remoteMessage) {
            console.log(
                'Notification caused app to open from quit state:',
                remoteMessage.notification,
            );
        }
    });
};

export async function displayLocalNotification(title, body) {
    // Create a channel (Android only)
    const channelId = await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        importance: AndroidImportance.HIGH,
    });

    // Display a notification
    await notifee.displayNotification({
        title: title,
        body: body,
        android: {
            channelId,
            pressAction: {
                id: 'default',
            },
        },
    });
}