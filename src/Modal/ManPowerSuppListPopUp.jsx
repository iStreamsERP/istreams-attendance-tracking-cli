import React from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { Searchbar } from 'react-native-paper';
import { GlobalStyles } from '../Styles/styles';

const ManPowerSuppListPopUp = ({ visible, onClose, onSelect }) => {
    const [manPowerSupp, setManPowerSupp] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

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
            <TouchableOpacity style={styles.backdrop} onPress={onClose} />
            <View style={styles.popup}>
                {/* Search Input */}
                <Searchbar
                    style={styles.inputContainer}
                    placeholder="Search Suppliers"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                <FlatList
                    data={filteredManPowerSupp}
                    keyExtractor={(item) => item.SUPPLIER_NAME}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.item}
                            onPress={() => onSelect(item)}
                        >
                            <Text style={GlobalStyles.subtitle_2}>{item.SUPPLIER_NAME}</Text>
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
        top: '33%',
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

export default ManPowerSuppListPopUp;
