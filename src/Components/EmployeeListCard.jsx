import React from 'react';
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    Image,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { GlobalStyles } from '../Styles/styles';
import { useTheme } from '../Context/ThemeContext';

const EmployeeListCard = ({ loading, selectedEmp, onPress }) => {
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);
    return (
        <View style={styles.employeeListContainer}>
            {loading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <>
                    <FlatList
                        data={selectedEmp}
                        keyExtractor={(item) => item.EMP_NO.toString()}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => onPress?.(item)}
                                style={[styles.container, { backgroundColor: colors.card }]}>
                                <Image
                                    source={
                                        item.EMP_IMAGE
                                            ? {
                                                uri: item.EMP_IMAGE.startsWith('data:image')
                                                    ? item.EMP_IMAGE
                                                    : `data:image/png;base64,${item.EMP_IMAGE.replace(/(\r\n|\n|\r)/gm, "")}`
                                            }
                                            : require('../../assets/human.png')
                                    }
                                    style={styles.empImage}
                                />
                                <View style={styles.innerContainer}>
                                    <Text style={[globalStyles.subtitle_3, { color: colors.primary }]}>{item.EMP_NO}</Text>
                                    <Text style={globalStyles.subtitle_3}>{item.EMP_NAME}</Text>
                                    <Text style={globalStyles.subtitle_4}>{item.DESIGNATION}</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                </>
            )}
        </View>
    );
};

export default EmployeeListCard;

const styles = StyleSheet.create({
    employeeListContainer: {
        flex: 1,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },
    empImage: {
        width: 50,
        height: 50,
        borderRadius: 10,
        marginRight: 10,
    },
    container: {
        flexDirection: 'row',
        borderRadius: 15,
        padding: 10,
        marginBottom: 10,
        alignItems: 'center',
    },
    innerContainer: {
        flex: 1,
        marginLeft: 10,
        justifyContent: 'center',
    }
});
