import React, { useState, useEffect } from 'react';
import {
  View, Text, Image, StyleSheet, Dimensions, KeyboardAvoidingView, ScrollView, Platform, Alert
} from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import ImageEditPopUp from '../Modal/ImageEditPopUp';
import { GlobalStyles } from '../Styles/styles';
const { width, height } = Dimensions.get('window');
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '../Context/AuthContext';
import { handleEmpImageUpload, handleEmpImageView } from '../Utils/EmpImageCRUDUtils';
import ManPowerSuppListPopUp from '../Modal/ManPowerSuppListPopUp';

const EmployeeAddComponent = ({ employee }) => {
  const { userData } = useAuth();
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [btnloading, setbtnLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [avatar, setAvatar] = useState(null);
  const [id, setId] = useState();
  const [empNo, setEmpNo] = useState();
  const [empName, setEmpName] = useState();
  const [designation, setDesignation] = useState();
  const [manpowerSupp, setManpowerSupp] = useState();
  const [errorMessage, setErrorMessage] = useState('');

  const handleManpowerSelect = (manPowerSupp) => {
    setManpowerSupp(manPowerSupp.SUPPLIER_NAME);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
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
        console.log(base64Img);
        
  
        if (base64Img) {
          setAvatar(base64Img);
        }
      } catch (err) {
        setErrorMessage(err.message);
      }
    };

  // Second: When empNo is set, fetch the image
  useEffect(() => {
    if (employee) {
      fetchImage(employee);
    }
  }, [employee]);

  useEffect(() => {
    if (errorMessage) {
      Alert.alert('Error', errorMessage, [
        { text: 'OK', onPress: () => setErrorMessage('') }
      ]);
    }
  }, [errorMessage]);


  const handleImageUpload = async () => {
    await handleEmpImageUpload(
      avatar,
      empNo,
      setbtnLoading,
      userData.userEmail,
      setErrorMessage
    );
  };

  if (loading) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={GlobalStyles.pageContainer}
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

          {/* Shimmer for Switch */}
          <View style={styles.switchContainer}>
            <ShimmerPlaceholder LinearGradient={LinearGradient} style={GlobalStyles.shimmerText} />
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
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, paddingTop: 10 }}
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

          <View style={styles.switchContainer}>
            <Text style={GlobalStyles.subtitle_1}>Employee Details</Text>
          </View>
          <View style={styles.inputContainer}>
            <View style={[GlobalStyles.twoInputContainer, styles.input]}>
              <TextInput
                mode="outlined"
                label="Emp No"
                value={empNo}
                style={GlobalStyles.container1}
                onChangeText={setEmpNo}
                placeholder="Enter Emp No" />

              <TextInput
                mode="outlined"
                label="Emp ID (New)"
                value={id}
                style={GlobalStyles.container2}
                editable={false}
                onChangeText={setId}
                placeholder="(New)" />
            </View>

            <TextInput
              mode="outlined"
              label="Emp Name"
              value={empName}
              onChangeText={setEmpName}
              style={styles.input}
              placeholder="Enter Emp Name" />

            <TextInput
              mode="outlined"
              label="Designation"
              value={designation}
              onChangeText={setDesignation}
              style={styles.input}
              placeholder="Enter Designation" />

            <TextInput
              mode="outlined"
              label="ManPower Supplier"
              onPressIn={() => setPopupVisible(true)}
              value={manpowerSupp}
              onChangeText={setManpowerSupp}
              style={styles.input}
              placeholder="Select ManPower Supplier" 
              showSoftInputOnFocus={false}/>

            <ManPowerSuppListPopUp
              visible={isPopupVisible}
              onClose={() => setPopupVisible(false)}
              onSelect={(manPowerSupp) => {
                handleManpowerSelect(manPowerSupp);
                setPopupVisible(false);
              }}
            />
          </View>

          {/* Image Picker Modal */}
          <ImageEditPopUp
            setAvatar={setAvatar}
            empNo={empNo}
          />
        </ScrollView>

        <View style={GlobalStyles.bottomButtonContainer}>
          <Button mode="contained"
            onPress={handleImageUpload}
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
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileContainer: {
    alignSelf: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    width: width * 0.35,
    height: width * 0.35,
    borderRadius: (width * 0.35) / 2,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
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
    marginBottom: 5,
  },
});


export default EmployeeAddComponent;