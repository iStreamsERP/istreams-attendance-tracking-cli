import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { useTheme } from '../Context/ThemeContext';
import { GlobalStyles } from '../Styles/styles';

const { width, height } = Dimensions.get('window');

const ModuleCard = ({ image, title, subtitle, onPress }) => {
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);
    return (
        <TouchableOpacity onPress={onPress} style={[styles.card, globalStyles.twoInputContainer, globalStyles.my_5, { backgroundColor: colors.card }]}>
            <View style={styles.imageWrapper}>
                <Image source={image} style={styles.cardImage} />
            </View>
            <View style={[globalStyles.flex_1, globalStyles.ml_10]}>
                <Text style={globalStyles.subtitle}>{title}</Text>
                {subtitle && <Text style={globalStyles.small_text}>{subtitle}</Text>}
            </View>
        </TouchableOpacity>
    );
};


export default ModuleCard;

const styles = StyleSheet.create({
    card: {
        width: 'auto',
        borderRadius: 10,
        flexDirection: 'row',   // image left, text right
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 5,
        elevation: 3,
    },
    imageWrapper:{
        borderRadius: 10,
        overflow: 'hidden',
        margin: 10
    },
    cardImage: {
        width: width * 0.35,
        height: height * 0.09,
        resizeMode: 'cover',
    },
});
