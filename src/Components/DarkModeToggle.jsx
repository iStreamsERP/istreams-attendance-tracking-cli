import React from 'react';
import { TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../Context/ThemeContext';
import { GlobalStyles } from '../Styles/styles';

const DarkModeToggle = () => {
    const { darkMode, theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);

    return (
        <TouchableOpacity
            onPress={() => {}} // No-op, no toggle available
            style={globalStyles.iconContainer}
            activeOpacity={0.7}
        >
            <Icon
                name={darkMode ? 'sun' : 'moon'}
                size={24}
                color={colors.text}
            />
        </TouchableOpacity>
    );
};

export default DarkModeToggle;