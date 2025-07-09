import React from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { Searchbar } from 'react-native-paper';
import { GlobalStyles } from '../Styles/styles';

const LeaveTypeListPopup = ({ visible, onClose, onSelect }) => {
    const [leaveType, setLeaveType] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

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
            <TouchableOpacity style={styles.backdrop} onPress={onClose} />
            <View style={styles.popup}>
                {/* Search Input */}
                <Searchbar
                    style={styles.inputContainer}
                    placeholder="Search Leave Type"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                <FlatList
                    data={filteredProjects}
                    keyExtractor={(item) => item.LEAVE_TYPE}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.item}
                            onPress={() => onSelect(item)}
                        >
                            <Text style={GlobalStyles.subtitle_2}>{item.LEAVE_TYPE}</Text>
                        </TouchableOpacity>
                    )}
                />
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: '#00000066',
    },
    popup: {
        position: 'absolute',
        top: '50%',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#f8f8f8',
        borderTopRightRadius: 30,
        borderTopLeftRadius: 30,
        padding: 10,
        elevation: 10,
    },
    item: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 15,
        marginBottom: 5,
        backgroundColor: '#fff',
    },
    inputContainer: {
        marginVertical: 10,
    },
});

export default LeaveTypeListPopup;
