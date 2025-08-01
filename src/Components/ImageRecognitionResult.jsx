import React from 'react';
import {
    View,
    Text,
    SectionList,
    ActivityIndicator,
    StyleSheet
} from 'react-native';
import EmployeeListCard from './EmployeeListCard';
import { useNavigation } from '@react-navigation/native';
import { GlobalStyles } from '../Styles/styles';
import { useTheme } from '../Context/ThemeContext';

const ImageRecognitionResult = ({ recogloading, groupedData }) => {
    const navigation = useNavigation();
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);

    const handleAddEmployee = () => {
        navigation.navigate('UpdateNonMatchedEmpScreen');
    };

    return (
        <View style={styles.employeeListContainer}>
            {recogloading ? (
                <View style={styles.loaderContainer}>
                    <Text
                        style={[globalStyles.subtitle_4, { color: colors.primary }]}
                    >
                        Analysing your Image. Please Wait...
                    </Text>
                    <ActivityIndicator size="small"
                        style={globalStyles.mt_5}
                        color={colors.primary} />
                </View>
            ) : (
                <SectionList
                    sections={groupedData}
                    keyExtractor={(item, index) => item.EMP_NO + index}
                    renderSectionHeader={({ section: { title } }) => (
                        <Text style={[globalStyles.subtitle_1, { marginVertical: 10 }]}>
                            {title}
                        </Text>
                    )}
                    renderItem={({ item, section }) => (
                        <EmployeeListCard
                            loading={false}
                            selectedEmp={[item]}
                            onPress={section.title === 'Non-Matched Employee' ? () => handleAddEmployee() : null}
                        />
                    )}
                />
            )}
        </View>
    );
};

export default ImageRecognitionResult;

const styles = StyleSheet.create({
    loaderContainer: {
        marginTop: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
});