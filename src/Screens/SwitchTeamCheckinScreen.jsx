import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Header from '../Components/Header';
import { GlobalStyles } from '../Styles/styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { useTheme } from '../Context/ThemeContext';
import TeamCheckin from './TeamCheckin';
import TeamCheckin_Manual from './TeamCheckin_Manual';

const SwitchTeamCheckinScreen = () => {
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);
    const [selectedSection, setSelectedSection] = useState('section1');
    const route = useRoute();
    const { selectedLocation } = route.params || {};

    return (
        <View style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>
            <Header title="Team Check-in" />
            {/* Toggle Buttons */}
            <View style={globalStyles.toggleContainer}>
                <TouchableOpacity
                    style={[
                        globalStyles.toggleButton,
                        selectedSection === 'section1' ? globalStyles.activeButton : globalStyles.inactiveButton,
                        globalStyles.leftButton,
                    ]}
                    onPress={() => setSelectedSection('section1')}
                >
                    <Text
                        style={[
                            globalStyles.subtitle_3,
                            selectedSection === 'section1' ? globalStyles.activeText : globalStyles.inactiveText,
                        ]}
                    >
                        Auto-Checkin
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        globalStyles.toggleButton,
                        selectedSection === 'section2' ? globalStyles.activeButton : globalStyles.inactiveButton,
                        globalStyles.rightButton,
                    ]}
                    onPress={() => setSelectedSection('section2')}
                >
                    <Text
                        style={[
                            globalStyles.subtitle_3,
                            selectedSection === 'section2' ? globalStyles.activeText : globalStyles.inactiveText,
                        ]}
                    >
                        Manual-Checkin
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Section Content */}
            {selectedSection === 'section1' && (
                <TeamCheckin selectedLocation={selectedLocation}/>
            )}

            {selectedSection === 'section2' && (
                <TeamCheckin_Manual selectedLocation={selectedLocation}/>
            )}
        </View>
    );
};

export default SwitchTeamCheckinScreen;