import React from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { Searchbar } from 'react-native-paper';
import { GlobalStyles } from '../Styles/styles';
import { useTheme } from '../Context/ThemeContext';

const ManPowerSuppListPopUp = ({ visible, onClose, onSelect }) => {
    const [manPowerSupp, setManPowerSupp] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);

    const getData = async () => {
        try {
            const storedData = await AsyncStorage.getItem('ManPowerSupplierList');
            if (storedData !== null) {
                const parsedData = JSON.parse(storedData);
                setManPowerSupp(parsedData);
            }
        } catch (e) {
            console.error('Failed to retrieve data:', e);
        }
    };

    useEffect(() => {
        getData();
    }, []);

    const filteredManPowerSupp = manPowerSupp.filter(pro => {
        const suppName = pro.SUPPLIER_NAME || '';

        return (
            suppName.toLowerCase().includes(searchQuery.toLowerCase())
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
                    placeholder="Search Suppliers"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                <FlatList
                    data={filteredManPowerSupp}
                    keyExtractor={(item) => item.SUPPLIER_NAME}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[globalStyles.item, { backgroundColor: colors.card }]}
                            onPress={() => onSelect(item)}
                        >
                            <Text style={globalStyles.subtitle_2}>{item.SUPPLIER_NAME}</Text>
                        </TouchableOpacity>
                    )}
                />
            </View>
        </Modal>
    );
};

export default ManPowerSuppListPopUp;
