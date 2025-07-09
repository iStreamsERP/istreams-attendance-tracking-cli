import React from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useState } from 'react';
import { Searchbar } from 'react-native-paper';
import { GlobalStyles } from '../Styles/styles';

const ProjectBOQListPopUp = ({ visible, onClose, onSelect, data = [] }) => {
    const [searchQuery, setSearchQuery] = useState('');

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
            <TouchableOpacity style={styles.backdrop} onPress={onClose} />
            <View style={styles.popup}>
                <Searchbar
                    style={styles.inputContainer}
                    placeholder="Search BOQ"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                <FlatList
                    data={filteredProjects}
                    keyExtractor={(item) => item.BOQ_NO}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.item}
                            onPress={() => onSelect(item)}
                        >
                            <Text style={[GlobalStyles.subtitle_3, { color: '#0685de' }]}>{item.BOQ_NO}</Text>
                            <Text style={GlobalStyles.subtitle_2}>{item.BOQ_DESCRIPTION}</Text>
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

export default ProjectBOQListPopUp;
