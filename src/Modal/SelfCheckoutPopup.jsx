import { Modal, StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { GlobalStyles } from '../Styles/styles';
import React from 'react';
import { useTheme } from '../Context/ThemeContext';

const SelfCheckoutPopup = ({ visible, onClose, onSelectOption }) => {
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);
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
                <View style={[styles.bottomModal, { backgroundColor: colors.card }]}>
                    <TouchableOpacity style={styles.modalOption}
                        onPress={() => { onSelectOption('office'); onClose(); }}>
                        <Icon name="office-building" size={24} color={colors.primary} />
                        <Text style={[globalStyles.subtitle_1, { marginLeft: 15 }]}>Office Check-out</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.modalOption}
                        onPress={() => {
                            onSelectOption('project');
                            onClose();
                        }}                    >
                        <Icon name="file-document" size={24} color={colors.primary} />
                        <Text style={[globalStyles.subtitle_1, { marginLeft: 15 }]}>Project Check-out</Text>
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