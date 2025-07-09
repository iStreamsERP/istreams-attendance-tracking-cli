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


const ChangeEmpImageScreen = () => {
  const navigation = useNavigation();
  const { userData } = useAuth();
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
          <View style={styles.profileContainer}>
            <View style={styles.imageContainer}>
              <ShimmerPlaceholder
                LinearGradient={LinearGradient}
                style={styles.image}
                shimmerStyle={styles.image}
                visible={false}
              />
            </View>
          </View>

          {/* Shimmer for Inputs */}
          <View style={styles.inputContainer}>
            <ShimmerPlaceholder LinearGradient={LinearGradient} style={GlobalStyles.shimmerInput} />
            <ShimmerPlaceholder LinearGradient={LinearGradient} style={GlobalStyles.shimmerInput} />
            <ShimmerPlaceholder LinearGradient={LinearGradient} style={GlobalStyles.shimmerInput} />
          </View>
        </ScrollView>

        {/* Shimmer for Button */}
        <View style={GlobalStyles.bottomButtonContainer}>
          <ShimmerPlaceholder LinearGradient={LinearGradient} style={GlobalStyles.shimmerButton} />
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, marginTop: 10 }}
    >
      <View style={styles.innerContainer}>
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.profileContainer}>
            <View style={styles.imageContainer}>
              <Image
                source={
                  avatar ? { uri: avatar } : require("../../assets/images.png")
                }
                style={styles.image}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <View style={GlobalStyles.twoInputContainer}>
              <TextInput
                mode="outlined"
                label="Emp No"
                value={empNo}
                onChangeText={setEmpNo}
                editable={false}
                style={GlobalStyles.container1}
                placeholder="Enter Emp No" />

              <View style={GlobalStyles.camButtonContainer}>
                <Button
                  icon="plus"
                  mode="contained-tonal"
                  onPress={() =>
                    navigation.navigate('EmployeeList', {
                      onSelect: async (employees) => {
                        setLoading(true);
                        if (employees.length !== 1) {
                          alert('Please select only one employee.');
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
              onChangeText={setEmpName}
              style={GlobalStyles.textInput}
              placeholder="Enter Emp Name" />

            <TextInput
              mode="outlined"
              label="Designation"
              value={designation}
              onChangeText={setDesignation}
              style={styles.input}
              placeholder="Enter Designation" />
          </View>

          {/* Image Picker Modal */}
          <ImageEditPopUp
            setAvatar={setAvatar}
            empNo={empNo}
          />
        </ScrollView>

        <View style={GlobalStyles.bottomButtonContainer}>
          <Button mode="contained"
            onPress={uploadImage}
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
  innerContainer: {
    flex: 1,
  },
  profileContainer: {
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: width * 0.35,
    height: width * 0.35,
    borderRadius: (width * 0.35) / 2,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: (width * 0.35) / 2,
  },
  inputContainer: {
    flex: 1,
    marginVertical: 10,
  },
  input: {
    marginBottom: 10,
    height: height * 0.07,
  },
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