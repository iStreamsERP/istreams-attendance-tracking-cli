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
        <View style={globalStyles.flex_1}>
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
                                            : require('../../assets/images.png')
                                    }
                                    style={globalStyles.empImageInList}
                                />
                                <View style={styles.innerContainer}>
                                    <Text style={[globalStyles.subtitle_3, { color: colors.primary }]}>{item.EMP_NO}</Text>
                                    <Text style={globalStyles.subtitle_3}>{item.EMP_NAME}</Text>
                                    <Text style={globalStyles.small_text}>{item.DESIGNATION}</Text>
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
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
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
