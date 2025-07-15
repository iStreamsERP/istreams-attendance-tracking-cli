import { Modal, StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { GlobalStyles } from '../Styles/styles';
import React from 'react';

const SelfCheckoutPopup = ({ visible, onClose, onSelectOption }) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <View style={styles.bottomModal}>
                    <TouchableOpacity style={styles.modalOption}
                        onPress={() => { onSelectOption('office'); onClose(); }}>
                        <Icon name="office-building" size={24} color="#002D72" />
                        <Text style={[GlobalStyles.subtitle_1, { marginLeft: 15 }]}>Office Check-out</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.modalOption}
                        onPress={() => {
                            onSelectOption('project');
                            onClose();
                        }}                    >
                        <Icon name="file-document" size={24} color="#002D72" />
                        <Text style={[GlobalStyles.subtitle_1, { marginLeft: 15 }]}>Project Check-out</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    )
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    bottomModal: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        paddingBottom: 30,
        width: '100%',
    },
    modalOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
});

export default SelfCheckoutPopup;