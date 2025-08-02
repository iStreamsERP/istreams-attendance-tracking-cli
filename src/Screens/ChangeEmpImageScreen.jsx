import React, { useState, useEffect } from 'react';
import {
  View, Text, Image, StyleSheet, Alert,
  Dimensions, KeyboardAvoidingView, ScrollView, Platform,
} from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import ImageEditPopUp from '../Modal/ImageEditPopUp';
import { GlobalStyles } from '../Styles/styles';
const { width, height } = Dimensions.get('window');
import { useNavigation } from '@react-navigation/native';
import { handleEmpImageUpload, handleEmpImageView } from '../Utils/EmpImageCRUDUtils';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '../Context/AuthContext';
import { useTheme } from '../Context/ThemeContext';


const ChangeEmpImageScreen = () => {
  const navigation = useNavigation();
  const { userData } = useAuth();
  const { theme } = useTheme();
  const colors = theme.colors;
  const globalStyles = GlobalStyles(colors);
  const [btnloading, setbtnLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [avatar, setAvatar] = useState(null);
  const [empNo, setEmpNo] = useState();
  const [empName, setEmpName] = useState();
  const [designation, setDesignation] = useState();
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Simulate a loading delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const fetchImage = async (employee) => {
    if (!employee) return;

    try {
      const base64Img = await handleEmpImageView(
        employee,
        setEmpNo,
        setEmpName,
        setDesignation,
        userData.userEmail,
        userData.userDomain,
        setErrorMessage,
        setAvatar
      );

      if (base64Img) {
        setAvatar(base64Img);
      }
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  const uploadImage = async () => {
    try {
      await handleEmpImageUpload(
        avatar,
        empNo,
        setbtnLoading,
        userData.userEmail,
        setErrorMessage
      );
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  useEffect(() => {
    if (errorMessage) {
      Alert.alert('Error', errorMessage, [
        { text: 'OK', onPress: () => setErrorMessage('') }
      ]);
    }
  }, [errorMessage]);

  if (loading) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, marginTop: 10 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          {/* Shimmer for Profile Image */}
          <View style={globalStyles.centerRoundImgContainer}>
            <View style={globalStyles.centerRoundImg}>
              <ShimmerPlaceholder
                LinearGradient={LinearGradient}
                style={globalStyles.roundImg}
                shimmerStyle={globalStyles.roundImg}
                visible={false}
              />
            </View>
          </View>

          {/* Shimmer for Inputs */}
          <View style={[globalStyles.flex_1, globalStyles.my_10]}>
            <ShimmerPlaceholder LinearGradient={LinearGradient} style={globalStyles.shimmerInput} />
            <ShimmerPlaceholder LinearGradient={LinearGradient} style={globalStyles.shimmerInput} />
            <ShimmerPlaceholder LinearGradient={LinearGradient} style={globalStyles.shimmerInput} />
          </View>
        </ScrollView>

        {/* Shimmer for Button */}
        <View style={globalStyles.bottomButtonContainer}>
          <ShimmerPlaceholder LinearGradient={LinearGradient} style={globalStyles.shimmerButton} />
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, marginTop: 10 }}
    >
      <View style={globalStyles.flex_1}>
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <View style={globalStyles.justalignCenter}>
            <View style={globalStyles.centerRoundImg}>
              <Image
                source={
                  avatar ? { uri: avatar } : require("../../assets/images.png")
                }
                style={globalStyles.roundImg}
              />
            </View>
          </View>

          <View style={[globalStyles.flex_1, globalStyles.my_10]}>
            <View style={[globalStyles.twoInputContainer, globalStyles.mb_10]}>
              <TextInput
                mode="outlined"
                label="Emp No"
                value={empNo}
                theme={theme}
                onChangeText={setEmpNo}
                editable={false}
                style={globalStyles.container1}
                placeholder="Enter Emp No" />

              <View style={globalStyles.camButtonContainer}>
                <Button
                  icon="plus"
                  mode="contained-tonal"
                  onPress={() =>
                    navigation.navigate('EmployeeList', {
                      onSelect: async (employees) => {
                        setLoading(true);
                        if (employees.length !== 1) {
                          Alert.alert('Please select only one employee.');
                          setLoading(false);
                          return;
                        }
                        const employee = employees[0];
                        await fetchImage(employee);
                        setLoading(false);
                      }
                    })
                  }
                >
                  Select Employee
                </Button>
              </View>

            </View>
            <TextInput
              mode="outlined"
              label="Emp Name"
              value={empName}
              theme={theme}
              onChangeText={setEmpName}
              style={globalStyles.mb_10}
              placeholder="Enter Emp Name" />

            <TextInput
              mode="outlined"
              label="Designation"
              value={designation}
              theme={theme}
              onChangeText={setDesignation}
              style={globalStyles.input}
              placeholder="Enter Designation" />
          </View>

          {/* Image Picker Modal */}
          <ImageEditPopUp
            setAvatar={setAvatar}
            empNo={empNo}
          />
        </ScrollView>

        <View style={globalStyles.bottomButtonContainer}>
          <Button mode="contained"
            onPress={uploadImage}
            theme={{
              colors: {
                primary: colors.primary,
                disabled: colors.lightGray, // <- set your desired disabled color
              },
            }}
            disabled={btnloading}
            loading={btnloading}>
            Save
          </Button>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    position: 'absolute',
    bottom: 5,
    left: width * 0.25,
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 10,
  },
});

export default ChangeEmpImageScreen;