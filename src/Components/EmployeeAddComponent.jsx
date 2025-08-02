import React, { useState, useEffect } from 'react';
import { View, Text, Image, KeyboardAvoidingView, ScrollView, Platform, Alert
} from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import ImageEditPopUp from '../Modal/ImageEditPopUp';
import { GlobalStyles } from '../Styles/styles';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '../Context/AuthContext';
import { handleEmpImageUpload, handleEmpImageView } from '../Utils/EmpImageCRUDUtils';
import ManPowerSuppListPopUp from '../Modal/ManPowerSuppListPopUp';
import DesignationListPopUp from '../Modal/DesignationListPopUp';
import { useTheme } from '../Context/ThemeContext';

const EmployeeAddComponent = ({ employee }) => {
  const { userData } = useAuth();
  const { theme } = useTheme();
  const colors = theme.colors;
  const globalStyles = GlobalStyles(colors);
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [isPopupVisible1, setPopupVisible1] = useState(false);
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

  const handleDesignationListSelect = (designationList) => {
    setDesignation(designationList.DESIGNATION);
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

  // Second: When empNo is set, fetch the image
  useEffect(() => {
    if (employee) {
      fetchImage(employee);
    }
  }, [employee]);

  const isEmpty = !employee || Object.keys(employee).length === 0;

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
        style={globalStyles.pageContainer}
      >
        <ScrollView keyboardShouldPersistTaps="handled">
          {/* Shimmer for Profile Image */}
          <View style={globalStyles.centerRoundImgContainer}>
            <View style={globalStyles.centerRoundImg}>
              <ShimmerPlaceholder
                LinearGradient={LinearGradient}
                style={globalStyles.roundIm}
                shimmerStyle={globalStyles.roundImg}
                visible={false}
              />
            </View>
          </View>

          {/* Shimmer for Switch */}
          <ShimmerPlaceholder LinearGradient={LinearGradient} style={globalStyles.shimmerText} />

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
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, paddingTop: 10 }}
    >
      <View style={globalStyles.flex_1}>
        <ScrollView keyboardShouldPersistTaps="handled">
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

          <Text style={globalStyles.subtitle_1}>Employee Details</Text>

          <View style={[globalStyles.flex_1, globalStyles.my_10]}>
            <View style={[globalStyles.twoInputContainer, globalStyles.mb_10]}>
              <TextInput
                mode="outlined"
                label="Emp No"
                value={empNo}
                theme={theme}
                editable={isEmpty}
                style={globalStyles.container1}
                onChangeText={setEmpNo}
                placeholder="Enter Emp No" />

              <>
                {isEmpty && (
                  <TextInput
                    mode="outlined"
                    label="Emp ID (New)"
                    value={id}
                    style={globalStyles.container2}
                    editable={false}
                    theme={theme}
                    onChangeText={setId}
                    placeholder="(New)" />
                )}
              </>
            </View>

            <TextInput
              mode="outlined"
              label="Emp Name"
              value={empName}
              editable={isEmpty}
              theme={theme}
              style={globalStyles.mb_10}
              onChangeText={setEmpName}
              placeholder="Enter Emp Name" />

            <TextInput
              mode="outlined"
              label="Designation"
              onPressIn={() => setPopupVisible1(true)}
              value={designation}
              editable={isEmpty}
              theme={theme}
              style={globalStyles.mb_10}
              onChangeText={setDesignation}
              placeholder="Select Designation"
              showSoftInputOnFocus={false}
            />
            <>
              {isEmpty && (
                <TextInput
                  mode="outlined"
                  label="ManPower Supplier"
                  onPressIn={() => setPopupVisible(true)}
                  value={manpowerSupp}
                  theme={theme}
                  onChangeText={setManpowerSupp}
                  placeholder="Select ManPower Supplier"
                  showSoftInputOnFocus={false}
                />
              )}
            </>

            <DesignationListPopUp
              visible={isPopupVisible1}
              onClose={() => setPopupVisible1(false)}
              onSelect={(designationList) => {
                handleDesignationListSelect(designationList);
                setPopupVisible1(false);
              }}
            />

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

        <View style={globalStyles.bottomButtonContainer}>
          <Button mode="contained"
            onPress={handleImageUpload}
            theme={{
              colors: {
                primary: colors.primary,
                disabled: colors.lightGray, 
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

export default EmployeeAddComponent;