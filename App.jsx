import { StyleSheet, Alert } from 'react-native'
import React, { useEffect } from 'react'
import StackNavigation from './src/Navigation/StackNavigation'
import { AuthProvider } from './src/Context/AuthContext';
import { CheckinProvider } from './src/Context/CheckinContext';
import { ThemeProvider } from './src/Context/ThemeContext';
import { messaging } from './firebaseConfig';
import {
  requestUserPermission,
  NotificationListener,
  getToken
} from './src/Utils/notificationUtils';
import { useColorScheme } from 'react-native';

const App = () => {
  useEffect(() => {
    const unsubscribe = messaging && messaging.onMessage
      ? messaging.onMessage(remoteMessage => {
        Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
      })
      : () => { };

    return unsubscribe;
  }, []);

  useEffect(() => {
    requestUserPermission();
    NotificationListener();
    getToken();
  }, []);

  return (
    <AuthProvider>
      <CheckinProvider>
        <ThemeProvider>
        <StackNavigation />
        </ThemeProvider>
      </CheckinProvider>
    </AuthProvider>
  );
};

export default App

const styles = StyleSheet.create({})