import React from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useState } from 'react';
import { Searchbar } from 'react-native-paper';
import { GlobalStyles } from '../Styles/styles';
import { useTheme } from '../Context/ThemeContext';

const ProjectBOQListPopUp = ({ visible, onClose, onSelect, data = [] }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);

    const filteredProjects = data.filter(pro => {
        const proName = pro.BOQ_DESCRIPTION || '';
        const proNo = pro.BOQ_NO ? pro.BOQ_NO.toString() : '';

        return (
            proName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            proNo.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });
    return (
        <Modal
            transparent
            visible={visible}
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableOpacity style={globalStyles.backdrop} onPress={onClose} />
            <View style={[globalStyles.popup, { backgroundColor: colors.background }]}>
                <Searchbar
                    style={globalStyles.my_10}
                    placeholder="Search BOQ"
                    theme={theme}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                <FlatList
                    data={filteredProjects}
                    keyExtractor={(item) => item.BOQ_NO}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[globalStyles.item, { backgroundColor: colors.card }]}
                            onPress={() => onSelect(item)}
                        >
                            <Text style={[globalStyles.subtitle_3, { color: '#0685de' }]}>{item.BOQ_NO}</Text>
                            <Text style={globalStyles.subtitle_2}>{item.BOQ_DESCRIPTION}</Text>
                        </TouchableOpacity>
                    )}
                />
            </View>
        </Modal>
    );
};

export default ProjectBOQListPopUp;