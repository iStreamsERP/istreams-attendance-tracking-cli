import React from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { Searchbar } from 'react-native-paper';
import { GlobalStyles } from '../Styles/styles';
import { useTheme } from '../Context/ThemeContext';

const DesignationListPopUp = ({ visible, onClose, onSelect }) => {
    const [designationMaster, setDesignationMaster] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);

    const getData = async () => {
        try {
            const storedData = await AsyncStorage.getItem('DesignationMasterList');
            if (storedData !== null) {
                const parsedData = JSON.parse(storedData);
                setDesignationMaster(parsedData);
            }
        } catch (e) {
            console.error('Failed to retrieve data:', e);
        }
    };

    useEffect(() => {
        getData();
    }, []);

    const filteredDesignationMaster = designationMaster.filter(pro => {
        const designation = pro.DESIGNATION || '';

        return (
            designation.toLowerCase().includes(searchQuery.toLowerCase())
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
                {/* Search Input */}
                <Searchbar
                    style={globalStyles.my_10}
                    theme={theme}
                    placeholder="Search Designation"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                <FlatList
                    data={filteredDesignationMaster}
                    keyExtractor={(item) => item.DESIGNATION}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[globalStyles.item, { backgroundColor: colors.card }]}
                            onPress={() => onSelect(item)}
                        >
                            <Text style={globalStyles.subtitle_2}>{item.DESIGNATION}</Text>
                        </TouchableOpacity>
                    )}
                />
            </View>
        </Modal>
    );
};

export default DesignationListPopUp;
