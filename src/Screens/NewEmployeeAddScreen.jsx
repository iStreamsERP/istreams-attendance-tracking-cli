import React from 'react';
import { View } from 'react-native';
import Header from '../Components/Header';
import EmployeeAddComponent from '../Components/EmployeeAddComponent';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlobalStyles } from '../Styles/styles';
import { useTheme } from '../Context/ThemeContext';

const NewEmployeeAddScreen = () => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const colors = theme.colors;
  const globalStyles = GlobalStyles(colors);
  return (
    <View style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>
      <Header title="Add New Employee" />

      <EmployeeAddComponent />
    </View>
  );
};

export default NewEmployeeAddScreen;