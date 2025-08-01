import { messaging } from "../../firebaseConfig";
import {
    getToken as getFCMToken,
    onMessage,
    onNotificationOpenedApp,
    getInitialNotification,
    requestPermission,
} from "@react-native-firebase/messaging";
import notifee, { AndroidImportance } from '@notifee/react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";

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
            vapidKey: 'BLbr-X4Y5EE5Z89145TBqhsEZ_3qeln4yTwbPXff83P-XdrItx2OypVObqJNQgbgVIbSqrNAl3F184aflNizMlk',
        });
        return token;
    } catch (error) {
        console.log('Error getting FCM token:', error);
    }
};

// ---- DISPLAY NOTIFICATION USING NOTIFEE ----
export async function displayLocalNotification(title, body) {
    const channelId = await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        importance: AndroidImportance.HIGH,
    });

    await notifee.displayNotification({
        title,
        body,
        android: {
            channelId,
            pressAction: {
                id: 'default',
                launchActivity: 'default',
            },
            actions: [
                {
                    title: 'Reply',
                    pressAction: {
                        id: 'reply',
                    },
                },
                {
                    title: 'Dismiss',
                    pressAction: {
                        id: 'dismiss',
                    },
                }
            ]
        },
    });

    saveNotification({
        title,
        body,
        timestamp: Date.now(),
        source: 'local',
    });
}

// ---- LISTENERS FOR FCM & SHOW NOTIFEE NOTIFICATION ----
export const NotificationListener = () => {
    // Foreground FCM Messages
    onMessage(messaging, async (remoteMessage) => {
        console.log('Foreground FCM message:', remoteMessage);

        const title = remoteMessage.notification?.title ?? 'New Message';
        const body = remoteMessage.notification?.body ?? '';

        // Show Notifee notification
        await displayLocalNotification(title, body);
    });

    // App opened from background
    onNotificationOpenedApp(messaging, (remoteMessage) => {
        console.log('Notification opened app from background:', remoteMessage.notification);

        const title = remoteMessage.notification?.title ?? 'New Message';
        const body = remoteMessage.notification?.body ?? '';
        displayLocalNotification(title, body);
    });

    // App opened from quit
    getInitialNotification(messaging).then((remoteMessage) => {
        if (remoteMessage) {
            console.log('Notification opened app from quit:', remoteMessage.notification);

            const title = remoteMessage.notification?.title ?? 'New Message';
            const body = remoteMessage.notification?.body ?? '';
            displayLocalNotification(title, body);
        }
    });
};

export const saveNotification = async (notification) => {
    try {
        const existing = await AsyncStorage.getItem('notifications');
        const list = existing ? JSON.parse(existing) : [];
        list.unshift(notification); // add at start
        await AsyncStorage.setItem('notifications', JSON.stringify(list));
    } catch (error) {
        console.log('Error saving notification:', error);
    }
};
