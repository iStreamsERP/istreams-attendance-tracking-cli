import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, ImageBackground, TouchableOpacity, ScrollView, Image, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../Context/ThemeContext';
import { GlobalStyles } from '../Styles/styles';
import { useAuth } from '../Context/AuthContext';
import { Switch, Button, Card } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import * as Progress from 'react-native-progress';

const { width, height } = Dimensions.get('window');

const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const { userData, logout } = useAuth();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const colors = theme.colors;
  const globalStyles = GlobalStyles(colors);

  const [useNativeCamera, setUseNativeCamera] = useState(true);
  const [showCameraSettings, setShowCameraSettings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const loadPreference = async () => {
      const value = await AsyncStorage.getItem('USE_MANUAL_CAPTURE');

      if (value === null) {
        await AsyncStorage.setItem('USE_MANUAL_CAPTURE', JSON.stringify(true));
      }

      if (value !== null) {
        setUseNativeCamera(JSON.parse(value));
      }
    };
    loadPreference();
  }, []);

  const toggleCaptureMode = async () => {
    const newValue = !useNativeCamera;

    setUseNativeCamera(newValue);
    await AsyncStorage.setItem('USE_MANUAL_CAPTURE', JSON.stringify(newValue));
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

  const syncAPI = async () => {
    setLoading(true);
    setProgress(0);

    let startTime = Date.now();
    let progressInterval = setInterval(() => {
      // Elapsed time (e.g., max 5s for full bar)
      let elapsed = Date.now() - startTime;
      let percentage = Math.min(elapsed / 5000, 0.95); // max 95% until API returns
      setProgress(percentage);
    }, 100);

    try {
      const response = await fetch(
        `http://103.168.19.35:8070/api/EncodeNpy/do-connection?UserName=${userData.userEmail}`,
        { method: 'GET' }
      );

      // When API response comes
      clearInterval(progressInterval);
      setProgress(1); // instantly complete
    } catch (error) {
      console.error('Sync Error: ', error);
      clearInterval(progressInterval);
    } finally {
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 500);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={[globalStyles.flex_1, { paddingTop: insets.top }]}>
        <ImageBackground
          source={require('../../assets/profile_bg.jpg')}
          style={[globalStyles.pageContainer, { paddingHorizontal: 0 }]}
          resizeMode="cover"
        >
          <View style={globalStyles.flex_1}>
            {/* Header */}
            <View style={[styles.headerContainer, globalStyles.twoInputContainer1]}>
              <Text style={[globalStyles.title1 ,{ color: '#fff' }]}>Profile</Text>
              <View>
                <LinearGradient
                  colors={['#6a11cb', '#2575fc']}
                  style={styles.companyContainer}
                >
                  <Icon name="briefcase" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={[globalStyles.subtitle, globalStyles.txt_center, { color: '#fff' }]}>{userData.companyName}</Text>
                </LinearGradient>
              </View>
            </View>

            {/* Profile Info */}
            <View style={[globalStyles.twoInputContainer1, globalStyles.my_10]}>
              <Image style={styles.userImg} source={{ uri: `data:image/jpeg;base64,${userData.userAvatar}` }} />
              <View style={globalStyles.flex_1}>
                <Text style={[globalStyles.title1, { color: '#fff' }]}>{userData.userName}</Text>
                <Text style={[globalStyles.body, { color: '#fff' }]}>{userData.userEmail}</Text>
              </View>
            </View>

            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
              <View style={[styles.formContainer, globalStyles.flex_1, { backgroundColor: colors.card }]}>
                {/* Top content */}
                <View>
                  {/* Settings */}
                  <View>
                    <Text style={globalStyles.subtitle}>Account Settings</Text>
                    <SettingsItem icon="user" label="Personal Information" lastIcon={'chevron-down'} />
                    <SettingsItem icon="lock" label="Password & Security" lastIcon={'chevron-down'} />
                    <SettingsItem icon="camera" label="Camera Settings" lastIcon={showCameraSettings ? 'chevron-up' : 'chevron-down'}
                      onPress={() => setShowCameraSettings(!showCameraSettings)} />

                    {/* Expanded Camera Settings */}
                    {showCameraSettings && (
                      <View>
                        <View style={[globalStyles.twoInputContainer1, globalStyles.my_10]}>
                          <Text style={globalStyles.subtitle_1}>Use Native Camera</Text>
                          <Switch value={useNativeCamera} onValueChange={toggleCaptureMode} theme={theme} />
                        </View>

                        <View style={{ borderBottomWidth: 1, borderColor: '#eee' }} />

                        {/* Sync Button */}
                        <TouchableOpacity
                          style={globalStyles.my_10}
                          onPress={syncAPI}
                          disabled={loading}
                        >
                          <Text style={globalStyles.subtitle_1}>
                            {loading ? 'Synchronizing...' : 'Synchronize Employee Images'}
                          </Text>
                        </TouchableOpacity>

                        {/* Progress Bar when loading */}
                        {loading && (
                          <View style={{ marginVertical: 10, alignItems: 'center' }}>
                            <Progress.Bar progress={progress} width={200} />
                            <Text>{Math.round(progress * 100)}%</Text>
                          </View>
                        )}
                      </View>
                    )}

                    <Text style={[globalStyles.subtitle, globalStyles.mt_10]}>Other</Text>
                    <SettingsItem icon="help-circle" label="FAQ" lastIcon={'chevron-down'} />
                    <SettingsItem icon="info" label="Help Center" lastIcon={'chevron-down'} />
                    <SettingsItem icon="phone" label="Contact Us" lastIcon={'chevron-down'} />
                  </View>
                </View>

                {/* Logout Button at bottom */}
                <TouchableOpacity onPress={handleLogout} style={[globalStyles.twoInputContainer, { justifyContent: 'center' }, styles.logoutButton]}>
                  <Icon name="log-out" size={20} color={colors.error} />
                  <Text style={[globalStyles.subtitle, globalStyles.mx_10, { color: colors.error }]}>Logout</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </ImageBackground>
      </View>
    </View>
  );
};

const SettingsItem = ({ icon, label, lastIcon, onPress }) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const globalStyles = GlobalStyles(colors);
  return (
    <TouchableOpacity style={[styles.item, globalStyles.twoInputContainer]}
      onPress={onPress}>
      <View style={globalStyles.twoInputContainer1}>
        <Icon name={icon} size={20} color={colors.primary} />
        <Text style={globalStyles.body}>{label}</Text>
      </View>
      <Icon name={lastIcon} size={20} color="#999" />
    </TouchableOpacity>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 20,
    width: width * 0.8
  },
  userImg: {
    height: 90,
    width: 90,
    borderRadius: 45,
    marginRight: 20,
    borderWidth: 2,
    borderColor: '#fff'
  },
  formContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  item: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#eee'
  },
  companyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  logoutButton: {
    marginVertical: 50,
    alignItems: 'center',
  },
});
