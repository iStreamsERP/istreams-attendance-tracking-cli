import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'
import StackNavigation from './src/Navigation/StackNavigation'
import { AuthProvider } from './src/Context/AuthContext';
import { CheckinProvider } from './src/Context/CheckinContext';
import messaging from '@react-native-firebase/messaging';
import { Alert } from 'react-native';
import { getToken, NotificationListener, requestUserPermission } from './src/Utils/notificationUtils';

const App = () => {
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
    });

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
        <StackNavigation />
      </CheckinProvider>
    </AuthProvider>
  );
};

export default App

const styles = StyleSheet.create({})