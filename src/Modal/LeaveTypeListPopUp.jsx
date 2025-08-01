import React from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { Searchbar } from 'react-native-paper';
import { GlobalStyles } from '../Styles/styles';
import { useTheme } from '../Context/ThemeContext';

const LeaveTypeListPopup = ({ visible, onClose, onSelect }) => {
    const [leaveType, setLeaveType] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);

    const getData = async () => {
        try {
            const storedData = await AsyncStorage.getItem('LeaveTypeList');

            if (storedData !== null) {
                const parsedData = JSON.parse(storedData);
                setLeaveType(parsedData);

                // Initialize checkbox state
                const initialChecks = {};
                parsedData.forEach(pro => {
                    initialChecks[pro.LEAVE_TYPE] = false;
                });
            }
        } catch (e) {
            console.error('Failed to retrieve data:', e);
        }
    };

    useEffect(() => {
        getData();
    }, []);

    const filteredProjects = leaveType.filter(pro => {
        const leaveType = pro.LEAVE_TYPE || '';
        return (
            leaveType.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });
    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity style={globalStyles.backdrop} onPress={onClose} />
            <View style={[globalStyles.popup, { backgroundColor: colors.background }]}>
                {/* Search Input */}
                <Searchbar
                    style={globalStyles.my_10}
                    placeholder="Search Leave Type"
                    value={searchQuery}
                    theme={theme}
                    onChangeText={setSearchQuery}
                />
                <FlatList
                    data={filteredProjects}
                    keyExtractor={(item) => item.LEAVE_TYPE}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[globalStyles.item, { backgroundColor: colors.card }]}
                            onPress={() => onSelect(item)}
                        >
                            <Text style={globalStyles.subtitle_2}>{item.LEAVE_TYPE}</Text>
                        </TouchableOpacity>
                    )}
                />
            </View>
        </Modal>
    );
};

export default LeaveTypeListPopup;
