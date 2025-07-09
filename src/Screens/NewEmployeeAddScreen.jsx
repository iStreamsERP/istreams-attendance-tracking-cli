import React from 'react';
import { View } from 'react-native';
import Header from '../Components/Header';
import EmployeeAddComponent from '../Components/EmployeeAddComponent';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlobalStyles } from '../Styles/styles';

const NewEmployeeAddScreen = () => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[GlobalStyles.pageContainer, { paddingTop: insets.top }]}>
      <Header title="Add New Employee" />

      <EmployeeAddComponent/>
    </View>
  );
};

export default NewEmployeeAddScreen;