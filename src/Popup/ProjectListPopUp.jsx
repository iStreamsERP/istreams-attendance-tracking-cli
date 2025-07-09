import React from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { Searchbar } from 'react-native-paper';
import { GlobalStyles } from '../Styles/styles';

const ProjectListPopup = ({ visible, onClose, onSelect }) => {
    const [projects, setProjects] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    const getData = async () => {
        try {
            const storedData = await AsyncStorage.getItem('ProjectList');
            if (storedData !== null) {
                const parsedData = JSON.parse(storedData);
                setProjects(parsedData);

                // Initialize checkbox state
                const initialChecks = {};
                parsedData.forEach(pro => {
                    initialChecks[pro.PROJECT_NO] = false;
                });
            }
        } catch (e) {
            console.error('Failed to retrieve data:', e);
        }
    };

    useEffect(() => {
        getData();
    }, []);

    const filteredProjects = projects.filter(pro => {
        const proName = pro.PROJECT_NAME || ''; 
        const proNo = pro.PROJECT_NO ? pro.PROJECT_NO.toString() : ''; 

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
            <TouchableOpacity style={styles.backdrop} onPress={onClose} />
            <View style={styles.popup}>
                {/* Search Input */}
                <Searchbar
                    style={styles.inputContainer}
                    placeholder="Search Projects"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                <FlatList
                    data={filteredProjects}
                    keyExtractor={(item) => item.PROJECT_NO}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.item}
                            onPress={() => onSelect(item)}
                        >
                            <Text style={[GlobalStyles.subtitle_3, {color: '#0685de'}]}>{item.PROJECT_NO}</Text>
                            <Text style={GlobalStyles.subtitle_2}>{item.PROJECT_NAME}</Text>
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

export default ProjectListPopup;